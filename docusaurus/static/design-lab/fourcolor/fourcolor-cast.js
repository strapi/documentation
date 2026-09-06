/* THE FOUR-COLOR DOCS — THE CAST.
   The drawn layer: 28 recurring heroes (one per title, cast from the
   community's own numbers), PAGE the copy kid, a rogues' gallery for the
   cautions, drawn step sequences, spot illustrations, cover figures, and
   the six house-ad portals to the sibling projects.
   Every WORD in a balloon is the documentation's own text, crisp DOM.
   The drawings are the period furniture that carries it. No third-party code. */
window.FC_CAST = function(env){
'use strict';
const {el, esc, cvs, DPR, mulberry, hash32, clamp, comboRGB, fillScreened,
       screenTile, INK, COMBOS, burstPath, drawLettering, textOf,
       firstSentence, bangify, S} = env;

const INKC='#231c12', PAPER='#f2e7c9', SKIN='#f0c692', SKIN2='#e5b57c';
const CONTENT_W=env.CONTENT_W||523;

/* ============ 1. the casting office (all derived) ============ */
const STOP=new Set(['THE','OF','AND','FOR','TO','A','AN','IN','ON','WITH','II','III','IV','V']);
function keyWord(noun){
  const parts=String(noun).split(/[\s&]+/).filter(w=>w&&!STOP.has(w));
  const first=parts[0];
  return ((first&&first.length>=3?first:(parts.sort((a,b)=>b.length-a.length)[0]||noun)))
    .replace(/[^A-Z0-9-]/gi,'');
}
const castCache=new Map();
const SECTION_KEY={'Getting Started':'START','Features':'FEATURE','Content APIs':'API',
  'Configurations':'CONFIG','Development':'DEV','Plugins development':'PLUGIN',
  'TypeScript':'TYPESCRIPT','AI':'AI','Command Line Interface':'COMMAND','Upgrades':'UPGRADE',
  'Deployments':'DEPLOY','Projects management':'PROJECT',
  'Account management':'ACCOUNT','Advanced configuration':'CONSOLE'};
/* ===== THE SIXTEEN (owner order): sixteen genuinely distinct heroes =====
   One DESIGN per title, keyed product|section so it survives reordering.
   Different silhouettes, builds, a real gender mix (eight clearly female-
   presenting leads), different costumes, headgear, gear and emblems — each
   derived from its section's character. A recolour is a failure; these are
   different bodies wearing different clothes under different heads. */
const HERO16={
  'cms|Getting Started':{ body:'slim', fem:true, head:'ponytail', hairC:'#6b3d1e',
    cape:'none', lower:'pants', legsC:'trim', gear:['satchel'], glove:'skin',
    emblem:'compass', recruit:true },
  'cms|Features':{ body:'bulky', head:'beret', hairC:'#4a2c14',
    cape:'none', coat:'long', lower:'pants', legsC:'suit', gear:[],
    emblem:'frame' },
  'cms|AI':{ body:'willowy', fem:true, head:'oracle', hairC:'#231c12', skin:'#c98d5a',
    cape:'none', lower:'gown', gear:[], belt:false, glove:'skin',
    emblem:'eye', prop:'staff' },
  'cms|Content APIs':{ body:'lithe', fem:true, head:'wingtail', hairC:'#231c12', skin:'#a8764a',
    suitC:'#e2a71c', cape:'none', lower:'pants', legsC:'suit', gear:['anklewings'],
    emblem:'bolt' },
  'cms|Configurations':{ body:'stocky', fem:true, head:'hardhat', hairC:'#4a2c14',
    cape:'none', lower:'pants', legsC:'suit', gear:['overalls','dialbelt'],
    glove:'skin', beltC:'#8f1d12', emblem:'dial', prop:'wrench' },
  'cms|Development':{ body:'bulky', head:'smith', hairC:'#231c12',
    cape:'none', coat:'apron', lower:'pants', legsC:'suit', gear:[],
    glove:'ink', neckSkin:true, emblem:'anvil', prop:'hammer' },
  'cms|TypeScript':{ body:'femheroic', fem:true, head:'gridhelm', hairC:'#2c2c34',
    cape:'half', lower:'pants', legsC:'trim', gear:['pauldrons','ruledsuit'],
    emblem:'bracket', prop:'lance' },
  'cms|Command Line Interface':{ body:'willowy', head:'hood', suitC:'#20361f', trimC:'#9fe08a',
    eyeC:'#9fe08a', cape:'cloak', capeC:'#141d12', lower:'gown', belt:false,
    gear:[], emblem:'prompt' },
  'cms|Plugins development':{ body:'round', head:'tinker', hairC:'#b4551f',
    cape:'none', lower:'pants', legsC:'trim', gear:['jetpack','toolbelt'],
    emblem:'plug' },
  'cms|Upgrades':{ body:'heroic', head:'mask', hairC:'#8e8e96',
    cape:'cape', lower:'trunks', gear:[], emblem:'uparrow', prop:'banner',
    teambook:true },
  'cloud|Getting Started':{ body:'femheroic', fem:true, head:'aviatrix', hairC:'#d9a13c',
    cape:'none', scarf:'#c22a1c', coat:'jacket', lower:'pants', legsC:'suit',
    gear:[], emblem:'wing', recruit:true },
  'cloud|Projects management':{ body:'willowy', head:'peakcap', hairC:'#2c2c34', skin:'#8a5a3c',
    cape:'none', lower:'pants', legsC:'suit', gear:['epaulettes'],
    emblem:'tower', prop:'paddles' },
  'cloud|Deployments':{ body:'bulky', head:'finhelm',
    cape:'none', lower:'pants', legsC:'trim', gear:['rockets'], glove:'ink',
    emblem:'rocket' },
  'cloud|Account management':{ body:'slim', fem:true, head:'bun', hairC:'#231c12', skin:'#f0c896',
    trimC:'#8f1d12', cape:'half', lower:'skirt', gear:['keyring'], glove:'skin',
    emblem:'key' },
  'cloud|Command Line Interface':{ body:'lithe', fem:true, head:'wingbob', hairC:'#7a3b16',
    suitC:'#3f6f9e', trimC:'#e9c81f', cape:'none', scarf:'#e9c81f', lower:'pants', legsC:'suit',
    gear:['satchel','anklewings'], emblem:'envelope' },
  'cloud|Advanced configuration':{ body:'stocky', head:'locs', hairC:'#231c12', skin:'#6f4630',
    cape:'none', lower:'pants', legsC:'trim', gear:['harness','ropecoil'],
    emblem:'knot' },
};
function castFor(t){
  if(castCache.has(t.idx)) return castCache.get(t.idx);
  const M=S.M;
  let code=0;
  for(const m of t.members){ code+=(M.code[m]||0); }
  const codeR=code/Math.max(1,t.words);
  const hubInb=M.inCount(t.hub)||0;
  const cloud=t.product==='cloud'||/^\/cloud|deploy|hosting/.test(t.hub);
  let arch;
  if(cloud&&(!t.section||/deploy|getting|projects/i.test(t.section))) arch='cosmic';
  else if(codeR>0.30) arch='gadgeteer';
  else if(hubInb>=25) arch='titan';
  else if(t.members.length<=4) arch='mystic';
  else if(t.words/Math.max(1,t.members.length)<900) arch='speedster';
  else arch='sentinel';
  let key=(t.section&&SECTION_KEY[t.section])||keyWord(t.noun);
  /* the sky line never shares a codename with the main line */
  if(t.product==='cloud'&&(t.section==='Command Line Interface'||t.section==='Getting Started'))
    key='SKY-'+key;
  const NAMES={
    speedster:'THE '+key+' STREAK', cosmic:'CAPTAIN '+key,
    gadgeteer:'DOC '+key, titan:'THE MIGHTY '+key,
    mystic:'THE PHANTOM '+key, sentinel:'THE '+key+' SENTINEL'};
  /* costume inks: the title's own channels pushed to press-strength so
     the figure pops off the tinted grounds */
  const boost=r=>r.map(([ch,tt])=>[ch, tt>=1?1:Math.min(1,tt*2)]);
  /* the face under the mask: jaw, brow, hairline, chin — cast from the
     title's own name so no two heroes share a face */
  const ir=mulberry(hash32('ident '+t.noun));
  const ident={
    jawW: 0.88+ir()*0.26,
    chin: 0.6+ir()*0.9,
    browY: (ir()-0.5)*0.55,
    browW: 0.85+ir()*0.5,
    noseL: 0.85+ir()*0.4,
    cheek: ir()<0.45,
    hairline: (hash32('hl'+t.noun)>>>3)%4,
    skin: [SKIN,'#eecb9b','#e7ba88','#f4d2a4'][(hash32('sk'+t.noun)>>>5)%4],
    hairC: ['#231c12','#4a2c14','#6b4a1e','#2c2c34'][(hash32('hc'+t.noun)>>>7)%4],
  };
  const design=HERO16[t.product+'|'+t.section]||null;
  if(design&&design.skin) ident.skin=design.skin;
  if(design&&design.hairC) ident.hairC=design.hairC;
  const cast={
    hero:{ name:NAMES[arch], arch, suit:boost(t.combo),
      trim:boost(COMBOS[(t.idx+9)%COMBOS.length]), letter:(key[0]||'D').toUpperCase(),
      ident, design },
    sidekick:{ name:'PAGE, THE COPY KID' },
  };
  castCache.set(t.idx,cast);
  return cast;
}
/* the rogues' gallery — summoned by what the warning actually says */
const VILLAINS={
  baron:{ id:'baron', name:'BARON BREAKING-CHANGE', suit:[['K',.5],['M',.25]], trim:[['M',1],['Y',.5],['K',.25]] },
  deprecation:{ id:'deprecation', name:'DOCTOR DEPRECATION', suit:[['Y',.5],['K',.25]], trim:[['K',.5]] },
  v404:{ id:'v404', name:'THE 404', suit:[['C',.25],['K',.5]], trim:[['C',.5]] },
  missconfig:{ id:'missconfig', name:'MISS CONFIGURATION', suit:[['M',.5],['C',.25]], trim:[['M',1],['C',.5]] },
};
function villainFor(kind, text){
  const s=String(text||'').toLowerCase();
  if(/deprecat|no longer (?:supported|maintained)|end.of.life|legacy/.test(s)) return VILLAINS.deprecation;
  if(/break|migrat|remov|renam|incompat|major version|drop/.test(s)) return VILLAINS.baron;
  if(/not found|404|missing|does not exist|undefined|fail|lost|delet/.test(s)) return VILLAINS.v404;
  if(kind==='danger') return VILLAINS.v404;
  return VILLAINS.missconfig;
}

/* ============ 2. the pencils — constructed Silver Age anatomy ============ */
/* Unit space: 100 × 100, ground ≈ y95, figure faces RIGHT.
   Every figure is built the way the period bullpen built them: skull, ribcage
   and pelvis masses first, limbs of correct proportion (≈7.5 heads), hands
   with fingers, feet with weight, then costume, then the spot blacks that
   anchor the figure to the page. */

const LW=2.1;                      /* master contour weight, unit space */
function lwFor(s){ return LW*Math.pow(Math.max(0.35,s),-0.28); }

/* --- geometry helpers --- */
function vsub(a,b){ return [a[0]-b[0],a[1]-b[1]]; }
function vlen(a){ return Math.hypot(a[0],a[1])||1e-6; }
function vnorm(a){ const l=vlen(a); return [a[0]/l,a[1]/l]; }
function vperp(a){ return [-a[1],a[0]]; }
function vmix(a,b,t){ return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t]; }

/* ===== THE INK KIT — one sun, thick-thin contours, feather, halftone tone ===== */
const SHADE=vnorm([1.8,1.1]);   /* away from the light (upper-left sun) */
function centroidOf(pts){ let sx=0,sy=0; for(const p of pts){sx+=p[0];sy+=p[1];} return [sx/pts.length,sy/pts.length]; }
/* half-plane through c: keeps the shadow half (toLight=false) or light half */
function sideClipPath(x,c,toLight){
  const D=toLight?[-SHADE[0],-SHADE[1]]:SHADE;
  const P=[-D[1],D[0]];
  const c0=[c[0]-D[0]*0.8, c[1]-D[1]*0.8];
  x.moveTo(c0[0]+P[0]*900, c0[1]+P[1]*900);
  x.lineTo(c0[0]-P[0]*900, c0[1]-P[1]*900);
  x.lineTo(c0[0]-P[0]*900+D[0]*900, c0[1]-P[1]*900+D[1]*900);
  x.lineTo(c0[0]+P[0]*900+D[0]*900, c0[1]+P[1]*900+D[1]*900);
  x.closePath();
}
/* the shadow-side of a contour drawn heavier: clip inside the form, keep
   only the shadow half, restate the contour at double weight — the line
   swells where the ink pools, stays wiry toward the sun */
function shadowWeight(x,pathFn,c,lw){
  x.save();
  pathFn(); x.clip();
  x.beginPath(); sideClipPath(x,c,false); x.clip();
  pathFn();
  x.strokeStyle=INKC; x.lineWidth=lw*2.05; x.lineJoin='round'; x.stroke();
  x.restore();
}
/* limb flank weight: the heavy line lives on the shadow FLANK of the
   limb's axis, and stays clear of both end caps so joints merge clean */
function limbFlankWeight(x,pts,ws,lw){
  const a=pts[0], b=pts[pts.length-1];
  const u=vnorm(vsub(b,a));
  const len=vlen(vsub(b,a));
  if(len<9) return;                       /* necks & stubs stay quiet */
  let n=vperp(u); if(n[0]*SHADE[0]+n[1]*SHADE[1]<0) n=[-n[0],-n[1]];
  const cap=Math.max(ws[0],ws[ws.length-1])*1.3;
  x.save();
  limbPath(x,pts,ws); x.clip();
  /* flank half-plane through the limb axis */
  const m=vmix(a,b,0.5);
  x.beginPath();
  x.moveTo(m[0]-u[0]*900, m[1]-u[1]*900);
  x.lineTo(m[0]+u[0]*900, m[1]+u[1]*900);
  x.lineTo(m[0]+u[0]*900+n[0]*900, m[1]+u[1]*900+n[1]*900);
  x.lineTo(m[0]-u[0]*900+n[0]*900, m[1]-u[1]*900+n[1]*900);
  x.closePath(); x.clip();
  /* band between the caps */
  const p1=[a[0]+u[0]*cap, a[1]+u[1]*cap];
  const inner=len-cap*2;
  if(inner>2){
    x.beginPath();
    x.moveTo(p1[0]-n[0]*900, p1[1]-n[1]*900);
    x.lineTo(p1[0]+n[0]*900, p1[1]+n[1]*900);
    x.lineTo(p1[0]+n[0]*900+u[0]*inner, p1[1]+n[1]*900+u[1]*inner);
    x.lineTo(p1[0]-n[0]*900+u[0]*inner, p1[1]-n[1]*900+u[1]*inner);
    x.closePath(); x.clip();
    limbPath(x,pts,ws);
    x.strokeStyle=INKC; x.lineWidth=lw*1.9; x.lineJoin='round'; x.stroke();
  }
  x.restore();
}
/* a paper-light rim along the sunny edge of the form */
function lightRim(x,pathFn,c,lw){
  x.save();
  pathFn(); x.clip();
  x.beginPath(); sideClipPath(x,c,true); x.clip();
  pathFn();
  x.strokeStyle='rgba(253,248,234,.34)'; x.lineWidth=lw*0.85; x.stroke();
  x.restore();
}
/* halftone mid-tone: the crescent between the form and a copy pushed
   toward the light, screened — base + shadow tone, press fashion */
function toneBand(x,pathFn,sv,scale){
  x.save();
  pathFn(); x.clip();
  pathFn(-sv[0]*1.9,-sv[1]*1.9);
  x.rect(-260,-260,760,760);
  const pat=x.createPattern(screenTile('K',.25,2),'repeat');
  if(pat&&pat.setTransform){
    /* the screen frequency belongs to the PAGE, not the figure: hold the
       dot pitch near 6 device px whatever the figure's scale */
    const tr=x.getTransform();
    const sc=Math.hypot(tr.a,tr.b)||1;
    pat.setTransform(new DOMMatrix().scale(clamp(6/(12*sc/DPR),0.05,0.6)*(scale||1)));
  }
  x.fillStyle=pat||'rgba(35,28,18,.16)';
  x.fill('evenodd');
  x.restore();
}
/* feathering: short parallel strokes laid in the same crescent — the
   hand-hatched turn of cloth and muscle */
function featherBand(x,pathFn,sv,c,lw,gap){
  x.save();
  pathFn(); x.clip();
  x.beginPath();
  pathFn(-sv[0]*1.35,-sv[1]*1.35);
  x.rect(-260,-260,760,760);
  x.clip('evenodd');
  const a=Math.atan2(SHADE[1],SHADE[0])+0.62;
  const dx=Math.cos(a), dy=Math.sin(a);
  const px=-dy, py=dx;
  x.strokeStyle='rgba(35,28,18,.62)'; x.lineWidth=lw*0.34; x.lineCap='round';
  const g=gap||2.1;
  for(let i=-16;i<=16;i++){
    const ox=c[0]+px*i*g, oy=c[1]+py*i*g;
    x.beginPath(); x.moveTo(ox-dx*30,oy-dy*30); x.lineTo(ox+dx*30,oy+dy*30); x.stroke();
  }
  x.restore();
}

/* smooth closed blob through pts (midpoint quadratic smoothing) */
function blobPath(x,pts,ox,oy){
  ox=ox||0; oy=oy||0;
  const n=pts.length;
  x.beginPath();
  let m0=vmix(pts[n-1],pts[0],0.5);
  x.moveTo(m0[0]+ox,m0[1]+oy);
  for(let i=0;i<n;i++){
    const p=pts[i], m=vmix(p,pts[(i+1)%n],0.5);
    x.quadraticCurveTo(p[0]+ox,p[1]+oy,m[0]+ox,m[1]+oy);
  }
  x.closePath();
}
/* highlight: the third tone of press colour modeling — a paper-pale
   crescent on the SUNNY side (mirror of toneBand), so every form carries
   base + shadow tone + highlight */
function highlightBand(x,pathFn,sv,alpha){
  x.save();
  pathFn(); x.clip();
  x.beginPath();
  pathFn(sv[0]*1.5,sv[1]*1.5);
  x.rect(-260,-260,760,760);
  x.fillStyle='rgba(253,248,234,'+(alpha!=null?alpha:0.24)+')';
  x.fill('evenodd');
  x.restore();
}
/* a mass: smoothed blob, base fill, spot-black crescent along the shade
   side (fill a copy of itself shifted toward the light, clipped inside,
   in black — the uncovered sliver is the ink shadow), then contour */
function mass(x,pts,fill,o){
  o=o||{};
  const pf=(ox,oy)=>blobPath(x,pts,ox,oy);
  blobPath(x,pts);
  if(fill){ x.fillStyle=fill; x.fill(); }
  if(o.shade!==false && o.sv){
    /* base + halftoned shadow tone, wider than the ink crescent */
    toneBand(x,pf,o.sv,1);
    if(o.hatch) featherBand(x,pf,o.sv,centroidOf(pts),o.lw||2,o.hatchGap);
    x.save(); blobPath(x,pts); x.clip();
    /* paint everything except a copy shifted toward the light —
       the uncovered crescent on the far side is the ink shadow */
    blobPath(x,pts,-o.sv[0]*0.55,-o.sv[1]*0.55);
    x.rect(-160,-160,520,520);
    x.fillStyle=o.shadeC||INKC; x.fill('evenodd');
    x.restore();
    highlightBand(x,pf,o.sv,0.22);
  }
  if(o.lw!==0){ blobPath(x,pts);
    x.strokeStyle=INKC; x.lineWidth=o.lw||2; x.lineJoin='round'; x.stroke();
    /* the ink pools on the shadow side of every mass */
    const c=centroidOf(pts);
    shadowWeight(x,()=>blobPath(x,pts),c,o.lw||2);
    if(o.rim&&o.sv&&o.shade!==false) lightRim(x,()=>blobPath(x,pts),c,o.lw||2);
  }
}
/* a tapered limb through 2-3 joints with per-joint half widths */
function limbPoly(pts,ws){
  const n=pts.length, Lp=[],Rp=[];
  for(let i=0;i<n;i++){
    let d;
    if(i===0) d=vsub(pts[1],pts[0]);
    else if(i===n-1) d=vsub(pts[i],pts[i-1]);
    else d=vsub(pts[i+1],pts[i-1]);
    const p=vperp(vnorm(d));
    Lp.push([pts[i][0]+p[0]*ws[i], pts[i][1]+p[1]*ws[i]]);
    Rp.push([pts[i][0]-p[0]*ws[i], pts[i][1]-p[1]*ws[i]]);
  }
  return {Lp,Rp};
}
function limbPath(x,pts,ws,ox,oy){
  ox=ox||0; oy=oy||0;
  const {Lp,Rp}=limbPoly(pts,ws);
  const n=pts.length;
  x.beginPath();
  x.moveTo(Lp[0][0]+ox,Lp[0][1]+oy);
  for(let i=1;i<n;i++) x.lineTo(Lp[i][0]+ox,Lp[i][1]+oy);
  /* rounded end cap */
  const de=vnorm(vsub(pts[n-1],pts[n-2]));
  x.quadraticCurveTo(pts[n-1][0]+de[0]*ws[n-1]*1.25+ox, pts[n-1][1]+de[1]*ws[n-1]*1.25+oy,
    Rp[n-1][0]+ox,Rp[n-1][1]+oy);
  for(let i=n-2;i>=0;i--) x.lineTo(Rp[i][0]+ox,Rp[i][1]+oy);
  const d0=vnorm(vsub(pts[0],pts[1]));
  x.quadraticCurveTo(pts[0][0]+d0[0]*ws[0]*1.25+ox, pts[0][1]+d0[1]*ws[0]*1.25+oy,
    Lp[0][0]+ox,Lp[0][1]+oy);
  x.closePath();
}
function limb(x,pts,ws,fill,o){
  o=o||{};
  const pf=(ox,oy)=>limbPath(x,pts,ws,ox,oy);
  limbPath(x,pts,ws);
  x.fillStyle=fill; x.fill();
  if(o.two){
    /* the second colour of the limb (glove past the cuff, bare shin past
       the short) is painted INSIDE the one silhouette — never a seam ring */
    x.save(); limbPath(x,pts,ws); x.clip();
    const m=o.two.at, d2=o.two.dir, p2=[-d2[1],d2[0]], Rr=o.two.r||9;
    x.beginPath();
    x.moveTo(m[0]+p2[0]*Rr,m[1]+p2[1]*Rr);
    x.lineTo(m[0]-p2[0]*Rr,m[1]-p2[1]*Rr);
    x.lineTo(m[0]-p2[0]*Rr+d2[0]*Rr*4,m[1]-p2[1]*Rr+d2[1]*Rr*4);
    x.lineTo(m[0]+p2[0]*Rr+d2[0]*Rr*4,m[1]+p2[1]*Rr+d2[1]*Rr*4);
    x.closePath(); x.fillStyle=o.two.col; x.fill();
    x.strokeStyle=INKC; x.lineWidth=(o.lw||2)*0.55;
    x.beginPath(); x.moveTo(m[0]+p2[0]*Rr,m[1]+p2[1]*Rr);
    x.lineTo(m[0]-p2[0]*Rr,m[1]-p2[1]*Rr); x.stroke();
    x.restore();
  }
  if(o.shade!==false && o.sv && vlen(vsub(pts[pts.length-1],pts[0]))>=9){
    toneBand(x,pf,o.sv,0.9);
    if(o.hatch) featherBand(x,pf,o.sv,vmix(pts[0],pts[pts.length-1],0.5),o.lw||2,1.8);
    x.save(); limbPath(x,pts,ws); x.clip();
    limbPath(x,pts,ws,-o.sv[0]*0.55,-o.sv[1]*0.55);
    x.rect(-160,-160,520,520);
    x.fillStyle=INKC; x.fill('evenodd');
    x.restore();
    highlightBand(x,pf,o.sv,0.17);
  }
  limbPath(x,pts,ws);
  x.strokeStyle=INKC; x.lineWidth=o.lw||2; x.lineJoin='round'; x.stroke();
  /* thick-thin: heavier ink on the shadow flank of the limb */
  limbFlankWeight(x,pts,ws,o.lw||2);
}
/* interior pencil accent (muscle hint) */
function accent(x,a,b,c,lw){
  x.strokeStyle='rgba(35,28,18,.75)'; x.lineWidth=lw||0.9; x.lineCap='round';
  x.beginPath(); x.moveTo(a[0],a[1]); x.quadraticCurveTo(b[0],b[1],c[0],c[1]); x.stroke();
}

/* --- body catalogues --- */
const BODY={
  heroic:{ headR:5.25, neckW:2.5, shW:10.2, chestHW:9.0, waistHW:5.4, pelvHW:6.7,
    armW:[3.25,2.6,2.0], legW:[4.5,3.2,2.25], hand:1, boot:1 },
  bulky:{ headR:5.6, neckW:3.7, shW:13.6, chestHW:12.2, waistHW:9.2, pelvHW:9.2,
    armW:[4.8,4.0,3.1], legW:[5.8,4.4,3.2], hand:1.25, boot:1.2 },
  slim:{ headR:5.0, neckW:1.95, shW:7.7, chestHW:6.5, waistHW:4.1, pelvHW:6.6,
    armW:[2.45,2.0,1.6], legW:[3.4,2.55,1.75], hand:0.85, boot:0.85 },
  kid:{ headR:7.4, neckW:2.3, shW:7.6, chestHW:6.9, waistHW:5.6, pelvHW:6.2,
    armW:[2.6,2.2,1.85], legW:[3.3,2.7,2.1], hand:0.9, boot:0.9 },
  /* THE SIXTEEN get sixteen bodies, not one (owner order): the small head
     reads TALL on the page, the big head reads short — so the rack shows
     willowy towers next to stocky fireplugs next to lithe runners. */
  willowy:{ headR:4.65, neckW:2.05, shW:8.2, chestHW:7.0, waistHW:4.4, pelvHW:5.9,
    armW:[2.6,2.1,1.65], legW:[3.5,2.6,1.8], hand:0.9, boot:0.9 },
  stocky:{ headR:6.0, neckW:3.1, shW:11.8, chestHW:10.6, waistHW:8.6, pelvHW:9.0,
    armW:[4.1,3.5,2.7], legW:[5.3,4.1,3.0], hand:1.12, boot:1.12 },
  lithe:{ headR:5.05, neckW:1.95, shW:7.9, chestHW:6.7, waistHW:3.8, pelvHW:6.9,
    armW:[2.45,2.0,1.55], legW:[3.55,2.65,1.75], hand:0.85, boot:0.85 },
  round:{ headR:6.4, neckW:3.2, shW:10.8, chestHW:11.0, waistHW:10.4, pelvHW:9.4,
    armW:[3.5,2.95,2.25], legW:[4.5,3.4,2.55], hand:1.05, boot:1.05 },
  femheroic:{ headR:5.05, neckW:2.1, shW:8.8, chestHW:7.5, waistHW:4.1, pelvHW:7.1,
    armW:[2.75,2.2,1.7], legW:[3.85,2.85,1.95], hand:0.85, boot:0.9 },
};

/* --- the pose library: real variety, chosen by the beat --- */
const POSES={
  stand:{ head:[50,11.5], dir:.55, expr:'resolve',
    sh:[[40.5,24],[59.5,24]], chest:[50,31], waist:[50,43], hip:[[45.5,51],[54.5,51]],
    arms:[[[40.5,25],[32.5,35],[41.5,45.3]],[[59.5,25],[67.5,35],[58.5,45.3]]],
    hands:['hip','hip'],
    legs:[[[46,51],[43,71.5],[41.5,91]],[[54,51],[58,71.5],[60,91]]],
    feet:['side','side'], cape:'down', grounded:1 },
  point:{ head:[52.5,11.5], dir:.55, expr:'resolve',
    sh:[[42,24.5],[58.5,23.5]], chest:[50.5,31], waist:[50,43], hip:[[45,51],[54.5,51]],
    arms:[[[42,25],[36.5,36],[41,46]],[[58.5,24],[70,18.5],[82.5,12]]],
    hands:['fist','point'],
    legs:[[[45.5,51],[40.5,71],[37,90.5]],[[55,51],[61,70.5],[66,89.5]]],
    feet:['side','side'], cape:'flow', wind:.5, grounded:1 },
  run:{ head:[61,15], dir:1, tilt:.1, expr:'resolve',
    sh:[[53,27.5],[57,26.5]], chest:[53,33.5], waist:[49.5,43.5], hip:[[46,51],[50.5,51]],
    arms:[[[53,28],[64,34],[73.5,26.5]],[[57,27],[47,36],[38.5,28.5]]],
    hands:['fist','fist'],
    legs:[[[46,51],[31.5,59.5],[18,62.5]],[[50.5,51],[61.5,65],[57,87]]],
    feet:['tip','side'], cape:'flow', wind:1, fx:'speed', grounded:1 },
  fly:{ head:[74,20], dir:1, tilt:-.16, expr:'resolve',
    sh:[[63,26],[68,30]], chest:[62,31.5], waist:[55,40], hip:[[49,45.5],[53,48]],
    /* rear arm swept back along the flank: streamlined flight, no under-
       chest loop to tangle the silhouette */
    arms:[[[63,27],[53,33.5],[42.5,38]],[[68,29],[81,21.5],[92.5,14.5]]],
    hands:['fist','fist'], fore:[1,1.4],
    legs:[[[49,46],[35,53],[21.5,55]],[[53,48],[41,59],[27.5,63.5]]],
    feet:['tip','tip'], cape:'flow', wind:1, fx:'speed', grounded:0 },
  raise:{ head:[50,12], dir:.4, expr:'resolve',
    /* both arms in a high wide V, hands well CLEAR of the head */
    sh:[[40,25],[60,25]], chest:[50,32], waist:[50,43.5], hip:[[45.5,51],[54.5,51]],
    arms:[[[40,24.5],[31,15],[26,3.5]],[[60,24.5],[69,15],[74,3.5]]],
    hands:['up','up'],
    legs:[[[45.5,51],[40,71],[36,90.5]],[[54.5,51],[60,71],[64.5,90.5]]],
    feet:['side','side'], cape:'down', grounded:1 },
  herald:{ head:[51,12], dir:.6, expr:'shout',
    /* one arm flung high to the sky, the other thrown out and DOWN away
       from the trunk — no hand ever melts into the hip */
    sh:[[41,24.5],[59.5,24]], chest:[50,31.5], waist:[49.5,43], hip:[[45,51],[54.5,51]],
    arms:[[[41,25],[31.5,30.5],[22,26]],[[59.5,24],[70,15.5],[80,7]]],
    hands:['fist','point'],
    legs:[[[45,51],[39,70.5],[34.5,90]],[[55,51],[62,70],[68,89]]],
    feet:['side','side'], cape:'flow', wind:.6, grounded:1 },
  lift:{ head:[50,13], dir:.3, expr:'grit',
    sh:[[40,26],[60,26]], chest:[50,33], waist:[50,44], hip:[[45,52],[55,52]],
    arms:[[[40,25.5],[35.5,14],[42,5]],[[60,25.5],[64.5,14],[58,5]]],
    hands:['up','up'],
    legs:[[[45,52],[38.5,71],[33.5,90.5]],[[55,52],[62,71],[67.5,90.5]]],
    feet:['side','side'], cape:'down', grounded:1 },
  console:{ head:[55,14.5], dir:.8, tilt:.12, expr:'focus',
    sh:[[45,27],[57.5,25.5]], chest:[51,33], waist:[49,44], hip:[[45.5,52],[54,52]],
    arms:[[[45,28],[57,36.5],[69.5,40]],[[57.5,26.5],[67,37],[76.5,44.5]]],
    hands:['point','open'],
    legs:[[[46,52],[43,71.5],[41,91]],[[54,52],[58.5,71],[62,90.5]]],
    feet:['side','side'], cape:'down', grounded:1 },
  warn:{ head:[44.5,14], dir:-.55, tilt:-.1, expr:'alarm',
    sh:[[37.5,26.5],[55,27.5]], chest:[47,34], waist:[50,45], hip:[[47.5,52],[57,52]],
    arms:[[[37.5,26.5],[27.5,19],[18.5,11.5]],[[55,27.5],[45,35.5],[34.5,30.5]]],
    hands:['splay','open'],
    legs:[[[48,52],[51.5,71],[49,90.5]],[[57,52],[65.5,69.5],[72.5,88.5]]],
    feet:['side','side'], cape:'flow', wind:-.7, grounded:1 },
  leap:{ head:[57,10.5], dir:.55, expr:'shout',
    sh:[[45.5,22.5],[62,23.5]], chest:[53,30], waist:[51,40], hip:[[47,47],[56,48.5]],
    arms:[[[45.5,22.5],[36,15.5],[27,8.5]],[[62,23.5],[74.5,15.5],[85.5,8]]],
    hands:['open','fist'], fore:[1,1.9],
    legs:[[[47,47],[39.5,58.5],[29,66.5]],[[56,48.5],[65,60.5],[57.5,72.5]]],
    feet:['tip','tip'], cape:'up', grounded:0 },
  think:{ head:[50,12.5], dir:.55, tilt:.08, expr:'think',
    sh:[[40.5,25],[59.5,25]], chest:[50,32], waist:[50,43.5], hip:[[46,51],[54,51]],
    arms:[[[40.5,26],[46,36.5],[56.5,34.5]],[[59.5,25],[64,36],[54.5,19]]],
    hands:['fist','chin'],
    legs:[[[46,51],[44,71.5],[43,91]],[[54,51],[57.5,71.5],[59,91]]],
    feet:['side','side'], cape:'down', grounded:1 },
  monologue:{ head:[48,11.5], dir:.55, tilt:-.14, expr:'scheme',
    sh:[[39,24.5],[58,24]], chest:[49,31.5], waist:[49.5,43], hip:[[45,51],[55,51]],
    arms:[[[39,25],[33.5,36],[36.5,46.5]],[[58,24],[68,14.5],[79,7.5]]],
    hands:['fist','splay'],
    legs:[[[45,51],[41.5,71],[39.5,91]],[[55,51],[60,71],[62.5,91]]],
    feet:['side','side'], cape:'down', grounded:1 },
  cower:{ head:[55.5,25], dir:-.55, tilt:.2, expr:'fear',
    sh:[[48,34],[63.5,33]], chest:[57,40], waist:[58,49], hip:[[53,56],[62,56]],
    arms:[[[48,34],[40,26.5],[33.5,18]],[[63.5,33.5],[52.5,38.5],[42.5,33.5]]],
    hands:['splay','open'],
    legs:[[[53,56],[47.5,71.5],[49,89.5]],[[62,56],[68.5,70.5],[63.5,88.5]]],
    feet:['side','side'], cape:'none', grounded:1 },
  brace:{ head:[49,14], dir:.55, expr:'grit',
    sh:[[40,26.5],[58.5,26.5]], chest:[49.5,33.5], waist:[49.5,44.5], hip:[[44.5,52],[55.5,52]],
    arms:[[[40,27],[47.5,35],[57.5,30.5]],[[58.5,27],[50,36],[41.5,31]]],
    hands:['fist','fist'],
    legs:[[[44.5,52],[37.5,70.5],[33,90]],[[55.5,52],[63,70.5],[68,90]]],
    feet:['side','side'], cape:'flow', wind:-.5, grounded:1 },
  punch:{ head:[47,15], dir:.8, expr:'grit',
    sh:[[38.5,27],[57,26]], chest:[48,33.5], waist:[47,44.5], hip:[[43,52],[52.5,52]],
    arms:[[[38.5,27],[31,34.5],[35,44]],[[57,26.5],[64.5,28.5],[70.5,29.5]]],
    hands:['fist','fist'], fore:[1,2.5],
    legs:[[[43,52],[36,70],[30,89.5]],[[52.5,52],[60.5,68],[67.5,86]]],
    feet:['side','side'], cape:'flow', wind:-.8, grounded:1 },
};
POSES.focus=POSES.console;

/* --- hands: palm + real drawn fingers, knuckles, thumbs --- */
function drawHand(x,at,ang,type,scale,col,o){
  o=o||{};
  const lw=(o.lw||2)*0.8;
  x.save(); x.translate(at[0],at[1]); x.rotate(ang); x.scale(scale,scale);
  x.strokeStyle=INKC; x.lineJoin='round'; x.lineCap='round';
  x.fillStyle=col;
  const SW=s2=>{ x.lineWidth=(lw*(s2||1))/Math.sqrt(scale); x.stroke(); };
  const detail=scale>=0.45;   /* micro-creases only when they can survive print */
  /* one finger: two phalanges, tapered, its own silhouette */
  const finger=(bx,by,a1,l1,bend,l2,w)=>{
    const j=[bx+Math.cos(a1)*l1, by+Math.sin(a1)*l1];
    const a2=a1+bend;
    const t=[j[0]+Math.cos(a2)*l2, j[1]+Math.sin(a2)*l2];
    limbPath(x,[[bx,by],j,t],[w,w*0.9,w*0.72]);
    x.fill(); SW(0.62);
    if(detail){ /* knuckle crease */
      const p=vperp(vnorm(vsub(t,j)));
      x.beginPath(); x.moveTo(j[0]+p[0]*w*0.55,j[1]+p[1]*w*0.55);
      x.lineTo(j[0]-p[0]*w*0.55,j[1]-p[1]*w*0.55); SW(0.4);
    }
    return t;
  };
  if(o.fore&&(type==='fist'||type==='point')){
    /* THE FORESHORTENED FIST — knuckles first, coming at the reader */
    /* forearm stub behind */
    x.beginPath(); x.ellipse(-2.7,0.1,2.3,3.0,0,0,7); x.fill(); SW(0.9);
    /* the four proximal fingers facing the reader, drawn as one brick
       with a scalloped knuckle ridge, then split by true creases */
    x.beginPath();
    x.moveTo(-1.95,-2.6);
    x.quadraticCurveTo(-1.3,-3.65,-0.45,-3.35);   /* knuckle 1 */
    x.quadraticCurveTo(0.05,-3.75,0.9,-3.45);     /* knuckle 2 */
    x.quadraticCurveTo(1.5,-3.8,2.3,-3.35);       /* knuckle 3 */
    x.quadraticCurveTo(3.1,-3.6,3.7,-2.95);       /* knuckle 4 */
    x.quadraticCurveTo(4.65,-1.6,4.35,0.6);       /* outer edge */
    x.quadraticCurveTo(4.15,2.3,2.9,2.75);
    x.lineTo(-1.5,2.85);
    x.quadraticCurveTo(-2.75,2.1,-2.7,0.2);
    x.closePath(); x.fill(); SW(1);
    /* finger separations: three creases falling from the scallop valleys */
    for(let i=0;i<3;i++){
      const cx0=-0.35+i*1.45;
      x.beginPath(); x.moveTo(cx0,-3.2+i*0.06);
      x.quadraticCurveTo(cx0+0.3,-1.2,cx0+0.05,0.9); SW(0.55);
    }
    /* second knuckle row: four short dashes */
    if(detail) for(let i=0;i<4;i++){
      x.beginPath(); x.moveTo(-1.35+i*1.45,-2.15);
      x.quadraticCurveTo(-1.0+i*1.45,-2.5,-0.6+i*1.45,-2.2); SW(0.4);
    }
    /* the thumb clamped across the heel of the hand */
    x.beginPath();
    x.moveTo(-2.5,1.3);
    x.quadraticCurveTo(0.4,1.9,2.6,1.6);
    x.quadraticCurveTo(3.5,2.2,2.7,3.1);
    x.quadraticCurveTo(0.2,3.9,-2.1,3.3);
    x.quadraticCurveTo(-3.1,2.5,-2.5,1.3);
    x.closePath(); x.fill(); SW(0.85);
    if(detail){ /* thumbnail */
      x.beginPath(); x.ellipse(1.9,2.4,0.6,0.42,-0.25,0,7); SW(0.45);
    }
    x.restore(); return;
  }
  if(type==='fist'||type==='hip'||type==='chin'){
    /* clenched side fist: back of hand + four curled fingers + thumb over */
    x.beginPath();
    x.moveTo(-2.0,-2.2); x.quadraticCurveTo(0.7,-2.85,2.0,-2.35);
    x.lineTo(2.3,2.1); x.quadraticCurveTo(0.3,2.8,-1.6,2.35);
    x.quadraticCurveTo(-2.55,0.2,-2.0,-2.2);
    x.closePath(); x.fill(); SW(1);
    /* four curled fingers stacked on the striking edge, each its own bump */
    for(let i=0;i<4;i++){
      const fy=-2.35+i*1.32;
      x.beginPath();
      x.moveTo(1.5,fy+0.06);
      x.quadraticCurveTo(3.85-i*0.16,fy-0.14,4.1-i*0.18,fy+0.62);
      x.quadraticCurveTo(3.9-i*0.16,fy+1.22,1.6,fy+1.18);
      x.closePath(); x.fill(); SW(0.6);
    }
    /* thumb pressing across the lower fingers */
    x.beginPath();
    x.moveTo(-0.7,2.3); x.quadraticCurveTo(1.7,3.15,3.2,2.05);
    x.quadraticCurveTo(3.85,1.3,3.15,0.85);
    x.quadraticCurveTo(2.0,1.6,0.5,1.75);
    x.quadraticCurveTo(-0.7,1.85,-0.7,2.3);
    x.closePath(); x.fill(); SW(0.7);
    if(detail){ /* wrist crease */
      x.beginPath(); x.moveTo(-1.9,-1.6); x.lineTo(-2.2,1.6); SW(0.4);
    }
  } else if(type==='point'){
    /* pointing: palm, three curled fingers, index extended, thumb on top */
    x.beginPath();
    x.moveTo(-1.8,-1.9); x.quadraticCurveTo(0.9,-2.5,2.2,-1.9);
    x.lineTo(2.5,2.0); x.quadraticCurveTo(0.4,2.75,-1.6,2.2);
    x.quadraticCurveTo(-2.45,0.1,-1.8,-1.9);
    x.closePath(); x.fill(); SW(1);
    /* three curled fingers under the index */
    for(let i=0;i<3;i++){
      const fy=-0.35+i*1.06;
      x.beginPath();
      x.moveTo(1.8,fy);
      x.quadraticCurveTo(3.5-i*0.2,fy-0.12,3.7-i*0.22,fy+0.5);
      x.quadraticCurveTo(3.5-i*0.2,fy+1.0,1.9,fy+0.96);
      x.closePath(); x.fill(); SW(0.55);
    }
    /* the index, two phalanges, dead level */
    finger(2.1,-1.35,-0.06,2.5,0.05,2.1,0.62);
    /* thumb lying along the top */
    x.beginPath();
    x.moveTo(-0.9,-1.95); x.quadraticCurveTo(1.1,-2.6,2.6,-2.1);
    x.quadraticCurveTo(2.9,-1.55,2.3,-1.35);
    x.quadraticCurveTo(0.8,-1.75,-0.6,-1.35);
    x.quadraticCurveTo(-1.2,-1.6,-0.9,-1.95);
    x.closePath(); x.fill(); SW(0.6);
  } else if(type==='splay'){
    /* open hand, four SEPARATE fingers fanned with daylight between */
    x.beginPath();  /* palm */
    x.moveTo(-1.9,-1.5); x.quadraticCurveTo(-0.5,-2.3,0.9,-2.05);
    x.quadraticCurveTo(2.2,-1.6,2.4,-0.2);
    x.quadraticCurveTo(2.3,1.5,0.9,2.2);
    x.quadraticCurveTo(-0.8,2.75,-1.9,1.9);
    x.quadraticCurveTo(-2.6,0.2,-1.9,-1.5);
    x.closePath(); x.fill(); SW(1);
    /* fingers: index high, middle longest, ring, pinky short */
    finger(1.5,-1.7,-0.92,1.9,0.14,1.7,0.56);
    finger(2.2,-0.9,-0.44,2.2,0.12,1.95,0.6);
    finger(2.35,0.15, 0.02,2.1,0.10,1.8,0.57);
    finger(2.1,1.15, 0.5,1.7,0.12,1.35,0.52);
    /* thumb opposed, up and back */
    finger(-0.9,-1.8,-1.9,1.5,-0.3,1.25,0.66);
    if(detail){ /* palm crease */
      x.beginPath(); x.moveTo(-0.9,-0.7); x.quadraticCurveTo(0.4,0.1,0.6,1.4); SW(0.4);
    }
  } else if(type==='up'){
    /* palm up, carrying overhead: plate + four fingertips curling */
    x.beginPath();
    x.moveTo(-2.4,0.7); x.quadraticCurveTo(-2.2,-1.4,0,-1.7);
    x.lineTo(3.4,-1.8); x.quadraticCurveTo(4.6,-1.5,4.4,-0.5);
    x.lineTo(4.1,0.9); x.quadraticCurveTo(1.4,1.8,-1.0,1.6);
    x.closePath(); x.fill(); SW(1);
    /* four fingers curling up past the far edge */
    for(let i=0;i<4;i++){
      const fx2=0.4+i*1.05;
      x.beginPath();
      x.moveTo(fx2,-1.75);
      x.quadraticCurveTo(fx2+0.18,-2.9,fx2+0.85,-2.8);
      x.quadraticCurveTo(fx2+1.05,-2.2,fx2+0.9,-1.78);
      x.closePath(); x.fill(); SW(0.55);
    }
    /* thumb hooked on the near edge */
    x.beginPath();
    x.moveTo(-1.9,0.9); x.quadraticCurveTo(-1.3,2.1,-0.1,2.15);
    x.quadraticCurveTo(0.5,1.7,0.1,1.3); x.quadraticCurveTo(-0.9,1.5,-1.4,0.6);
    x.closePath(); x.fill(); SW(0.6);
  } else { /* open (relaxed): fingers together but truly drawn */
    x.beginPath();  /* palm */
    x.moveTo(-1.8,-1.6); x.quadraticCurveTo(0.4,-2.3,2.0,-1.9);
    x.lineTo(2.3,1.5); x.quadraticCurveTo(0.5,2.5,-1.3,2.0);
    x.quadraticCurveTo(-2.5,0.4,-1.8,-1.6);
    x.closePath(); x.fill(); SW(1);
    /* four fingers, slightly different lengths, tiny gaps */
    finger(2.0,-1.45,-0.16,1.8,0.10,1.5,0.52);
    finger(2.2,-0.55,-0.05,2.0,0.08,1.7,0.55);
    finger(2.25,0.4, 0.06,1.85,0.08,1.55,0.52);
    finger(2.1,1.3, 0.2,1.5,0.10,1.2,0.47);
    /* thumb along the lower edge */
    x.beginPath();
    x.moveTo(-0.9,1.7); x.quadraticCurveTo(0.8,2.6,2.2,2.1);
    x.quadraticCurveTo(2.5,1.6,2.0,1.35);
    x.quadraticCurveTo(0.7,1.85,-0.5,1.35);
    x.quadraticCurveTo(-1.15,1.4,-0.9,1.7);
    x.closePath(); x.fill(); SW(0.6);
  }
  x.restore();
}

/* --- boots with weight --- */
function drawBoot(x,ankle,o){
  /* o: {type:'side'|'tip', dirX (toe direction ±1), col, lw, cuff, scale} */
  o=o||{};
  const s=o.scale||1, d=o.dirX==null?1:o.dirX, col=o.col||INKC;
  x.save(); x.translate(ankle[0],ankle[1]); x.scale(s,s);
  x.strokeStyle=INKC; x.lineJoin='round';
  x.fillStyle=col;
  if(o.type==='tip'){
    /* pointed, in flight — toe extended along the shin direction */
    x.rotate(o.ang||0);
    x.beginPath();
    x.moveTo(-2.2,-3.4);
    x.quadraticCurveTo(3.2,-2.6,6.6,0.4);        /* instep to toe */
    x.quadraticCurveTo(4.4,2.4,1.4,2.6);
    x.quadraticCurveTo(-1.6,2.8,-2.6,1.6);
    x.closePath(); x.fill();
    x.lineWidth=o.lw||1.8; x.stroke();
    /* cuff */
    x.beginPath(); x.moveTo(-2.6,-3.8); x.lineTo(-0.2,-2.2); x.lineWidth=(o.lw||1.8)*0.7; x.stroke();
  } else {
    /* planted side boot: heel, flat sole, round toe */
    x.beginPath();
    x.moveTo(-2.4*d,-3.2);                       /* back of shin */
    x.lineTo(-2.8*d,2.0);                        /* heel back */
    x.quadraticCurveTo(-2.9*d,3.8,-1.2*d,3.9);   /* heel block */
    x.lineTo(4.2*d,3.9);                         /* sole */
    x.quadraticCurveTo(6.3*d,3.8,6.1*d,2.6);     /* toe cap */
    x.quadraticCurveTo(5.6*d,1.2,3.4*d,0.6);     /* instep */
    x.quadraticCurveTo(2.2*d,0.2,2.0*d,-2.8);    /* front of shin */
    x.closePath(); x.fill();
    x.lineWidth=o.lw||1.8; x.stroke();
    /* sole line + cuff notch */
    x.lineWidth=(o.lw||1.8)*0.62;
    x.beginPath(); x.moveTo(-2.6*d,2.2); x.lineTo(5.9*d,2.5); x.stroke();
    if(o.cuff!==false){
      x.beginPath(); x.moveTo(-2.3*d,-3.0); x.lineTo(0*d,-1.6); x.lineTo(2.0*d,-3.0); x.stroke();
    }
  }
  x.restore();
}

/* --- capes with folds and a black underside --- */
function drawCape(x,sh,mode,wind,colOut,seed,lw){
  if(mode==='none') return;
  const rng=mulberry(seed||7);
  const L=sh[0], R=sh[1];
  const cx=(L[0]+R[0])/2, cy=(L[1]+R[1])/2;
  const w=wind||0;
  let hem=[];
  let pts=[];
  if(mode==='flow'){
    const dx=-(w>=0?1:-1);       /* streams away from facing */
    const reach=34+Math.abs(w)*14;
    const liftY=cy+6-Math.abs(w)*10;
    /* in full flight the cape STREAMS level behind the shoulders instead
       of draping down over the trunk — the torso keeps its own silhouette */
    const drop=Math.abs(w)>=0.95?14:30;
    hem=[[cx+dx*reach, liftY+drop],[cx+dx*(reach*0.72), liftY+drop+8],[cx+dx*(reach*0.4), cy+drop+10]];
    pts=[L,[cx+dx*reach*0.55, cy-2-Math.abs(w)*6],[cx+dx*reach, liftY+14],
      hem[0],hem[1],hem[2],[R[0],cy+(Math.abs(w)>=0.95?18:34)],R];
  } else if(mode==='up'){
    hem=[[cx-30, cy-16],[cx-20, cy-26],[cx-6, cy-20]];
    pts=[L,[cx-32,cy+2],hem[0],hem[1],hem[2],[cx+4,cy-8],R];
  } else { /* down */
    const sway=w*6+(rng()*2-1)*2;
    hem=[[cx-16+sway, cy+42],[cx-6+sway*0.6, cy+45],[cx+6+sway*0.4, cy+44],[cx+15+sway*0.2, cy+41]];
    pts=[[L[0]-2,L[1]],[cx-17+sway*0.7, cy+22], hem[0],hem[1],hem[2],hem[3],[cx+16, cy+20],[R[0]+2,R[1]]];
  }
  /* scallop the hem: pull midpoints inward */
  blobPath(x,pts);
  x.fillStyle=colOut; x.fill();
  /* the cape always runs a value DARKER than the suit, so the two masses
     never fuse even when trim and suit share a hue */
  blobPath(x,pts);
  x.fillStyle='rgba(35,28,18,.18)'; x.fill();
  /* spot black: the turned underside along the hem */
  x.save(); blobPath(x,pts); x.clip();
  x.fillStyle=INKC;
  x.beginPath();
  const h0=hem[0], hN=hem[hem.length-1];
  x.moveTo(h0[0]-8,h0[1]+9);
  hem.forEach(h=>x.lineTo(h[0],h[1]-7-rng()*3));
  x.lineTo(hN[0]+8,hN[1]+9);
  x.closePath(); x.fill();
  x.restore();
  blobPath(x,pts);
  x.strokeStyle=INKC; x.lineWidth=lw||2; x.stroke();
  /* fold lines from the clasp */
  x.strokeStyle='rgba(35,28,18,.8)'; x.lineWidth=(lw||2)*0.5;
  for(let i=0;i<3;i++){
    const t=(i+1)/4;
    const target=hem[Math.min(hem.length-1,i)]||hem[0];
    x.beginPath(); x.moveTo(cx-6+i*6, cy+1);
    x.quadraticCurveTo(cx+(target[0]-cx)*0.4, cy+(target[1]-cy)*0.55, target[0]+(i-1)*2, target[1]-3);
    x.stroke();
  }
}

/* --- the constructed head --- */
const EXPR={
  resolve:{ brow:[0.15,-0.1], eye:0.8, mouth:'firm' },
  focus:  { brow:[0.25,0.0],  eye:0.65, mouth:'firm' },
  grit:   { brow:[0.5,-0.2],  eye:0.6, mouth:'grit' },
  shout:  { brow:[0.55,-0.25],eye:0.7, mouth:'shout' },
  alarm:  { brow:[-0.5,0.3],  eye:1.15, mouth:'o' },
  fear:   { brow:[-0.6,0.45], eye:1.2, mouth:'wail' },
  triumph:{ brow:[-0.1,0.05], eye:0.85, mouth:'smile' },
  smile:  { brow:[-0.15,0.1], eye:0.9, mouth:'smile' },
  think:  { brow:[0.3,0.05],  eye:0.55, mouth:'small' },
  scheme: { brow:[0.4,-0.35], eye:0.7, mouth:'smirk' },
};
/* skull + jaw silhouette in local r=5 space; d = facing (-1..1);
   id carries the face's IDENTITY — jaw width and chin push vary per hero */
function skullPath(x,d,jaw,id){
  const cs=d*0.8*(id&&id.chin!=null?id.chin:1);   /* chin shift */
  const jw=(jaw==='soft'?0.86:1)*(id&&id.jawW?id.jawW:1);
  x.beginPath();
  x.moveTo(-4.75,-0.4);
  x.bezierCurveTo(-4.95,-4.1,-2.7,-6.0,0.2,-6.0);
  x.bezierCurveTo(3.2,-6.0,5.05,-3.9,4.95,-0.5);
  x.bezierCurveTo(4.92,1.3,4.55*jw,2.9,3.75*jw,4.0);
  x.bezierCurveTo(2.8,5.5,1.7,6.35,0.4+cs*0.7,6.4);
  x.bezierCurveTo(-1.5+cs*0.3,6.35,-3.3,4.7,-3.95,2.7);
  x.bezierCurveTo(-4.45,1.4,-4.72,0.5,-4.75,-0.4);
  x.closePath();
}
/* profile skull with a real nose, facing +x */
function profilePath(x,jaw){
  x.beginPath();
  x.moveTo(-4.4,-0.6);
  x.bezierCurveTo(-4.7,-4.2,-2.3,-6.05,0.6,-6.0);
  x.bezierCurveTo(3.4,-5.95,5.0,-3.9,5.0,-1.6);   /* forehead */
  x.bezierCurveTo(5.0,-1.0,4.6,-0.6,4.55,-0.2);   /* brow notch */
  x.bezierCurveTo(5.3,0.6,5.9,1.6,5.75,2.1);      /* nose */
  x.bezierCurveTo(5.3,2.5,4.7,2.4,4.4,2.4);       /* under nose */
  x.bezierCurveTo(4.75,3.0,4.75,3.3,4.4,3.6);     /* upper lip */
  x.bezierCurveTo(4.85,4.0,4.85,4.4,4.45,4.8);    /* lower lip */
  x.bezierCurveTo(4.2,5.6,3.4,6.2,2.2,6.35);      /* chin */
  x.bezierCurveTo(0.2,6.5,-2.4,5.6,-3.4,3.4);
  x.bezierCurveTo(-4.1,2.0,-4.35,0.6,-4.4,-0.6);
  x.closePath();
}
function drawHeadC(x,o){
  /* o: {cx,cy,r,tilt,dir,expr,style,suit,trim,skin,lw,shade} */
  const s=(o.r||5)/5;
  const d=clamp(o.dir==null?0.55:o.dir,-1.15,1.15);
  const profile=Math.abs(d)>=0.95;
  const E=EXPR[o.expr]||EXPR.resolve;
  const id=o.ident||{};
  const skin=o.skin||id.skin||SKIN;
  x.save();
  x.translate(o.cx,o.cy);
  x.rotate(o.tilt||0);
  x.scale(s*(d<0?-1:1),s);      /* mirror for left-facing so features stay drawn +x */
  const dd=Math.abs(d);
  const lw=(o.lw||2)/s;
  const st=o.style||'face';
  const suitC=o.suitC||'#345';
  /* — silhouette — */
  if(profile) profilePath(x,o.jaw); else skullPath(x,dd,o.jaw,id);
  x.fillStyle=skin; x.fill();
  x.strokeStyle=INKC; x.lineWidth=lw; x.stroke();
  const fx=profile?1.9:dd*1.35;   /* feature shift toward facing */
  /* — cowls / hair — */
  if(st==='cowl'||st==='speedster'||st==='cosmic'||st==='mystic'||st==='gadget'){
    /* the cowl mass covers the skull down to the jawline, leaving the mouth */
    x.save();
    if(profile) profilePath(x,o.jaw); else skullPath(x,dd,o.jaw,id);
    x.clip();
    x.beginPath();
    x.moveTo(-6.5,-7);
    x.lineTo(6.5,-7);
    x.lineTo(6.5, st==='cosmic'?-1.6:2.2);
    if(st==='cosmic'){
      x.lineTo(-6.5,-1.6);
    } else {
      /* the face opening: across under the nose, classic */
      x.quadraticCurveTo(4.2,2.2,3.4,2.7);
      x.quadraticCurveTo(1.6,1.9,0.4,2.4);
      x.quadraticCurveTo(-1.4,3.2,-2.6,3.1);
      x.quadraticCurveTo(-4.0,3.0,-6.5,3.4);
    }
    x.closePath();
    x.fillStyle=suitC; x.fill();
    /* cowl brow ridge */
    x.strokeStyle='rgba(35,28,18,.85)'; x.lineWidth=lw*0.5;
    x.beginPath(); x.moveTo(-2.8+fx*0.4,-2.2); x.quadraticCurveTo(0.4+fx*0.4,-2.9,3.0+fx*0.3,-2.1); x.stroke();
    if(st!=='cosmic'){ /* cowl nose */
      x.beginPath(); x.moveTo(0.7+fx*0.55,-1.1); x.lineTo(1.3+fx*0.55,1.6); x.quadraticCurveTo(0.9+fx*0.5,2.1,0.4+fx*0.5,2.1); x.stroke();
    }
    x.restore();
    if(profile) profilePath(x,o.jaw); else skullPath(x,dd,o.jaw,id);
    x.strokeStyle=INKC; x.lineWidth=lw; x.stroke();
    /* ears / fins / crests outside the skull */
    x.fillStyle=suitC; x.strokeStyle=INKC; x.lineWidth=lw*0.8;
    if(st==='cowl'){         /* short ears */
      for(const ex of [-2.7,2.9]){
        x.beginPath(); x.moveTo(ex-0.9,-4.6); x.lineTo(ex-0.1,-7.6); x.lineTo(ex+0.9,-4.7);
        x.closePath(); x.fill(); x.stroke();
      }
    } else if(st==='speedster'){ /* temple wings */
      x.beginPath(); x.moveTo(3.4,-3.4); x.quadraticCurveTo(6.4,-4.6,7.4,-6.6);
      x.quadraticCurveTo(5.6,-5.8,4.4,-5.6); x.quadraticCurveTo(5.2,-6.6,5.4,-7.6);
      x.quadraticCurveTo(3.6,-6.2,2.8,-4.6); x.closePath(); x.fill(); x.stroke();
    } else if(st==='cosmic'){ /* helmet fin */
      x.beginPath(); x.moveTo(-0.8,-5.9); x.quadraticCurveTo(0.3,-8.6,1.4,-5.9);
      x.closePath(); x.fill(); x.stroke();
      /* helmet star */
      x.fillStyle='#f2e7c9';
      x.save(); x.translate(0.2,-4.0); x.scale(0.16,0.16);
      x.beginPath(); x.moveTo(0,-5); x.quadraticCurveTo(0,0,5,0); x.quadraticCurveTo(0,0,0,5);
      x.quadraticCurveTo(0,0,-5,0); x.quadraticCurveTo(0,0,0,-5); x.fill(); x.restore();
    } else if(st==='mystic'){ /* hood peak */
      x.beginPath(); x.moveTo(-4.9,-0.6); x.quadraticCurveTo(-1.4,-8.4,4.4,-3.4);
      x.quadraticCurveTo(5.4,-2.4,5.1,-0.6);
      x.quadraticCurveTo(3.6,-5.4,0.2,-5.6); x.quadraticCurveTo(-3.4,-5.4,-4.9,-0.6);
      x.closePath(); x.fill(); x.stroke();
    }
    if(st==='gadget'){ /* goggles up on the brow */
      x.strokeStyle=INKC; x.lineWidth=lw*0.7; x.fillStyle='#d9c8a2';
      x.beginPath(); x.moveTo(-4.2,-3.4); x.lineTo(4.6,-3.6); x.stroke();
      for(const gx of [-1.4+fx*0.4,2.0+fx*0.4]){
        x.beginPath(); x.arc(gx,-3.7,1.25,0,7); x.fill(); x.stroke();
        x.fillStyle='rgba(255,255,255,.85)';
        x.beginPath(); x.arc(gx-0.4,-4.0,0.4,0,7); x.fill();
        x.fillStyle='#d9c8a2';
      }
    }
  }
  else if(st==='hair'||st==='mask'){
    /* hair as MASS with flow — four hairlines so no two heads share one */
    const hairC=o.hairC||id.hairC||INKC;
    const hl=id.hairline||0;
    x.fillStyle=hairC;
    x.beginPath();
    x.moveTo(-4.85,0.6);                          /* sideburn */
    x.bezierCurveTo(-5.2,-4.2,-2.8,-6.35-(hl===3?0.5:0),0.3,-6.35-(hl===3?0.7:0));
    x.bezierCurveTo(3.5,-6.35-(hl===3?0.4:0),5.3,-4.0,5.05,-0.4);
    x.lineTo(4.35,-1.4+(hl===2?-0.5:0));          /* temple point */
    if(hl===1){ /* widow's peak */
      x.quadraticCurveTo(4.6,-2.8,3.1,-3.6);
      x.quadraticCurveTo(1.6,-4.3,0.6,-3.4);      /* the peak dips */
      x.lineTo(0.1,-2.7); x.lineTo(-0.5,-3.5);
      x.quadraticCurveTo(-2.2,-4.4,-3.6,-3.2);
    } else if(hl===2){ /* high square crop */
      x.quadraticCurveTo(4.7,-3.4,3.2,-3.9);
      x.lineTo(-2.2,-4.15);
      x.quadraticCurveTo(-3.6,-3.9,-3.8,-2.4);
    } else if(hl===3){ /* swept back, deep temples */
      x.quadraticCurveTo(4.8,-2.4,3.5,-3.2);
      x.quadraticCurveTo(1.0,-4.9,-1.6,-4.1);
      x.quadraticCurveTo(-3.5,-3.4,-3.8,-1.9);
    } else { /* side part with forelock */
      x.quadraticCurveTo(4.6,-2.8,3.3,-3.5);
      x.quadraticCurveTo(0.8,-4.6,-1.9,-3.7);
      x.quadraticCurveTo(-3.6,-3.1,-3.8,-1.6);
    }
    x.lineTo(-3.95,0.2);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.8; x.stroke();
    /* shine: one short glint on the crown, toward the sun */
    x.strokeStyle='rgba(239,230,205,.8)'; x.lineWidth=lw*0.42;
    x.beginPath(); x.moveTo(-1.6,-5.15); x.quadraticCurveTo(-0.6,-5.5,0.5,-5.25); x.stroke();
    /* carved locks: the comb's own flow lines */
    x.strokeStyle='rgba(242,231,201,.55)'; x.lineWidth=lw*0.4; x.lineCap='round';
    if(hl===3){ /* swept straight back */
      x.beginPath(); x.moveTo(-2.8,-3.6); x.quadraticCurveTo(-1.4,-5.2,1.2,-5.4); x.stroke();
      x.beginPath(); x.moveTo(-1.4,-2.9); x.quadraticCurveTo(0.6,-4.4,3.2,-4.3); x.stroke();
      x.beginPath(); x.moveTo(2.4,-4.8); x.quadraticCurveTo(3.8,-3.9,4.4,-2.6) ; x.stroke();
    } else {
      x.beginPath(); x.moveTo(-3.4,-3.5); x.quadraticCurveTo(-2.2,-4.9,-0.2,-5.0); x.stroke();
      x.beginPath(); x.moveTo(1.6,-4.85); x.quadraticCurveTo(3.2,-4.2,4.05,-2.9); x.stroke();
    }
    if(hl===0||hl===1){ /* forelock */
      x.fillStyle=hairC;
      x.beginPath(); x.moveTo(-0.55,-4.0); x.quadraticCurveTo(0.05,-3.5,0.3,-3.0);
      x.lineTo(0.95,-3.95); x.closePath(); x.fill();
    }
    if(st==='mask'){ /* domino mask with white lenses, Silver Age fashion */
      x.fillStyle=suitC;
      x.beginPath();
      x.moveTo(-3.4+fx*0.5,-1.7); x.quadraticCurveTo(0.4+fx*0.4,-2.6,3.8+fx*0.4,-1.6);
      x.quadraticCurveTo(4.0+fx*0.4,0.4,2.6+fx*0.4,0.6);
      x.quadraticCurveTo(0.6+fx*0.4,0.0,-1.4+fx*0.4,0.6);
      x.quadraticCurveTo(-3.2+fx*0.5,0.5,-3.4+fx*0.5,-1.7);
      x.closePath(); x.fill();
      x.strokeStyle=INKC; x.lineWidth=lw*0.55; x.stroke();
    }
  }
  else if(st==='lady'){
    /* villainess bob with flip */
    x.fillStyle=o.hairC||INKC;
    x.beginPath();
    x.moveTo(-5.4,2.6);
    x.bezierCurveTo(-5.8,-3.4,-3.4,-6.4,0.2,-6.4);
    x.bezierCurveTo(3.8,-6.4,5.6,-3.6,5.4,0.4);
    x.bezierCurveTo(5.3,1.8,5.6,2.8,6.2,3.6);     /* the flip */
    x.bezierCurveTo(4.8,3.7,4.2,3.2,4.0,2.4);
    x.quadraticCurveTo(4.8,-3.2,2.6,-4.0);        /* over brow */
    x.quadraticCurveTo(0.6,-4.8,-1.6,-4.2);
    x.quadraticCurveTo(-3.6,-3.7,-3.9,-0.6);
    x.bezierCurveTo(-4.0,1.0,-3.8,2.0,-3.2,3.2);
    x.bezierCurveTo(-3.9,3.8,-5.0,3.4,-5.4,2.6);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.8; x.stroke();
    x.strokeStyle='#efe6cd'; x.lineWidth=lw*0.5;
    x.beginPath(); x.moveTo(-2.2,-5.2); x.quadraticCurveTo(0.4,-5.9,2.6,-4.9); x.stroke();
  }
  else if(st==='ponytail'||st==='wingtail'){
    /* hair pulled up into a HIGH TAIL streaming behind — a silhouette no
       cowl shares */
    const hairC=o.hairC||id.hairC||'#6b3d1e';
    x.fillStyle=hairC;
    x.beginPath();
    x.moveTo(-4.85,0.6);
    x.bezierCurveTo(-5.25,-4.4,-2.8,-6.5,0.3,-6.5);
    x.bezierCurveTo(3.6,-6.5,5.3,-4.2,5.05,-0.6);
    x.lineTo(4.4,-1.5);
    x.quadraticCurveTo(4.7,-3.2,3.0,-3.9);
    x.quadraticCurveTo(0.6,-4.8,-1.8,-3.9);
    x.quadraticCurveTo(-3.7,-3.2,-3.9,-0.2);
    x.lineTo(-4.85,0.6);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.8; x.stroke();
    /* the tail */
    x.fillStyle=hairC;
    x.beginPath();
    x.moveTo(-3.2,-4.7);
    x.quadraticCurveTo(-7.4,-4.4,-10.0,-1.0);
    x.quadraticCurveTo(-11.0,0.8,-10.3,2.8);
    x.quadraticCurveTo(-8.7,0.6,-7.5,0.2);
    x.quadraticCurveTo(-8.3,1.9,-7.8,3.6);
    x.quadraticCurveTo(-6.2,0.7,-5.0,-0.6);
    x.quadraticCurveTo(-4.4,-1.7,-4.2,-3.1);
    x.closePath(); x.fill(); x.stroke();
    x.strokeStyle='rgba(242,231,201,.5)'; x.lineWidth=lw*0.4; x.lineCap='round';
    x.beginPath(); x.moveTo(-4.6,-3.4); x.quadraticCurveTo(-7.4,-2.6,-9.0,-0.2); x.stroke();
    x.fillStyle='#c22a1c';
    x.beginPath(); x.arc(-3.9,-3.6,0.95,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.5; x.stroke();
    if(st==='wingtail'){ /* the speedster's temple wings ride the hair */
      x.fillStyle='#f6efdd'; x.strokeStyle=INKC; x.lineWidth=lw*0.7;
      x.beginPath(); x.moveTo(3.4,-3.6); x.quadraticCurveTo(6.4,-4.8,7.4,-6.8);
      x.quadraticCurveTo(5.6,-6.0,4.4,-5.8); x.quadraticCurveTo(5.2,-6.8,5.4,-7.8);
      x.quadraticCurveTo(3.6,-6.4,2.8,-4.8); x.closePath(); x.fill(); x.stroke();
    }
  }
  else if(st==='oracle'){
    /* long falls of hair, a gold circlet, and the radiant third eye */
    const hairC=o.hairC||id.hairC||'#231c12';
    x.fillStyle=hairC;
    x.beginPath();
    x.moveTo(-5.0,-0.4);
    x.bezierCurveTo(-5.5,-4.8,-2.8,-6.6,0.3,-6.6);
    x.bezierCurveTo(3.6,-6.6,5.5,-4.4,5.1,-0.2);
    x.bezierCurveTo(5.3,3.4,4.9,6.6,4.3,9.0);
    x.lineTo(2.9,8.4);
    x.quadraticCurveTo(3.7,4.0,3.4,-0.4);
    x.quadraticCurveTo(3.6,-3.4,1.6,-4.2);
    x.quadraticCurveTo(-0.8,-5.0,-2.6,-4.0);
    x.quadraticCurveTo(-3.7,-3.2,-3.6,-0.4);
    x.quadraticCurveTo(-3.6,4.2,-2.8,8.4);
    x.lineTo(-4.2,9.0);
    x.bezierCurveTo(-4.9,6.4,-5.2,3.2,-5.0,-0.4);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.8; x.stroke();
    x.strokeStyle='rgba(242,231,201,.5)'; x.lineWidth=lw*0.4; x.lineCap='round';
    x.beginPath(); x.moveTo(-4.4,2.0); x.quadraticCurveTo(-4.6,5.0,-3.9,7.6); x.stroke();
    x.beginPath(); x.moveTo(4.4,1.8); x.quadraticCurveTo(4.6,4.8,3.9,7.4); x.stroke();
    /* circlet */
    x.strokeStyle='#e9c81f'; x.lineWidth=lw*0.75;
    x.beginPath(); x.moveTo(-3.8,-3.3); x.quadraticCurveTo(0.3,-4.3,4.0,-3.1); x.stroke();
    x.strokeStyle=INKC; x.lineWidth=lw*0.3;
    x.beginPath(); x.moveTo(-3.8,-3.3); x.quadraticCurveTo(0.3,-4.3,4.0,-3.1); x.stroke();
    /* the third eye, radiant */
    x.strokeStyle='#e9c81f'; x.lineWidth=lw*0.45;
    for(let i=0;i<5;i++){ const aa=-Math.PI/2+(i-2)*0.5;
      x.beginPath(); x.moveTo(0.4+Math.cos(aa)*1.5,-4.5+Math.sin(aa)*1.3);
      x.lineTo(0.4+Math.cos(aa)*2.6,-4.5+Math.sin(aa)*2.3); x.stroke(); }
    x.fillStyle='#f6efdd';
    x.beginPath(); x.moveTo(-0.9,-4.5); x.quadraticCurveTo(0.4,-5.5,1.7,-4.5);
    x.quadraticCurveTo(0.4,-3.5,-0.9,-4.5); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.4; x.stroke();
    x.fillStyle=INKC; x.beginPath(); x.arc(0.4,-4.5,0.42,0,7); x.fill();
  }
  else if(st==='aviatrix'){
    /* leather flight cap over BIG escaping curls; the amber goggles land
       over her eyes after the features */
    const hairC=o.hairC||id.hairC||'#d9a13c';
    x.fillStyle=hairC;
    const curls=[[-4.6,0.4,1.8],[-4.0,2.4,1.5],[-2.9,3.9,1.25],
                 [4.7,0.6,1.8],[4.1,2.6,1.5],[3.0,4.1,1.25]];
    for(const [hx,hy,hr] of curls){ x.beginPath(); x.arc(hx,hy,hr,0,7); x.fill(); }
    x.strokeStyle=INKC; x.lineWidth=lw*0.5;
    for(const [hx,hy,hr] of curls){ x.beginPath(); x.arc(hx,hy,hr,0,7); x.stroke(); }
    x.fillStyle='#8a5a2c';
    x.beginPath();
    x.moveTo(-4.95,0.2);
    x.bezierCurveTo(-5.3,-4.6,-2.8,-6.6,0.3,-6.6);
    x.bezierCurveTo(3.5,-6.6,5.3,-4.4,5.05,0.0);
    x.quadraticCurveTo(4.2,-1.4,4.1,-2.3);
    x.quadraticCurveTo(0.4,-3.4,-2.9,-2.5);
    x.quadraticCurveTo(-4.0,-1.2,-3.95,0.5);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.75; x.stroke();
    /* cap seams */
    x.strokeStyle='rgba(35,28,18,.55)'; x.lineWidth=lw*0.38;
    x.beginPath(); x.moveTo(0.3,-6.5); x.quadraticCurveTo(0.5,-4.6,0.5,-3.1); x.stroke();
    /* chin strap */
    x.strokeStyle=INKC; x.lineWidth=lw*0.45;
    x.beginPath(); x.moveTo(-3.7,0.9); x.quadraticCurveTo(0.2,6.9,4.0,0.7); x.stroke();
  }
  else if(st==='hardhat'){
    /* wide-brimmed site hat with its lamp, bob underneath */
    const hairC=o.hairC||id.hairC||'#4a2c14';
    /* two site-day plaits swing from under the shell — nobody mistakes
       whose hat this is */
    x.fillStyle=hairC;
    for(const sd of [-1,1]){
      const bx=sd*4.5;
      x.beginPath();
      x.moveTo(bx-0.9*sd,-1.6);
      x.quadraticCurveTo(bx+1.4*sd,0.6,bx+0.9*sd,3.4);
      x.quadraticCurveTo(bx+0.5*sd,5.6,bx-0.4*sd,6.6);
      x.quadraticCurveTo(bx-1.4*sd,5.2,bx-1.2*sd,3.0);
      x.quadraticCurveTo(bx-1.6*sd,0.6,bx-0.9*sd,-1.6);
      x.closePath(); x.fill();
      x.strokeStyle=INKC; x.lineWidth=lw*0.55; x.stroke();
      /* plait notches */
      x.strokeStyle='rgba(35,28,18,.7)'; x.lineWidth=lw*0.35;
      for(let k=0;k<3;k++){
        x.beginPath(); x.moveTo(bx-1.1*sd,0.4+k*1.9);
        x.lineTo(bx+0.9*sd,1.1+k*1.9); x.stroke();
      }
      /* the tie */
      x.fillStyle='#c22a1c';
      x.beginPath(); x.arc(bx-0.4*sd,6.5,0.62,0,7); x.fill();
      x.strokeStyle=INKC; x.lineWidth=lw*0.3; x.stroke();
      x.fillStyle=hairC;
    }
    x.fillStyle='#e9c81f';
    x.beginPath();
    x.moveTo(-5.9,-2.0);
    x.bezierCurveTo(-5.4,-6.2,-2.6,-7.4,0.3,-7.4);
    x.bezierCurveTo(3.4,-7.4,6.0,-6.0,6.1,-2.1);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.8; x.stroke();
    /* brim */
    x.fillStyle='#e9c81f';
    x.beginPath(); x.ellipse(0.1,-1.9,6.6,1.05,0,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.6; x.stroke();
    /* lamp */
    x.fillStyle='#d9c8a2';
    x.fillRect(-0.9,-6.6,2.4,1.7);
    x.strokeStyle=INKC; x.lineWidth=lw*0.5; x.strokeRect(-0.9,-6.6,2.4,1.7);
    x.fillStyle='rgba(255,255,255,.9)';
    x.beginPath(); x.arc(0.3,-5.75,0.5,0,7); x.fill();
    /* ridge */
    x.strokeStyle='rgba(35,28,18,.55)'; x.lineWidth=lw*0.4;
    x.beginPath(); x.moveTo(-3.4,-6.3); x.quadraticCurveTo(0.3,-7.0,3.8,-6.2); x.stroke();
  }
  else if(st==='peakcap'){
    /* controller's peaked cap: puffed crown, dark band, long visor */
    const hairC=o.hairC||id.hairC||'#2c2c34';
    x.fillStyle=hairC;    /* sideburns */
    x.fillRect(-4.5,-1.2,0.85,1.9); x.fillRect(3.9,-1.4,0.85,1.9);
    x.fillStyle=o.suitC||'#31465e';
    x.beginPath();
    x.moveTo(-5.4,-3.1);
    x.bezierCurveTo(-5.7,-7.0,-2.8,-8.1,0.3,-8.1);
    x.bezierCurveTo(3.5,-8.1,6.0,-6.8,5.8,-3.2);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.8; x.stroke();
    /* band */
    x.fillStyle=INKC;
    x.fillRect(-5.2,-3.2,10.8,1.1);
    /* badge on the band */
    x.fillStyle='#e9c81f';
    x.beginPath(); x.arc(0.9,-2.65,0.7,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.35; x.stroke();
    /* the visor: a thin peak off the band, toward facing */
    x.fillStyle=INKC;
    x.beginPath(); x.moveTo(0.6,-2.1);
    x.quadraticCurveTo(4.4,-2.3,6.2,-1.6);
    x.quadraticCurveTo(4.2,-1.1,1.0,-1.5);
    x.closePath(); x.fill();
  }
  else if(st==='finhelm'){
    /* full launch helm: shell, jaw guard, dorsal fin, dark visor. The
       face lives behind the glass — features are the helmet's. */
    const shell=o.suitC||'#345';
    x.fillStyle=shell;
    x.beginPath();
    x.moveTo(-5.3,-0.2);
    x.bezierCurveTo(-5.6,-4.8,-2.9,-6.9,0.3,-6.9);
    x.bezierCurveTo(3.6,-6.9,5.7,-4.6,5.5,-0.2);
    x.bezierCurveTo(5.4,2.6,4.4,5.2,2.4,6.6);
    x.quadraticCurveTo(0.3,7.4,-1.9,6.6);
    x.bezierCurveTo(-4.0,5.2,-5.2,2.6,-5.3,-0.2);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw; x.stroke();
    /* dorsal fin — always the launch red, tall enough to read at a glance */
    x.fillStyle='#c22a1c';
    x.beginPath(); x.moveTo(-2.3,-5.6);
    x.quadraticCurveTo(-0.6,-13.2,0.6,-13.4);
    x.quadraticCurveTo(1.9,-13.0,2.7,-5.7);
    x.quadraticCurveTo(0.2,-6.6,-2.3,-5.6);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.7; x.stroke();
    x.strokeStyle='rgba(255,255,255,.55)'; x.lineWidth=lw*0.4;
    x.beginPath(); x.moveTo(-0.9,-6.4); x.quadraticCurveTo(-0.2,-10.6,0.4,-12.4); x.stroke();
    /* visor */
    x.fillStyle='#241f16';
    rrp(x,-3.1,-2.6,7.0,2.6,1.1); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.5; rrp(x,-3.1,-2.6,7.0,2.6,1.1); x.stroke();
    x.fillStyle='#f6efdd';
    x.fillRect(-1.3,-1.85,1.5,0.75); x.fillRect(1.5,-1.85,1.5,0.75);
    /* breather grille */
    x.strokeStyle='rgba(35,28,18,.8)'; x.lineWidth=lw*0.45;
    for(let i=0;i<3;i++){ x.beginPath(); x.moveTo(-0.9+i*1.1,3.4); x.lineTo(-0.9+i*1.1,4.7); x.stroke(); }
    /* rivets */
    x.fillStyle='rgba(246,239,221,.7)';
    for(const [rx,ry] of [[-4.4,-2.2],[4.7,-2.4],[-3.6,3.2],[3.9,3.0]]){
      x.beginPath(); x.arc(rx,ry,0.4,0,7); x.fill();
    }
  }
  else if(st==='bun'){
    /* sleek pulled-back hair with a high bun — the ledger never blinks */
    const hairC=o.hairC||id.hairC||'#231c12';
    x.fillStyle=hairC;
    x.beginPath();
    x.moveTo(-4.85,0.4);
    x.bezierCurveTo(-5.2,-4.3,-2.8,-6.4,0.3,-6.4);
    x.bezierCurveTo(3.5,-6.4,5.3,-4.1,5.05,-0.5);
    x.lineTo(4.35,-1.4);
    x.quadraticCurveTo(4.6,-3.0,3.0,-3.8);
    x.quadraticCurveTo(0.6,-4.7,-1.9,-3.8);
    x.quadraticCurveTo(-3.6,-3.1,-3.85,-0.3);
    x.lineTo(-4.85,0.4);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.8; x.stroke();
    /* combed-back flow lines */
    x.strokeStyle='rgba(242,231,201,.5)'; x.lineWidth=lw*0.38; x.lineCap='round';
    x.beginPath(); x.moveTo(-2.6,-3.4); x.quadraticCurveTo(-3.6,-4.6,-3.4,-5.3); x.stroke();
    x.beginPath(); x.moveTo(1.8,-4.3); x.quadraticCurveTo(0.8,-5.2,0.4,-5.9); x.stroke();
    /* the bun */
    x.fillStyle=hairC;
    x.beginPath(); x.arc(-2.9,-6.3,1.75,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.6; x.stroke();
    x.strokeStyle='rgba(242,231,201,.5)'; x.lineWidth=lw*0.35;
    x.beginPath(); x.arc(-2.9,-6.3,1.0,0.6,4.2); x.stroke();
  }
  else if(st==='wingbob'){
    /* round courier bob with a wind flip and tiny temple wings */
    const hairC=o.hairC||id.hairC||'#7a3b16';
    x.fillStyle=hairC;
    x.beginPath();
    x.moveTo(-5.5,2.8);
    x.bezierCurveTo(-5.9,-3.6,-3.4,-6.5,0.2,-6.5);
    x.bezierCurveTo(3.8,-6.5,5.7,-3.7,5.5,0.6);
    x.bezierCurveTo(5.4,2.0,5.7,3.0,6.4,3.8);
    x.bezierCurveTo(5.0,3.9,4.3,3.4,4.1,2.6);
    x.quadraticCurveTo(4.8,-3.0,2.6,-3.9);
    x.quadraticCurveTo(0.6,-4.7,-1.7,-4.0);
    x.quadraticCurveTo(-3.6,-3.5,-3.9,-0.5);
    x.bezierCurveTo(-4.0,1.1,-3.9,2.1,-3.3,3.3);
    x.bezierCurveTo(-4.0,3.9,-5.1,3.6,-5.5,2.8);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.8; x.stroke();
    x.strokeStyle='rgba(239,230,205,.8)'; x.lineWidth=lw*0.5;
    x.beginPath(); x.moveTo(-2.3,-5.3); x.quadraticCurveTo(0.4,-6.0,2.7,-5.0); x.stroke();
    /* temple wings, small */
    x.fillStyle='#f6efdd'; x.strokeStyle=INKC; x.lineWidth=lw*0.6;
    x.beginPath(); x.moveTo(3.6,-3.0); x.quadraticCurveTo(5.9,-4.0,6.7,-5.6);
    x.quadraticCurveTo(5.1,-5.0,4.3,-4.9); x.quadraticCurveTo(3.9,-3.9,3.6,-3.0);
    x.closePath(); x.fill(); x.stroke();
  }
  else if(st==='locs'){
    /* thick locs swept back under a workband, beads on the ends */
    const hairC=o.hairC||id.hairC||'#231c12';
    x.strokeStyle=hairC; x.lineCap='round';
    for(let i=0;i<6;i++){
      const a0=-2.6+i*0.42;
      const sx=-1.6+i*0.9, sy=-5.9+Math.abs(i-2.5)*0.16;
      const ex=-5.8-i*0.55, ey=-1.8+i*1.35;
      x.lineWidth=lw*1.9;
      x.beginPath(); x.moveTo(sx,sy);
      x.quadraticCurveTo(sx-4.2,sy-1.2+i*0.4,ex,ey); x.stroke();
    }
    x.strokeStyle=INKC; x.lineWidth=lw*0.4;
    for(let i=0;i<6;i++){
      const sx=-1.6+i*0.9, sy=-5.9+Math.abs(i-2.5)*0.16;
      const ex=-5.8-i*0.55, ey=-1.8+i*1.35;
      x.beginPath(); x.moveTo(sx,sy-0.8);
      x.quadraticCurveTo(sx-4.2,sy-2.0+i*0.4,ex,ey-0.7); x.stroke();
    }
    x.fillStyle='#e9c81f';
    for(let i=0;i<6;i+=2){
      const ex=-5.8-i*0.55, ey=-1.8+i*1.35;
      x.beginPath(); x.arc(ex,ey,0.55,0,7); x.fill();
    }
    /* crown mass so the skull reads haired */
    x.fillStyle=hairC;
    x.beginPath();
    x.moveTo(-4.85,-0.6);
    x.bezierCurveTo(-5.2,-4.4,-2.8,-6.4,0.3,-6.4);
    x.bezierCurveTo(3.5,-6.4,5.2,-4.2,5.0,-0.8);
    x.lineTo(4.3,-1.6);
    x.quadraticCurveTo(4.6,-3.2,2.9,-3.9);
    x.quadraticCurveTo(0.6,-4.8,-1.9,-3.9);
    x.quadraticCurveTo(-3.6,-3.2,-3.85,-1.2);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.75; x.stroke();
    /* the workband */
    x.fillStyle='#c22a1c';
    x.beginPath();
    x.moveTo(-4.4,-2.4); x.quadraticCurveTo(0.3,-3.6,4.6,-2.3);
    x.lineTo(4.5,-1.2); x.quadraticCurveTo(0.3,-2.4,-4.3,-1.3);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.45; x.stroke();
  }
  else if(st==='smith'){
    /* bald pate, welding goggles parked high, the full forge beard */
    const hairC=o.hairC||id.hairC||'#4a2c14';
    /* goggles */
    x.strokeStyle=INKC; x.lineWidth=lw*0.6;
    x.beginPath(); x.moveTo(-4.5,-4.4); x.lineTo(4.7,-4.6); x.stroke();
    x.fillStyle='#d9c8a2';
    for(const gx of [-0.9,2.1]){
      x.beginPath(); x.arc(gx,-4.8,1.25,0,7); x.fill(); x.stroke();
      x.fillStyle='rgba(255,255,255,.8)';
      x.beginPath(); x.arc(gx-0.4,-5.1,0.38,0,7); x.fill();
      x.fillStyle='#d9c8a2';
    }
    /* the beard: one mass around the jaw with the mouth left open */
    x.fillStyle=hairC;
    x.beginPath();
    x.moveTo(-4.4,0.2);
    x.bezierCurveTo(-4.6,3.6,-3.4,6.8,-0.6,8.2);
    x.bezierCurveTo(1.4,9.0,3.4,8.2,4.4,6.2);
    x.bezierCurveTo(5.2,4.4,5.1,1.8,4.9,0.2);
    x.lineTo(3.6,1.0);
    x.quadraticCurveTo(4.0,4.4,2.6,6.0);
    x.quadraticCurveTo(0.8,7.4,-1.2,6.4);
    x.quadraticCurveTo(-3.2,5.0,-3.2,1.2);
    x.closePath();
    x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.7; x.stroke();
    /* chin fill under the lip */
    x.fillStyle=hairC;
    x.beginPath();
    x.moveTo(-2.6,5.6); x.quadraticCurveTo(0.4,7.6,3.0,5.4);
    x.quadraticCurveTo(2.4,7.2,0.2,7.6); x.quadraticCurveTo(-1.8,7.4,-2.6,5.6);
    x.closePath(); x.fill();
    /* mustache lobes riding over the beard, clear of the mouth line */
    x.fillStyle=hairC;
    x.beginPath(); x.moveTo(0.9,3.2); x.quadraticCurveTo(-1.4,2.8,-2.4,3.8);
    x.quadraticCurveTo(-1.4,4.6,0.7,4.2); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(1.3,3.2); x.quadraticCurveTo(3.4,2.8,4.3,3.8);
    x.quadraticCurveTo(3.4,4.6,1.5,4.2); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.4;
    x.beginPath(); x.moveTo(-2.4,3.8); x.quadraticCurveTo(-1.4,4.6,0.7,4.2); x.stroke();
    x.beginPath(); x.moveTo(4.3,3.8); x.quadraticCurveTo(3.4,4.6,1.5,4.2); x.stroke();
  }
  else if(st==='beret'){
    /* the warden's soft beret, plume up like a gallery flag */
    const hairC=o.hairC||id.hairC||'#4a2c14';
    x.fillStyle=hairC;
    x.fillRect(-4.5,-1.6,1.2,2.8); x.fillRect(3.5,-1.8,1.2,2.8);
    x.strokeStyle=INKC; x.lineWidth=lw*0.4;
    x.strokeRect(-4.5,-1.6,1.2,2.8); x.strokeRect(3.5,-1.8,1.2,2.8);
    /* plume behind the crown */
    x.strokeStyle=INKC; x.lineWidth=lw*0.5;
    x.beginPath(); x.moveTo(2.6,-5.6); x.quadraticCurveTo(4.6,-8.6,4.0,-11.0); x.stroke();
    x.fillStyle='#f6efdd';
    for(let i=0;i<4;i++){
      const t=i/4;
      const px=2.6+(4.4-2.6)*t+t*t*(-0.9), py=-5.8-t*4.6;
      x.beginPath(); x.ellipse(px+0.7,py-0.5,1.5,0.6,-1.0+t*0.3,0,7); x.fill();
      x.strokeStyle=INKC; x.lineWidth=lw*0.3; x.stroke();
    }
    x.fillStyle='#8f1d12';
    x.save(); x.translate(-0.6,-4.6); x.rotate(-0.14);
    x.beginPath(); x.ellipse(0,0,5.8,2.5,0,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.7; x.stroke();
    x.restore();
    /* band + stem */
    x.strokeStyle=INKC; x.lineWidth=lw*0.5;
    x.beginPath(); x.moveTo(-4.4,-2.6); x.quadraticCurveTo(0.3,-3.7,4.2,-2.5); x.stroke();
    x.fillStyle=INKC; x.beginPath(); x.arc(-0.9,-7.0,0.5,0,7); x.fill();
  }
  else if(st==='gridhelm'){
    /* the architect's ruled helm: straight edges, a set-square crest —
       and her hair falls free below the steel */
    const steel='#c9c9d4';
    const hairC=o.hairC||id.hairC||'#2c2c34';
    x.fillStyle=hairC;
    x.beginPath();
    x.moveTo(-4.6,-0.6);
    x.bezierCurveTo(-5.6,2.4,-5.4,5.4,-4.4,7.8);
    x.lineTo(-3.0,7.0);
    x.quadraticCurveTo(-3.9,4.6,-3.6,1.6);
    x.quadraticCurveTo(-3.5,0.2,-3.4,-0.6);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.6; x.stroke();
    x.strokeStyle='rgba(242,231,201,.5)'; x.lineWidth=lw*0.35; x.lineCap='round';
    x.beginPath(); x.moveTo(-4.5,1.6); x.quadraticCurveTo(-4.9,4.2,-4.2,6.6); x.stroke();
    x.fillStyle=steel;
    x.beginPath();
    x.moveTo(-5.0,0.9);
    x.lineTo(-5.0,-5.2); x.lineTo(-2.2,-6.9); x.lineTo(2.8,-6.9);
    x.lineTo(5.2,-5.0); x.lineTo(5.2,0.7);
    x.lineTo(3.7,0.8); x.lineTo(3.6,-1.9); x.lineTo(-3.5,-1.8); x.lineTo(-3.6,0.9);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.8; x.stroke();
    /* cheek guards */
    x.fillStyle=steel;
    x.beginPath(); x.moveTo(-5.0,0.9); x.lineTo(-3.6,0.9); x.lineTo(-3.2,3.6); x.lineTo(-4.6,3.2); x.closePath(); x.fill(); x.stroke();
    x.beginPath(); x.moveTo(5.2,0.7); x.lineTo(3.7,0.8); x.lineTo(3.4,3.6); x.lineTo(4.8,3.1); x.closePath(); x.fill(); x.stroke();
    /* ruled construction lines */
    x.strokeStyle='rgba(35,28,18,.45)'; x.lineWidth=lw*0.3;
    x.beginPath(); x.moveTo(-4.6,-3.4); x.lineTo(4.8,-3.5); x.stroke();
    x.beginPath(); x.moveTo(-4.6,-5.0); x.lineTo(4.8,-5.0); x.stroke();
    x.beginPath(); x.moveTo(0.2,-6.9); x.lineTo(0.2,-1.9); x.stroke();
    /* the set-square crest */
    x.fillStyle=o.trimC||'#e9c81f';
    x.beginPath(); x.moveTo(-1.6,-6.9); x.lineTo(2.2,-6.9); x.lineTo(2.2,-9.3);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.55; x.stroke();
    x.beginPath(); x.moveTo(0.4,-7.5) ; x.lineTo(1.6,-7.5); x.lineTo(1.6,-8.3); x.closePath();
    x.fillStyle='#f6efdd'; x.fill();
  }
  else if(st==='tinker'){
    /* the workshop head: ginger curls all round; the brass goggles land
       over the eyes AFTER the features so the glass shows them through */
    const hairC=o.hairC||id.hairC||'#b4551f';
    x.fillStyle=hairC;
    for(const [hx,hy,hr] of [[-3.9,-3.6,1.7],[-1.7,-5.2,1.8],[0.8,-5.7,1.8],
        [3.2,-4.6,1.7],[4.5,-2.4,1.4],[-4.6,-1.2,1.4]]){
      x.beginPath(); x.arc(hx,hy,hr,0,7); x.fill();
    }
    x.strokeStyle=INKC; x.lineWidth=lw*0.5;
    for(const [hx,hy,hr] of [[-3.9,-3.6,1.7],[-1.7,-5.2,1.8],[0.8,-5.7,1.8],
        [3.2,-4.6,1.7],[4.5,-2.4,1.4],[-4.6,-1.2,1.4]]){
      x.beginPath(); x.arc(hx,hy,hr,0,7); x.stroke();
    }
  }
  else if(st==='kid'){
    /* newsboy cap */
    x.fillStyle=o.hairC||'#8a5a2c';
    x.beginPath();  /* hair fringe */
    x.moveTo(-4.4,-1.2); x.quadraticCurveTo(-1.5,-3.0,3.9,-1.9);
    x.quadraticCurveTo(3.0,-3.0,2.0,-3.2); x.quadraticCurveTo(-2.8,-3.4,-4.4,-1.2);
    x.closePath(); x.fill();
    x.fillStyle=o.capC||'#c22a1c';
    x.beginPath();
    x.moveTo(-5.2,-1.8);
    x.bezierCurveTo(-5.0,-5.4,-2.4,-6.9,0.4,-6.8);
    x.bezierCurveTo(3.4,-6.7,5.2,-4.6,5.2,-2.2);
    x.quadraticCurveTo(6.9,-2.2,7.3,-1.4);        /* brim */
    x.quadraticCurveTo(5.4,-1.0,4.4,-1.3);
    x.quadraticCurveTo(-0.4,-2.8,-5.2,-1.8);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.8; x.stroke();
    x.fillStyle=o.capC||'#c22a1c';
    x.beginPath(); x.arc(0.2,-6.7,0.5,0,7); x.fill(); x.stroke();
  }
  else if(st==='hood'){
    /* deep robe hood, face sunk in shadow */
    x.fillStyle=suitC;
    x.beginPath();
    x.moveTo(-5.8,4.4);
    x.bezierCurveTo(-6.6,-3.4,-3.6,-7.0,0.4,-7.0);
    x.bezierCurveTo(4.6,-7.0,6.6,-3.0,6.0,4.6);
    x.quadraticCurveTo(4.6,3.2,4.4,0.6);
    x.bezierCurveTo(4.4,-2.6,2.8,-4.4,0.2,-4.4);
    x.bezierCurveTo(-2.6,-4.4,-4.2,-2.4,-4.1,0.8);
    x.quadraticCurveTo(-4.0,3.0,-5.8,4.4);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.85; x.stroke();
    /* the pit of the hood: darkness and two burning eyes */
    x.fillStyle='#3a3226';
    x.beginPath(); x.ellipse(0.2,0.6,3.6,4.2,0,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.5; x.stroke();
    x.fillStyle=o.eyeC||'#e9c81f';
    x.beginPath(); x.ellipse(-1.2,-0.2,1.15,0.62,0.1,0,7); x.fill();
    x.beginPath(); x.ellipse(1.7,-0.2,1.15,0.62,-0.1,0,7); x.fill();
    /* gaunt cheek hints */
    x.strokeStyle=o.eyeC||'rgba(233,200,31,.5)'; x.globalAlpha=o.eyeC?0.5:1; x.lineWidth=lw*0.4;
    x.beginPath(); x.moveTo(-1.6,2.2); x.quadraticCurveTo(0.2,3.2,2.0,2.2); x.stroke();
    x.globalAlpha=1;
  }
  else if(st==='baron'){
    /* bald pate, heavy brow, ear tufts, walrus mustache, monocle */
    for(const exd of [-1,1]){
      x.beginPath(); x.moveTo(exd*4.4,0.4);
      x.quadraticCurveTo(exd*6.4,-1.2,exd*5.4,-3.2);
      x.quadraticCurveTo(exd*4.6,-1.4,exd*3.6,-1.2);
      x.closePath(); x.fillStyle='#efe6cd'; x.fill();
      x.strokeStyle=INKC; x.lineWidth=lw*0.7; x.stroke();
    }
  }
  /* — features (skip when hooded or helmed: the shadow carries it) — */
  if(st!=='hood'&&st!=='finhelm'){
    const cowled=(st==='cowl'||st==='speedster'||st==='mystic'||st==='mask'||st==='cosmic');
    const eyeY=-1.1, eo=E.eye;
    const exL=-1.7+fx, exR=1.8+fx;
    /* brows: filled tapered shapes, not wire lines */
    const bIn=E.brow[0], bOut=E.brow[1];
    const bY=id.browY||0, bW=(id.browW||1)*(o.fem?0.62:1);
    const browS=(xo,yo,xi,yi)=>{ x.fillStyle=INKC; x.beginPath();
      x.moveTo(xo,yo); x.quadraticCurveTo((xo+xi)/2,(yo+yi)/2-0.30,xi,yi);
      x.lineTo(xi,yi+0.36*bW); x.quadraticCurveTo((xo+xi)/2,(yo+yi)/2+0.26*bW,xo,yo+0.52*bW);
      x.closePath(); x.fill(); };
    if(st==='cosmic'){
      /* the helmet edge carries the brow — just two determined ticks */
      x.strokeStyle=INKC; x.lineWidth=lw*0.6; x.lineCap='round';
      x.beginPath(); x.moveTo(exL-0.9,eyeY-0.75); x.lineTo(exL+0.8,eyeY-0.85+bIn*0.4); x.stroke();
      x.beginPath(); x.moveTo(exR+0.9,eyeY-0.75); x.lineTo(exR-0.8,eyeY-0.85+bIn*0.4); x.stroke();
    } else {
      browS(exL-1.15,eyeY-1.15-bOut+bY, exL+0.95,eyeY-1.0+bIn+bY);
      browS(exR+1.15,eyeY-1.15-bOut+bY, exR-0.95,eyeY-1.0+bIn+bY);
    }
    /* eyes */
    for(const [ex,side] of [[exL,-1],[exR,1]]){
      if(profile&&side<0) continue;   /* far eye hidden in profile */
      if(cowled){
        x.fillStyle='#fdf8ea';
        x.beginPath();
        x.moveTo(ex-1.05,eyeY+0.15);
        x.quadraticCurveTo(ex,eyeY-0.7*eo-0.25,ex+1.05,eyeY+0.1);
        x.quadraticCurveTo(ex,eyeY+0.55*eo,ex-1.05,eyeY+0.15);
        x.closePath(); x.fill();
        x.strokeStyle=INKC; x.lineWidth=lw*0.45; x.stroke();
      } else {
        x.fillStyle='#fdf8ea';
        x.beginPath();
        x.moveTo(ex-1.1,eyeY+0.1);
        x.quadraticCurveTo(ex,eyeY-0.95*eo,ex+1.1,eyeY+0.1);
        x.quadraticCurveTo(ex,eyeY+0.75*eo,ex-1.1,eyeY+0.1);
        x.closePath(); x.fill();
        x.strokeStyle=INKC; x.lineWidth=lw*0.5; x.stroke();
        const ir=0.52*Math.min(1,eo+0.25);
        x.fillStyle='#7a5a34';
        x.beginPath(); x.arc(ex+0.28,eyeY-0.02,ir,0,7); x.fill();
        x.strokeStyle=INKC; x.lineWidth=lw*0.3; x.stroke();
        x.fillStyle=INKC;
        x.beginPath(); x.arc(ex+0.28,eyeY-0.02,ir*0.55,0,7); x.fill();
        x.fillStyle='#fdf8ea';
        x.beginPath(); x.arc(ex+0.10,eyeY-0.20,ir*0.24,0,7); x.fill();
        /* upper lid weight + outer lash tick */
        x.strokeStyle=INKC; x.lineWidth=lw*0.6;
        x.beginPath(); x.moveTo(ex-1.05,eyeY+0.04); x.quadraticCurveTo(ex,eyeY-0.95*eo-0.06,ex+1.02,eyeY+0.04); x.stroke();
        x.lineWidth=lw*0.42;
        x.beginPath(); x.moveTo(ex+1.0,eyeY+0.02); x.lineTo(ex+1.32,eyeY-0.24); x.stroke();
        if(o.fem){ /* the lash fan + a lower-lid tick */
          x.beginPath(); x.moveTo(ex+0.75,eyeY-0.32); x.lineTo(ex+1.05,eyeY-0.62); x.stroke();
          x.lineWidth=lw*0.3;
          x.beginPath(); x.moveTo(ex+0.5,eyeY+0.55); x.lineTo(ex+0.95,eyeY+0.62); x.stroke();
        }
      }
    }
    /* lids for scheme/focus */
    if(E.eye<0.7&&!cowled){
      x.strokeStyle=INKC; x.lineWidth=lw*0.45;
      x.beginPath(); x.moveTo(exL-0.9,eyeY-0.3); x.lineTo(exL+0.9,eyeY-0.35); x.stroke();
      x.beginPath(); x.moveTo(exR-0.9,eyeY-0.35); x.lineTo(exR+0.9,eyeY-0.3); x.stroke();
    }
    /* nose (skip in profile: silhouette carries it; skip under full cowl which drew its own) */
    if(!profile&&!cowled&&st!=='cosmic'){
      const nl=id.noseL||1;
      x.strokeStyle=INKC; x.lineWidth=lw*0.5;
      x.beginPath(); x.moveTo(0.55+fx*0.5,eyeY+0.3);
      x.quadraticCurveTo(1.2+fx*0.5,1.4*nl,1.15+fx*0.5,2.0*nl);
      x.quadraticCurveTo(0.8+fx*0.5,2.45*nl-(nl-1)*0.4,0.2+fx*0.5,2.3*nl-(nl-1)*0.5); x.stroke();
      /* nostril wing + shade */
      x.beginPath(); x.moveTo(0.1+fx*0.5,2.28); x.quadraticCurveTo(-0.3+fx*0.5,2.1,-0.38+fx*0.5,1.8); x.stroke();
      x.fillStyle='rgba(35,28,18,.8)';
      x.beginPath(); x.ellipse(0.72+fx*0.5,2.08,0.16,0.10,0.3,0,7); x.fill();
    }
    /* mouth */
    const my=4.15, mx=fx*0.72;
    x.strokeStyle=INKC; x.lineCap='round';
    const mt=E.mouth;
    if(o.fem&&(mt==='firm'||mt==='small'||mt==='smile')){
      /* full lips under the line — comics shorthand, not a painting */
      x.fillStyle='#a83a2c';
      x.beginPath(); x.ellipse(mx+0.1,my+0.05,1.35,0.62,0.03,0,7); x.fill();
    }
    if(mt==='firm'){
      x.lineWidth=lw*0.62;
      x.beginPath(); x.moveTo(mx-1.25,my); x.quadraticCurveTo(mx+0.1,my+0.28,mx+1.35,my-0.12); x.stroke();
      x.strokeStyle='rgba(35,28,18,.55)'; x.lineWidth=lw*0.3;
      x.beginPath(); x.moveTo(mx-0.35,my+1.05); x.lineTo(mx+0.45,my+1.02); x.stroke();
      x.strokeStyle=INKC;
    } else if(mt==='grit'){
      /* clenched snarl built on LIPS: the dark opening is an almond that
         tapers into both corners, one corner rides higher (a snarl is
         never symmetric), and the teeth are ONE pale band whose edges
         follow the lip curves — no rounded box, no picket grid */
      const lift=0.24;
      x.fillStyle='#5a1410';
      x.beginPath();
      x.moveTo(mx-1.9,my+0.12+lift);
      x.quadraticCurveTo(mx-0.9,my-0.85,mx+0.15,my-0.72);
      x.quadraticCurveTo(mx+1.25,my-0.86,mx+2.05,my-0.30-lift);
      x.quadraticCurveTo(mx+1.15,my+0.85,mx+0.1,my+0.90);
      x.quadraticCurveTo(mx-1.0,my+0.95,mx-1.9,my+0.12+lift);
      x.closePath(); x.fill();
      x.strokeStyle=INKC; x.lineWidth=lw*0.42; x.stroke();
      x.fillStyle='#fdf8ea';
      x.beginPath();
      x.moveTo(mx-1.5,my+0.08+lift*0.8);
      x.quadraticCurveTo(mx+0.15,my-0.58,mx+1.72,my-0.24-lift*0.8);
      x.quadraticCurveTo(mx+1.0,my+0.52,mx+0.1,my+0.58);
      x.quadraticCurveTo(mx-0.9,my+0.62,mx-1.5,my+0.08+lift*0.8);
      x.closePath(); x.fill();
      /* the bite line — the single shadow where the rows meet */
      x.strokeStyle='rgba(35,28,18,.85)'; x.lineWidth=lw*0.26;
      x.beginPath(); x.moveTo(mx-1.3,my+0.12+lift*0.6);
      x.quadraticCurveTo(mx+0.15,my-0.10,mx+1.5,my-0.12-lift*0.6); x.stroke();
      /* snarl creases pulled toward the raised corner */
      x.strokeStyle=INKC; x.lineWidth=lw*0.4;
      x.beginPath(); x.moveTo(mx-1.9,my+0.12+lift);
      x.quadraticCurveTo(mx-2.35,my-0.35,mx-1.75,my-0.95); x.stroke();
      x.beginPath(); x.moveTo(mx+2.05,my-0.30-lift);
      x.quadraticCurveTo(mx+2.55,my+0.15,mx+2.1,my+0.8); x.stroke();
      /* lower-lip ledge under the clench */
      x.strokeStyle='rgba(35,28,18,.55)'; x.lineWidth=lw*0.3;
      x.beginPath(); x.moveTo(mx-0.6,my+1.35);
      x.quadraticCurveTo(mx+0.2,my+1.55,mx+1.1,my+1.25); x.stroke();
    } else if(mt==='shout'||mt==='wail'){
      x.fillStyle='#5a1410';
      x.beginPath(); x.ellipse(mx+0.1,my+0.25,1.5,mt==='wail'?1.5:1.2,0.05,0,7); x.fill();
      x.strokeStyle=INKC; x.lineWidth=lw*0.5; x.stroke();
      x.fillStyle='#fdf8ea';
      x.beginPath(); x.moveTo(mx-1.25,my-0.55); x.quadraticCurveTo(mx+0.1,my-0.95,mx+1.45,my-0.5);
      x.lineTo(mx+1.2,my-0.15); x.quadraticCurveTo(mx+0.1,my-0.5,mx-1.05,my-0.2); x.closePath(); x.fill();
      /* the yell pulls the cheeks: nasolabial creases */
      x.strokeStyle='rgba(35,28,18,.75)'; x.lineWidth=lw*0.4; x.lineCap='round';
      x.beginPath(); x.moveTo(mx-1.7,my-1.3); x.quadraticCurveTo(mx-2.1,my-0.3,mx-1.6,my+0.9); x.stroke();
      x.beginPath(); x.moveTo(mx+1.9,my-1.35); x.quadraticCurveTo(mx+2.3,my-0.3,mx+1.8,my+0.9); x.stroke();
    } else if(mt==='o'){
      x.fillStyle='#5a1410';
      x.beginPath(); x.ellipse(mx+0.1,my+0.15,0.7,0.9,0,0,7); x.fill();
      x.strokeStyle=INKC; x.lineWidth=lw*0.45; x.stroke();
    } else if(mt==='smile'){
      x.lineWidth=lw*0.6;
      x.beginPath(); x.moveTo(mx-1.5,my-0.5); x.quadraticCurveTo(mx+0.1,my+0.95,mx+1.7,my-0.6); x.stroke();
      x.lineWidth=lw*0.4;
      x.beginPath(); x.moveTo(mx-1.5,my-0.5); x.lineTo(mx-1.75,my-0.85); x.stroke();
      x.beginPath(); x.moveTo(mx+1.7,my-0.6); x.lineTo(mx+1.95,my-0.95); x.stroke();
    } else if(mt==='smirk'){
      x.lineWidth=lw*0.55;
      x.beginPath(); x.moveTo(mx-1.1,my+0.25); x.quadraticCurveTo(mx+0.5,my+0.4,mx+1.6,my-0.55); x.stroke();
    } else { /* small */
      x.lineWidth=lw*0.55;
      x.beginPath(); x.moveTo(mx-0.7,my+0.1); x.lineTo(mx+0.7,my+0.05); x.stroke();
    }
    /* baron extras: mustache + monocle over the features */
    if(st==='baron'){
      x.fillStyle='#efe6cd';
      x.beginPath();
      x.moveTo(mx-2.4,my-0.9); x.quadraticCurveTo(mx+0.1,my+0.4,mx+2.6,my-0.9);
      x.quadraticCurveTo(mx+2.9,my+0.6,mx+1.4,my+1.1);
      x.quadraticCurveTo(mx+0.1,my+1.4,mx-1.2,my+1.1);
      x.quadraticCurveTo(mx-2.7,my+0.6,mx-2.4,my-0.9);
      x.closePath(); x.fill();
      x.strokeStyle=INKC; x.lineWidth=lw*0.5; x.stroke();
      x.strokeStyle=INKC; x.lineWidth=lw*0.45;
      x.beginPath(); x.arc(exR+0.1,eyeY,1.5,0,7); x.stroke();
      x.beginPath(); x.moveTo(exR+1.0,eyeY+1.1); x.lineTo(exR+1.9,eyeY+3.6); x.stroke();
    }
    /* ear when the hair leaves it open */
    if(!profile&&(st==='face'||st==='hair'||st==='mask'||st==='baron'||st==='kid'||st==='lady')){
      x.strokeStyle=INKC; x.lineWidth=lw*0.5;
      x.beginPath(); x.arc(-4.0,0.6,1.05,-1.4,1.6); x.stroke();
    }
    /* jaw shade under the chin */
    if(o.shade!==false){
      /* jaw + cheek modelled with hatch strokes, never a beard blob */
      x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=lw*0.36; x.lineCap='round';
      for(let i=0;i<3;i++){
        x.beginPath(); x.moveTo(-1.2+i*1.05,5.55+i*0.12);
        x.lineTo(-0.45+i*1.05,5.95+i*0.1); x.stroke();
      }
      x.beginPath(); x.moveTo(exR+0.95,eyeY+1.75); x.lineTo(exR+1.45,eyeY+2.35); x.stroke();
      x.beginPath(); x.moveTo(exR+0.55,eyeY+2.05); x.lineTo(exR+1.0,eyeY+2.6); x.stroke();
    }
    if(o.shade!==false){
      /* the face is built on planes: cheekbone turn + temple plane */
      x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=lw*0.36; x.lineCap='round';
      if(!cowled){
        x.beginPath(); x.moveTo(exR+0.7,eyeY+0.95); x.lineTo(exR+1.35,eyeY+1.5); x.stroke();
        if(id.cheek){ /* the hollow-cheeked identity carves deeper */
          x.beginPath(); x.moveTo(exL-1.0,eyeY+1.9); x.quadraticCurveTo(exL-0.6,eyeY+2.7,exL+0.1,eyeY+3.1); x.stroke();
        }
      }
    }
    if(st==='tinker'||st==='aviatrix'){ /* goggles over the eyes, glass half-clear */
      x.strokeStyle=INKC; x.lineWidth=lw*0.45;
      x.beginPath(); x.moveTo(-4.6,eyeY-0.3); x.lineTo(4.9,eyeY-0.5); x.stroke();
      for(const gx of [exL,exR]){
        x.fillStyle='rgba(217,200,162,.45)';
        x.beginPath(); x.arc(gx,eyeY,1.62,0,7); x.fill();
        x.strokeStyle='#8a5a2c'; x.lineWidth=lw*0.6;
        x.beginPath(); x.arc(gx,eyeY,1.62,0,7); x.stroke();
        x.strokeStyle=INKC; x.lineWidth=lw*0.35;
        x.beginPath(); x.arc(gx,eyeY,1.86,0,7); x.stroke();
        x.strokeStyle='rgba(255,255,255,.8)'; x.lineWidth=lw*0.4;
        x.beginPath(); x.arc(gx-0.5,eyeY-0.5,0.5,3.6,5.6); x.stroke();
      }
    }
    if(st==='bun'){ /* the keeper's pince-nez, over the ledger-reading eyes */
      x.strokeStyle=INKC; x.lineWidth=lw*0.42;
      x.beginPath(); x.arc(exL,eyeY,1.32,0,7); x.stroke();
      x.beginPath(); x.arc(exR,eyeY,1.32,0,7); x.stroke();
      x.beginPath(); x.moveTo(exL+1.3,eyeY-0.2); x.quadraticCurveTo((exL+exR)/2,eyeY-0.7,exR-1.3,eyeY-0.2); x.stroke();
      x.beginPath(); x.moveTo(exL-1.3,eyeY); x.lineTo(-4.2,0.2); x.stroke();
      /* gold drop earring under the open ear */
      x.strokeStyle=INKC; x.lineWidth=lw*0.5;
      x.beginPath(); x.arc(-4.0,0.6,1.05,-1.4,1.6); x.stroke();
      x.fillStyle='#e9c81f';
      x.beginPath(); x.arc(-4.15,2.4,0.62,0,7); x.fill();
      x.strokeStyle=INKC; x.lineWidth=lw*0.35; x.stroke();
    }
  }
  x.restore();
}

/* --- shared figure chassis --- */
function handAngle(arm,i,P){
  const wr=arm[2], el=arm[1];
  return Math.atan2(wr[1]-el[1],wr[0]-el[0]);
}
function drawFigureCore(x,P,B,C,o){
  /* P pose, B body, C colors {suit,trim,skin,glove,boot,capeMode?,coat,skirt,trunks,emblem}, o opts */
  o=o||{};
  const lw=o.lw||2;
  const sv=[1.8,1.1];          /* shade vector: light upper-left */
  const svT=[2.7,1.6];         /* heavier crescent for the big masses */
  const shC=[(P.sh[0][0]+P.sh[1][0])/2,(P.sh[0][1]+P.sh[1][1])/2];
  const chest=P.chest||[shC[0],shC[1]+7];
  const waist=P.waist||[chest[0],chest[1]+12];
  const hipC=[(P.hip[0][0]+P.hip[1][0])/2,(P.hip[0][1]+P.hip[1][1])/2];
  const fore=P.fore||[1,1];
  /* ground shadow */
  if(P.grounded&&o.shadow!==false){
    x.fillStyle='rgba(35,28,18,.5)';
    x.beginPath();
    x.ellipse((P.legs[0][2][0]+P.legs[1][2][0])/2,94.6,
      Math.abs(P.legs[1][2][0]-P.legs[0][2][0])/2+10,2.1,0,0,7);
    x.fill();
  }
  /* speed streaks */
  if(P.fx==='speed'&&!o.noFx){
    x.fillStyle='rgba(35,28,18,.5)';
    for(let i=0;i<5;i++){
      const yy=chest[1]-8+i*9, ln=22+((i*29)%17)+i*3, x0=chest[0]-15-i*3;
      x.beginPath(); x.moveTo(x0,yy-0.75); x.lineTo(x0,yy+0.75);
      x.lineTo(x0-ln,yy+1.8); x.closePath(); x.fill();
    }
  }
  /* cape */
  if(C.cape&&(P.cape&&P.cape!=='none'))
    drawCape(x,P.sh,P.cape,P.wind||0,C.cape,o.seed,lw);
  /* far arm & far leg */
  const armC=[C.sleeve||C.suit,C.sleeve||C.suit];
  const drawArm=(i)=>{
    const A=P.arms[i], f=fore[i]||1;
    const wUp=B.armW[0]*(i?1:0.92), wEl=B.armW[1],
      wWr=Math.min(B.armW[2]*f, B.armW[2]+3.0);
    /* which side of the elbow is outside the bend? bulges live there */
    const u1=vsub(A[1],A[0]), u2=vsub(A[2],A[1]);
    const outSide=(u1[0]*u2[1]-u1[1]*u2[0])>0?-1:1;
    /* deltoid cap — filled, then contoured ONLY on its outer arc so no
       ball-joint seam survives a 2x look */
    x.beginPath(); x.arc(A[0][0],A[0][1],wUp*1.18,0,7);
    x.fillStyle=armC[i]; x.fill();
    const aOut=Math.atan2(A[0][1]-chest[1]-2,A[0][0]-chest[0]);
    x.strokeStyle=INKC; x.lineWidth=lw*0.8;
    x.beginPath(); x.arc(A[0][0],A[0][1],wUp*1.18,aOut-1.15,aOut+1.15); x.stroke();
    /* the shadow half of that arc runs heavier */
    x.lineWidth=lw*1.25;
    x.beginPath(); x.arc(A[0][0],A[0][1],wUp*1.16,aOut+0.2,aOut+1.1); x.stroke();
    /* ONE silhouette shoulder-to-wrist, bicep and extensor swells carried
       as width stations on the same path — the arm is a single drawn form,
       so no segment band or joint ring can survive any zoom */
    const pU=vperp(vnorm(u1));
    const mU=[vmix(A[0],A[1],0.45)[0]+pU[0]*outSide*wUp*0.30,
              vmix(A[0],A[1],0.45)[1]+pU[1]*outSide*wUp*0.30];
    const pF=vperp(vnorm(u2));
    const mF=[vmix(A[1],A[2],0.34)[0]+pF[0]*outSide*wEl*0.30,
              vmix(A[1],A[2],0.34)[1]+pF[1]*outSide*wEl*0.30];
    const cuff=vmix(A[1],A[2],0.42);
    limb(x,[A[0],mU,A[1],mF,A[2]],[wUp,wUp*1.02,wEl*0.86,wEl*0.98,wWr],armC[i],
      {lw,sv:i?sv:null,hatch:o.hatch&&i===1,
       two:(C.glove&&C.glove!==armC[i])?{at:cuff,dir:vnorm(u2),col:C.glove,r:wEl*2.1}:null});
    /* elbow crease inside the bend — a fold of cloth, not a joint ring */
    x.strokeStyle='rgba(35,28,18,.7)'; x.lineWidth=lw*0.45; x.lineCap='round';
    x.beginPath();
    x.moveTo(A[1][0]-pF[0]*outSide*wEl*0.5,A[1][1]-pF[1]*outSide*wEl*0.5);
    x.quadraticCurveTo(A[1][0]-pF[0]*outSide*wEl*0.85,A[1][1]-pF[1]*outSide*wEl*0.85,
      A[1][0]-pF[0]*outSide*wEl*0.55-vnorm(u2)[0]*wEl*0.8,
      A[1][1]-pF[1]*outSide*wEl*0.55-vnorm(u2)[1]*wEl*0.8);
    x.stroke();
    const hd=P.hands[i]||'open';
    let ang=handAngle(A,i,P);
    drawHand(x,A[2],ang,hd,Math.min((B.hand||1)*f,(B.hand||1)+1.35),C.glove||C.skin,{lw,fore:f>=1.8});
    if(i===1&&!o.noAccent) accent(x,vmix(A[0],mU,0.4),mU,vmix(mU,A[1],0.6),lw*0.42);
  };
  const drawLeg=(i)=>{
    const Lg=P.legs[i];
    const u1=vsub(Lg[1],Lg[0]), u2=vsub(Lg[2],Lg[1]);
    const outSide=(u1[0]*u2[1]-u1[1]*u2[0])>0?-1:1;
    /* ONE silhouette hip-to-ankle: quad swell high outside, calf swell up
       high, hard taper to the ankle — all width stations on a single path,
       so the doll-joint knee ring is structurally impossible */
    const pT=vperp(vnorm(u1));
    const mT=[vmix(Lg[0],Lg[1],0.38)[0]+pT[0]*outSide*B.legW[0]*0.20,
              vmix(Lg[0],Lg[1],0.38)[1]+pT[1]*outSide*B.legW[0]*0.20];
    const pS=vperp(vnorm(u2));
    const mC=[vmix(Lg[1],Lg[2],0.30)[0]+pS[0]*outSide*B.legW[1]*0.34,
              vmix(Lg[1],Lg[2],0.30)[1]+pS[1]*outSide*B.legW[1]*0.34];
    const legC=C.legs||C.suit;
    limb(x,[Lg[0],mT,Lg[1],mC,Lg[2]],
      [B.legW[0],B.legW[0]*1.0,B.legW[1]*0.88,B.legW[1]*1.02,B.legW[2]],legC,
      {lw,sv:i?sv:null,hatch:o.hatch&&i===1,
       two:(C.shin&&C.shin!==legC)?{at:vmix(Lg[1],Lg[2],0.12),dir:vnorm(u2),col:C.shin,r:B.legW[1]*2.0}:null});
    /* knee crease inside the bend — cloth folding, never a cap */
    x.strokeStyle='rgba(35,28,18,.7)'; x.lineWidth=lw*0.42; x.lineCap='round';
    x.beginPath();
    x.moveTo(Lg[1][0]-pS[0]*outSide*B.legW[1]*0.45,Lg[1][1]-pS[1]*outSide*B.legW[1]*0.45);
    x.quadraticCurveTo(Lg[1][0]-pS[0]*outSide*B.legW[1]*0.8,Lg[1][1]-pS[1]*outSide*B.legW[1]*0.8,
      Lg[1][0]-pS[0]*outSide*B.legW[1]*0.5-vnorm(u2)[0]*B.legW[1]*0.7,
      Lg[1][1]-pS[1]*outSide*B.legW[1]*0.5-vnorm(u2)[1]*B.legW[1]*0.7);
    x.stroke();
    const ft=P.feet?P.feet[i]:'side';
    const dirX=(Lg[2][0]>=Lg[1][0]-1)?1:-1;
    drawBoot(x,Lg[2],{type:ft, dirX, col:C.boot||INKC, lw:lw*0.85, scale:B.boot||1,
      ang:ft==='tip'?Math.atan2(Lg[2][1]-Lg[1][1],Lg[2][0]-Lg[1][0]):0});
    if(i===1&&!o.noAccent) accent(x,vmix(Lg[1],mC,0.3),mC,vmix(mC,Lg[2],0.5),lw*0.42);
  };
  drawArm(0); drawLeg(0);
  /* pelvis / trunks / skirt */
  if(C.skirt){
    const sk=[[waist[0]-B.waistHW-1,waist[1]+1],[waist[0]+B.waistHW+1,waist[1]+1],
      [hipC[0]+B.pelvHW+3.5,hipC[1]+11],[hipC[0]-B.pelvHW-3.5,hipC[1]+11]];
    mass(x,sk,C.skirt,{lw,sv:svT});
  } else {
    /* trunks cut like BRIEFS: the hem drops over each thigh and rises at
       the crotch, so the pelvis reads as two legs taken by cloth — never
       a diaper point or a beanbag */
    const pel=[[waist[0]-B.waistHW,waist[1]],[waist[0]+B.waistHW,waist[1]],
      [P.hip[1][0]+B.pelvHW*0.70,P.hip[1][1]],
      [P.hip[1][0]+B.pelvHW*0.26,P.hip[1][1]+3.9],
      [hipC[0]+0.9,hipC[1]+4.4],
      [hipC[0],hipC[1]+2.8],
      [hipC[0]-0.9,hipC[1]+4.4],
      [P.hip[0][0]-B.pelvHW*0.26,P.hip[0][1]+3.9],
      [P.hip[0][0]-B.pelvHW*0.70,P.hip[0][1]]];
    mass(x,pel,C.trunks||C.suit,{lw,sv});
    /* leg-opening hems */
    x.strokeStyle='rgba(35,28,18,.6)'; x.lineWidth=lw*0.4; x.lineCap='round';
    x.beginPath(); x.moveTo(P.hip[1][0]+B.pelvHW*0.52,P.hip[1][1]+1.6);
    x.quadraticCurveTo(hipC[0]+2.2,hipC[1]+4.0,hipC[0]+0.5,hipC[1]+3.4); x.stroke();
    x.beginPath(); x.moveTo(P.hip[0][0]-B.pelvHW*0.52,P.hip[0][1]+1.6);
    x.quadraticCurveTo(hipC[0]-2.2,hipC[1]+4.0,hipC[0]-0.5,hipC[1]+3.4); x.stroke();
  }
  /* torso */
  const tor=[[P.sh[0][0]-2.4,P.sh[0][1]-1.2],[shC[0],shC[1]-3.2],[P.sh[1][0]+2.4,P.sh[1][1]-1.2],
    [chest[0]+B.chestHW,chest[1]+2],[waist[0]+B.waistHW,waist[1]],
    [waist[0]-B.waistHW,waist[1]],[chest[0]-B.chestHW,chest[1]+2]];
  mass(x,tor,C.coat||C.suit,{lw,sv:svT,hatch:o.hatch,rim:true});
  /* pec / costume interior */
  if(!o.noAccent){
    accent(x,[chest[0]-B.chestHW*0.55,chest[1]+1],[chest[0],chest[1]+2.5],[chest[0]+B.chestHW*0.55,chest[1]+1],lw*0.45);
  }
  /* CLOTH: folds that follow the pose — the suit creases from the lead
     armpit toward the opposite hip, deeper the more the trunk leans */
  if(!o.noAccent){
    const lean=waist[0]-chest[0];
    x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=lw*0.38; x.lineCap='round';
    const n=Math.abs(lean)>1.5?3:2;
    for(let i=0;i<n;i++){
      const t0=[chest[0]+(lean>=0?-1:1)*B.chestHW*0.62+i*1.3, chest[1]+4.5+i*1.4];
      const t1=[waist[0]+(lean>=0?1:-1)*B.waistHW*0.5-i*0.9, waist[1]-1.2-i*0.7];
      x.beginPath(); x.moveTo(t0[0],t0[1]);
      x.quadraticCurveTo((t0[0]+t1[0])/2+lean*0.7,(t0[1]+t1[1])/2,t1[0],t1[1]);
      x.stroke();
    }
    /* hip creases where the trunks take the legs */
    for(const hp of P.hip){
      x.beginPath(); x.moveTo(hp[0]-1.6,hp[1]+2.2); x.lineTo(hp[0]+1.2,hp[1]+3.6); x.stroke();
    }
  }
  /* belt */
  if(C.belt!==false){
    x.fillStyle=C.beltC||'#e9c81f';
    const bw=B.waistHW+1.4;
    x.save();
    x.translate(waist[0],waist[1]-0.4);
    x.rotate(Math.atan2(P.hip[1][1]-P.hip[0][1],P.hip[1][0]-P.hip[0][0])*0.3);
    x.fillRect(-bw,-1.7,bw*2,3.4);
    x.strokeStyle=INKC; x.lineWidth=lw*0.6; x.strokeRect(-bw,-1.7,bw*2,3.4);
    x.fillStyle=INKC; x.fillRect(-1.5,-1.4,3,2.8);
    x.restore();
  }
  return {shC,chest,waist,hipC,drawArm,drawLeg,lw,sv};
}

/* costume emblem on the chest */
function emblemAt(x,spec,at,lw){
  const a=spec.arch;
  const cx=at[0],cy=at[1];
  x.strokeStyle=INKC; x.lineJoin='round';
  x.fillStyle='#f6efdd';
  /* the sixteen carry their own devices — never the same shield twice */
  const dk=spec.design&&spec.design.emblem;
  if(dk){
    x.save(); x.translate(cx,cy); x.lineWidth=lw*0.6; x.lineCap='round';
    if(dk==='compass'){
      x.beginPath(); x.arc(0,0,3.4,0,7); x.fill(); x.stroke();
      x.fillStyle='#c22a1c';
      x.beginPath(); x.moveTo(0,-2.7); x.lineTo(0.9,0); x.lineTo(0,2.7); x.lineTo(-0.9,0);
      x.closePath(); x.fill(); x.stroke();
    } else if(dk==='frame'){
      x.fillRect(-3.4,-2.8,6.8,5.6); x.strokeRect(-3.4,-2.8,6.8,5.6);
      x.strokeRect(-2.2,-1.6,4.4,3.2);
    } else if(dk==='eye'){
      x.beginPath(); x.moveTo(-3.8,0); x.quadraticCurveTo(0,-3.2,3.8,0);
      x.quadraticCurveTo(0,3.2,-3.8,0); x.closePath(); x.fill(); x.stroke();
      x.fillStyle=INKC; x.beginPath(); x.arc(0,0,1.2,0,7); x.fill();
    } else if(dk==='dial'){
      x.beginPath(); x.arc(0,0,3.3,0,7); x.fill(); x.stroke();
      x.beginPath(); x.moveTo(0,0); x.lineTo(1.9,-1.9); x.stroke();
      for(let i=0;i<4;i++){ const aa=Math.PI*2*i/4+0.4;
        x.beginPath(); x.moveTo(Math.cos(aa)*2.5,Math.sin(aa)*2.5);
        x.lineTo(Math.cos(aa)*3.2,Math.sin(aa)*3.2); x.stroke(); }
    } else if(dk==='anvil'){
      x.beginPath(); x.moveTo(-3.6,-1.4); x.lineTo(3.6,-1.4); x.quadraticCurveTo(2.2,0.6,0.8,0.8);
      x.lineTo(0.8,2.0); x.lineTo(-2.4,2.0); x.lineTo(-2.4,0.8);
      x.quadraticCurveTo(-3.4,0.4,-3.6,-1.4); x.closePath(); x.fill(); x.stroke();
    } else if(dk==='bracket'){
      x.font='700 6.2px "Courier Prime",monospace'; x.textAlign='center'; x.textBaseline='middle';
      x.fillStyle='#f6efdd'; x.fillRect(-3.2,-2.9,6.4,5.8); x.strokeRect(-3.2,-2.9,6.4,5.8);
      x.fillStyle=INKC; x.fillText('<>',0,0.3);
      x.textAlign='left'; x.textBaseline='alphabetic';
    } else if(dk==='prompt'){
      x.fillStyle='#141d12'; x.fillRect(-3.4,-2.6,6.8,5.2);
      x.strokeStyle='#9fe08a'; x.strokeRect(-3.4,-2.6,6.8,5.2);
      x.strokeStyle='#9fe08a'; x.lineWidth=lw*0.7;
      x.beginPath(); x.moveTo(-2.2,-1.4); x.lineTo(-0.6,0); x.lineTo(-2.2,1.4); x.stroke();
      x.beginPath(); x.moveTo(0.4,1.4); x.lineTo(2.4,1.4); x.stroke();
    } else if(dk==='plug'){
      x.beginPath(); x.arc(0,0.4,2.9,Math.PI,0); x.lineTo(2.9,1.8); x.lineTo(-2.9,1.8);
      x.closePath(); x.fill(); x.stroke();
      x.beginPath(); x.moveTo(-1.3,-2.4); x.lineTo(-1.3,-4.2); x.stroke();
      x.beginPath(); x.moveTo(1.3,-2.4); x.lineTo(1.3,-4.2); x.stroke();
    } else if(dk==='uparrow'){
      x.beginPath(); x.moveTo(0,-3.6); x.lineTo(3.0,0.2); x.lineTo(1.3,0.2); x.lineTo(1.3,3.2);
      x.lineTo(-1.3,3.2); x.lineTo(-1.3,0.2); x.lineTo(-3.0,0.2); x.closePath();
      x.fillStyle='#e9c81f'; x.fill(); x.stroke();
    } else if(dk==='wing'){
      x.beginPath(); x.moveTo(-3.8,0.8);
      x.quadraticCurveTo(-1.2,-2.8,3.8,-1.8); x.quadraticCurveTo(1.6,-0.6,1.2,0.2);
      x.quadraticCurveTo(-0.6,-0.2,-1.4,0.6); x.quadraticCurveTo(-2.4,0.5,-3.8,0.8);
      x.closePath(); x.fill(); x.stroke();
    } else if(dk==='tower'){
      x.fillRect(-1.1,-3.4,2.2,6.4); x.strokeRect(-1.1,-3.4,2.2,6.4);
      x.beginPath(); x.moveTo(-2.8,3.0); x.lineTo(2.8,3.0); x.stroke();
      x.beginPath(); x.moveTo(0,-3.4); x.lineTo(0,-4.6); x.stroke();
      x.beginPath(); x.arc(0,-4.9,0.5,0,7); x.fill();
    } else if(dk==='rocket'){
      x.beginPath(); x.moveTo(0,-3.8); x.quadraticCurveTo(1.8,-1.4,1.4,1.6);
      x.lineTo(-1.4,1.6); x.quadraticCurveTo(-1.8,-1.4,0,-3.8);
      x.closePath(); x.fill(); x.stroke();
      x.beginPath(); x.moveTo(-1.4,1.6); x.lineTo(-2.4,3.4); x.lineTo(-0.6,1.6); x.stroke();
      x.beginPath(); x.moveTo(1.4,1.6); x.lineTo(2.4,3.4); x.lineTo(0.6,1.6); x.stroke();
    } else if(dk==='key'){
      x.beginPath(); x.arc(-1.6,-1.2,1.7,0,7); x.fill(); x.stroke();
      x.strokeStyle=INKC; x.lineWidth=lw*0.75;
      x.beginPath(); x.moveTo(-0.4,0); x.lineTo(2.8,2.9); x.stroke();
      x.beginPath(); x.moveTo(1.6,2.9); x.lineTo(2.4,2.1); x.stroke();
    } else if(dk==='envelope'){
      x.fillRect(-3.4,-2.2,6.8,4.4); x.strokeRect(-3.4,-2.2,6.8,4.4);
      x.beginPath(); x.moveTo(-3.4,-2.2); x.lineTo(0,0.6); x.lineTo(3.4,-2.2); x.stroke();
    } else if(dk==='knot'){
      x.beginPath(); x.arc(-1.2,0,1.9,0.6,5.4); x.stroke();
      x.beginPath(); x.arc(1.2,0,1.9,3.7,2.6); x.stroke();
    } else if(dk==='bolt'){
      x.beginPath(); x.moveTo(2.4,-4.4); x.lineTo(-2.6,0.6); x.lineTo(0.4,0.8);
      x.lineTo(-2.2,4.6); x.lineTo(2.8,-0.2); x.lineTo(-0.2,-0.4); x.closePath();
      x.fillStyle='#e9c81f'; x.fill(); x.lineWidth=lw*0.6; x.stroke();
    }
    x.restore();
    return;
  }
  if(a==='cosmic'){
    x.save(); x.translate(cx,cy); x.scale(0.5,0.5);
    x.beginPath(); x.moveTo(0,-7); x.quadraticCurveTo(0,0,7,0); x.quadraticCurveTo(0,0,0,7);
    x.quadraticCurveTo(0,0,-7,0); x.quadraticCurveTo(0,0,0,-7);
    x.closePath(); x.fill(); x.lineWidth=lw; x.stroke(); x.restore();
    return;
  }
  if(a==='speedster'){
    x.beginPath(); x.moveTo(cx+2.4,cy-4.4); x.lineTo(cx-2.6,cy+0.6); x.lineTo(cx+0.4,cy+0.8);
    x.lineTo(cx-2.2,cy+4.6); x.lineTo(cx+2.8,cy-0.2); x.lineTo(cx-0.2,cy-0.4); x.closePath();
    x.fillStyle='#e9c81f'; x.fill(); x.lineWidth=lw*0.6; x.stroke();
    return;
  }
  /* lettered shield */
  x.beginPath();
  x.moveTo(cx-3.6,cy-3.4); x.lineTo(cx+3.6,cy-3.4);
  x.quadraticCurveTo(cx+3.8,cy+1.2,cx,cy+4.4);
  x.quadraticCurveTo(cx-3.8,cy+1.2,cx-3.6,cy-3.4);
  x.closePath();
  x.fill(); x.lineWidth=lw*0.62; x.stroke();
  x.fillStyle=INKC;
  x.font='700 5.6px Oswald,sans-serif'; x.textAlign='center'; x.textBaseline='middle';
  x.fillText(spec.letter||'D',cx,cy+0.2);
  x.textAlign='left'; x.textBaseline='alphabetic';
}

/* ===== garments and gear that give the sixteen their silhouettes ===== */
function drawBust(x,F,B,lw){
  /* comic shorthand: two under-curves at the chest, never anatomy-first */
  x.strokeStyle='rgba(35,28,18,.7)'; x.lineWidth=lw*0.48; x.lineCap='round';
  const cx=F.chest[0], cy=F.chest[1]+1.8, r=B.chestHW*0.44;
  x.beginPath(); x.arc(cx-r*0.6,cy,r*0.62,0.5,2.5); x.stroke();
  x.beginPath(); x.arc(cx+r*0.6,cy,r*0.62,0.65,2.65); x.stroke();
}
function drawGown(x,P,F,B,col,lw,seed){
  /* ankle-length gown that FOLLOWS the pose: the hem is hung on the
     figure's own ankle points, so a flying oracle streams and a standing
     one falls straight */
  const rng=mulberry((seed||3)>>>0);
  const a0=P.legs[0][2], a1=P.legs[1][2];
  const lo=a0[0]<a1[0]?a0:a1, hi=a0[0]<a1[0]?a1:a0;
  const hemY=Math.max(a0[1],a1[1])-1.5;
  const pts=[[F.waist[0]-B.waistHW-0.6,F.waist[1]+0.8],
    [F.hipC[0]-B.pelvHW-2.4,F.hipC[1]+6],
    [lo[0]-5,hemY-4],[lo[0]-3.2,hemY],
    [(lo[0]+hi[0])/2-2,hemY-2.6],[(lo[0]+hi[0])/2+2,hemY-0.6],
    [hi[0]+3.2,hemY-1],[hi[0]+5,hemY-5],
    [F.hipC[0]+B.pelvHW+2.4,F.hipC[1]+6],
    [F.waist[0]+B.waistHW+0.6,F.waist[1]+0.8]];
  mass(x,pts,col,{lw,sv:[1.8,1.1]});
  x.strokeStyle='rgba(35,28,18,.6)'; x.lineWidth=lw*0.42; x.lineCap='round';
  for(let i=0;i<3;i++){
    const t=(i+1)/4;
    const hx=lo[0]+(hi[0]-lo[0])*t, sx=F.waist[0]-B.waistHW*0.7+B.waistHW*1.4*t;
    x.beginPath(); x.moveTo(sx,F.waist[1]+3);
    x.quadraticCurveTo((sx+hx)/2+(rng()*2-1)*2,(F.waist[1]+hemY)/2,hx,hemY-3-rng()*2);
    x.stroke();
  }
}
function drawCoatFlaps(x,P,F,B,col,lw){
  /* knee-length open coat: two skirts beside the legs + lapel creases */
  for(const i of [0,1]){
    const kx=P.legs[i][1][0], ky=P.legs[i][1][1];
    const out=i?1:-1;
    const pts=[[F.waist[0]+out*(B.waistHW*0.4),F.waist[1]+0.5],
      [F.waist[0]+out*(B.waistHW+1.8),F.waist[1]+2],
      [kx+out*(B.legW[0]*0.9+2.0),ky+2.5],
      [kx+out*(B.legW[0]*0.35),ky+4.0]];
    mass(x,pts,col,{lw:lw*0.9,sv:i?[1.8,1.1]:null});
    /* the coat runs a value darker than the suit so the masses never fuse */
    blobPath(x,pts); x.fillStyle='rgba(35,28,18,.14)'; x.fill();
  }
  x.strokeStyle='rgba(35,28,18,.75)'; x.lineWidth=lw*0.5; x.lineCap='round';
  x.beginPath(); x.moveTo(P.sh[0][0]+2,P.sh[0][1]+2);
  x.lineTo(F.chest[0]-1.2,F.chest[1]+5); x.lineTo(F.waist[0]-1.4,F.waist[1]); x.stroke();
  x.beginPath(); x.moveTo(P.sh[1][0]-2,P.sh[1][1]+2);
  x.lineTo(F.chest[0]+1.8,F.chest[1]+5); x.lineTo(F.waist[0]+1.6,F.waist[1]); x.stroke();
}
function drawApron(x,P,F,B,lw){
  /* the forge apron: a straight-cut leather panel, bib to knees */
  const kneeY=(P.legs[0][1][1]+P.legs[1][1][1])/2+1.5;
  const bw=B.chestHW*0.5, ww=B.waistHW*0.9+1.2;
  const k0=P.legs[0][1][0]-B.legW[0]*0.4, k1=P.legs[1][1][0]+B.legW[0]*0.4;
  x.beginPath();
  x.moveTo(F.chest[0]-bw,F.chest[1]-0.5);
  x.lineTo(F.chest[0]+bw,F.chest[1]-0.5);
  x.lineTo(F.waist[0]+ww,F.waist[1]+1.5);
  x.lineTo(k1,kneeY);
  x.quadraticCurveTo((k0+k1)/2,kneeY+1.6,k0,kneeY);
  x.lineTo(F.waist[0]-ww,F.waist[1]+1.5);
  x.closePath();
  x.fillStyle='#8a5a2c'; x.fill();
  x.strokeStyle=INKC; x.lineWidth=lw*0.85; x.stroke();
  /* scorch shading down the shadow flank */
  x.save(); x.clip();
  x.fillStyle=shadePat(x);
  x.fillRect(F.waist[0]+1,F.chest[1],ww+B.chestHW,kneeY-F.chest[1]+4);
  x.restore();
  x.strokeStyle='rgba(35,28,18,.55)'; x.lineWidth=lw*0.4; x.lineCap='round';
  x.beginPath(); x.moveTo(F.waist[0]-ww*0.6,F.waist[1]+3);
  x.lineTo(F.waist[0]+ww*0.6,F.waist[1]+3.4); x.stroke();
  x.strokeStyle=INKC; x.lineWidth=lw*0.7;
  x.beginPath(); x.moveTo(F.chest[0]-B.chestHW*0.5,F.chest[1]); x.lineTo(P.sh[0][0]+1.5,P.sh[0][1]); x.stroke();
  x.beginPath(); x.moveTo(F.chest[0]+B.chestHW*0.5,F.chest[1]); x.lineTo(P.sh[1][0]-1.5,P.sh[1][1]); x.stroke();
  x.fillStyle='#6b4a2e';
  x.fillRect(F.waist[0]-3.2,F.waist[1]+3,6.4,4.6);
  x.strokeStyle=INKC; x.lineWidth=lw*0.5; x.strokeRect(F.waist[0]-3.2,F.waist[1]+3,6.4,4.6);
}
function drawJacket(x,P,F,B,col,lw){
  /* cropped flight jacket: waist hem band, zip, storm collar */
  x.fillStyle=col;
  x.fillRect(F.waist[0]-B.waistHW-1.2,F.waist[1]-2.2,(B.waistHW+1.2)*2,2.6);
  x.strokeStyle=INKC; x.lineWidth=lw*0.55;
  x.strokeRect(F.waist[0]-B.waistHW-1.2,F.waist[1]-2.2,(B.waistHW+1.2)*2,2.6);
  x.beginPath(); x.moveTo(F.chest[0]+0.6,F.chest[1]-2.5); x.lineTo(F.waist[0]+0.4,F.waist[1]-2.4); x.stroke();
  x.fillStyle=col;
  x.beginPath(); x.moveTo(P.sh[0][0]-0.5,P.sh[0][1]-1); x.lineTo(P.sh[0][0]+4.4,P.sh[0][1]+0.6);
  x.lineTo(P.sh[0][0]+1.4,P.sh[0][1]+3.2); x.closePath(); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(P.sh[1][0]+0.5,P.sh[1][1]-1); x.lineTo(P.sh[1][0]-4.4,P.sh[1][1]+0.6);
  x.lineTo(P.sh[1][0]-1.4,P.sh[1][1]+3.2); x.closePath(); x.fill(); x.stroke();
}
function drawHalfCape(x,P,col,lw,seed){
  /* one-shoulder ceremonial half-cape, hung from the far shoulder */
  const rng=mulberry((seed||9)>>>0);
  const sh=P.sh[0];
  const hem=[[sh[0]-14+rng()*2,sh[1]+33],[sh[0]-10.5,sh[1]+29],[sh[0]-7,sh[1]+36],
    [sh[0]-3.5,sh[1]+30],[sh[0]-0.5,sh[1]+34]];
  const pts=[[sh[0]-2.5,sh[1]-0.5],[sh[0]-12,sh[1]+14],hem[0],hem[1],hem[2],hem[3],hem[4],[sh[0]+3,sh[1]+12],[sh[0]+3.5,sh[1]+1]];
  blobPath(x,pts); x.fillStyle=col; x.fill();
  blobPath(x,pts); x.fillStyle='rgba(35,28,18,.18)'; x.fill();
  blobPath(x,pts); x.strokeStyle=INKC; x.lineWidth=lw*0.9; x.stroke();
  x.strokeStyle='rgba(35,28,18,.7)'; x.lineWidth=lw*0.45;
  x.beginPath(); x.moveTo(sh[0]-1,sh[1]+3); x.quadraticCurveTo(sh[0]-6,sh[1]+18,hem[1][0],hem[1][1]-4); x.stroke();
}
function drawScarf(x,P,F,col,lw,seed){
  const rng=mulberry((seed||5)>>>0);
  const w=P.wind||0.4;
  const n=[F.shC[0],F.shC[1]-1.5];
  const dx=-(w>=0?1:-1);
  const tail=[n[0]+dx*(20+Math.abs(w)*16),n[1]-3-Math.abs(w)*7+rng()*2];
  const mid=[n[0]+dx*9,n[1]-1.0];
  limb(x,[n,mid,tail],[3.1,2.5,1.2],col,{lw:lw*0.75});
  limb(x,[[n[0]+1,n[1]+1],[n[0]+dx*7,n[1]+5],[n[0]+dx*13,n[1]+8.5-Math.abs(w)*8]],[2.3,1.8,1.0],col,{lw:lw*0.65});
  x.fillStyle=col; x.beginPath(); x.arc(n[0]+0.8,n[1]+1.2,2.0,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=lw*0.5; x.stroke();
}
function drawJetpack(x,P,B,col,lw,rocket,flame){
  const c=[(P.sh[0][0]+P.sh[1][0])/2,(P.sh[0][1]+P.sh[1][1])/2];
  const bx=c[0]-B.chestHW-1.6, by=c[1]+0.5;
  for(const [ox,sc] of [[0,1],[3.4,0.85]]){
    const w=4.4*sc, h=(rocket?14:10)*sc;
    x.fillStyle=col;
    rrp(x,bx-ox-w,by,w,h,1.8); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.7; rrp(x,bx-ox-w,by,w,h,1.8); x.stroke();
    x.strokeStyle='rgba(35,28,18,.6)'; x.lineWidth=lw*0.4;
    x.beginPath(); x.moveTo(bx-ox-w+1,by+2.2); x.lineTo(bx-ox-1,by+2.2); x.stroke();
    x.fillStyle=INKC; x.beginPath();
    x.moveTo(bx-ox-w+0.5,by+h); x.lineTo(bx-ox-0.5,by+h);
    x.lineTo(bx-ox-w/2,by+h+2.6); x.closePath(); x.fill();
    if(flame){
      x.fillStyle='#e9c81f'; x.beginPath();
      x.moveTo(bx-ox-w+0.9,by+h+2.6); x.lineTo(bx-ox-0.9,by+h+2.6);
      x.lineTo(bx-ox-w/2,by+h+8.5); x.closePath(); x.fill();
      x.strokeStyle='#c22a1c'; x.lineWidth=lw*0.5; x.stroke();
    }
  }
}
function drawGearTorso(x,P,F,B,D,cols,lw){
  const g=D.gear||[];
  if(g.indexOf('overalls')>=0){
    const bw=B.chestHW*0.78;
    x.fillStyle=cols.trim;
    x.fillRect(F.chest[0]-bw,F.chest[1]+0.5,bw*2,F.waist[1]-F.chest[1]-0.5);
    x.strokeStyle=INKC; x.lineWidth=lw*0.6;
    x.strokeRect(F.chest[0]-bw,F.chest[1]+0.5,bw*2,F.waist[1]-F.chest[1]-0.5);
    x.lineWidth=lw*0.7;
    x.beginPath(); x.moveTo(F.chest[0]-bw*0.7,F.chest[1]+1); x.lineTo(P.sh[0][0]+1.5,P.sh[0][1]+0.5); x.stroke();
    x.beginPath(); x.moveTo(F.chest[0]+bw*0.7,F.chest[1]+1); x.lineTo(P.sh[1][0]-1.5,P.sh[1][1]+0.5); x.stroke();
    x.fillStyle=INKC;
    x.beginPath(); x.arc(F.chest[0]-bw*0.7,F.chest[1]+2.1,0.7,0,7); x.fill();
    x.beginPath(); x.arc(F.chest[0]+bw*0.7,F.chest[1]+2.1,0.7,0,7); x.fill();
    x.fillStyle='#f6efdd';
    x.fillRect(F.chest[0]-2.1,F.chest[1]+4.2,4.2,3.1);
    x.strokeStyle=INKC; x.lineWidth=lw*0.45; x.strokeRect(F.chest[0]-2.1,F.chest[1]+4.2,4.2,3.1);
  }
  if(g.indexOf('harness')>=0){
    limb(x,[P.sh[0],[F.waist[0]+B.waistHW*0.7,F.waist[1]-0.5]],[1.6,1.4],cols.trim,{lw:lw*0.5});
    limb(x,[P.sh[1],[F.waist[0]-B.waistHW*0.7,F.waist[1]-0.5]],[1.6,1.4],cols.trim,{lw:lw*0.5});
    x.fillStyle='#d9c8a2';
    x.beginPath(); x.arc(F.chest[0],F.chest[1]+4.5,1.6,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.55; x.stroke();
  }
  if(g.indexOf('ruledsuit')>=0){
    x.strokeStyle='rgba(35,28,18,.4)'; x.lineWidth=lw*0.32;
    for(let i=0;i<3;i++){
      const yy=F.chest[1]+2+i*((F.waist[1]-F.chest[1]-2)/3);
      const hw=B.chestHW-(i*(B.chestHW-B.waistHW)/3);
      x.beginPath(); x.moveTo(F.chest[0]-hw*0.9,yy); x.lineTo(F.chest[0]+hw*0.9,yy); x.stroke();
    }
    for(const ox of [-0.45,0.45]){
      x.beginPath(); x.moveTo(F.chest[0]+B.chestHW*ox,F.chest[1]+1);
      x.lineTo(F.waist[0]+B.waistHW*ox,F.waist[1]); x.stroke();
    }
  }
}
function drawGearPost(x,P,F,B,D,cols,lw){
  const g=D.gear||[];
  if(g.indexOf('satchel')>=0){
    x.strokeStyle=INKC; x.lineWidth=lw*0.6;
    x.beginPath(); x.moveTo(P.sh[0][0]+2,P.sh[0][1]+2);
    x.lineTo(F.waist[0]+B.waistHW*0.8+2,F.waist[1]+3); x.stroke();
    x.fillStyle='#8a5a2c';
    x.fillRect(F.waist[0]+B.waistHW*0.5,F.waist[1]+2.5,6.6,5.2);
    x.strokeRect(F.waist[0]+B.waistHW*0.5,F.waist[1]+2.5,6.6,5.2);
    x.strokeStyle=INKC; x.lineWidth=lw*0.4;
    x.beginPath(); x.moveTo(F.waist[0]+B.waistHW*0.5,F.waist[1]+4.4);
    x.lineTo(F.waist[0]+B.waistHW*0.5+6.6,F.waist[1]+4.4); x.stroke();
  }
  if(g.indexOf('toolbelt')>=0){
    x.fillStyle='#6b4a2e';
    for(const ox of [-B.waistHW*0.8,0.2,B.waistHW*0.8-2.8]){
      x.fillRect(F.waist[0]+ox-1.4,F.waist[1]+1.6,3.4,3.4);
      x.strokeStyle=INKC; x.lineWidth=lw*0.45;
      x.strokeRect(F.waist[0]+ox-1.4,F.waist[1]+1.6,3.4,3.4);
    }
  }
  if(g.indexOf('dialbelt')>=0){
    /* her belt of dials — three faces, needles at different hours */
    for(let i=0;i<3;i++){
      const ox=F.waist[0]+(i-1)*B.waistHW*0.9;
      x.fillStyle='#d9c8a2';
      x.beginPath(); x.arc(ox,F.waist[1]+2.8,1.9,0,7); x.fill();
      x.strokeStyle=INKC; x.lineWidth=lw*0.5; x.stroke();
      const aa=[-0.8,0.6,2.4][i];
      x.beginPath(); x.moveTo(ox,F.waist[1]+2.8);
      x.lineTo(ox+Math.cos(aa)*1.3,F.waist[1]+2.8+Math.sin(aa)*1.3); x.stroke();
    }
  }
  if(g.indexOf('keyring')>=0){
    const kx=F.waist[0]+B.waistHW+1.6, ky=F.waist[1]+3;
    x.strokeStyle=INKC; x.lineWidth=lw*0.6;
    x.beginPath(); x.arc(kx,ky,2.0,0,7); x.stroke();
    for(let i=0;i<3;i++){
      const aa=1.1+i*0.55;
      x.beginPath(); x.moveTo(kx+Math.cos(aa)*2.0,ky+Math.sin(aa)*2.0);
      x.lineTo(kx+Math.cos(aa)*4.6,ky+Math.sin(aa)*4.6); x.stroke();
      x.beginPath(); x.arc(kx+Math.cos(aa)*5.1,ky+Math.sin(aa)*5.1,0.7,0,7); x.stroke();
    }
  }
  if(g.indexOf('ropecoil')>=0){
    const rx=F.waist[0]-B.waistHW-1.8, ry=F.waist[1]+4;
    x.strokeStyle='#b98d4f'; x.lineWidth=lw*0.9;
    for(let i=0;i<3;i++){ x.beginPath(); x.arc(rx,ry,2.6-i*0.7,0.3,5.9); x.stroke(); }
    x.strokeStyle=INKC; x.lineWidth=lw*0.35;
    x.beginPath(); x.arc(rx,ry,2.7,0.3,5.9); x.stroke();
  }
  if(g.indexOf('anklewings')>=0){
    for(const i of [0,1]){
      const a=P.legs[i][2];
      x.fillStyle='#f6efdd';
      x.beginPath(); x.moveTo(a[0]-1,a[1]-2.2);
      x.quadraticCurveTo(a[0]-4.6,a[1]-5.4,a[0]-6.2,a[1]-3.2);
      x.quadraticCurveTo(a[0]-4.2,a[1]-3.0,a[0]-3.4,a[1]-1.8);
      x.closePath(); x.fill();
      x.strokeStyle=INKC; x.lineWidth=lw*0.5; x.stroke();
    }
  }
  if(g.indexOf('epaulettes')>=0){
    x.fillStyle='#e9c81f';
    for(const i of [0,1]){
      const sh=P.sh[i];
      x.fillRect(sh[0]-2.6,sh[1]-1.8,5.2,1.9);
      x.strokeStyle=INKC; x.lineWidth=lw*0.45;
      x.strokeRect(sh[0]-2.6,sh[1]-1.8,5.2,1.9);
      for(let k=0;k<3;k++){ x.beginPath(); x.moveTo(sh[0]-1.6+k*1.6,sh[1]+0.1);
        x.lineTo(sh[0]-1.6+k*1.6,sh[1]+1.2); x.stroke(); }
    }
  }
  if(g.indexOf('pauldrons')>=0){
    x.fillStyle='#c9c9d4';
    for(const i of [0,1]){
      const sh=P.sh[i], out=i?1:-1;
      x.beginPath(); x.moveTo(sh[0]-3.0,sh[1]-2.0); x.lineTo(sh[0]+3.0,sh[1]-2.0);
      x.lineTo(sh[0]+out*4.4,sh[1]+2.6); x.lineTo(sh[0]-out*2.2,sh[1]+2.2);
      x.closePath(); x.fill();
      x.strokeStyle=INKC; x.lineWidth=lw*0.6; x.stroke();
      x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=lw*0.35;
      x.beginPath(); x.moveTo(sh[0]-2.2,sh[1]-0.4); x.lineTo(sh[0]+2.6,sh[1]-0.4); x.stroke();
    }
  }
}
function drawHandProp(x,P,F,D,lw,trimC,suitC,seed){
  const hd=P.arms[1][2];
  const aa=Math.atan2(hd[1]-P.arms[1][1][1],hd[0]-P.arms[1][1][0]);
  if(D.prop==='hammer'){
    x.save(); x.translate(hd[0],hd[1]); x.rotate(aa+Math.PI/2);
    x.strokeStyle='#8a5a2c'; x.lineWidth=lw*1.5;
    x.beginPath(); x.moveTo(0,7); x.lineTo(0,-18); x.stroke();
    x.strokeStyle=INKC; x.lineWidth=lw*0.6;
    x.beginPath(); x.moveTo(0,7); x.lineTo(0,-18); x.stroke();
    x.fillStyle='#9a9aa4'; x.fillRect(-7.5,-27,15,9);
    x.strokeStyle=INKC; x.lineWidth=lw*0.8; x.strokeRect(-7.5,-27,15,9);
    x.fillStyle=INKC; x.fillRect(2.2,-27,5.3,9);
    x.restore();
  } else if(D.prop==='lance'){
    /* the set-square lance: a draughtsman's triangle on a ruled shaft */
    x.save(); x.translate(hd[0],hd[1]); x.rotate(aa);
    x.strokeStyle='#c9c9d4'; x.lineWidth=lw*1.4;
    x.beginPath(); x.moveTo(-14,0); x.lineTo(22,0); x.stroke();
    x.strokeStyle=INKC; x.lineWidth=lw*0.55;
    x.beginPath(); x.moveTo(-14,0); x.lineTo(22,0); x.stroke();
    for(let i=0;i<5;i++){ x.beginPath(); x.moveTo(-10+i*6,-1.2); x.lineTo(-10+i*6,1.2); x.stroke(); }
    x.fillStyle='#f6efdd';
    x.beginPath(); x.moveTo(22,-6.5); x.lineTo(33,0); x.lineTo(22,6.5); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.7; x.stroke();
    x.beginPath(); x.moveTo(24,-2.6); x.lineTo(28.5,0); x.lineTo(24,2.6); x.closePath(); x.stroke();
    x.restore();
  } else if(D.prop==='staff'){
    const sx=hd[0]+2;
    x.strokeStyle='#6b4a2e'; x.lineWidth=lw*1.4;
    x.beginPath(); x.moveTo(sx,hd[1]+26); x.lineTo(sx,hd[1]-16); x.stroke();
    x.strokeStyle=INKC; x.lineWidth=lw*0.55;
    x.beginPath(); x.moveTo(sx,hd[1]+26); x.lineTo(sx,hd[1]-16); x.stroke();
    x.fillStyle='#f6efdd';
    x.beginPath(); x.arc(sx,hd[1]-20,4.2,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.6; x.stroke();
    x.beginPath(); x.moveTo(sx-2.8,hd[1]-20); x.quadraticCurveTo(sx,hd[1]-22.4,sx+2.8,hd[1]-20);
    x.quadraticCurveTo(sx,hd[1]-17.6,sx-2.8,hd[1]-20); x.closePath();
    x.fillStyle=trimC; x.fill(); x.stroke();
    x.fillStyle=INKC; x.beginPath(); x.arc(sx,hd[1]-20,0.9,0,7); x.fill();
  } else if(D.prop==='paddles'){
    for(const hand of [P.arms[1][2],P.arms[0][2]]){
      const a2=Math.atan2(hand[1]-F.chest[1],hand[0]-F.chest[0]);
      const px=hand[0]+Math.cos(a2)*6, py=hand[1]+Math.sin(a2)*6;
      x.strokeStyle=INKC; x.lineWidth=lw*0.8;
      x.beginPath(); x.moveTo(hand[0],hand[1]); x.lineTo(px,py); x.stroke();
      x.fillStyle='#e9c81f';
      x.beginPath(); x.arc(px+Math.cos(a2)*3,py+Math.sin(a2)*3,3.4,0,7); x.fill();
      x.strokeStyle=INKC; x.lineWidth=lw*0.6; x.stroke();
      x.strokeStyle=INKC; x.lineWidth=lw*0.45;
      x.beginPath(); x.arc(px+Math.cos(a2)*3,py+Math.sin(a2)*3,1.6,0,7); x.stroke();
    }
  } else if(D.prop==='wrench'){
    x.save(); x.translate(hd[0],hd[1]); x.rotate(aa+Math.PI/2);
    x.strokeStyle='#9a9aa4'; x.lineWidth=lw*1.7;
    x.beginPath(); x.moveTo(0,5); x.lineTo(0,-12); x.stroke();
    x.strokeStyle=INKC; x.lineWidth=lw*0.55;
    x.beginPath(); x.moveTo(0,5); x.lineTo(0,-12); x.stroke();
    x.fillStyle='#9a9aa4';
    x.beginPath(); x.arc(0,-14.5,3.4,0.7,5.6); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.6; x.stroke();
    x.restore();
  } else if(D.prop==='banner'){
    const sx=hd[0]+1.5;
    x.strokeStyle='#8a5a2c'; x.lineWidth=lw*1.4;
    x.beginPath(); x.moveTo(sx,hd[1]+28); x.lineTo(sx,hd[1]-22); x.stroke();
    x.strokeStyle=INKC; x.lineWidth=lw*0.55;
    x.beginPath(); x.moveTo(sx,hd[1]+28); x.lineTo(sx,hd[1]-22); x.stroke();
    x.fillStyle=trimC;
    x.beginPath(); x.moveTo(sx,hd[1]-22); x.lineTo(sx+16,hd[1]-18.5);
    x.quadraticCurveTo(sx+11,hd[1]-15.5,sx+16,hd[1]-12.5); x.lineTo(sx,hd[1]-9);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.6; x.stroke();
  }
}

/* the hero — SIXTEEN designs, one body engine, no recolours */
function drawFigure(x, spec, poseName, box, o){
  o=o||{};
  const D=spec.design||null;
  const P=POSES[poseName]||POSES.stand;
  const s=Math.min(box.w,box.h)/100;
  x.save();
  x.translate(box.x+box.w/2, box.y+box.h/2);
  if(o.flip) x.scale(-1,1);
  if(o.rot) x.rotate(o.rot);
  x.scale(s,s); x.translate(-50,-50);
  const lw=lwFor(s);
  const hatch=s>=1.05;   /* feathering only where it can survive print */
  const suitC=(D&&D.suitC)||comboRGB(spec.suit), trimC=(D&&D.trimC)||comboRGB(spec.trim);
  const skinC=(spec.ident&&spec.ident.skin)||SKIN;
  const col=n=>n==='suit'?suitC:n==='trim'?trimC:n==='skin'?skinC:n==='ink'?INKC:n;
  let C, B;
  if(D){
    B=BODY[D.body]||BODY.heroic;
    C={suit:suitC,trim:trimC,skin:skinC,
      glove:D.glove?col(D.glove):trimC,
      boot:D.boot?col(D.boot):trimC,
      cape:(D.cape==='cape'||D.cape==='cloak')?(D.capeC||trimC):null,
      trunks:D.lower==='pants'?suitC:trimC,
      skirt:D.lower==='skirt'?trimC:null,
      beltC:D.beltC||'#e9c81f'};
    if(D.legsC) C.legs=col(D.legsC);
    if(D.belt===false) C.belt=false;
  } else {
    B=BODY.heroic;
    C={suit:suitC,trim:trimC,skin:skinC,glove:trimC,boot:trimC,
      cape:(spec.arch==='gadgeteer'||spec.arch==='titan')?null:trimC,
      trunks:trimC,beltC:'#e9c81f'};
  }
  const gr=D?(D.gear||[]):[];
  /* the back layer: rockets and half-capes live BEHIND the figure */
  if(gr.indexOf('jetpack')>=0) drawJetpack(x,P,B,trimC,lw,false,false);
  if(gr.indexOf('rockets')>=0) drawJetpack(x,P,B,trimC,lw,true,!P.grounded);
  if(D&&D.cape==='half') drawHalfCape(x,P,D.capeC||trimC,lw,(o.seed||0)^11);
  const F=drawFigureCore(x,P,B,C,{lw,seed:o.seed,noFx:o.noFx,shadow:o.shadow,hatch});
  if(D&&D.fem) drawBust(x,F,B,lw);
  if(D) drawGearTorso(x,P,F,B,D,{suit:suitC,trim:trimC},lw);
  if(D&&D.coat==='jacket') drawJacket(x,P,F,B,trimC,lw);
  /* near leg, then the long cloth, then the near arm over everything */
  F.drawLeg(1);
  if(D&&D.lower==='gown') drawGown(x,P,F,B,D.gownC||suitC,lw,(o.seed||0)^29);
  if(D&&D.coat==='long') drawCoatFlaps(x,P,F,B,trimC,lw);
  if(D&&D.coat==='apron') drawApron(x,P,F,B,lw);
  F.drawArm(1);
  if(D) drawGearPost(x,P,F,B,D,{suit:suitC,trim:trimC},lw);
  if(D&&D.scarf) drawScarf(x,P,F,D.scarf===true?'#c22a1c':D.scarf,lw,(o.seed||0)^47);
  /* gadgeteer harness (legacy titles without a design) */
  if(!D&&spec.arch==='gadgeteer'){
    x.strokeStyle=INKC; x.lineWidth=lw*0.62;
    x.beginPath(); x.moveTo(P.sh[0][0]+1,P.sh[0][1]+1); x.lineTo(F.waist[0]+3,F.waist[1]-1); x.stroke();
    x.fillStyle='#d9c8a2';
    x.fillRect(F.chest[0]+2,F.chest[1]+4,4.4,3.2);
    x.strokeRect(F.chest[0]+2,F.chest[1]+4,4.4,3.2);
  }
  /* neck + head */
  const nb=vmix(F.shC,P.head,0.25);
  const neckC=D?((D.neckSkin||D.fem)?skinC:suitC):(spec.arch==='titan'?skinC:suitC);
  limb(x,[nb,[P.head[0],P.head[1]+3.5]],[B.neckW,B.neckW*0.9],neckC,{lw:lw*0.9});
  const styleMap={sentinel:'cowl',speedster:'speedster',cosmic:'cosmic',
    mystic:'mystic',gadgeteer:'gadget',titan:'mask'};
  drawHeadC(x,{cx:P.head[0],cy:P.head[1],r:B.headR,tilt:P.tilt||0,
    dir:o.flip?-(P.dir||0.55)* -1:(P.dir||0.55),
    expr:o.expr||P.expr,style:D?D.head:(styleMap[spec.arch]||'cowl'),
    suitC:(D&&D.helmC)||suitC,trimC,lw,
    ident:spec.ident,skin:skinC,hairC:D&&D.hairC,fem:!!(D&&D.fem),eyeC:D&&D.eyeC});
  emblemAt(x,spec,[F.chest[0]+ (P.dir>0?1:-1)*0.5,F.chest[1]+3.4],lw);
  if(o.withProp&&D&&D.prop) drawHandProp(x,P,F,D,lw,trimC,suitC,o.seed);
  x.restore();
}

/* DRAMATIC LIGHT: draw the figure to its own cel, remodel it with light,
   then press the cel onto the page — screen-glow on a face, rim at night */
function drawFigureLit(x, kind, arg, poseName, box, o){
  o=o||{};
  const light=o.light;
  const draw=(ctx,bx)=>{
    if(kind==='villain') drawVillain(ctx,arg,bx,o);
    else if(kind==='sidekick') drawSidekick(ctx,bx,poseName,o);
    else drawFigure(ctx,arg,poseName,bx,o);
  };
  if(!light){ draw(x,box); return; }
  const pad=Math.ceil(Math.max(box.w,box.h)*0.3)+24;
  const cw=Math.ceil(box.w+pad*2), ch=Math.ceil(box.h+pad*2);
  const cel=document.createElement('canvas');
  const R=DPR;
  cel.width=Math.max(2,cw*R); cel.height=Math.max(2,ch*R);
  const cx2=cel.getContext('2d'); cx2.setTransform(R,0,0,R,0,0);
  draw(cx2,{x:pad,y:pad,w:box.w,h:box.h});
  /* LIGHT, not paint: a luminance gradient pressed through 'overlay'
     brightens toward the source and sinks away from it while every base
     colour keeps its own hue — a lit arm stays a BLUE arm in warm light,
     never a flat recolour. A faint tinted breath near the source carries
     the colour temperature on top. */
  const lum=document.createElement('canvas');
  lum.width=cel.width; lum.height=cel.height;
  const lx2=lum.getContext('2d'); lx2.setTransform(R,0,0,R,0,0);
  let gx,gy,g;
  if(light.mode==='screen'){
    gx=(light.at?light.at[0]:0)*cw; gy=(light.at?light.at[1]:0.5)*ch;
    g=lx2.createRadialGradient(gx,gy,8,gx,gy,Math.max(cw,ch)*0.92);
    g.addColorStop(0,'rgb(255,246,222)');
    g.addColorStop(0.40,'rgb(148,148,148)');
    g.addColorStop(1,'rgb(58,62,96)');
  } else { /* rim: the night sinks the mass, one bright edge survives */
    const d=vnorm(light.dir||[-1,-0.25]);
    gx=cw/2+d[0]*cw*0.55; gy=ch/2+d[1]*ch*0.55;
    g=lx2.createLinearGradient(gx,gy,cw/2-d[0]*cw*0.55,ch/2-d[1]*ch*0.55);
    g.addColorStop(0,'rgb(255,244,214)');
    g.addColorStop(0.30,'rgb(140,140,140)');
    g.addColorStop(1,'rgb(52,54,86)');
  }
  lx2.fillStyle=g; lx2.fillRect(0,0,cw,ch);
  /* mask the light to the figure's own alpha */
  lx2.globalCompositeOperation='destination-in';
  lx2.setTransform(1,0,0,1,0,0); lx2.drawImage(cel,0,0);
  cx2.save();
  cx2.globalCompositeOperation='overlay';
  cx2.setTransform(1,0,0,1,0,0); cx2.drawImage(lum,0,0);
  cx2.restore();
  /* colour temperature: a LOW-alpha tinted breath close to the source */
  cx2.globalCompositeOperation='source-atop';
  const warm=light.tint||(light.mode==='screen'?'rgba(159,224,138,.42)':'rgba(255,242,204,.5)');
  const wg=cx2.createRadialGradient(gx,gy,6,gx,gy,Math.max(cw,ch)*0.5);
  wg.addColorStop(0,warm.replace(/[\d.]+\)$/,'.20)'));
  wg.addColorStop(1,warm.replace(/[\d.]+\)$/,'0)'));
  cx2.fillStyle=wg; cx2.fillRect(0,0,cw,ch);
  cx2.globalCompositeOperation='source-over';
  x.drawImage(cel, box.x-pad, box.y-pad, cw, ch);
}

/* PAGE the copy kid */
const KIDPOSE={
  point:{ head:[52,19], dir:.55, expr:'smile',
    sh:[[43,34],[59,33.5]], chest:[51,40], waist:[50.5,50], hip:[[46.5,57],[55,57]],
    arms:[[[43,34.5],[38,44],[41,52.5]],[[59,34],[67.5,27.5],[76.5,20.5]]],
    hands:['open','point'],
    legs:[[[47,57],[44.5,75],[43.5,91]],[[55,57],[59,75],[61,91]]],
    feet:['side','side'], cape:'none', grounded:1 },
  think:{ head:[50,20], dir:.55, tilt:.08, expr:'think',
    sh:[[42.5,35],[58,35]], chest:[50,41], waist:[50,50.5], hip:[[46,57],[54.5,57]],
    arms:[[[42.5,35.5],[46,45],[55,43]],[[58,35],[62,45],[54,27.5]]],
    hands:['open','chin'],
    legs:[[[46.5,57],[45,75],[44,91]],[[54.5,57],[57.5,75],[59,91]]],
    feet:['side','side'], cape:'none', grounded:1 },
  stand:{ head:[50,19.5], dir:.55, expr:'smile',
    sh:[[42.5,34.5],[57.5,34.5]], chest:[50,40.5], waist:[50,50], hip:[[46,57],[54.5,57]],
    arms:[[[42.5,35],[39,44.5],[40.5,53]],[[57.5,35],[61.5,44.5],[60,53]]],
    hands:['open','open'],
    legs:[[[46.5,57],[44.5,75],[43.5,91]],[[54.5,57],[57.5,75],[59,91]]],
    feet:['side','side'], cape:'none', grounded:1 },
  run:{ head:[57,21], dir:1, tilt:.1, expr:'alarm',
    sh:[[50,35.5],[54.5,35]], chest:[51,41], waist:[49,50], hip:[[46.5,56.5],[50.5,56.5]],
    arms:[[[50,36],[59,42],[66,36]],[[54.5,35.5],[46,43],[39.5,36.5]]],
    hands:['fist','fist'],
    legs:[[[46.5,56.5],[36,64],[26.5,67]],[[50.5,56.5],[59.5,69],[56,87]]],
    feet:['tip','side'], cape:'none', fx:'speed', grounded:1 },
};
function drawSidekick(x, box, poseName, o){
  o=o||{};
  const P=KIDPOSE[poseName]||KIDPOSE[{point:'point',think:'think',run:'run'}[poseName]]||KIDPOSE.stand;
  const s=Math.min(box.w,box.h)/100;
  x.save();
  x.translate(box.x+box.w/2, box.y+box.h/2);
  if(o.flip) x.scale(-1,1);
  x.scale(s,s); x.translate(-50,-50);
  const lw=lwFor(s);
  const shirt='#e3e7dd', shorts='#3f6f9e', capC=comboRGB([['Y',1],['M',.5]]);
  const C={suit:shirt,skin:SKIN,glove:null,boot:'#7a5a34',cape:null,
    trunks:shorts,belt:false,legs:shorts,shin:SKIN2};
  const F=drawFigureCore(x,P,BODY.kid,C,{lw,seed:o.seed,noFx:o.noFx,shadow:o.shadow,noAccent:true});
  F.drawLeg(1); F.drawArm(1);
  /* the satchel of copy */
  x.strokeStyle=INKC; x.lineWidth=lw*0.6;
  x.beginPath(); x.moveTo(P.sh[0][0]+2,P.sh[0][1]+2); x.lineTo(F.waist[0]+5,F.waist[1]+3); x.stroke();
  x.fillStyle='#8a5a2c';
  x.fillRect(F.waist[0]+3,F.waist[1]+2,7,5.5);
  x.strokeRect(F.waist[0]+3,F.waist[1]+2,7,5.5);
  x.fillStyle='#fdf8ea';
  x.fillRect(F.waist[0]+4,F.waist[1]+1,5,2);
  x.strokeStyle=INKC; x.lineWidth=lw*0.4; x.strokeRect(F.waist[0]+4,F.waist[1]+1,5,2);
  const nb=vmix(F.shC,P.head,0.3);
  limb(x,[nb,[P.head[0],P.head[1]+5]],[BODY.kid.neckW,BODY.kid.neckW*0.9],SKIN,{lw:lw*0.9});
  drawHeadC(x,{cx:P.head[0],cy:P.head[1],r:BODY.kid.headR,tilt:P.tilt||0,dir:P.dir,
    expr:o.expr||P.expr,style:'kid',capC,jaw:'soft',lw});
  x.restore();
}

/* --- the rogues, rebuilt on the same bones --- */
function drawVillain(x, v, box, o){
  o=o||{};
  const s=Math.min(box.w,box.h)/100;
  x.save();
  x.translate(box.x+box.w/2, box.y+box.h/2);
  if(o.flip) x.scale(-1,1);
  x.scale(s,s); x.translate(-50,-50);
  const lw=lwFor(s);
  const suitC=comboRGB(v.suit), trimC=comboRGB(v.trim);
  const rng=mulberry(hash32(v.id)+(o.seed||0));
  if(v.id==='v404'){
    /* THE 404 — the ghost of the missing page, with weight and folds */
    x.beginPath();
    x.moveTo(26,93);
    for(let i=0;i<5;i++){
      x.quadraticCurveTo(30+i*10.4,84+(i%2?8:-5),36+i*10.4,93);
    }
    x.quadraticCurveTo(80,84,79,56);
    x.bezierCurveTo(80,22,68,9,49,9);
    x.bezierCurveTo(30,9,20,24,23,52);
    x.quadraticCurveTo(24,78,26,93);
    x.closePath();
    x.fillStyle='#f6efdd'; x.fill();
    /* fold shading down the flanks */
    x.save(); x.clip();
    const pat=x.createPattern(screenTile('K',.25,2),'repeat');
    if(pat&&pat.setTransform) pat.setTransform(new DOMMatrix().scale(0.45));
    x.fillStyle=pat;
    x.beginPath(); x.moveTo(20,10); x.lineTo(42,10); x.quadraticCurveTo(30,50,34,95); x.lineTo(20,95); x.closePath(); x.fill();
    x.fillStyle=INKC;
    x.beginPath(); x.moveTo(23,40); x.quadraticCurveTo(27,60,26,88); x.lineTo(30,88); x.quadraticCurveTo(30,58,27,40); x.closePath(); x.fill();
    x.restore();
    x.strokeStyle=INKC; x.lineWidth=lw*1.1; x.stroke();
    /* fold lines */
    x.strokeStyle='rgba(35,28,18,.7)'; x.lineWidth=lw*0.5;
    x.beginPath(); x.moveTo(44,20); x.quadraticCurveTo(40,50,42,88); x.stroke();
    x.beginPath(); x.moveTo(62,22); x.quadraticCurveTo(66,50,64,86); x.stroke();
    /* the hollow face — angled, grieving */
    x.fillStyle=INKC;
    x.beginPath(); x.ellipse(41.5,35,4.2,6.2,0.3,0,7); x.fill();
    x.beginPath(); x.ellipse(58,35,4.2,6.2,-0.3,0,7); x.fill();
    x.beginPath(); x.ellipse(50,53,3.4,5.2,0,0,7); x.fill();
    /* paper glints inside the eyes */
    x.fillStyle='#f6efdd';
    x.beginPath(); x.arc(42.5,33,1,0,7); x.fill();
    x.beginPath(); x.arc(59,33,1,0,7); x.fill();
    x.font='700 12px Oswald,sans-serif'; x.textAlign='center'; x.fillStyle=INKC;
    x.fillText('404',50,74); x.textAlign='left';
    /* a broken chain of anchors trailing */
    x.strokeStyle=INKC; x.lineWidth=lw*0.7;
    for(let i=0;i<3;i++){
      x.beginPath(); x.ellipse(20-i*4,60+i*9,2.6,1.7,0.5,0,7); x.stroke();
    }
    x.restore(); return;
  }
  if(v.id==='baron'){
    /* BARON BREAKING-CHANGE — a bulk of a man in a greatcoat, hammer shouldered */
    const P=POSES[o.pose||'monologue'];
    const B=BODY.bulky;
    const C={suit:suitC,skin:SKIN2,glove:INKC,boot:INKC,cape:trimC,
      coat:suitC,trunks:suitC,beltC:'#8f1d12'};
    /* high spiked collar instead of a cape */
    const F0={sh:P.sh};
    x.fillStyle=trimC;
    x.beginPath();
    x.moveTo(P.sh[0][0]-5,P.sh[0][1]+1);
    for(let i=0;i<4;i++) x.lineTo(P.sh[0][0]-4+i*3.4, P.sh[0][1]-4.5-(i%2?1.6:0));
    x.lineTo((P.sh[0][0]+P.sh[1][0])/2, P.sh[0][1]-2.5);
    for(let i=0;i<4;i++) x.lineTo(P.sh[1][0]-7+i*3.4, P.sh[1][1]-4.5-(i%2?0:1.6));
    x.lineTo(P.sh[1][0]+5,P.sh[1][1]+1);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw; x.stroke();
    const F=drawFigureCore(x,P,B,C,{lw,seed:o.seed,shadow:o.shadow});
    F.drawLeg(1);
    /* coat buttons + medal */
    x.fillStyle=trimC;
    for(let i=0;i<3;i++){ x.beginPath(); x.arc(F.chest[0]+3,F.chest[1]+2+i*5.5,1.1,0,7); x.fill(); }
    x.strokeStyle='#e9c81f'; x.lineWidth=lw*0.8;
    x.beginPath(); x.moveTo(F.chest[0]-4,F.chest[1]+1); x.lineTo(F.chest[0]-6,F.chest[1]+5); x.stroke();
    x.fillStyle='#e9c81f';
    x.beginPath(); x.arc(F.chest[0]-6.4,F.chest[1]+6.6,1.9,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.5; x.stroke();
    F.drawArm(1);
    /* the wrecking gavel in the raised hand */
    const hd=P.arms[1][2];
    x.save(); x.translate(hd[0],hd[1]);
    x.rotate(Math.atan2(P.arms[1][2][1]-P.arms[1][1][1],P.arms[1][2][0]-P.arms[1][1][0])+Math.PI/2);
    x.strokeStyle='#8a5a2c'; x.lineWidth=lw*1.6;
    x.beginPath(); x.moveTo(0,8); x.lineTo(0,-24); x.stroke();
    x.strokeStyle=INKC; x.lineWidth=lw*0.7;
    x.beginPath(); x.moveTo(0,8); x.lineTo(0,-24); x.stroke();
    x.fillStyle=comboRGB([['K',.5]]);
    x.fillRect(-10.5,-36,21,12);
    x.strokeStyle=INKC; x.lineWidth=lw*0.9; x.strokeRect(-10.5,-36,21,12);
    x.save(); x.beginPath(); x.rect(-10.5,-36,21,12); x.clip();
    x.fillStyle=INKC; x.fillRect(3,-36,8,12); x.restore();
    x.restore();
    const nb=vmix(F.shC,P.head,0.3);
    limb(x,[nb,[P.head[0],P.head[1]+4]],[B.neckW,B.neckW*0.95],SKIN2,{lw:lw*0.9});
    drawHeadC(x,{cx:P.head[0],cy:P.head[1],r:B.headR,tilt:P.tilt||0,dir:P.dir||.55,
      expr:o.expr||'scheme',style:'baron',skin:SKIN2,jaw:'square',lw});
    x.restore(); return;
  }
  if(v.id==='deprecation'){
    /* DOCTOR DEPRECATION — the hooded archivist, staff and sunset clause */
    /* robe: one constructed mass with real folds */
    x.beginPath();
    x.moveTo(50,9);
    x.bezierCurveTo(38,10,32,20,33,30);       /* hood back */
    x.bezierCurveTo(28,44,27,62,25,92);       /* left fall */
    x.lineTo(31,92);
    x.quadraticCurveTo(33,80,34,72);
    x.lineTo(36,92); x.lineTo(64,92);
    x.quadraticCurveTo(66,78,67,70);
    x.quadraticCurveTo(69,80,70,92);
    x.lineTo(75,92);
    x.bezierCurveTo(74,60,72,42,67,29);
    x.bezierCurveTo(66,16,60,9,50,9);
    x.closePath();
    x.fillStyle=suitC; x.fill();
    x.save(); x.clip();
    x.fillStyle=shadePat(x);
    x.beginPath(); x.moveTo(24,9); x.lineTo(45,9); x.quadraticCurveTo(36,50,38,95); x.lineTo(24,95);
    x.closePath(); x.fill();
    /* fold spot blacks */
    x.fillStyle=INKC;
    x.beginPath(); x.moveTo(34,72); x.quadraticCurveTo(35,82,36,92); x.lineTo(40,92);
    x.quadraticCurveTo(38,80,37,70); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(67,70); x.quadraticCurveTo(66,82,64,92); x.lineTo(60,92);
    x.quadraticCurveTo(63,80,64,68); x.closePath(); x.fill();
    x.restore();
    x.strokeStyle=INKC; x.lineWidth=lw*1.05; x.stroke();
    /* fold lines */
    x.strokeStyle='rgba(35,28,18,.75)'; x.lineWidth=lw*0.48;
    x.beginPath(); x.moveTo(44,34); x.quadraticCurveTo(42,60,43,90); x.stroke();
    x.beginPath(); x.moveTo(56,34); x.quadraticCurveTo(58,60,57,90); x.stroke();
    /* rope belt */
    x.strokeStyle='#d9c8a2'; x.lineWidth=lw*0.8;
    x.beginPath(); x.moveTo(36,52); x.quadraticCurveTo(50,56,66,52); x.stroke();
    x.beginPath(); x.moveTo(52,54); x.quadraticCurveTo(53,62,51,68); x.stroke();
    /* the reaching bony hand */
    const armEnd=[26,42];
    limb(x,[[42,36],[33,40],armEnd],[4.5,3.4,2.2],suitC,{lw});
    drawHand(x,armEnd,Math.PI*0.9,'splay',0.95,'#d9c8a2',{lw});
    /* the staff with the sunset flag */
    x.strokeStyle='#8a5a2c'; x.lineWidth=lw*1.5;
    x.beginPath(); x.moveTo(78,94); x.lineTo(78,20); x.stroke();
    x.strokeStyle=INKC; x.lineWidth=lw*0.6;
    x.beginPath(); x.moveTo(78,94); x.lineTo(78,20); x.stroke();
    x.fillStyle='#f6efdd';
    x.beginPath(); x.moveTo(78,20); x.lineTo(95,24);
    x.quadraticCurveTo(88,27,95,31);
    x.lineTo(78,34); x.closePath();
    x.fill(); x.strokeStyle=INKC; x.lineWidth=lw*0.7; x.stroke();
    x.fillStyle='#e9c81f';
    x.beginPath(); x.arc(85,26.6,2.4,Math.PI,0); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=lw*0.4; x.stroke();
    /* hooded head */
    drawHeadC(x,{cx:50,cy:22,r:6.2,dir:.4,expr:'scheme',style:'hood',suitC,lw});
    x.restore(); return;
  }
  /* MISS CONFIGURATION — the tangler of settings, cable whip in hand */
  {
    const P=POSES[o.pose||'monologue'];
    const B=BODY.slim;
    const C={suit:suitC,skin:SKIN,glove:trimC,boot:trimC,cape:null,
      skirt:trimC,beltC:INKC};
    const F=drawFigureCore(x,P,B,C,{lw,seed:o.seed,shadow:o.shadow});
    F.drawLeg(1); F.drawArm(1);
    /* the cable whip from the raised hand */
    const hd=P.arms[1][2];
    x.strokeStyle=INKC; x.lineWidth=lw*0.9; x.lineCap='round';
    x.beginPath(); x.moveTo(hd[0]+2,hd[1]);
    x.bezierCurveTo(hd[0]+16,hd[1]-6,hd[0]+18,hd[1]+16,hd[0]+8,hd[1]+22);
    x.bezierCurveTo(hd[0]+2,hd[1]+27,hd[0]+12,hd[1]+34,hd[0]+18,hd[1]+31);
    x.stroke();
    x.fillStyle=trimC;
    x.fillRect(hd[0]+16,hd[1]+29,5.5,6.5);
    x.strokeStyle=INKC; x.lineWidth=lw*0.55; x.strokeRect(hd[0]+16,hd[1]+29,5.5,6.5);
    for(let i=0;i<3;i++){ x.beginPath(); x.moveTo(hd[0]+17+i*1.6,hd[1]+35.5); x.lineTo(hd[0]+17+i*1.6,hd[1]+38); x.stroke(); }
    const nb=vmix(F.shC,P.head,0.3);
    limb(x,[nb,[P.head[0],P.head[1]+4]],[B.neckW,B.neckW*0.9],SKIN,{lw:lw*0.9});
    drawHeadC(x,{cx:P.head[0],cy:P.head[1],r:B.headR,tilt:P.tilt||0,dir:P.dir||.55,
      expr:o.expr||'scheme',style:'lady',jaw:'soft',suitC:trimC,lw});
    x.restore(); return;
  }
}

/* where a figure's mouth sits, in unit space (for balloon tails) */
function mouthOfPose(kind,poseName){
  let P;
  if(kind==='sidekick') P=KIDPOSE[poseName]||KIDPOSE.stand;
  else P=POSES[poseName]||POSES.stand;
  const d=P.dir==null?0.55:P.dir;
  const r=kind==='sidekick'?BODY.kid.headR:5.4;
  return [P.head[0]+d*r*0.5, P.head[1]+r*0.72, d];
}
/* panel-pixel mouth anchor for a scene figure spec {kind,pose,box,flip} */
function mouthAnchor(f){
  let m;
  if(f.kind==='v404') m=[50,54];
  else if(f.kind==='deprecation') m=[51,24];
  else m=mouthOfPose(f.kind==='sidekick'?'sidekick':f.kind, f.pose);
  let ux=m[0];
  if(f.flip) ux=100-ux;
  return [f.box[0]+f.box[2]*ux/100, f.box[1]+f.box[3]*m[1]/100];
}

/* portrait: head & shoulders, for badges */
function drawPortrait(x, who, series, w, h){
  x.save();
  x.translate(w/2,h*0.96);
  const s=h/30;
  x.scale(s,s);
  if(who==='sidekick'){
    limb(x,[[0,-4],[0,-11]],[2.6,2.3],'#e3e7dd',{lw:1.2});
    drawHeadC(x,{cx:0,cy:-17.5,r:7,dir:.4,expr:'smile',style:'kid',jaw:'soft',
      capC:comboRGB([['Y',1],['M',.5]]),lw:1.2,shade:false});
  } else {
    const spec=castFor(series).hero;
    const D=spec.design;
    const suitC=(D&&D.suitC)||comboRGB(spec.suit);
    const trimC=(D&&D.trimC)||comboRGB(spec.trim);
    const skinC=(spec.ident&&spec.ident.skin)||SKIN;
    /* shoulders */
    x.fillStyle=suitC;
    x.beginPath(); x.moveTo(-9,0); x.quadraticCurveTo(-8,-8,-4,-9.5);
    x.lineTo(4,-9.5); x.quadraticCurveTo(8,-8,9,0); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.2; x.stroke();
    limb(x,[[0,-8],[0,-13]],[2.5,2.2],D&&(D.neckSkin||D.fem)?skinC:suitC,{lw:1.1});
    const styleMap={sentinel:'cowl',speedster:'speedster',cosmic:'cosmic',
      mystic:'mystic',gadgeteer:'gadget',titan:'mask'};
    drawHeadC(x,{cx:0,cy:-19.5,r:5.6,dir:.4,expr:'resolve',
      style:D?D.head:(styleMap[spec.arch]||'cowl'),
      suitC:(D&&D.helmC)||suitC,trimC,lw:1.1,shade:false,
      ident:spec.ident,skin:skinC,hairC:D&&D.hairC,fem:!!(D&&D.fem),eyeC:D&&D.eyeC});
  }
  x.restore();
}

function shadePat(x,scale){
  const pat=x.createPattern(screenTile('K',.25,2),'repeat');
  if(pat&&pat.setTransform) pat.setTransform(new DOMMatrix().scale(scale||0.5));
  return pat;
}

/* ============ 3. props ============ */
function drawProp(x, kind, cx, cy, s, accent){
  x.save(); x.translate(cx,cy); x.scale(s/40,s/40); x.translate(-20,-20);
  x.strokeStyle=INKC; x.lineJoin='round';
  const acc=accent||'#0e9ad6';
  switch(kind){
    case 'terminal':
      x.fillStyle='#2e2a22'; x.lineWidth=2.4;
      rrp(x,2,4,36,28,3); x.fill(); x.stroke();
      x.fillStyle='#9fe08a'; x.font='700 9px "Courier Prime",monospace';
      x.fillText('>_',7,17);
      x.fillStyle='#6cae5e'; x.fillRect(7,21,18,2); x.fillRect(7,25,11,2);
      x.fillStyle='#d9c8a2'; x.fillRect(14,32,12,4); x.strokeRect(14,32,12,4);
      break;
    case 'browser':
      x.fillStyle='#fbf5e2'; x.lineWidth=2.4;
      rrp(x,2,4,36,28,2.5); x.fill(); x.stroke();
      x.fillStyle=acc; x.fillRect(2,4,36,6); x.strokeRect(2,4,36,6);
      x.fillStyle='#fbf5e2';
      for(let i=0;i<3;i++){ x.beginPath(); x.arc(7+i*5,7,1.5,0,7); x.fill(); }
      x.fillStyle='#c9b98f'; x.fillRect(6,14,28,3); x.fillRect(6,20,20,3); x.fillRect(6,26,24,3);
      break;
    case 'doc':
      x.fillStyle='#fdf8ea'; x.lineWidth=2.2;
      x.beginPath(); x.moveTo(6,2); x.lineTo(28,2); x.lineTo(34,9); x.lineTo(34,38); x.lineTo(6,38);
      x.closePath(); x.fill(); x.stroke();
      x.beginPath(); x.moveTo(28,2); x.lineTo(28,9); x.lineTo(34,9); x.stroke();
      x.strokeStyle='#8d7c52'; x.lineWidth=1.6;
      for(let i=0;i<4;i++){ x.beginPath(); x.moveTo(10,14+i*6); x.lineTo(30,14+i*6); x.stroke(); }
      break;
    case 'gear':
      x.fillStyle='#d9c8a2'; x.lineWidth=2.2;
      x.beginPath();
      for(let i=0;i<20;i++){ const r=i%2?11:16, an=i*Math.PI/10;
        const px=20+Math.cos(an)*r, py=20+Math.sin(an)*r; i?x.lineTo(px,py):x.moveTo(px,py); }
      x.closePath(); x.fill(); x.stroke();
      x.beginPath(); x.arc(20,20,4.4,0,7); x.fillStyle='#2e2a22'; x.fill();
      break;
    case 'db':
      x.fillStyle=acc; x.lineWidth=2.2;
      x.beginPath(); x.ellipse(20,8,14,5,0,0,7); x.fill(); x.stroke();
      x.fillRect(6,8,28,22);
      x.beginPath(); x.ellipse(20,30,14,5,0,0,7); x.fill(); x.stroke();
      x.beginPath(); x.moveTo(6,8); x.lineTo(6,30); x.moveTo(34,8); x.lineTo(34,30); x.stroke();
      x.strokeStyle='rgba(255,255,255,.7)';
      x.beginPath(); x.ellipse(20,16,14,5,0,0,Math.PI); x.stroke();
      break;
    case 'key':
      x.fillStyle='#e9c81f'; x.lineWidth=2.2;
      x.beginPath(); x.arc(12,12,8,0,7); x.fill(); x.stroke();
      x.beginPath(); x.arc(12,12,3.4,0,7); x.fillStyle='#fdf8ea'; x.fill(); x.stroke();
      x.strokeStyle=INKC; x.lineWidth=4.4; x.lineCap='round';
      x.beginPath(); x.moveTo(18,18); x.lineTo(34,34); x.stroke();
      x.beginPath(); x.moveTo(28,34); x.lineTo(33,29); x.moveTo(24,30); x.lineTo(28,26); x.lineWidth=3; x.stroke();
      break;
    case 'rocket':
      x.fillStyle='#e8e2d2'; x.lineWidth=2.2;
      x.beginPath(); x.moveTo(20,2); x.quadraticCurveTo(30,12,28,26); x.lineTo(12,26);
      x.quadraticCurveTo(10,12,20,2); x.closePath(); x.fill(); x.stroke();
      x.fillStyle=acc; x.beginPath(); x.arc(20,14,4,0,7); x.fill(); x.stroke();
      x.beginPath(); x.moveTo(12,26); x.lineTo(6,34); x.lineTo(13,30); x.closePath(); x.fillStyle=acc; x.fill(); x.stroke();
      x.beginPath(); x.moveTo(28,26); x.lineTo(34,34); x.lineTo(27,30); x.closePath(); x.fill(); x.stroke();
      x.fillStyle='#e9c81f';
      x.beginPath(); x.moveTo(16,28); x.quadraticCurveTo(20,40,24,28); x.closePath(); x.fill(); x.stroke();
      break;
    case 'field':
      x.fillStyle='#f8ecc9'; x.lineWidth=2.4;
      rrp(x,4,8,32,20,3); x.fill(); x.stroke();
      x.fillStyle='#8d7c52'; x.font='600 8px Oswald,sans-serif'; x.fillText('ABC',9,21);
      x.strokeStyle='#e9c81f'; x.lineWidth=1.8;
      for(let i=0;i<7;i++){ const an=-Math.PI/2+ i*Math.PI/3.5;
        x.beginPath(); x.moveTo(20+Math.cos(an)*19,18+Math.sin(an)*14);
        x.lineTo(20+Math.cos(an)*25,18+Math.sin(an)*19); x.stroke(); }
      break;
    default:
      x.fillStyle=acc; x.lineWidth=2.2;
      x.beginPath(); x.moveTo(20,6); x.quadraticCurveTo(8,2,3,6); x.lineTo(3,32);
      x.quadraticCurveTo(8,28,20,32); x.quadraticCurveTo(32,28,37,32); x.lineTo(37,6);
      x.quadraticCurveTo(32,2,20,6); x.closePath(); x.fill(); x.stroke();
      x.beginPath(); x.moveTo(20,6); x.lineTo(20,32); x.stroke();
  }
  x.restore();
}
function rrp(x,a,b,w,h,r){ x.beginPath(); x.moveTo(a+r,b); x.arcTo(a+w,b,a+w,b+h,r);
  x.arcTo(a+w,b+h,a,b+h,r); x.arcTo(a,b+h,a,b,r); x.arcTo(a,b,a+w,b,r); x.closePath(); }
function propFor(text){
  const s=String(text||'').toLowerCase();
  if(/terminal|command|\brun\b|npx|npm|yarn|\bcli\b|script/.test(s)) return 'terminal';
  if(/click|select|button|browser|navigate|panel|menu|\btab\b|dashboard/.test(s)) return 'browser';
  if(/deploy|publish|launch|cloud|production/.test(s)) return 'rocket';
  if(/token|key|login|log in|sign|account|credential|password|auth/.test(s)) return 'key';
  if(/database|sql|data\b|entry|entries|record/.test(s)) return 'db';
  if(/config|setting|option|environment|variable/.test(s)) return 'gear';
  if(/field|content-type|attribute|schema|model|component/.test(s)) return 'field';
  if(/file|create|add|new|write|save|edit|upload/.test(s)) return 'doc';
  return 'book';
}

/* ============ 4. the shared scene painter ============
   A scene panel: fixed height, one canvas behind, DOM balloons above.
   panel._sc = { seed, series, ground, figures:[{kind,pose,fx,box,flip}],
                 balloons:[{el, tail:[fx,fy], mode}] }                      */

/* ============ 4a. drawn worlds — backgrounds with conviction ============ */
function drawBackdrop(x,kind,W,H,seed,combo,opts){
  opts=opts||{};
  const rng=mulberry(seed);
  const drift={C:[.8,-.6],M:[-.7,.8],Y:[.4,.3],K:[0,0]};
  const dim=(combo||[['C',.5]]).map(([c,t])=>[c,clamp(t*0.5,0.25,0.5)]);
  const P2=f=>{const p=new Path2D(); f(p); return p;};
  x.save();
  if(opts.tilt){ x.translate(W/2,H/2); x.rotate(opts.tilt); x.scale(1.12,1.12); x.translate(-W/2,-H/2); }
  x.strokeStyle=INKC;
  if(kind==='serverroom'){
    /* one-point perspective aisle of humming cabinets */
    const vpx=W*0.5, vpy=H*0.40;
    fillScreened(x,P2(p=>p.rect(0,0,W,vpy+8)),[[dim[0][0],.25]],drift,2);
    fillScreened(x,P2(p=>p.rect(0,vpy,W,H-vpy)),dim,drift,2);
    /* floor tiles to the vanishing point */
    x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1.1;
    for(let i=-4;i<=4;i++){ x.beginPath(); x.moveTo(vpx,vpy); x.lineTo(vpx+i*W*0.2,H+8); x.stroke(); }
    for(let i=0;i<4;i++){ const yy=vpy+(H-vpy)*Math.pow((i+1)/4,1.6);
      x.beginPath(); x.moveTo(0,yy); x.lineTo(W,yy); x.stroke(); }
    /* cabinets left & right, shrinking away */
    for(const side of [-1,1]){
      for(let i=3;i>=0;i--){
        const t=i/3.2;
        const cw=W*(0.16-0.035*i), ch=H*(0.62-0.13*i);
        const cx0=vpx+side*(W*0.135+W*0.115*(3-i))-cw/2;
        const cy0=vpy+(H-vpy)*0.86-ch- i*3;
        x.fillStyle=i%2?'#4a4436':'#3a352b';
        x.fillRect(cx0,cy0,cw,ch);
        x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(cx0,cy0,cw,ch);
        /* blinking rows */
        for(let r=0;r<Math.floor(ch/16);r++) for(let c2=0;c2<3;c2++){
          if(rng()<0.55) continue;
          x.fillStyle=rng()<0.5?'#e9c81f':'#5fae57';
          x.fillRect(cx0+4+c2*(cw/3.4), cy0+7+r*16, 2.6,2.6);
        }
        /* tape reels on the tallest */
        if(i===0){ for(const ry of [cy0+ch*0.2]){
          for(const rx of [cx0+cw*0.3,cx0+cw*0.7]){
            x.beginPath(); x.arc(rx,ry,cw*0.14,0,7); x.fillStyle='#d9c8a2'; x.fill();
            x.strokeStyle=INKC; x.lineWidth=1.4; x.stroke();
            x.beginPath(); x.arc(rx,ry,cw*0.05,0,7); x.fillStyle=INKC; x.fill();
          }}}
      }
    }
    /* cable trays overhead */
    x.strokeStyle=INKC; x.lineWidth=2;
    x.beginPath(); x.moveTo(0,14); x.quadraticCurveTo(W*0.5,26,W,12); x.stroke();
    x.beginPath(); x.moveTo(0,20); x.quadraticCurveTo(W*0.5,32,W,18); x.stroke();
  }
  else if(kind==='consolehall'){
    /* the great period machine room — built from a different INVENTORY per
       issue: reel banks, oscilloscopes, patch bays, card readers, plotters,
       pneumatic tubes; two bays, no two rooms furnished alike */
    fillScreened(x,P2(p=>p.rect(0,0,W,H*0.72)),[[dim[0][0],.25]],drift,2);
    /* ceiling conduit differs per room */
    x.strokeStyle=INKC; x.lineWidth=1.8;
    const cdy=6+rng()*10;
    x.beginPath(); x.moveTo(0,cdy); x.quadraticCurveTo(W*0.5,cdy+10,W,cdy-3); x.stroke();
    if(rng()<0.5){ x.beginPath(); x.moveTo(W*0.3,cdy+3); x.lineTo(W*0.3,H*0.08); x.stroke(); }
    /* two wall bays of unequal height */
    const splitX=W*(0.34+rng()*0.22);
    const bays=[[W*0.05,splitX-W*0.02,H*(0.06+rng()*0.05),H*(0.52+rng()*0.08)],
                [splitX+W*0.02,W*0.95,H*(0.08+rng()*0.06),H*(0.50+rng()*0.10)]];
    const MODS=['reels','scopes','patch','cards','plotter','lamps'];
    /* deal two DIFFERENT wall modules, then a lamp course somewhere */
    const m1=MODS[Math.floor(rng()*5)];
    let m2=MODS[Math.floor(rng()*5)]; if(m2===m1) m2=MODS[(MODS.indexOf(m1)+1+Math.floor(rng()*3))%5];
    const mods=[m1,m2];
    bays.forEach(([bx0,bx1,by0,by1],bi)=>{
      x.fillStyle=bi?'#44403a':'#3c3830';
      x.fillRect(bx0,by0,bx1-bx0,by1-by0);
      x.strokeStyle=INKC; x.lineWidth=2.4; x.strokeRect(bx0,by0,bx1-bx0,by1-by0);
      const bw=bx1-bx0, bh=by1-by0, mod=mods[bi];
      if(mod==='reels'){
        const nr=2+Math.floor(rng()*3);
        for(let i=0;i<nr;i++){
          const px=bx0+bw*(0.16+i*0.68/Math.max(1,nr-1)), py=by0+bh*0.22, rr2=Math.min(bw*0.11,14);
          x.beginPath(); x.arc(px,py,rr2,0,7); x.fillStyle='#d9c8a2'; x.fill();
          x.strokeStyle=INKC; x.lineWidth=1.6; x.stroke();
          x.beginPath(); x.arc(px,py,rr2*0.34,0,7); x.fillStyle=INKC; x.fill();
          /* wound tape mass + run to the head below */
          x.strokeStyle='rgba(35,28,18,.8)'; x.lineWidth=1;
          x.beginPath(); x.arc(px,py,rr2*0.72,0.4,2.6); x.stroke();
          x.beginPath(); x.moveTo(px-rr2*0.5,py+rr2+2); x.lineTo(px+rr2*0.5,py+rr2+8); x.stroke();
        }
      } else if(mod==='scopes'){
        for(const px of [bx0+bw*0.28,bx0+bw*0.72]){
          const py=by0+bh*0.26, rr2=Math.min(bw*0.16,16);
          x.beginPath(); x.arc(px,py,rr2,0,7); x.fillStyle='#1d2b1e'; x.fill();
          x.strokeStyle=INKC; x.lineWidth=1.8; x.stroke();
          x.strokeStyle='#9fe08a'; x.lineWidth=1.3;
          x.beginPath();
          for(let t=0;t<=12;t++){ const xx=px-rr2*0.72+t*rr2*0.12;
            const yy=py+Math.sin(t*1.1+rng()*2)*rr2*0.4;
            t?x.lineTo(xx,yy):x.moveTo(xx,yy); }
          x.stroke();
        }
      } else if(mod==='patch'){
        for(let r=0;r<3;r++) for(let c2=0;c2<6;c2++){
          const px=bx0+bw*0.14+c2*bw*0.14, py=by0+bh*0.14+r*bh*0.14;
          x.beginPath(); x.arc(px,py,2.6,0,7);
          x.fillStyle='#231c12'; x.fill();
          x.strokeStyle='#d9c8a2'; x.lineWidth=1; x.stroke();
        }
        /* two hanging patch cords */
        x.strokeStyle=INKC; x.lineWidth=1.6;
        for(let i=0;i<2;i++){
          const a2=[bx0+bw*(0.14+Math.floor(rng()*6)*0.14),by0+bh*0.14];
          const b2=[bx0+bw*(0.14+Math.floor(rng()*6)*0.14),by0+bh*0.42];
          x.beginPath(); x.moveTo(a2[0],a2[1]);
          x.quadraticCurveTo((a2[0]+b2[0])/2,Math.max(a2[1],b2[1])+bh*0.3,b2[0],b2[1]); x.stroke();
        }
      } else if(mod==='cards'){
        /* punch-card reader: slot, card stack, one card mid-flight */
        x.fillStyle='#6b6355';
        x.fillRect(bx0+bw*0.18,by0+bh*0.16,bw*0.64,bh*0.20);
        x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(bx0+bw*0.18,by0+bh*0.16,bw*0.64,bh*0.20);
        x.fillStyle=INKC; x.fillRect(bx0+bw*0.24,by0+bh*0.23,bw*0.52,3);
        x.fillStyle='#fdf8ea';
        for(let i=0;i<4;i++){
          x.save(); x.translate(bx0+bw*0.5,by0+bh*0.46+i*4); x.rotate((rng()-0.5)*0.1);
          x.fillRect(-bw*0.2,-4,bw*0.4,7); x.strokeStyle=INKC; x.lineWidth=0.8; x.strokeRect(-bw*0.2,-4,bw*0.4,7);
          x.restore();
        }
      } else if(mod==='plotter'){
        /* drum plotter drawing a curve */
        x.fillStyle='#d9c8a2';
        x.fillRect(bx0+bw*0.16,by0+bh*0.14,bw*0.68,bh*0.30);
        x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(bx0+bw*0.16,by0+bh*0.14,bw*0.68,bh*0.30);
        x.strokeStyle='#8a3b2a'; x.lineWidth=1.3;
        x.beginPath();
        for(let t=0;t<=14;t++){ const xx=bx0+bw*(0.20+t*0.043);
          const yy=by0+bh*(0.30-Math.sin(t*0.7)*0.09);
          t?x.lineTo(xx,yy):x.moveTo(xx,yy); }
        x.stroke();
        x.fillStyle=INKC; x.fillRect(bx0+bw*0.16+bw*0.68*0.6,by0+bh*0.10,3,bh*0.08);
      }
      /* every bay carries a small toggle course low */
      for(let i=0;i<Math.floor(bw/14);i++){
        x.fillStyle=rng()<0.5?'#e9c81f':'#8a3b2a';
        x.fillRect(bx0+6+i*14,by1-bh*0.16,5,5);
        x.strokeStyle=INKC; x.lineWidth=0.8; x.strokeRect(bx0+6+i*14,by1-bh*0.16,5,5);
      }
    });
    /* pneumatic tube on one flank, half the rooms */
    if(rng()<0.5){
      const tx0=rng()<0.5?W*0.03:W*0.965;
      x.strokeStyle=INKC; x.lineWidth=3.4;
      x.beginPath(); x.moveTo(tx0,H*0.04); x.lineTo(tx0,H*0.66); x.stroke();
      x.fillStyle='#d9c8a2';
      x.beginPath(); x.ellipse(tx0,H*(0.2+rng()*0.3),4.4,8,0,0,7); x.fill();
      x.strokeStyle=INKC; x.lineWidth=1.4; x.stroke();
    } else {
      /* or the shop clock, punched in over the seam */
      const cx4=splitX, cy4=H*0.10;
      x.beginPath(); x.arc(cx4,cy4,9,0,7); x.fillStyle='#fdf8ea'; x.fill();
      x.strokeStyle=INKC; x.lineWidth=1.6; x.stroke();
      const ha=rng()*Math.PI*2;
      x.beginPath(); x.moveTo(cx4,cy4); x.lineTo(cx4+Math.cos(ha)*5.4,cy4+Math.sin(ha)*5.4); x.stroke();
      x.beginPath(); x.moveTo(cx4,cy4); x.lineTo(cx4+Math.cos(ha*3)*3.4,cy4+Math.sin(ha*3)*3.4); x.stroke();
    }
    /* the operator desk: three period shapes */
    const dsk=Math.floor(rng()*3);
    x.fillStyle='#6b6355';
    if(dsk===0){
      x.beginPath(); x.moveTo(0,H*0.72); x.lineTo(W,H*0.72); x.lineTo(W*0.94,H); x.lineTo(W*0.06,H);
      x.closePath(); x.fill(); x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
    } else if(dsk===1){
      /* L-desk holding the left, teletype on it */
      x.beginPath(); x.moveTo(0,H*0.70); x.lineTo(W*0.62,H*0.70); x.lineTo(W*0.70,H); x.lineTo(0,H);
      x.closePath(); x.fill(); x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
      x.fillStyle='#44403a'; x.fillRect(W*0.10,H*0.585,W*0.20,H*0.115);
      x.strokeRect(W*0.10,H*0.585,W*0.20,H*0.115);
      x.fillStyle='#fdf8ea';
      x.beginPath(); x.moveTo(W*0.14,H*0.585); x.lineTo(W*0.26,H*0.585);
      x.lineTo(W*0.28,H*0.51); x.lineTo(W*0.16,H*0.51); x.closePath(); x.fill();
      x.strokeStyle=INKC; x.lineWidth=1.2; x.stroke();
    } else {
      /* twin pedestals with a gangway between */
      for(const [px0,px1] of [[0,W*0.40],[W*0.60,W]]){
        x.fillStyle='#6b6355';
        x.beginPath(); x.moveTo(px0,H*0.74); x.lineTo(px1,H*0.74);
        x.lineTo(px1===W?W:px1-W*0.03,H); x.lineTo(px0===0?0:px0+W*0.03,H);
        x.closePath(); x.fill(); x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
      }
    }
    /* desk fittings: knob count, handwheel, phone — dealt per room */
    const nk=4+Math.floor(rng()*4);
    for(let i=0;i<nk;i++){
      const kx=W*(0.12+i*0.76/Math.max(1,nk-1)), ky=H*0.85;
      if(dsk===2&&kx>W*0.42&&kx<W*0.58) continue;
      x.beginPath(); x.arc(kx,ky,6+rng()*3,0,7);
      x.fillStyle='#d9c8a2'; x.fill(); x.strokeStyle=INKC; x.lineWidth=1.4; x.stroke();
      const an=rng()*Math.PI-Math.PI/2;
      x.beginPath(); x.moveTo(kx,ky); x.lineTo(kx+Math.cos(an)*6,ky+Math.sin(an)*6); x.stroke();
    }
    if(rng()<0.45){ /* a handwheel */
      const hx=W*(0.2+rng()*0.6), hy=H*0.80;
      x.beginPath(); x.arc(hx,hy,9,0,7); x.strokeStyle=INKC; x.lineWidth=2.4; x.stroke();
      x.beginPath(); x.moveTo(hx-9,hy); x.lineTo(hx+9,hy); x.moveTo(hx,hy-9); x.lineTo(hx,hy+9); x.lineWidth=1.4; x.stroke();
    }
  }
  else if(kind==='office'){
    /* the bullpen at deadline: window, blinds, desk, rotary phone */
    fillScreened(x,P2(p=>p.rect(0,0,W,H)),[[dim[0][0],.25]],drift,2);
    /* window with skyline */
    const wx=W*0.58,wy=H*0.08,ww=W*0.34,wh=H*0.5;
    x.fillStyle='#2c2a3c'; x.fillRect(wx,wy,ww,wh);
    x.strokeStyle=INKC; x.lineWidth=2.4; x.strokeRect(wx,wy,ww,wh);
    x.fillStyle=INKC;
    let bx0=wx+4;
    while(bx0<wx+ww-10){ const bw2=8+rng()*16, bh2=wh*(0.2+rng()*0.5);
      x.fillRect(bx0,wy+wh-bh2,bw2,bh2);
      x.fillStyle='#e9c81f';
      for(let wyy=wy+wh-bh2+3; wyy<wy+wh-4; wyy+=6)
        for(let wxx=bx0+2; wxx<bx0+bw2-2; wxx+=5) if(rng()<0.5) x.fillRect(wxx,wyy,2,3);
      x.fillStyle=INKC;
      bx0+=bw2+5;
    }
    x.strokeStyle=INKC; x.lineWidth=1.4;
    x.beginPath(); x.moveTo(wx+ww/2,wy); x.lineTo(wx+ww/2,wy+wh); x.stroke();
    /* blinds half-drawn */
    x.fillStyle='#d9c8a2'; x.fillRect(wx-2,wy-2,ww+4,wh*0.3);
    x.strokeStyle=INKC; x.lineWidth=1.2;
    for(let i=0;i<4;i++){ x.beginPath(); x.moveTo(wx-2,wy+i*wh*0.075); x.lineTo(wx+ww+2,wy+i*wh*0.075); x.stroke(); }
    x.strokeRect(wx-2,wy-2,ww+4,wh*0.3);
    /* the desk */
    x.fillStyle='#7a5a34';
    x.fillRect(W*0.04,H*0.64,W*0.44,H*0.09);
    x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(W*0.04,H*0.64,W*0.44,H*0.09);
    x.beginPath(); x.moveTo(W*0.07,H*0.73); x.lineTo(W*0.07,H*0.95); x.moveTo(W*0.44,H*0.73); x.lineTo(W*0.44,H*0.95); x.lineWidth=3; x.stroke();
    /* rotary phone */
    x.fillStyle=INKC;
    x.beginPath(); x.ellipse(W*0.13,H*0.60,13,8,0,0,7); x.fill();
    x.beginPath(); x.ellipse(W*0.13,H*0.545,10,4,0,0,7); x.fill();
    x.fillStyle='#f2e7c9'; x.beginPath(); x.arc(W*0.13,H*0.615,4.4,0,7); x.fill();
    /* stacked copy */
    x.fillStyle='#fdf8ea'; x.strokeStyle=INKC; x.lineWidth=1.2;
    for(let i=0;i<3;i++){ x.save(); x.translate(W*0.31,H*0.60-i*4); x.rotate((rng()-0.5)*0.15);
      x.fillRect(-16,-5,32,8); x.strokeRect(-16,-5,32,8); x.restore(); }
    /* cork board */
    x.fillStyle='#c9a86b'; x.fillRect(W*0.06,H*0.12,W*0.34,H*0.3);
    x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(W*0.06,H*0.12,W*0.34,H*0.3);
    for(let i=0;i<4;i++){
      x.fillStyle='#fdf8ea';
      x.save(); x.translate(W*(0.1+i*0.075),H*(0.17+(i%2)*0.1)); x.rotate((rng()-0.5)*0.2);
      x.fillRect(0,0,W*0.055,H*0.11); x.strokeStyle=INKC; x.lineWidth=1; x.strokeRect(0,0,W*0.055,H*0.11);
      x.restore();
    }
  }
  else if(kind==='skyline'){
    /* rooftops of Docs City — water towers and neon */
    fillScreened(x,P2(p=>p.rect(0,0,W,H)),[[dim[0][0],.25],['M',.25]],drift,2);
    /* far row */
    x.fillStyle='#8d8266';
    let fx0=-6;
    while(fx0<W){ const bw2=24+rng()*40, bh2=H*(0.3+rng()*0.3);
      x.fillRect(fx0,H*0.78-bh2,bw2,bh2); fx0+=bw2+3; }
    /* near row, inked */
    fx0=-10;
    while(fx0<W){
      const bw2=34+rng()*52, bh2=H*(0.34+rng()*0.42);
      const p=P2(pp=>pp.rect(fx0,H*0.92-bh2,bw2,bh2));
      fillScreened(x,p,rng()<0.5?[['C',.25]]:[['M',.25],['K',.25]],drift,2);
      x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke(p);
      x.fillStyle='#e9c81f';
      for(let wy2=H*0.92-bh2+5; wy2<H*0.88; wy2+=9)
        for(let wx2=fx0+4; wx2<fx0+bw2-4; wx2+=8) if(rng()<0.4) x.fillRect(wx2,wy2,3,4);
      /* water tower on one roof */
      if(rng()<0.4){
        const tx0=fx0+bw2*0.5, ty0=H*0.92-bh2;
        x.fillStyle='#6b4f2a';
        x.fillRect(tx0-8,ty0-18,16,13);
        x.beginPath(); x.moveTo(tx0-10,ty0-18); x.lineTo(tx0,ty0-26); x.lineTo(tx0+10,ty0-18);
        x.closePath(); x.fill();
        x.strokeStyle=INKC; x.lineWidth=1.4; x.strokeRect(tx0-8,ty0-18,16,13);
        x.beginPath(); x.moveTo(tx0-6,ty0-5); x.lineTo(tx0-6,ty0); x.moveTo(tx0+6,ty0-5); x.lineTo(tx0+6,ty0); x.stroke();
      }
      fx0+=bw2+6;
    }
    x.fillStyle=INKC; x.fillRect(0,H*0.92,W,3);
    /* the searchlight */
    const beam=P2(p=>{p.moveTo(W*0.82,H*0.92); p.lineTo(W*0.62,0); p.lineTo(W*0.74,0); p.closePath();});
    fillScreened(x,beam,[['Y',.25]],drift,2);
  }
  else if(kind==='street'){
    /* the DOCS CODE PUBLICATIONS building, seen from the sidewalk */
    fillScreened(x,P2(p=>p.rect(0,0,W,H)),[[dim[0][0],.25]],drift,2);
    /* facade */
    const bx1=W*0.16,bw1=W*0.55;
    const p=P2(pp=>pp.rect(bx1,H*0.06,bw1,H*0.78));
    fillScreened(x,p,[['Y',.25],['M',.25]],drift,2);
    x.strokeStyle=INKC; x.lineWidth=2.6; x.stroke(p);
    /* window grid */
    for(let r=0;r<3;r++) for(let c2=0;c2<4;c2++){
      const wx2=bx1+bw1*0.1+c2*bw1*0.22, wy2=H*0.12+r*H*0.17;
      x.fillStyle=rng()<0.6?'#2c2a3c':'#e9c81f';
      x.fillRect(wx2,wy2,bw1*0.15,H*0.11);
      x.strokeStyle=INKC; x.lineWidth=1.3; x.strokeRect(wx2,wy2,bw1*0.15,H*0.11);
    }
    /* entrance + awning */
    x.fillStyle='#3a352b'; x.fillRect(bx1+bw1*0.32,H*0.62,bw1*0.36,H*0.22);
    x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(bx1+bw1*0.32,H*0.62,bw1*0.36,H*0.22);
    x.fillStyle='#c22a1c';
    x.beginPath(); x.moveTo(bx1+bw1*0.26,H*0.62); x.lineTo(bx1+bw1*0.74,H*0.62);
    x.lineTo(bx1+bw1*0.70,H*0.54); x.lineTo(bx1+bw1*0.30,H*0.54); x.closePath(); x.fill(); x.stroke();
    /* the shingle */
    x.fillStyle='#fdf8ea'; x.fillRect(bx1+bw1*0.2,H*0.30,bw1*0.6,H*0.13);
    x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(bx1+bw1*0.2,H*0.30,bw1*0.6,H*0.13);
    x.fillStyle=INKC; x.font='700 '+Math.round(H*0.075)+'px Oswald,sans-serif'; x.textAlign='center';
    x.fillText('DOCS CODE PUBL.',bx1+bw1*0.5,H*0.39); x.textAlign='left';
    /* neighbor building + lamppost + hydrant */
    const p2=P2(pp=>pp.rect(W*0.76,H*0.2,W*0.2,H*0.64));
    fillScreened(x,p2,[['C',.5],['K',.25]],drift,2);
    x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke(p2);
    for(let r=0;r<3;r++){ x.fillStyle='#e9c81f'; x.fillRect(W*0.79,H*(0.25+r*0.16),W*0.05,H*0.08);
      x.strokeStyle=INKC; x.lineWidth=1.2; x.strokeRect(W*0.79,H*(0.25+r*0.16),W*0.05,H*0.08);
      x.fillStyle='#2c2a3c'; x.fillRect(W*0.87,H*(0.25+r*0.16),W*0.05,H*0.08);
      x.strokeRect(W*0.87,H*(0.25+r*0.16),W*0.05,H*0.08); }
    x.strokeStyle=INKC; x.lineWidth=3;
    x.beginPath(); x.moveTo(W*0.08,H*0.84); x.lineTo(W*0.08,H*0.3); x.stroke();
    x.fillStyle='#e9c81f'; x.beginPath(); x.ellipse(W*0.08,H*0.27,6,8,0,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.6; x.stroke();
    /* sidewalk */
    x.fillStyle=INKC; x.fillRect(0,H*0.84,W,2.4);
    x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1;
    for(let i=0;i<6;i++){ x.beginPath(); x.moveTo(W*i/6,H*0.86); x.lineTo(W*(i/6+0.03),H); x.stroke(); }
    x.fillStyle='#c22a1c';
    x.fillRect(W*0.88,H*0.76,9,10);
    x.strokeStyle=INKC; x.lineWidth=1.4; x.strokeRect(W*0.88,H*0.76,9,10);
  }
  else if(kind==='rain'){
    /* the storm in DEPTH: sky, far skyline, a NEAR tenement wall with lit
       windows and a fire escape, then the parapet we stand behind — the
       figures never float on tone again */
    fillScreened(x,P2(p=>p.rect(0,0,W,H)),[['C',.25]],drift,2);
    x.fillStyle='rgba(28,30,52,.22)'; x.fillRect(0,0,W,H*0.5);
    /* far skyline, pale in the rain-haze */
    x.fillStyle='rgba(35,28,18,.42)';
    let fx1=-4;
    while(fx1<W){ const bw2=22+rng()*30, bh2=H*(0.16+rng()*0.16);
      x.fillRect(fx1,H*0.62-bh2,bw2,bh2);
      if(rng()<0.3) x.fillRect(fx1+bw2*0.3,H*0.62-bh2-7,6,7);
      fx1+=bw2+4; }
    /* MID PLANE: the tenement across the alley — drawn, not silhouetted */
    const tnx=rng()<0.5?W*0.02:W*0.40, tnw=W*0.58;
    const p3=P2(p=>p.rect(tnx,H*0.18,tnw,H*0.64));
    fillScreened(x,p3,[['C',.5],['K',.25]],drift,2);
    x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke(p3);
    /* cornice */
    x.fillStyle='#231c12'; x.fillRect(tnx-4,H*0.165,tnw+8,H*0.03);
    for(let r=0;r<3;r++) for(let c2=0;c2<4;c2++){
      const wx2=tnx+tnw*0.10+c2*tnw*0.23, wy2=H*(0.24+r*0.19), ww2=tnw*0.14, wh2=H*0.12;
      x.fillStyle=rng()<0.4?'#e9c81f':'#242640';
      x.fillRect(wx2,wy2,ww2,wh2);
      x.strokeStyle=INKC; x.lineWidth=1.4; x.strokeRect(wx2,wy2,ww2,wh2);
      x.beginPath(); x.moveTo(wx2,wy2+wh2/2); x.lineTo(wx2+ww2,wy2+wh2/2); x.lineWidth=1; x.stroke();
      /* one lit window holds a watcher */
      if(r===1&&c2===2&&rng()<0.7){ x.fillStyle=INKC;
        x.beginPath(); x.arc(wx2+ww2*0.5,wy2+wh2*0.55,2.6,0,7); x.fill();
        x.fillRect(wx2+ww2*0.5-3.4,wy2+wh2*0.55+2,6.8,wh2*0.4); }
    }
    /* fire escape zig-zag down the flank */
    const fex=tnx+tnw*(rng()<0.5?0.10:0.82);
    x.strokeStyle=INKC; x.lineWidth=1.6;
    for(let r=0;r<3;r++){
      const fy=H*(0.30+r*0.17);
      x.strokeRect(fex-10,fy,20,3);
      x.beginPath(); x.moveTo(fex-9,fy+3); x.lineTo(fex+9,fy+H*0.14); x.stroke();
      for(let bb=0;bb<4;bb++){ x.beginPath(); x.moveTo(fex-10+bb*6.6,fy); x.lineTo(fex-10+bb*6.6,fy-6); x.stroke(); }
    }
    /* drainpipe spilling at the corner */
    x.strokeStyle=INKC; x.lineWidth=2.6;
    x.beginPath(); x.moveTo(tnx+2,H*0.20); x.lineTo(tnx+2,H*0.80); x.stroke();
    x.strokeStyle='rgba(242,231,201,.8)'; x.lineWidth=1.2;
    x.beginPath(); x.moveTo(tnx+2,H*0.80); x.quadraticCurveTo(tnx+6,H*0.84,tnx+12,H*0.86); x.stroke();
    /* rooftop silhouettes of OUR building, nearer, deeper black */
    x.fillStyle=INKC;
    x.beginPath(); x.moveTo(0,H);
    let rx0=0, ry0=H*0.8;
    x.lineTo(0,ry0);
    while(rx0<W){ const bw2=30+rng()*46; ry0=H*(0.70+rng()*0.20);
      x.lineTo(rx0,ry0); x.lineTo(rx0+bw2,ry0);
      if(rng()<0.3){ x.lineTo(rx0+bw2,ry0-10); x.lineTo(rx0+bw2+6,ry0-10); x.lineTo(rx0+bw2+6,ry0); }
      rx0+=bw2+6; }
    x.lineTo(W,H); x.closePath(); x.fill();
    /* chimney pots + a wire with drops, drawn against the sky */
    x.strokeStyle=INKC; x.lineWidth=1.4;
    x.beginPath(); x.moveTo(0,H*0.30); x.quadraticCurveTo(W*0.4,H*0.36,W,H*0.26); x.stroke();
    for(let i=0;i<5;i++){ const wx3=W*(0.12+i*0.18);
      x.beginPath(); x.moveTo(wx3,H*0.33); x.lineTo(wx3,H*0.35); x.stroke(); }
    /* the rain: two families of strict parallels */
    x.strokeStyle='rgba(242,231,201,.85)'; x.lineCap='round';
    for(const [ang,step,lwr,len] of [[1.28,13,1.3,26],[1.24,29,0.8,17]]){
      const dx0=Math.cos(ang), dy0=Math.sin(ang);
      x.lineWidth=lwr;
      for(let i=-6;i<W/step+6;i++){
        const sx0=i*step+rng()*4, sy0=-10+rng()*H*0.9;
        x.beginPath(); x.moveTo(sx0,sy0); x.lineTo(sx0+dx0*len,sy0+dy0*len); x.stroke();
      }
    }
    /* splash ticks where the rain strikes our parapet */
    x.strokeStyle='rgba(242,231,201,.7)'; x.lineWidth=1;
    for(let i=0;i<10;i++){ const px=W*rng(), py=H*(0.82+rng()*0.12);
      x.beginPath(); x.moveTo(px-2.4,py); x.quadraticCurveTo(px,py-4,px+2.4,py); x.stroke(); }
    /* a crack of lightning */
    x.strokeStyle='#e9c81f'; x.lineWidth=2.6;
    x.beginPath(); x.moveTo(W*0.72,0); x.lineTo(W*0.66,H*0.22); x.lineTo(W*0.72,H*0.24);
    x.lineTo(W*0.64,H*0.46); x.stroke();
  }
  x.restore();
}

function sparkleC(x,cx,cy,r){
  x.beginPath();
  x.moveTo(cx,cy-r); x.quadraticCurveTo(cx,cy,cx+r,cy); x.quadraticCurveTo(cx,cy,cx,cy+r);
  x.quadraticCurveTo(cx,cy,cx-r,cy); x.quadraticCurveTo(cx,cy,cx,cy-r); x.fill();
}
function estBalloonH(text, widthPx){
  const cpl=Math.max(12,(widthPx-24)/6.6);
  const lines=Math.ceil(text.length/cpl);
  return lines*18.4+22;
}
function paintScene(panel){
  const sc=panel._sc; if(!sc) return;
  /* THE ART SLOT: when the owner's plate art has taken this node, the
     code-drawn plate stands down entirely — pixels sacred, no repaint */
  if(panel.classList&&panel.classList.contains('plate-owner-art')) return;
  const W=panel.clientWidth, H=panel.clientHeight;
  if(!W||!H) return;
  let c=panel.querySelector(':scope > canvas.sc-c');
  if(!c){ c=document.createElement('canvas'); c.className='sc-c'; panel.prepend(c); }
  c.width=Math.round(W*DPR); c.height=Math.round(H*DPR);
  c.style.width=W+'px'; c.style.height=H+'px';
  const x=c.getContext('2d'); x.setTransform(DPR,0,0,DPR,0,0);
  const rng=mulberry(sc.seed||1);
  const drift={C:[(rng()*2-1)*1.1,(rng()*2-1)*1.1],M:[(rng()*2-1)*1.1,(rng()*2-1)*1.1],Y:[.4,-.3],K:[0,0]};
  const combo=sc.series?sc.series.combo:[['C',.5]];
  const dim=combo.map(([ch,t])=>[ch,clamp(t*0.5,0.25,0.5)]);
  if(sc.bg){
    drawBackdrop(x,sc.bg,W,H,sc.seed,combo,{tilt:sc.tilt||0});
  }
  /* ground / ambience — five moods so no two scenes stamp alike */
  const mood=(sc.bg||sc.motif||sc.plate)?-1:(sc.ground!=null?sc.ground:(sc.seed%5));
  const P2=f=>{const p=new Path2D(); f(p); return p;};
  if(mood===0){ /* radial wedges from a corner */
    const cx0=rng()<0.5?0:W;
    for(let i=0;i<10;i++){ if(i%2)continue;
      const a0=(cx0?Math.PI*0.5:0)+Math.PI*0.5*i/10, a1=(cx0?Math.PI*0.5:0)+Math.PI*0.5*(i+1)/10;
      fillScreened(x,P2(p=>{p.moveTo(cx0,0);p.lineTo(cx0+Math.cos(a0)*W*1.6,Math.sin(a0)*W*1.6);
        p.lineTo(cx0+Math.cos(a1)*W*1.6,Math.sin(a1)*W*1.6);p.closePath();}),dim,drift,2);
    }
  } else if(mood===1){ /* horizon band + speed rules */
    fillScreened(x,P2(p=>p.rect(0,H*0.55,W,H*0.45)),dim,drift,2);
    x.strokeStyle='rgba(35,28,18,.55)'; x.lineWidth=1.1;
    for(let i=0;i<6;i++){ const yy=H*0.14+i*H*0.1+rng()*5;
      x.beginPath(); x.moveTo(rng()*W*0.2,yy); x.lineTo(W*(0.6+rng()*0.38),yy+3); x.stroke(); }
  } else if(mood===2){ /* Kirby dot field corner */
    fillScreened(x,P2(p=>p.rect(0,0,W,H)),[[combo[0][0],.09]],drift,2);
    x.fillStyle=INKC;
    for(let i=0;i<16;i++){ const a=rng()*Math.PI*2, r=rng()*H*0.44;
      x.beginPath(); x.arc(W*0.82+Math.cos(a)*r,H*0.24+Math.sin(a)*r*0.7,2+rng()*5,0,7); x.fill(); }
  } else if(mood===3){ /* quiet romance arcs */
    for(let i=0;i<4;i++){
      x.strokeStyle=i%2?'rgba(35,28,18,.5)':comboRGB(dim); x.lineWidth=2.2;
      x.beginPath(); x.arc(W*0.5,H*1.5,H*(0.8+i*0.16),Math.PI*1.2,Math.PI*1.8); x.stroke();
    }
  } else if(mood>=0){ /* checks strip at foot */
    const s2=12;
    for(let i=0;i<Math.ceil(W/s2);i++) for(let j=0;j<2;j++){
      if((i+j)%2===0) fillScreened(x,P2(p=>p.rect(i*s2,H-24+j*s2,s2+0.4,s2+0.4)),dim,drift,2);
    }
  }
  /* stage line */
  if(!sc.plate){
    x.strokeStyle='rgba(35,28,18,.30)'; x.lineWidth=1;
    x.beginPath(); x.moveTo(8,H-10); x.lineTo(W-8,H-10); x.stroke();
  }
  /* the full-page myth painting: layered planes before the figure walks on */
  if(sc.plate) drawPlate(x,sc,W,H);
  /* the diagonal master-motif — the terminal as Detective-378's newspaper,
     blown across the whole page, behind the figure */
  if(sc.motif){
    const rngM=mulberry(sc.seed^31);
    /* storm tone + radiating ink wedges from the upper-left corner */
    fillScreened(x,P2(p=>p.rect(0,0,W,H)),[[combo[0][0],.25]],null,2);
    x.fillStyle='rgba(35,28,18,.08)';
    for(let i=0;i<7;i+=2){ const a0=0.12+i*0.13, a1=a0+0.10;
      x.beginPath(); x.moveTo(0,0); x.lineTo(Math.cos(a0)*W*2,Math.sin(a0)*W*2);
      x.lineTo(Math.cos(a1)*W*2,Math.sin(a1)*W*2); x.closePath(); x.fill(); }
    /* the code rain: two families of disciplined parallels */
    x.lineCap='round';
    for(const fam of [[1.32,14,1.25,30,'rgba(35,28,18,.40)'],[1.27,31,0.8,19,'rgba(35,28,18,.30)']]){
      const dx0=Math.cos(fam[0]), dy0=Math.sin(fam[0]);
      x.strokeStyle=fam[4]; x.lineWidth=fam[2];
      for(let i=-4;i<W/fam[1]+6;i++){
        const sx0=i*fam[1]+((sc.seed>>>(i&13))&5), sy0=((i*53)%Math.max(1,H))-14;
        x.beginPath(); x.moveTo(sx0,sy0); x.lineTo(sx0+dx0*fam[3],sy0+dy0*fam[3]); x.stroke();
      }
    }
    x.font='700 10px "Courier Prime",monospace'; x.fillStyle='rgba(35,28,18,.5)';
    const GLY='{};<>/=()$#';
    for(let i=0;i<26;i++) x.fillText(GLY[(sc.seed+i)%GLY.length],(i*47)%W,((i*83)+18)%Math.max(24,H-8));
    /* the terminal itself, huge, tilted, corners running off the page */
    x.save();
    x.translate(W*0.38,H*0.56); x.rotate(-0.21);
    const tw=W*1.04, th=H*0.72, tb=20;
    x.fillStyle='rgba(35,28,18,.92)'; x.fillRect(-tw/2+9,-th/2+11,tw,th);
    x.fillStyle='#2e2a22'; x.fillRect(-tw/2,-th/2,tw,th);
    x.strokeStyle=INKC; x.lineWidth=3.4; x.strokeRect(-tw/2,-th/2,tw,th);
    x.fillStyle='#d9c8a2'; x.fillRect(-tw/2,-th/2,tw,tb);
    x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(-tw/2,-th/2,tw,tb);
    for(let i=0;i<3;i++){ x.beginPath(); x.arc(-tw/2+13+i*15,-th/2+tb/2,4.4,0,7);
      x.fillStyle=['#c22a1c','#e9c81f','#5fae57'][i]; x.fill();
      x.strokeStyle=INKC; x.lineWidth=1.2; x.stroke(); }
    x.fillStyle=INKC; x.font='700 11px Oswald,sans-serif'; x.textAlign='left';
    x.fillText('DOCS CITY TERMINAL — LATE EDITION', -tw/2+56, -th/2+14.5);
    /* corner screws */
    for(const scw of [[-tw/2+8,-th/2+tb+9],[tw/2-9,-th/2+tb+9],[-tw/2+8,th/2-9],[tw/2-9,th/2-9]]){
      x.strokeStyle='rgba(217,200,162,.55)'; x.lineWidth=1.1;
      x.beginPath(); x.arc(scw[0],scw[1],2.6,0,7); x.stroke();
      x.beginPath(); x.moveTo(scw[0]-1.8,scw[1]-1.8); x.lineTo(scw[0]+1.8,scw[1]+1.8); x.stroke();
    }
    /* the prompt: the story's real address, typed large */
    x.font='700 16px "Courier Prime",monospace'; x.fillStyle='#9fe08a';
    x.fillText('> open '+((sc.motif.file||'').slice(0,26)), -tw/2+14, -th/2+tb+27);
    /* honest output rows + one diff pair */
    const rows=Math.max(6,Math.floor((th-tb-92)/15));
    for(let i=0;i<rows;i++){
      const wq=[0.62,0.38,0.5,0.28,0.56,0.33,0.44,0.24][i%8]*tw*0.78;
      x.fillStyle=i===2?'#8a3b2a':(i===3?'#5fae57':'#6cae5e');
      x.fillRect(-tw/2+14, -th/2+tb+40+i*15, wq, 4.2);
    }
    x.fillStyle='#9fe08a'; x.font='700 15px "Courier Prime",monospace';
    x.fillText('> OK — 200 IN 12 MS', -tw/2+14, th/2-22);
    x.fillRect(-tw/2+14+182, th/2-34, 9, 14);
    /* period scanlines */
    x.fillStyle='rgba(242,231,201,.05)';
    for(let yy=-th/2+tb+4; yy<th/2-6; yy+=6) x.fillRect(-tw/2+2,yy,tw-4,2);
    x.restore();
  }
  /* figures */
  /* night scenes carry their own key light */
  const sceneLight = sc.light || (sc.bg==='rain' ? {mode:'rim', dir:[-0.8,-0.35]} : null);
  for(const f of sc.figures||[]){
    const box={x:f.box[0]*W, y:f.box[1]*H, w:f.box[2]*W, h:f.box[3]*H};
    const lt=f.light||sceneLight;
    if(f.kind==='sidekick') drawFigureLit(x,'sidekick',null,f.pose,box,{flip:f.flip,light:lt});
    else if(f.kind&&VILLAINS[f.kind]) drawFigureLit(x,'villain',VILLAINS[f.kind],null,box,{flip:f.flip,pose:f.pose==='stand'?undefined:f.pose,seed:sc.seed,light:lt});
    else drawFigureLit(x,'hero',castFor(sc.series).hero,f.pose,box,{seed:sc.seed+(f.seed||0),flip:f.flip,noFx:f.noFx,expr:f.expr,light:lt});
    if(f.prop) drawProp(x,f.prop,(f.box[0]+f.box[2]*(f.flip?0.1:0.9))*W,(f.box[1]+f.box[3]*0.5)*H,
      Math.min(52,f.box[3]*H*0.4), comboRGB(combo));
  }
  if(sc.plate&&sc.plate.after){ try{ sc.plate.after(x); }catch(e){ console.error('plate after',e); } }
  /* splash foreground: the rooftop parapet in full spot black */
  if(sc.motif){
    x.fillStyle=INKC;
    const lh=H*0.925;
    x.beginPath();
    x.moveTo(0,H); x.lineTo(0,lh);
    let lx=0;
    while(lx<W){ const seg=34+((sc.seed>>>(lx&7))&15);
      x.lineTo(lx+4,lh); x.lineTo(lx+4,lh-6); x.lineTo(lx+seg-6,lh-6);
      x.lineTo(lx+seg-6,lh); x.lineTo(lx+seg,lh);
      lx+=seg; }
    x.lineTo(W,lh); x.lineTo(W,H); x.closePath(); x.fill();
    /* vent pipe on the roof */
    x.beginPath(); x.moveTo(W*0.075,lh+2); x.lineTo(W*0.075,H*0.865);
    x.quadraticCurveTo(W*0.075,H*0.842,W*0.10,H*0.842);
    x.lineTo(W*0.125,H*0.842); x.lineTo(W*0.125,H*0.858);
    x.lineTo(W*0.092,H*0.858); x.lineTo(W*0.092,lh+2); x.closePath(); x.fill();
  }
  /* object close-up: one machine detail fills the panel, a different
     machine per issue — switch, dial, key, glowing field */
  if(sc.closeup){
    const obj=(sc.closeup&&sc.closeup.obj)||'switch';
    const gc=comboRGB((sc.series&&sc.series.combo)||[['C',1]]);
    /* emphasis rules radiating from the object */
    x.strokeStyle='rgba(35,28,18,.55)'; x.lineWidth=1.2;
    for(let i=0;i<14;i++){ const a=Math.PI*2*i/14;
      x.beginPath(); x.moveTo(W*0.42+Math.cos(a)*W*0.13,H*0.5+Math.sin(a)*H*0.24);
      x.lineTo(W*0.42+Math.cos(a)*W*0.5,H*0.5+Math.sin(a)*H*0.8); x.stroke(); }
    if(obj==='switch'){
      /* the master switch plate, lever thrown to ON */
      x.save(); x.translate(W*0.40,H*0.52); x.rotate(-0.06);
      x.fillStyle='#44403a'; x.fillRect(-64,-52,128,104);
      x.strokeStyle=INKC; x.lineWidth=3; x.strokeRect(-64,-52,128,104);
      for(const [bx2,by2] of [[-55,-43],[55,-43],[-55,43],[55,43]]){
        x.beginPath(); x.arc(bx2,by2,4,0,7); x.fillStyle='#d9c8a2'; x.fill();
        x.strokeStyle=INKC; x.lineWidth=1.2; x.stroke(); }
      x.fillStyle='#d9c8a2'; x.fillRect(-14,-38,28,76);
      x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(-14,-38,28,76);
      x.strokeStyle=INKC; x.lineWidth=9; x.lineCap='round';
      x.beginPath(); x.moveTo(0,16); x.lineTo(34,-26); x.stroke();
      x.fillStyle='#c22a1c';
      x.beginPath(); x.arc(38,-31,10,0,7); x.fill();
      x.strokeStyle=INKC; x.lineWidth=2.4; x.stroke();
      x.fillStyle=INKC;
      x.font='700 11px Oswald,sans-serif'; x.textAlign='center';
      x.fillText('ON',0,-24); x.fillText('OFF',0,34); x.textAlign='left';
      x.restore();
      /* the gloved fist gripping in from the right */
      x.save(); x.translate(W*0.70,H*0.44); x.rotate(2.6);
      drawHand(x,[0,0],0,'fist',7.5,gc,{lw:2.6});
      x.restore();
      limb(x,[[W*0.98,H*0.10],[W*0.80,H*0.30]],[26,20],gc,{lw:3});
    }
    else if(obj==='dial'){
      /* the pressure gauge, needle leaning into the red */
      x.save(); x.translate(W*0.40,H*0.52);
      x.fillStyle='#44403a'; x.beginPath(); x.arc(0,0,64,0,7); x.fill();
      x.strokeStyle=INKC; x.lineWidth=3; x.stroke();
      x.fillStyle='#f6efdd'; x.beginPath(); x.arc(0,0,52,0,7); x.fill();
      x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
      /* red zone wedge */
      x.fillStyle='#c22a1c';
      x.beginPath(); x.moveTo(0,0); x.arc(0,0,52,-1.1,-0.35); x.closePath(); x.fill();
      /* ticks */
      x.strokeStyle=INKC; x.lineWidth=2;
      for(let i=0;i<=10;i++){ const a=Math.PI*0.75+i*(Math.PI*1.5/10);
        x.beginPath(); x.moveTo(Math.cos(a)*44,Math.sin(a)*44);
        x.lineTo(Math.cos(a)*51,Math.sin(a)*51); x.stroke(); }
      /* the needle, into the red */
      x.strokeStyle=INKC; x.lineWidth=4.4; x.lineCap='round';
      x.beginPath(); x.moveTo(0,0); x.lineTo(Math.cos(-0.62)*44,Math.sin(-0.62)*44); x.stroke();
      x.fillStyle=INKC; x.beginPath(); x.arc(0,0,6.5,0,7); x.fill();
      /* glass glint */
      x.strokeStyle='rgba(255,255,255,.7)'; x.lineWidth=3;
      x.beginPath(); x.arc(0,0,46,3.6,4.2); x.stroke();
      x.fillStyle=INKC; x.font='700 10px Oswald,sans-serif'; x.textAlign='center';
      x.fillText('LOAD',0,30); x.textAlign='left';
      x.restore();
      /* a splayed hand thrown up before it */
      limb(x,[[W*0.99,H*0.95],[W*0.83,H*0.73]],[24,18],gc,{lw:3});
      x.save(); x.translate(W*0.785,H*0.665); x.rotate(-2.25);
      drawHand(x,[0,0],0,'splay',6.2,SKIN,{lw:2.4});
      x.restore();
    }
    else if(obj==='key'){
      /* the great console key, pressed by one finger */
      x.save(); x.translate(W*0.40,H*0.56); x.rotate(-0.05);
      /* key shaft in perspective */
      x.fillStyle='#8d8266'; x.fillRect(-46,-18,92,44);
      x.strokeStyle=INKC; x.lineWidth=2.4; x.strokeRect(-46,-18,92,44);
      /* key cap */
      x.fillStyle='#d9c8a2'; x.fillRect(-56,-52,112,44);
      x.strokeStyle=INKC; x.lineWidth=3; x.strokeRect(-56,-52,112,44);
      x.fillStyle=INKC; x.font='700 22px "Courier Prime",monospace'; x.textAlign='center';
      x.fillText('RUN',0,-22); x.textAlign='left';
      /* motion ticks: the cap going down */
      x.strokeStyle=INKC; x.lineWidth=2;
      for(const dx2 of [-62,62]){ x.beginPath(); x.moveTo(dx2,-46); x.lineTo(dx2,-14); x.stroke(); }
      x.restore();
      /* the pressing finger from above */
      limb(x,[[W*0.88,H*-0.10],[W*0.66,H*0.08]],[24,19],gc,{lw:3});
      x.save(); x.translate(W*0.615,H*0.125); x.rotate(2.62);
      drawHand(x,[0,0],0,'point',6.8,gc,{lw:2.6});
      x.restore();
    }
    else { /* field */
      /* one glowing admin field, cursor mid-blink */
      x.save(); x.translate(W*0.40,H*0.52); x.rotate(-0.04);
      /* glow */
      x.fillStyle='rgba(233,200,31,.30)';
      x.beginPath(); x.ellipse(0,0,110,58,0,0,7); x.fill();
      x.fillStyle='#fdf8ea'; x.fillRect(-92,-26,184,52);
      x.strokeStyle=INKC; x.lineWidth=3; x.strokeRect(-92,-26,184,52);
      x.fillStyle=INKC; x.font='700 11px Oswald,sans-serif';
      x.fillText('TITLE — REQUIRED',-92,-34);
      x.font='700 17px "Courier Prime",monospace';
      x.fillText('THE FOUR-COLOR…',-82,7);
      x.fillStyle='#c22a1c'; x.fillRect(78,-14,9,28);
      /* sparkles at the corners */
      x.fillStyle=INKC;
      x.restore();
      sparkleC(x,W*0.13,H*0.24,7); sparkleC(x,W*0.70,H*0.80,5);
      /* the splayed hand hovering */
      limb(x,[[W*1.02,H*-0.04],[W*0.845,H*0.155]],[22,17],gc,{lw:3});
      x.save(); x.translate(W*0.80,H*0.21); x.rotate(2.45);
      drawHand(x,[0,0],0,'splay',6.0,gc,{lw:2.4});
      x.restore();
    }
  }
  /* the sound as the whole scene — impact burst, debris, one great word */
  if(sc.bigOno){
    const rngO=mulberry(sc.seed^55);
    const bx2=sc.bigOno.at[0]*W, by2=sc.bigOno.at[1]*H;
    const p=burstPath(bx2,by2,W*0.34,H*0.42,14,rngO,0.30);
    fillScreened(x,p,[['Y',1]],null,2);
    x.strokeStyle=INKC; x.lineWidth=3; x.lineJoin='miter'; x.stroke(p);
    const p2=burstPath(bx2,by2,W*0.22,H*0.26,11,rngO,0.26);
    x.fillStyle='#f6efdd'; x.fill(p2);
    x.strokeStyle=INKC; x.lineWidth=2; x.stroke(p2);
    /* debris flecks */
    x.fillStyle=INKC;
    for(let i=0;i<12;i++){
      const a=rngO()*Math.PI*2, r=W*0.3+rngO()*W*0.14;
      x.save(); x.translate(bx2+Math.cos(a)*r,by2+Math.sin(a)*r*0.6); x.rotate(rngO()*3);
      x.fillRect(-3,-1.4,6,2.8); x.restore();
    }
    x.save(); x.translate(bx2,by2); x.rotate(sc.bigOno.rot||-0.09);
    drawLettering(x,sc.bigOno.word,{x:0,y:sc.bigOno.size*0.36,w:W*0.6,size:sc.bigOno.size,
      color:'#c22a1c',style:'saladino',seed:sc.seed,arc:0.16,telescope:3});
    x.restore();
  }
  /* onomatopoeia */
  if(sc.ono){
    x.save(); x.translate(sc.ono.at[0]*W, sc.ono.at[1]*H); x.rotate(sc.ono.rot||-0.1);
    drawLettering(x,sc.ono.word,{x:0,y:8,w:W*0.36,size:sc.ono.size||30,color:'#eec81a',
      style:'saladino',seed:sc.seed,arc:0.14,telescope:2});
    x.restore();
  }
  /* balloons behind their DOM text — offsets, never client rects, so a
     page can be lettered even while the leaf is mid-turn in 3D */
  for(const b of sc.balloons||[]){
    const bx=b.el.offsetLeft-12, by=b.el.offsetTop-10,
          bw=b.el.offsetWidth+24, bh=b.el.offsetHeight+23;
    const cx2=bx+bw/2, cy2=by+bh/2;
    const tx=b.tail[0]*W, ty=b.tail[1]*H;
    if(b.mode==='burst'){
      const p=burstPath(cx2,cy2,bw/2+13,bh/2+11,Math.max(11,Math.floor((bw+bh)/24)),rng,0.14);
      x.fillStyle='#f8ecc9'; x.fill(p);
      fillScreened(x,p,[['Y',.25]],null,2);
      x.strokeStyle=INKC; x.lineWidth=2.6; x.lineJoin='miter'; x.stroke(p);
      /* jagged shout tail — a lightning wedge at the speaker */
      if(!(tx>bx-6&&tx<bx+bw+6&&ty>by-6&&ty<by+bh+6)){
        const sx0=clamp(tx,bx+bw*0.2,bx+bw*0.8), sy0=cy2+ (ty>cy2? bh/2+6 : -bh/2-6);
        const mx1=sx0+(tx-sx0)*0.42+6, my1=sy0+(ty-sy0)*0.5;
        x.beginPath();
        x.moveTo(sx0-10,sy0-3*Math.sign(ty-cy2));
        x.lineTo(mx1-4,my1); x.lineTo(mx1+3,my1-5);
        x.lineTo(tx,ty);
        x.lineTo(mx1+7,my1+1); x.lineTo(sx0+10,sy0-3*Math.sign(ty-cy2));
        x.closePath();
        x.fillStyle='#f8ecc9'; x.fill();
        x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
      }
    } else if(b.mode==='thought'){
      bubblePath(x,bx,by,bw,bh,rng,true);
      /* the trail of thought bubbles wanders to the thinker */
      const dx0=tx-cx2, dy0=ty-cy2;
      const kk=Math.min(Math.abs(dx0)>1?(bw/2)/Math.abs(dx0):9, Math.abs(dy0)>1?(bh/2)/Math.abs(dy0):9)*1.02;
      const sx0=cx2+dx0*Math.min(kk,0.9), sy0=cy2+dy0*Math.min(kk,0.9);
      const n=3;
      for(let i=1;i<=n;i++){
        const t=i/(n+1);
        const px=sx0+(tx-sx0)*t+(i%2?4:-3), py=sy0+(ty-sy0)*t;
        const r=6.4*(1-t)+1.6;
        x.beginPath(); x.ellipse(px,py,r,r*0.72,0.2,0,7); x.fillStyle='#fdf8ea'; x.fill();
        x.strokeStyle=INKC; x.lineWidth=1.8; x.stroke();
      }
    } else {
      bubblePath(x,bx,by,bw,bh,rng,false);
      drawSpeechTail(x,bx,by,bw,bh,tx,ty);
    }
  }
}
/* the pointed tail: anchored on the balloon edge nearest the speaker,
   both flanks curving so the point AIMS AT THE MOUTH */
function drawSpeechTail(x,bx,by,bw,bh,tx,ty){
  if(tx>bx-4&&tx<bx+bw+4&&ty>by-4&&ty<by+bh+4) return;  /* mouth inside: no tail */
  const cx2=bx+bw/2, cy2=by+bh/2;
  /* choose the edge the target falls beyond */
  const overX=tx<bx? -1 : tx>bx+bw? 1 : 0;
  const overY=ty<by? -1 : ty>by+bh? 1 : 0;
  let baseX,baseY,horiz;
  if(overY!==0&&(overX===0||Math.abs(ty-cy2)/bh>=Math.abs(tx-cx2)/bw)){
    horiz=true;
    baseY=overY<0? by+2.5 : by+bh-2.5;
    baseX=clamp(tx,bx+24,bx+bw-24);
  } else {
    horiz=false;
    baseX=overX<0? bx+2.5 : bx+bw-2.5;
    baseY=clamp(ty,by+15,by+bh-15);
  }
  const half=horiz?9.5:7.5;
  const f=(t,w)=>horiz?[baseX+w,baseY+(ty-baseY)*t+( (ty>baseY?1:-1) * 0)]:[baseX+(tx-baseX)*t,baseY+w];
  /* control points give the tail its period S-curve */
  const c1=horiz? [baseX-6+(tx-baseX)*0.22, baseY+(ty-baseY)*0.58]
                : [baseX+(tx-baseX)*0.58, baseY-5+(ty-baseY)*0.22];
  const c2=horiz? [baseX+6+(tx-baseX)*0.34, baseY+(ty-baseY)*0.38]
                : [baseX+(tx-baseX)*0.38, baseY+5+(ty-baseY)*0.34];
  const A=horiz?[baseX-half,baseY]:[baseX,baseY-half];
  const B=horiz?[baseX+half,baseY]:[baseX,baseY+half];
  x.beginPath();
  x.moveTo(A[0],A[1]);
  x.quadraticCurveTo(c1[0],c1[1],tx,ty);
  x.quadraticCurveTo(c2[0],c2[1],B[0],B[1]);
  x.closePath();
  x.fillStyle='#fdf8ea'; x.fill();
  x.strokeStyle=INKC; x.lineWidth=2.2; x.lineCap='round';
  x.beginPath(); x.moveTo(A[0],A[1]); x.quadraticCurveTo(c1[0],c1[1],tx,ty); x.stroke();
  x.beginPath(); x.moveTo(B[0],B[1]); x.quadraticCurveTo(c2[0],c2[1],tx,ty); x.stroke();
}

/* the balloon body: a hand-wobbled rounded box that always CONTAINS the
   text block (period balloons hug their lettering; ellipses cut corners) */
function bubblePath(x,bx,by,bw,bh,rng,scallop){
  const r=Math.min(bh/2, scallop?18:30);
  const pts=[];
  const push=(px,py)=>pts.push([px+(rng()*2-1)*1.05, py+(rng()*2-1)*1.05]);
  const per=2*(bw+bh);
  const stepN=Math.max(12,Math.round(per/(scallop?26:42)));
  /* walk the rounded-rect perimeter */
  for(let i=0;i<stepN;i++){
    const t=i/stepN*per;
    let px,py;
    if(t<bw){ px=bx+t; py=by; }
    else if(t<bw+bh){ px=bx+bw; py=by+(t-bw); }
    else if(t<bw*2+bh){ px=bx+bw-(t-bw-bh); py=by+bh; }
    else { px=bx; py=by+bh-(t-2*bw-bh); }
    /* pull corners in for the rounding */
    const dx=Math.min(px-bx,bx+bw-px), dy=Math.min(py-by,by+bh-py);
    if(dx<r&&dy<r){
      const cxr=px<bx+bw/2?bx+r:bx+bw-r, cyr=py<by+bh/2?by+r:by+bh-r;
      const an=Math.atan2(py-cyr,px-cxr);
      px=cxr+Math.cos(an)*r; py=cyr+Math.sin(an)*r;
    }
    push(px,py);
  }
  x.beginPath();
  for(let i=0;i<=pts.length;i++){
    const p=pts[i%pts.length];
    if(i===0){ x.moveTo(p[0],p[1]); continue; }
    const q=pts[(i-1)%pts.length];
    const mx=(p[0]+q[0])/2, my=(p[1]+q[1])/2;
    /* bow every edge outward — scalloped hard for thought clouds,
       gently for speech so the box becomes a hand-drawn pillow oval */
    const cx0=bx+bw/2, cy0=by+bh/2;
    const vx=mx-cx0, vy=my-cy0; const vl=Math.hypot(vx,vy)||1;
    const bow=scallop?7:2.0;
    x.quadraticCurveTo(mx+vx/vl*bow, my+vy/vl*bow, p[0],p[1]);
  }
  x.closePath();
  x.fillStyle='#fdf8ea'; x.fill();
  x.strokeStyle=INKC; x.lineWidth=2.4; x.lineJoin='round'; x.stroke();
}

/* ============ 5. the dialogue scenes ============ */
function sceneNode(o){
  /* o: series, speaker 'hero'|'sidekick', mode, html(text), seed, plainLen */
  const cast=castFor(o.series);
  const seed=o.seed||1;
  const right=!!(seed%2); /* figure side alternates */
  const balW=CONTENT_W*0.60;
  const balH=estBalloonH(o.plain||textOf(o.html), balW);
  const figH=o.speaker==='sidekick'?118:150;
  const H=clamp(Math.max(figH+26, balH+50), 132, 320);
  const n=el('div','panel scene');
  n.dataset.viz=1; n.dataset.bl=1;
  n.style.height=H+'px';
  const bl=el('div','balloon'+(o.mode==='thought'?' thought':''));
  bl.innerHTML=o.html;
  bl.style.width=balW+'px';
  bl.style.top='12px';
  bl.style[right?'left':'right']='16px';
  n.appendChild(bl);
  const plate=el('div','plate', esc(o.speaker==='sidekick'?cast.sidekick.name:cast.hero.name));
  plate.style.bottom='7px';
  plate.style[right?'right':'left']='9px';
  n.appendChild(plate);
  const figW=(o.speaker==='sidekick'?0.20:0.26);
  const fx=right? (1-figW-0.03) : 0.03;
  const pose=o.pose||(o.speaker==='sidekick'
    ? (o.mode==='thought'?'think':'point')
    : (o.mode==='thought'?'think':['point','stand','think','monologue'][seed%4]));
  const fig={kind:o.speaker==='sidekick'?'sidekick':'hero', pose,
      box:[fx, 1-(figH/H)-0.03, figW, figH/H], flip:right, noFx:true,
      expr:o.mode==='thought'?'think':undefined};
  /* a drawn world behind the words, chosen by the beat */
  const bg=[null,'office',null,'consolehall',null,'skyline'][seed%6];
  n._sc={ seed, series:o.series, bg,
    figures:[fig],
    balloons:[{el:bl, tail:mouthAnchor(fig), mode:o.mode||'speech'}] };
  return n;
}

/* the villain scene + the crisp caution box */
function villainNode(o){
  /* o: series, kind, title, blocks(dom array), text, seed */
  const v=villainFor(o.kind,o.text);
  const cast=castFor(o.series);
  const wrap=el('div','panel scenewrap vwrap');
  wrap.dataset.viz=1; wrap.dataset.bl=1;
  wrap.style.border='none'; wrap.style.background='transparent'; wrap.style.padding='0';
  const scene=el('div','scene vscene');
  const H=158;
  scene.style.height=H+'px';
  const shout=el('div','balloon shout', esc((o.title&&o.title.toUpperCase())||(o.kind.toUpperCase()+'!')));
  shout.style.width=CONTENT_W*0.40+'px';
  shout.style.top='16px'; shout.style.left='22px';
  scene.appendChild(shout);
  const plate=el('div','plate vil', esc(v.name));
  plate.style.bottom='6px'; plate.style.right='8px';
  scene.appendChild(plate);
  const vf={kind:v.id, pose:'monologue', box:[0.66,0.04,0.32,0.92], flip:true};
  const hf={kind:'hero', pose:'warn', box:[0.42,0.30,0.19,0.64], noFx:true, expr:'alarm'};
  /* the menace strikes in the rain, the whole panel knocked off its level */
  scene._sc={ seed:o.seed, series:o.series, bg:'rain', tilt:-0.045,
    figures:[vf,hf],
    balloons:[{el:shout, tail:mouthAnchor(vf), mode:'burst'}],
    ono:null };
  wrap.appendChild(scene);
  const box=el('div','cautionbox'+(o.kind==='danger'?' grim':''));
  o.blocks.forEach(b=>box.appendChild(b));
  box.appendChild(el('div','cb-say',
    esc(cast.hero.name)+': “<b>'+esc(v.name)+'</b> STRIKES WHERE THIS PANEL GOES UNREAD — TWICE!”'));
  wrap.appendChild(box);
  return wrap;
}

/* ============ 6. drawn step sequences ============ */
function stepSeq(series, items, seedBase, renderBlocks){
  const cast=castFor(series);
  const POSE_CYCLE=['point','console','run','lift','stand','leap','think','console'];
  const out=[];
  let grid=null, gridCount=0;
  const kick=el('div','seq-kick','FOLLOW '+esc(cast.hero.name)+' — EVERY PANEL ONE REAL STEP!');
  items.forEach((it,i)=>{
    const html=typeof it==='string'?it:(it.html||'');
    const plain=textOf(html);
    const hasSub=(typeof it!=='string')&&it.blocks&&it.blocks.length;
    const wide=plain.length>220||hasSub;
    const step=el('div','step'+(wide?' wide':''));
    step.dataset.viz=1;
    const art=el('div','st-art');
    const artW=wide?148:Math.floor((CONTENT_W-10-6)/2), artH=112;
    const c=cvs(artW,artH); art.appendChild(c);
    art.style.height=artH+'px';
    art.appendChild(el('div','st-flag','STEP '+(i+1)));
    step.appendChild(art);
    const short=plain.length<170;
    const txt=el('div','st-txt'+(short?'':' long'));
    txt.innerHTML=html;
    if(short) step.dataset.bl=1;
    if(hasSub&&renderBlocks){ renderBlocks(it.blocks).forEach(k=>txt.appendChild(k)); }
    step.appendChild(txt);
    const pose=POSE_CYCLE[(seedBase+i)%POSE_CYCLE.length];
    const prop=propFor(plain);
    step._paint=()=>{
      const x=c.getContext('2d');
      x.setTransform(DPR,0,0,DPR,0,0);
      const rng=mulberry(seedBase+i*31);
      /* backdrop hatch corner */
      x.strokeStyle='rgba(35,28,18,.28)'; x.lineWidth=1;
      for(let k=0;k<5;k++){ x.beginPath(); x.moveTo(artW-40+k*8,0); x.lineTo(artW,40-k*8); x.stroke(); }
      x.beginPath(); x.moveTo(4,artH-8); x.lineTo(artW-4,artH-8); x.stroke();
      drawFigure(x,cast.hero,pose,{x:2,y:4,w:artW*0.58,h:artH-10},{seed:seedBase+i,noFx:artW<170});
      drawProp(x,prop,artW*0.79,artH*0.48,Math.min(50,artW*0.34),comboRGB(series.combo));
    };
    if(wide){
      if(grid&&gridCount===1){ grid.classList.add('single'); }
      grid=null; gridCount=0;
      const seq=el('div','panel stepseq onerow');
      seq.style.border='none'; seq.style.background='transparent'; seq.style.padding='0';
      seq.dataset.viz=1; if(short) seq.dataset.bl=1;
      seq.appendChild(step);
      out.push({node:seq,kind:'bd'});
    } else {
      if(!grid||gridCount>=4){
        grid=el('div','panel stepseq');
        grid.style.border='none'; grid.style.background='transparent'; grid.style.padding='0';
        grid.dataset.viz=1;
        gridCount=0;
        out.push({node:grid,kind:'bd'});
      }
      if(short) grid.dataset.bl=1;
      grid.appendChild(step); gridCount++;
    }
  });
  if(out.length) out[0].node.prepend(kick);
  /* a lone half-width step at a grid's end stretches full width */
  for(const o of out){
    const steps=o.node.querySelectorAll(':scope>.step:not(.wide)');
    if(steps.length%2===1) steps[steps.length-1].style.gridColumn='1/-1';
  }
  return out;
}

/* ============ 7. spot panels — the cadence keepers, in every
   register the period knew: action beats, establishing shots, interiors,
   panoramas, object close-ups, silent beats, pure onomatopoeia ============ */
const SPOT_TYPES=['action','establish','twoshot','panorama','closeup','interior','silent','ono'];
const BL_TYPES=['action','twoshot','interior'];
function spotOrder(slug){
  /* a per-issue shuffle so every issue opens its vocabulary differently
     and two consecutive spots never share a type */
  const rng=mulberry(hash32('vocab'+slug));
  const arr=SPOT_TYPES.slice();
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}
function capboxAt(n,txt,pos){
  const cb=el('div','capbox', esc(txt));
  cb.style.top='10px'; cb.style[pos==='right'?'right':'left']='12px';
  cb.style.maxWidth='62%';
  n.appendChild(cb);
  return cb;
}
function spotNode(series, slug, seed, nextHeading, opts){
  opts=opts||{};
  const order=spotOrder(slug);
  let type=order[(opts.seq||0)%order.length];
  if(opts.needBl&&BL_TYPES.indexOf(type)<0) type=BL_TYPES[(opts.seq||0)%BL_TYPES.length];
  if(opts.type) type=opts.type; /* the vocabulary law asks by name */
  const cast=castFor(series);
  const headUp=nextHeading?String(nextHeading).toUpperCase():null;
  const hv=hash32('flavor'+slug);          /* per-issue flavor: no two books stamp alike */
  const n=el('div','panel spot spot-'+type);
  n.dataset.viz=1;
  const ONO=['ZOK!','WHAM!','KRAK!','THOOM!','SWOOSH!','ZANG!','KRA-KOOM!','THA-THOOM!'];
  let H=176;
  if(type==='action'){
    n.dataset.bl=1;
    const line=headUp?bangify('ONWARD — '+headUp):bangify('THE TALE CONTINUES');
    const bl=el('div','balloon', esc(line));
    bl.style.width=Math.min(250,CONTENT_W*0.44)+'px';
    bl.style.right='18px'; bl.style.top='16px';
    n.appendChild(bl);
    const fig={kind:'hero', pose:['run','fly','leap'][seed%3], box:[0.05,0.06,0.40,0.86], seed};
    n._sc={ seed, series, bg:['skyline','street','rain'][hv%3],
      figures:[fig],
      balloons:[{el:bl, tail:mouthAnchor(fig), mode:'speech'}],
      ono:{word:ONO[seed%6], at:[0.56,0.78], size:30, rot:-0.1} };
  }
  else if(type==='establish'){
    H=196;
    const which=['street','skyline','office'][hv%3];
    const caps={
      street:[ 'MEANWHILE, AT THE HOME OFFICE...',
               'THE PRESSES WARM UP DOWNTOWN...'],
      skyline:['SOMEWHERE PAST THOSE ROOFTOPS, THE NEXT PAGE WAITS...',
               'THE CITY THAT NEVER STOPS READING...'],
      office:[ 'UPSTAIRS, THE BULLPEN BURNS THE LATE OIL...',
               'DEADLINE NIGHT AT DOCS CODE PUBLICATIONS...'],
    };
    let cap=caps[which][(hv>>>3)%2];
    if(headUp) cap=cap.replace(/\.\.\.$/,'')+' — '+headUp+' IS ALREADY ON THE PRESSES...';
    capboxAt(n, cap);
    n._sc={ seed:hv, series, bg:which, figures:[], balloons:[] };
  }
  else if(type==='twoshot'){
    n.dataset.bl=1;
    const line=headUp?bangify('NEXT STOP — '+headUp):bangify('STAY WITH ME, PAGE');
    const bl=el('div','balloon', esc(line));
    bl.style.width=Math.min(240,CONTENT_W*0.42)+'px';
    bl.style.left='34%'; bl.style.top='12px';
    n.appendChild(bl);
    H=188;
    const hero={kind:'hero', pose:'point', box:[0.66,0.10,0.30,0.84], flip:true, noFx:true};
    const kid={kind:'sidekick', pose:'think', box:[0.06,0.28,0.20,0.66]};
    n._sc={ seed, series, bg:['office','street','rain'][hv%3],
      figures:[kid,hero],
      balloons:[{el:bl, tail:mouthAnchor(hero), mode:'speech'}] };
  }
  else if(type==='panorama'){
    H=142;
    const caps=['THE LONG VIEW — AND STILL THE STORY RUNS ON',
      'THE CITY OF PAGES AT PRESS TIME',
      'EVERY LIGHT DOWN THERE IS A READER',
      'THE NIGHT SHIFT NEVER CLOSES THE BOOK'];
    let cap=caps[hv%4];
    cap+=headUp?(' — TOWARD '+headUp+'...'):'...';
    capboxAt(n, cap);
    n._sc={ seed:hv, series, bg:['serverroom','rain','skyline'][(hv>>>2)%3],
      figures:[], balloons:[] };
  }
  else if(type==='closeup'){
    H=172;
    const obj=['switch','dial','key','field'][hv%4];
    const capsO={ switch:'EVERY SWITCH MATTERS NOW.',
      dial:'THE NEEDLE CREEPS TOWARD RED.',
      key:'ONE KEY BETWEEN DRAFT AND DESTINY.',
      field:'A SINGLE FIELD HOLDS THE LINE.' };
    const onoO={ switch:'KLIK!', dial:'TIK-TIK!', key:'CHUNK!', field:'BLIP!' };
    capboxAt(n, headUp?(capsO[obj]+' '+headUp+' IS ONE PAGE AWAY.'):capsO[obj],'right');
    n._sc={ seed:hv, series, closeup:{obj}, figures:[], balloons:[],
      ono:{word:onoO[obj], at:[0.70,0.47], size:24, rot:-0.06} };
  }
  else if(type==='interior'){
    n.dataset.bl=1;
    H=196;
    const line=headUp?bangify('THE BOARD IS GREEN — ON TO '+headUp):bangify('THE BOARD IS GREEN');
    const bl=el('div','balloon', esc(line));
    bl.style.width=Math.min(230,CONTENT_W*0.40)+'px';
    bl.style.right='16px'; bl.style.top='12px';
    n.appendChild(bl);
    /* figures small in a big drawn room */
    const hero={kind:'hero', pose:'console', box:[0.12,0.42,0.22,0.52], noFx:true};
    const kid={kind:'sidekick', pose:'point', box:[0.38,0.50,0.13,0.44]};
    n._sc={ seed, series, bg:hv%2?'consolehall':'office',
      figures:[hero,kid],
      balloons:[{el:bl, tail:mouthAnchor(hero), mode:'speech'}] };
  }
  else if(type==='silent'){
    /* the breather: no words at all — the hero alone with the machines */
    H=168;
    const pose=['stand','think','console'][hv%3];
    const hero={kind:'hero', pose, box:[0.60,0.14,0.34,0.80], flip:pose!=='console', noFx:true,
      expr:pose==='console'?undefined:'think',
      light:pose==='console'?{mode:'screen', at:[0.9,0.45]}:null};
    n._sc={ seed, series, bg:['consolehall','skyline','office','rain'][(hv>>>4)%4],
      figures:[hero], balloons:[] };
  }
  else { /* ono — the sound is the whole panel, an object among objects */
    H=150;
    const caps=['AND THE PRESSES ANSWER —','SOMEWHERE, A BUILD FINISHES —',
      'THE NIGHT SHIFT HEARS IT FIRST —','EVERY ROOFTOP HEARS IT —'];
    capboxAt(n,caps[hv%4]);
    n._sc={ seed, series, ground:0, figures:[], balloons:[],
      bigOno:{word:ONO[(seed>>>2)%ONO.length], at:[0.52,0.62], size:64, rot:-0.09} };
  }
  n.style.height=H+'px';
  return n;
}

/* ============ 8. the splash scene — the master-motif page ============ */
function splashScene(series, slug, teaser, inb, file){
  const seed=hash32('spl'+slug);
  const cast=castFor(series);
  const n=el('div','sp-scene');
  n.style.flex='1 1 auto';
  n.style.minHeight='300px';
  const line=bangify(firstSentence(teaser,170)).toUpperCase();
  const bl=el('div','balloon', esc(line));
  bl.style.width=CONTENT_W*0.46+'px';
  bl.style.left='14px'; bl.style.top='12px';
  n.appendChild(bl);
  const plate=el('div','plate', esc(cast.hero.name));
  plate.style.right='10px'; plate.style.bottom='8px';
  n.appendChild(plate);
  /* the hero vaults the giant terminal blown corner to corner,
     Detective-378 fashion — the page IS the splash */
  const pose=inb>=10?'fly':'leap';
  const hero={kind:'hero', pose, box:[0.50,0.05,0.48,0.86], flip:false, seed,
    light:{mode:'screen', at:[0.02,0.62]}};   /* lit by the giant terminal */
  n._sc={ seed, series, motif:{file:file||''},
    figures:[hero],
    balloons:[{el:bl, tail:mouthAnchor(hero), mode:'speech'}],
    ono:inb>=10?{word:['KRA-KOOM!','ZZRAKK!','FWOOOM!','THA-THOOM!'][seed%4], at:[0.26,0.82], size:26, rot:-0.08}:null };
  return n;
}

/* ============ 8b. THE PLATE — one pure-art page per issue ============
   The page's own subject told as myth, the cosmic-splash scan the bar:
   layered planes, drawn props, a lit figure — no prose, no code, only
   the painting and its floating caption boxes in the period hand. */
function plateStars(x,W,H,seed,n,yMax,x0,x1){
  const rng=mulberry(seed^0x51ab);
  x0=x0||0; x1=x1==null?W:x1;
  for(let i=0;i<n;i++){
    const sx=x0+rng()*(x1-x0), sy=rng()*(yMax||H*0.5), r=rng()<0.85?(0.6+rng()*0.9):(1.6+rng()*0.8);
    x.fillStyle='rgba(253,248,234,.9)';
    x.beginPath(); x.arc(sx,sy,r,0,7); x.fill();
    if(r>1.5){ x.strokeStyle='rgba(253,248,234,.55)'; x.lineWidth=0.8;
      x.beginPath(); x.moveTo(sx-r*2.4,sy); x.lineTo(sx+r*2.4,sy);
      x.moveTo(sx,sy-r*2.4); x.lineTo(sx,sy+r*2.4); x.stroke(); }
  }
}
/* a run of drawn buildings; same seed = same geometry, so day/night
   passes can disagree only about the light in the windows */
function plateCity(x,W,yBase,hMax,seed,o){
  o=o||{};
  const rng=mulberry(seed^0xc17e);
  let bx=(o.x0!=null?o.x0:-10);
  const xEnd=(o.x1!=null?o.x1:W+10);
  while(bx<xEnd){
    const bw=24+rng()*44, bh=hMax*(0.35+rng()*0.65);
    const wt=rng(), an=rng();
    if(o.wire){
      x.strokeStyle=o.wire; x.lineWidth=1.5;
      x.setLineDash([5,4]);
      x.strokeRect(bx,yBase-bh,bw,bh);
      x.beginPath(); x.moveTo(bx,yBase-bh*0.5); x.lineTo(bx+bw,yBase-bh*0.5); x.stroke();
      x.beginPath(); x.moveTo(bx+bw*0.5,yBase-bh); x.lineTo(bx+bw*0.5,yBase); x.stroke();
      x.setLineDash([]);
    } else {
      x.fillStyle=o.fill||INKC;
      /* a real building profile: possible setback tower, cornice ledge */
      const setb=rng()<0.4, sbw=bw*(0.36+rng()*0.3), sbh=bh*(0.24+rng()*0.3);
      x.fillRect(bx,yBase-bh,bw,bh+(o.below||0));
      if(setb) x.fillRect(bx+bw*0.5-sbw/2,yBase-bh-sbh,sbw,sbh+2);
      if(o.stroke){ x.strokeStyle=o.stroke; x.lineWidth=1.4; x.strokeRect(bx,yBase-bh,bw,bh+(o.below||0));
        if(setb) x.strokeRect(bx+bw*0.5-sbw/2,yBase-bh-sbh,sbw,sbh); }
      /* cornice slab */
      if(rng()<0.6){ x.fillRect(bx-1.6,yBase-bh-2.4,bw+3.2,2.6);
        if(setb) x.fillRect(bx+bw*0.5-sbw/2-1.4,yBase-bh-sbh-2.2,sbw+2.8,2.4); }
      const roofTop=yBase-bh-(setb?sbh:0);
      if(wt<0.3){ /* water tank on stilts with a conical hat */
        const tx=bx+bw*(0.2+rng()*0.5);
        x.fillRect(tx,roofTop-9,8,7);
        x.beginPath(); x.moveTo(tx-1.6,roofTop-9); x.lineTo(tx+4,roofTop-13.5);
        x.lineTo(tx+9.6,roofTop-9); x.closePath(); x.fill();
        x.fillRect(tx+1,roofTop-2,1.4,2); x.fillRect(tx+5.6,roofTop-2,1.4,2); }
      else if(an<0.25){ x.strokeStyle=o.fill||INKC; x.lineWidth=1.6;
        x.beginPath(); x.moveTo(bx+bw/2,roofTop); x.lineTo(bx+bw/2,roofTop-14); x.stroke();
        x.beginPath(); x.moveTo(bx+bw/2-4,roofTop-10); x.lineTo(bx+bw/2+4,roofTop-10); x.stroke(); }
      else if(rng()<0.2){ /* rooftop shed + clothes line */
        x.fillRect(bx+bw*0.15,roofTop-6,bw*0.3,6);
        x.strokeStyle=o.fill||INKC; x.lineWidth=1;
        x.beginPath(); x.moveTo(bx+bw*0.5,roofTop-4);
        x.quadraticCurveTo(bx+bw*0.72,roofTop-1,bx+bw*0.94,roofTop-5); x.stroke(); }
      if(o.win){
        x.fillStyle=o.win;
        const tall=rng()<0.3;   /* some faces run tall arched windows */
        const cols=Math.max(2,Math.floor(bw/9)), rows=Math.max(2,Math.floor(bh/13));
        for(let c2=0;c2<cols;c2++)for(let r2=0;r2<rows;r2++){
          if(rng()<(o.winDensity!=null?o.winDensity:0.5)){
            if(tall&&r2===0){ x.fillRect(bx+4+c2*8, yBase-bh+4, 4.2, 10); }
            else x.fillRect(bx+4+c2*8, yBase-bh+5+r2*12, 4.2,6.2);
          }
        }
        /* string-course ledge lines every few floors */
        x.strokeStyle='rgba(35,28,18,.35)'; x.lineWidth=0.8;
        for(let r2=1;r2<rows;r2+=2){ x.beginPath();
          x.moveTo(bx+1,yBase-bh+r2*12+1.5); x.lineTo(bx+bw-1,yBase-bh+r2*12+1.5); x.stroke(); }
      }
    }
    bx+=bw+(2+rng()*8);
  }
}
/* painted-sky kit: scalloped cloud banks, streak washes, ground incident */
function plateClouds(x,W,seed,banks){
  const rng=mulberry(seed^0xc10d);
  for(const [cx,cy,s,dark] of banks){
    x.fillStyle=dark?'rgba(58,53,43,.9)':'#f6efdd';
    x.beginPath();
    x.arc(cx,cy,15*s,Math.PI*0.5,Math.PI*1.5);
    x.arc(cx+14*s,cy-11*s,11*s,Math.PI*0.9,Math.PI*1.9);
    x.arc(cx+30*s,cy-7*s,12*s,Math.PI*1.1,Math.PI*0.25);
    x.arc(cx+27*s,cy+7*s,9*s,Math.PI*1.5,Math.PI*0.5);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.5; x.stroke();
    /* the shadowed belly of the bank */
    x.strokeStyle='rgba(35,28,18,.45)'; x.lineWidth=1;
    for(let i=0;i<3;i++){ x.beginPath();
      x.moveTo(cx-8*s+i*10*s,cy+10*s-i*1.2);
      x.quadraticCurveTo(cx+i*10*s,cy+13*s,cx+8*s+i*10*s,cy+10*s); x.stroke(); }
  }
}
function plateSkyTex(x,W,y0,y1,seed,col,n){
  /* loose painter's streaks broken over the halftone: the sky stops being
     a flat dot field and starts being WEATHER */
  const rng=mulberry(seed^0x57e4);
  x.strokeStyle=col; x.lineCap='round';
  for(let i=0;i<(n||14);i++){
    const yy=y0+(y1-y0)*rng(), x0=W*rng()*0.7, ln=W*(0.08+rng()*0.22);
    x.lineWidth=1+rng()*2.2;
    x.beginPath(); x.moveTo(x0,yy);
    x.quadraticCurveTo(x0+ln*0.5,yy-2-rng()*3,x0+ln,yy+ (rng()-0.5)*3);
    x.stroke();
  }
}
function plateGroundTex(x,W,y0,y1,seed,mode){
  /* cracks, cobbles or tufts across a ground band */
  const rng=mulberry(seed^0x9247);
  x.strokeStyle='rgba(35,28,18,.5)'; x.lineCap='round';
  if(mode==='cobble'){
    for(let i=0;i<26;i++){ const px=W*rng(), py=y0+(y1-y0)*rng();
      x.lineWidth=1;
      x.beginPath(); x.ellipse(px,py,3.4+rng()*2.4,1.6+rng()*1,0,Math.PI*0.15,Math.PI*0.9); x.stroke(); }
  } else if(mode==='tuft'){
    for(let i=0;i<16;i++){ const px=W*rng(), py=y0+(y1-y0)*rng();
      x.lineWidth=1.2;
      x.beginPath(); x.moveTo(px,py); x.quadraticCurveTo(px+2,py-5,px+4.5,py-6.5); x.stroke();
      x.beginPath(); x.moveTo(px+1,py); x.quadraticCurveTo(px-1,py-4,px-3.5,py-5.5); x.stroke(); }
  } else {
    for(let i=0;i<9;i++){ const px=W*rng(), py=y0+(y1-y0)*rng();
      x.lineWidth=1.1;
      x.beginPath(); x.moveTo(px,py);
      x.lineTo(px+6+rng()*8,py+2+rng()*3);
      x.lineTo(px+15+rng()*9,py+1-rng()*3); x.stroke();
      if(rng()<0.5){ x.beginPath(); x.moveTo(px+7,py+2); x.lineTo(px+9,py+6); x.stroke(); } }
  }
}
/* a walking file of small black silhouettes, bundles on their backs */
function plateCrowd(x,yAt,x0,x1,seed,n,s,standing){
  const rng=mulberry(seed^0xf00d);
  x.fillStyle=INKC;
  for(let i=0;i<n;i++){
    const t=i/Math.max(1,n-1);
    const px=x0+(x1-x0)*t+(rng()-0.5)*10;
    const py=(typeof yAt==='function')?yAt(px):yAt;
    const sc2=s*(0.85+rng()*0.35);
    x.save(); x.translate(px,py); x.scale(sc2,sc2);
    x.beginPath(); x.arc(0,-13,2.6,0,7); x.fill();
    x.beginPath(); x.moveTo(-2.6,-10.5); x.lineTo(2.6,-10.5); x.lineTo(1.8,-2); x.lineTo(-1.8,-2); x.closePath(); x.fill();
    const ph=standing?0:((i%3)-1);
    x.lineWidth=1.9; x.strokeStyle=INKC; x.lineCap='round';
    x.beginPath(); x.moveTo(-0.8,-2); x.lineTo(-2.4+ph,4.5); x.stroke();
    x.beginPath(); x.moveTo(0.8,-2); x.lineTo(2.6-ph,4.5); x.stroke();
    if(!standing&&rng()<0.6){ x.beginPath(); x.arc(-3.4,-9.6,2.5,0,7); x.fill(); }
    if(rng()<0.35){ x.lineWidth=1.2;
      x.beginPath(); x.moveTo(3.2,-12); x.lineTo(4.6,4.5); x.stroke(); }
    x.restore();
  }
}
function plateFlame(x,cx,cy,s,seed){
  const rng=mulberry(seed^0xf1a3);
  x.save(); x.translate(cx,cy); x.scale(s,s);
  x.fillStyle='#e9c81f';
  x.beginPath(); x.moveTo(-3.4,0);
  x.bezierCurveTo(-4.2,-3.4,-1.6,-4.2,-1.2,-7.4);
  x.bezierCurveTo(0.4,-4.8,1.4,-5.6,2.2,-8.8);
  x.bezierCurveTo(3.4,-4.6,4.2,-3.2,3.4,0);
  x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=0.9; x.stroke();
  x.fillStyle='#c22a1c';
  x.beginPath(); x.moveTo(-1.6,0);
  x.bezierCurveTo(-2.2,-2.2,-0.4,-2.6,0.2,-4.6);
  x.bezierCurveTo(1.0,-2.6,2.0,-2.4,1.6,0);
  x.closePath(); x.fill();
  x.restore();
}
function plateVignette(x,W,H,fx,fy){
  /* the painter's last pass: value modulation over the whole plate — the
     corners sink, a breath of light holds the focal center, and the flat
     dot fields start reading as PAINT */
  const g=x.createRadialGradient(W*fx,H*fy,Math.min(W,H)*0.16,W*fx,H*fy,Math.max(W,H)*0.85);
  g.addColorStop(0,'rgba(253,248,234,.10)');
  g.addColorStop(0.42,'rgba(253,248,234,0)');
  g.addColorStop(0.72,'rgba(35,28,18,.08)');
  g.addColorStop(1,'rgba(35,28,18,.22)');
  x.fillStyle=g; x.fillRect(0,0,W,H);
}
/* ============ 8. THE PLATE FORGE — ONE PAGE = ONE PICTURE ============
   No scene ids, no fixed layouts. Every plate is COMPOSED from the page's
   own material: the title names the drawn subject (the lexicon maps its
   concepts to things a brush can hold), the REAL h2/h3 headings walk into
   the picture as lettered signs, banners and carved names, the body's
   shape (code, steps, tables, words, citations) sets the vantage, the
   density and the crowd, and the hour and palette are seeded per page.
   Shared primitives only — a figure, a brick, a lamp — never a layout. */

const PF_STOP=new Set(['THE','OF','AND','FOR','TO','A','AN','IN','ON','WITH','HOW','VIA',
  'YOUR','FROM','USING','USE','SETUP','SET','UP','GUIDE','GUIDES','STRAPI','IS','ARE',
  'INTRODUCTION','OVERVIEW','REFERENCE','&','AMP']);
function pfWords(s){
  return String(s||'').toUpperCase().replace(/&AMP;/g,'&').replace(/[^A-Z0-9\-\s]/g,' ')
    .split(/[\s\-]+/).filter(w=>w&&!PF_STOP.has(w));
}
const PF_TAILSTOP=new Set(['THE','A','AN','OF','TO','FOR','AND','OR','IN','ON','BY',
  'WITH','YOUR','VS','INTO','FROM','AT','IS','ARE','VIA','AS','&','+','-','—']);
function pfShort(s,n){
  /* cut on a word, never mid-token, and never leave a dangling article —
     'CREATE A .DOCKERIG' and 'REVIEWING THE' are not lettering. A single
     long token is kept whole (the letterer shrinks) rather than sawn */
  s=String(s||'').replace(/\s+/g,' ').trim();
  if(s.length<=n) return s;
  let cut=s.slice(0,n);
  const sp=cut.lastIndexOf(' ');
  if(sp<=0){ const w0=s.split(' ')[0]; return (n>=12&&w0.length<=n+8)?w0:cut; }
  cut=cut.slice(0,sp).replace(/[,;:]$/,'');
  const parts=cut.split(' ');
  while(parts.length>1&&PF_TAILSTOP.has(parts[parts.length-1].toUpperCase())) parts.pop();
  return parts.join(' ');
}
/* code identifiers in a title keep their case; prose gets shouted */
function pfToken(s){
  const m=String(s||'').match(/[a-zA-Z_$][\w$]*\(\)|[a-z][a-zA-Z0-9]*[A-Z][\w]*|[\w-]+\.[\w.]+|`([^`]+)`/);
  return m?(m[1]||m[0]):null;
}

/* ---- the hand-lettered furniture: signs, banners, carvings ---- */
function pfFitFont(x,text,maxW,size,fam){
  x.font=fam.replace('%',size);
  let w=x.measureText(text).width;
  if(w>maxW){ size=Math.max(6.5,size*maxW/w); x.font=fam.replace('%',size); w=x.measureText(text).width; }
  return {size,w};
}
/* a plank sign: post into the ground, board, lettered with a REAL heading */
function pfSign(x,cx,by,text,o){
  o=o||{};
  const s=o.s||1, ang=(o.ang||0);
  const bw=Math.max(34,Math.min(o.maxW||120, text.length*6.4+14))*s;
  const bh=17*s, ph=(o.post==null?26:o.post)*s;
  x.save(); x.translate(cx,by);
  if(ph>0){ x.strokeStyle=INKC; x.lineWidth=3.2*s; x.beginPath(); x.moveTo(0,0); x.lineTo(0,-ph); x.stroke(); }
  x.translate(0,-ph); x.rotate(ang);
  x.fillStyle=o.tone||'#e8d9ac';
  x.fillRect(-bw/2,-bh,bw,bh);
  x.strokeStyle=INKC; x.lineWidth=1.6*s; x.strokeRect(-bw/2,-bh,bw,bh);
  /* nail heads */
  x.fillStyle=INKC;
  x.beginPath(); x.arc(-bw/2+3.4*s,-bh/2,1.1*s,0,7); x.arc(bw/2-3.4*s,-bh/2,1.1*s,0,7); x.fill();
  x.fillStyle=o.ink||INKC; x.textAlign='center';
  pfFitFont(x,text,bw-8*s,10*s,'600 %px Oswald,"Arial Narrow",sans-serif');
  x.fillText(text,0,-bh*0.28);
  x.textAlign='left'; x.restore();
  return bw;
}
/* a cloth banner hung from a rod or wall */
function pfBanner(x,cx,ty,text,o){
  o=o||{};
  const s=o.s||1;
  const bw=Math.max(30,Math.min(o.maxW||110,text.length*6.2+16))*s, bh=(o.h||26)*s;
  x.save(); x.translate(cx,ty); x.rotate(o.ang||0);
  x.fillStyle=o.tone||'#c22a1c';
  x.beginPath(); x.moveTo(-bw/2,0); x.lineTo(bw/2,0); x.lineTo(bw/2,bh);
  x.lineTo(0,bh-6*s); x.lineTo(-bw/2,bh); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.6*s; x.stroke();
  if(o.rod!==false){ x.strokeStyle=INKC; x.lineWidth=2.4*s;
    x.beginPath(); x.moveTo(-bw/2-5*s,0); x.lineTo(bw/2+5*s,0); x.stroke(); }
  x.fillStyle=o.ink||'#f6efdd'; x.textAlign='center';
  pfFitFont(x,text,bw-8*s,10.5*s,'600 %px Oswald,"Arial Narrow",sans-serif');
  x.fillText(text,0,bh*0.52);
  x.textAlign='left'; x.restore();
  return bw;
}
/* letters carved into stone — pale inlay with a drop of shadow */
function pfCarve(x,cx,cy,text,o){
  o=o||{};
  x.save(); x.translate(cx,cy); x.rotate(o.ang||0); x.textAlign='center';
  const fam=o.mono?'700 %px "Courier Prime",monospace':'600 %px Oswald,"Arial Narrow",sans-serif';
  pfFitFont(x,text,o.maxW||120,o.size||11,fam);
  x.fillStyle='rgba(35,28,18,.55)'; x.fillText(text,0.8,0.8);
  x.fillStyle=o.ink||'rgba(246,239,221,.78)'; x.fillText(text,0,0);
  x.textAlign='left'; x.restore();
}

/* ---- the shared brush kit: one brick, one lamp, one flame at a time ---- */
function pfLamp(x,cx,by,s,lit){
  x.strokeStyle=INKC; x.lineWidth=3*s; x.lineCap='round';
  x.beginPath(); x.moveTo(cx,by); x.lineTo(cx,by-34*s); x.stroke();
  x.beginPath(); x.moveTo(cx,by-34*s); x.quadraticCurveTo(cx+9*s,by-38*s,cx+11*s,by-33*s); x.stroke();
  x.fillStyle=lit?'#e9c81f':'#3a352b';
  x.beginPath(); x.moveTo(cx+8*s,by-34*s); x.lineTo(cx+14*s,by-34*s);
  x.lineTo(cx+12.6*s,by-26*s); x.lineTo(cx+9.4*s,by-26*s); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.4*s; x.stroke();
  if(lit){ const g=x.createRadialGradient(cx+11*s,by-30*s,2,cx+11*s,by-30*s,26*s);
    g.addColorStop(0,'rgba(233,200,31,.4)'); g.addColorStop(1,'rgba(233,200,31,0)');
    x.fillStyle=g; x.beginPath(); x.arc(cx+11*s,by-30*s,26*s,0,7); x.fill(); }
}
function pfCrate(x,cx,cy,w,h,label,tone){
  x.fillStyle=tone||'#c9a86a'; x.fillRect(cx-w/2,cy-h,w,h);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(cx-w/2,cy-h,w,h);
  x.lineWidth=1.1;
  x.beginPath(); x.moveTo(cx-w/2,cy-h); x.lineTo(cx+w/2,cy); x.moveTo(cx+w/2,cy-h); x.lineTo(cx-w/2,cy); x.stroke();
  x.strokeRect(cx-w/2+3,cy-h+3,w-6,h-6);
  if(label){ x.save(); x.fillStyle=INKC; x.textAlign='center';
    pfFitFont(x,label,w-8,Math.min(9,h*0.3),'600 %px Oswald,sans-serif');
    x.fillText(label,cx,cy-h*0.42); x.textAlign='left'; x.restore(); }
}
function pfKeyBig(x,cx,cy,s,ang,tone){
  x.save(); x.translate(cx,cy); x.rotate(ang||0);
  x.strokeStyle=INKC; x.fillStyle=tone||'#e9c81f'; x.lineWidth=2*s;
  x.beginPath(); x.arc(-9*s,0,6.5*s,0,7); x.fill(); x.stroke();
  x.fillStyle='#efe3c2'; x.beginPath(); x.arc(-9*s,0,2.6*s,0,7); x.fill(); x.stroke();
  x.strokeStyle=INKC; x.lineWidth=3.4*s; x.lineCap='round';
  x.beginPath(); x.moveTo(-3*s,0); x.lineTo(13*s,0); x.stroke();
  x.lineWidth=2.6*s;
  x.beginPath(); x.moveTo(9*s,0); x.lineTo(9*s,4.4*s); x.moveTo(13*s,0); x.lineTo(13*s,5.6*s); x.stroke();
  x.restore();
}
function pfFlag(x,cx,by,h,label,tone,dir){
  dir=dir||1;
  x.strokeStyle=INKC; x.lineWidth=2.6; x.lineCap='round';
  x.beginPath(); x.moveTo(cx,by); x.lineTo(cx,by-h); x.stroke();
  const fw=Math.max(26,(label||'').length*5.6+10), fh=15;
  x.fillStyle=tone||'#c22a1c';
  x.beginPath(); x.moveTo(cx,by-h); x.lineTo(cx+dir*fw,by-h+3);
  x.lineTo(cx+dir*(fw-5),by-h+fh*0.55); x.lineTo(cx+dir*fw,by-h+fh);
  x.lineTo(cx,by-h+fh-2); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.4; x.stroke();
  if(label){ x.save(); x.fillStyle='#f6efdd'; x.textAlign='center';
    pfFitFont(x,label,fw-8,8.4,'600 %px Oswald,sans-serif');
    x.fillText(label,cx+dir*fw/2,by-h+fh*0.62); x.textAlign='left'; x.restore(); }
}
function pfGearBig(x,cx,cy,r,teeth,ang,tone){
  x.save(); x.translate(cx,cy); x.rotate(ang||0);
  x.fillStyle=tone||'#d9c8a2'; x.strokeStyle=INKC; x.lineWidth=Math.max(1.6,r*0.06);
  x.beginPath();
  for(let i=0;i<teeth*2;i++){ const rr=i%2?r*0.78:r, an=i*Math.PI/teeth;
    const px=Math.cos(an)*rr, py=Math.sin(an)*rr; i?x.lineTo(px,py):x.moveTo(px,py); }
  x.closePath(); x.fill(); x.stroke();
  x.beginPath(); x.arc(0,0,r*0.2,0,7); x.fillStyle='#2e2a22'; x.fill(); x.stroke();
  x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1.2;
  x.beginPath(); x.arc(0,0,r*0.52,0,7); x.stroke();
  x.restore();
}
function pfWireRun(x,ax,ay,bx,by,sag,o){
  o=o||{};
  x.strokeStyle=o.col||INKC; x.lineWidth=o.lw||1.6;
  x.beginPath(); x.moveTo(ax,ay);
  x.quadraticCurveTo((ax+bx)/2,Math.max(ay,by)+sag,bx,by); x.stroke();
}
function pfSmokeCurl(x,cx,cy,s,tone){
  x.strokeStyle=tone||'rgba(74,68,54,.65)'; x.lineWidth=2.2*s; x.lineCap='round';
  x.beginPath(); x.moveTo(cx,cy);
  x.bezierCurveTo(cx-5*s,cy-8*s,cx+6*s,cy-13*s,cx+1*s,cy-21*s);
  x.stroke();
}
function pfLadder(x,cx,by,h,ang){
  x.save(); x.translate(cx,by); x.rotate(ang||0);
  x.strokeStyle=INKC; x.lineWidth=2.2;
  x.beginPath(); x.moveTo(-5,0); x.lineTo(-5,-h); x.moveTo(5,0); x.lineTo(5,-h); x.stroke();
  x.lineWidth=1.7;
  for(let yy=-8;yy>-h;yy-=9){ x.beginPath(); x.moveTo(-5,yy); x.lineTo(5,yy); x.stroke(); }
  x.restore();
}
function pfBookBig(x,cx,cy,w,o){
  o=o||{};
  const h=w*0.62;
  x.save(); x.translate(cx,cy); x.rotate(o.ang||0);
  x.fillStyle=o.cover||'#8a3b2a';
  x.beginPath(); x.moveTo(-w/2-3,h/2+4); x.lineTo(w/2+3,h/2+4); x.lineTo(w/2+3,-h/2+8);
  x.lineTo(0,-h/2+2); x.lineTo(-w/2-3,-h/2+8); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
  x.fillStyle='#fdf8ea';
  for(const sgn of [-1,1]){
    x.beginPath(); x.moveTo(0,h/2);
    x.quadraticCurveTo(sgn*w*0.24,h/2-4,sgn*w*0.48,h/2-1);
    x.lineTo(sgn*w*0.48,-h/2+6); x.quadraticCurveTo(sgn*w*0.24,-h/2,0,-h/2+4);
    x.closePath(); x.fill(); x.strokeStyle=INKC; x.lineWidth=1.6; x.stroke();
    x.strokeStyle='rgba(35,28,18,.45)'; x.lineWidth=1;
    for(let i=1;i<5;i++){ x.beginPath(); x.moveTo(sgn*w*0.09,-h/2+8+i*(h-16)/5);
      x.lineTo(sgn*w*0.42,-h/2+6+i*(h-16)/5); x.stroke(); }
  }
  x.restore();
}
function pfEnvelope(x,cx,cy,w,ang,tone){
  const h=w*0.62;
  x.save(); x.translate(cx,cy); x.rotate(ang||0);
  x.fillStyle=tone||'#fdf8ea'; x.fillRect(-w/2,-h/2,w,h);
  x.strokeStyle=INKC; x.lineWidth=Math.max(1.1,w*0.05); x.strokeRect(-w/2,-h/2,w,h);
  x.beginPath(); x.moveTo(-w/2,-h/2); x.lineTo(0,h*0.12); x.lineTo(w/2,-h/2); x.stroke();
  x.restore();
}
function pfBellShape(x,cx,cy,s,tone){
  x.fillStyle=tone||'#e9c81f'; x.strokeStyle=INKC; x.lineWidth=2.2*s;
  x.beginPath(); x.moveTo(cx-11*s,cy);
  x.quadraticCurveTo(cx-11*s,cy-16*s,cx,cy-18*s);
  x.quadraticCurveTo(cx+11*s,cy-16*s,cx+11*s,cy);
  x.lineTo(cx+13*s,cy+2.6*s); x.lineTo(cx-13*s,cy+2.6*s); x.closePath(); x.fill(); x.stroke();
  x.fillStyle=INKC; x.beginPath(); x.arc(cx,cy+4.6*s,2.6*s,0,7); x.fill();
}
function pfBoatHull(x,cx,wy,w,tone){
  x.fillStyle=tone||'#3a352b';
  x.beginPath(); x.moveTo(cx-w/2,wy-w*0.10);
  x.quadraticCurveTo(cx-w*0.42,wy+w*0.10,cx-w*0.18,wy+w*0.11);
  x.lineTo(cx+w*0.30,wy+w*0.11);
  x.quadraticCurveTo(cx+w*0.52,wy+w*0.08,cx+w*0.5,wy-w*0.14);
  x.lineTo(cx+w*0.38,wy-w*0.02); x.lineTo(cx-w*0.34,wy-w*0.02);
  x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=Math.max(1.4,w*0.02); x.stroke();
}
function pfColumn(x,cx,by,w,h,tone){
  x.fillStyle=tone||'#e0d2a8';
  x.fillRect(cx-w/2,by-h,w,h);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(cx-w/2,by-h,w,h);
  x.fillRect(cx-w*0.72,by-h-6,w*1.44,6); x.strokeRect(cx-w*0.72,by-h-6,w*1.44,6);
  x.fillRect(cx-w*0.66,by-4,w*1.32,4); x.strokeRect(cx-w*0.66,by-4,w*1.32,4);
  x.strokeStyle='rgba(35,28,18,.4)'; x.lineWidth=1;
  for(let i=1;i<3;i++){ x.beginPath(); x.moveTo(cx-w/2+i*w/3,by-h+2); x.lineTo(cx-w/2+i*w/3,by-3); x.stroke(); }
}
function pfStatue(x,cx,by,s,o){
  /* a stone figure on a plinth — arms set by o.pose, o.broken knocks it */
  o=o||{};
  x.save(); x.translate(cx,by); if(o.tilt) x.rotate(o.tilt);
  x.fillStyle=o.tone||'#b9ab84'; x.strokeStyle=INKC;
  x.fillRect(-16*s,-6*s,32*s,6*s); x.lineWidth=1.8*s; x.strokeRect(-16*s,-6*s,32*s,6*s);
  const hY=-34*s;
  x.beginPath(); x.moveTo(-8*s,-6*s); x.lineTo(-6*s,hY+8*s); x.lineTo(6*s,hY+8*s); x.lineTo(8*s,-6*s);
  x.closePath(); x.fill(); x.stroke();
  if(!o.headless){ x.beginPath(); x.arc(0,hY+2*s,5.2*s,0,7); x.fill(); x.stroke(); }
  else { x.beginPath(); x.moveTo(-4*s,hY+7*s); x.lineTo(4*s,hY+9*s); x.stroke(); }
  x.lineWidth=4.2*s; x.lineCap='round';
  const aA=o.pose==='hail'?[-14,-16]:[-13,2], aB=o.pose==='hail'?[13,-14]:[12,4];
  x.beginPath(); x.moveTo(-6*s,hY+11*s); x.lineTo(aA[0]*s,hY+11*s+aA[1]*s); x.stroke();
  x.beginPath(); x.moveTo(6*s,hY+11*s); x.lineTo(aB[0]*s,hY+11*s+aB[1]*s); x.stroke();
  if(o.crack){ x.strokeStyle='rgba(35,28,18,.8)'; x.lineWidth=1.2*s;
    x.beginPath(); x.moveTo(-2*s,hY+9*s); x.lineTo(1*s,hY+16*s); x.lineTo(-3*s,hY+24*s); x.stroke(); }
  x.restore();
}
function pfCylDB(x,cx,by,w,h,tone){
  const ry=w*0.17;
  x.fillStyle=tone||'#7f95b0'; x.strokeStyle=INKC; x.lineWidth=Math.max(1.8,w*0.03);
  x.beginPath(); x.ellipse(cx,by-h,w/2,ry,0,0,7); x.fill();
  x.fillRect(cx-w/2,by-h,w,h-ry);
  x.beginPath(); x.ellipse(cx,by-ry,w/2,ry,0,0,Math.PI); x.fill();
  x.beginPath(); x.moveTo(cx-w/2,by-h); x.lineTo(cx-w/2,by-ry);
  x.moveTo(cx+w/2,by-h); x.lineTo(cx+w/2,by-ry); x.stroke();
  x.beginPath(); x.ellipse(cx,by-h,w/2,ry,0,0,7); x.stroke();
  x.beginPath(); x.ellipse(cx,by-ry,w/2,ry,0,0,Math.PI); x.stroke();
  x.strokeStyle='rgba(246,239,221,.55)'; x.lineWidth=Math.max(1.2,w*0.02);
  x.beginPath(); x.ellipse(cx,by-h*0.62,w/2,ry,0,0.15,Math.PI-0.15); x.stroke();
  x.beginPath(); x.ellipse(cx,by-h*0.34,w/2,ry,0,0.15,Math.PI-0.15); x.stroke();
}
function pfFrame(x,cx,cy,w,h,seed,o){
  /* one framed picture, its little painting seeded — no two frames alike */
  o=o||{};
  const rng=mulberry(seed);
  x.fillStyle=o.gold?'#caa53c':'#6b5636';
  x.fillRect(cx-w/2,cy-h/2,w,h);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(cx-w/2,cy-h/2,w,h);
  const iw=w-10,ih=h-10;
  x.fillStyle='#f2e7c9'; x.fillRect(cx-iw/2,cy-ih/2,iw,ih);
  x.strokeStyle=INKC; x.lineWidth=1.1; x.strokeRect(cx-iw/2,cy-ih/2,iw,ih);
  const kind=o.kind!=null?o.kind:Math.floor(rng()*4);
  x.save(); x.beginPath(); x.rect(cx-iw/2,cy-ih/2,iw,ih); x.clip();
  if(kind===0){ /* little mountain scene */
    x.fillStyle='#9fb7c6'; x.fillRect(cx-iw/2,cy-ih/2,iw,ih*0.6);
    x.fillStyle='#5b6b52';
    x.beginPath(); x.moveTo(cx-iw/2,cy+ih/2);
    x.lineTo(cx-iw*0.15,cy-ih*0.2); x.lineTo(cx+iw*0.2,cy+ih/2); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(cx-iw*0.05,cy+ih/2); x.lineTo(cx+iw*0.3,cy-ih*0.05);
    x.lineTo(cx+iw/2,cy+ih/2); x.closePath(); x.fill();
  } else if(kind===1){ /* portrait bust */
    x.fillStyle='#d9b98c';
    x.beginPath(); x.arc(cx,cy-ih*0.12,ih*0.2,0,7); x.fill();
    x.fillStyle='#7a4a3a';
    x.beginPath(); x.moveTo(cx-iw*0.3,cy+ih/2); x.quadraticCurveTo(cx,cy-ih*0.05,cx+iw*0.3,cy+ih/2);
    x.closePath(); x.fill();
  } else if(kind===2){ /* still life dots */
    x.fillStyle='#8a3b2a'; x.beginPath(); x.arc(cx-iw*0.15,cy+ih*0.1,ih*0.16,0,7); x.fill();
    x.fillStyle='#e9c81f'; x.beginPath(); x.arc(cx+iw*0.14,cy+ih*0.14,ih*0.12,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1; x.beginPath(); x.moveTo(cx-iw/2,cy+ih*0.3); x.lineTo(cx+iw/2,cy+ih*0.3); x.stroke();
  } else { /* abstract diagonals */
    x.strokeStyle='#31647e'; x.lineWidth=2.4;
    for(let i=0;i<4;i++){ x.beginPath(); x.moveTo(cx-iw/2+i*iw/3.4,cy-ih/2);
      x.lineTo(cx-iw/2+i*iw/3.4-ih*0.4,cy+ih/2); x.stroke(); }
  }
  x.restore();
}
function pfWindowGlow(x,cx,cy,w,h,night){
  x.fillStyle=night?'#e9c81f':'#cfe0e8';
  x.fillRect(cx-w/2,cy-h/2,w,h);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(cx-w/2,cy-h/2,w,h);
  x.lineWidth=1.2;
  x.beginPath(); x.moveTo(cx,cy-h/2); x.lineTo(cx,cy+h/2);
  x.moveTo(cx-w/2,cy); x.lineTo(cx+w/2,cy); x.stroke();
}

/* ---- the lexicon: the page's concepts choose the drawn subject ----
   Ordered rules, most specific first. Each returns a subject id plus the
   parameters the painter needs, pulled from the page's OWN words. */
const PF_RULES=[
  ['edict',      t=>/\/breaking-changes\//.test(t.slug)],
  ['embassy',    t=>/-providers\/(?!.*new-provider)/.test(t.slug)&&!/media-library|email/.test(t.slug)],
  ['embassy',    t=>/media-library-providers\/|email-custom|email-nodemailer/.test(t.slug)],
  ['forgeshield',t=>/new-provider-guide/.test(t.slug)],
  ['masonry',    t=>/content-type-builder|server-content-types/.test(t.txt)],
  ['doors',      t=>/\brbac\b|role-based|admin permissions/.test(t.txt)],
  ['counter',    t=>/users?[ -]?(&|and)?[ -]?permissions(?!.*provider)/.test(t.txt)],
  ['vault',      t=>/api tokens?|admin tokens?/.test(t.txt)],
  ['ledger',     t=>/audit logs?|usage information/.test(t.txt)],
  ['meters',     t=>/billing|usage & billing/.test(t.txt)],
  ['gatebanners',t=>/single sign-on|\bsso\b/.test(t.txt)],
  ['gallery',    t=>/media library/.test(t.txt)],
  ['quay',       t=>/docker/.test(t.txt)],
  ['wires',      t=>/webhook/.test(t.txt)],
  ['bellpost',   t=>/email/.test(t.txt)],
  ['belfry',     t=>/notification/.test(t.txt)],
  ['clockworks', t=>/\bcron\b|schedule/.test(t.txt)],
  ['constellation',t=>/graphql/.test(t.txt)],
  ['organ',      t=>/interactive query builder/.test(t.txt)],
  ['oracle',     t=>/\bai\b|mcp server|ai for/.test(t.txt)],
  ['codex',      t=>/openapi/.test(t.txt)],
  ['scriptorium',t=>/document service api$|\/api\/document-service$|document concept/.test(t.txt)],
  ['gearworks',  t=>/query engine api$|query-engine$/.test(t.txt)],
  ['temple',     t=>/rest api|\/api\/rest$|endpoints?/.test(t.txt)],
  ['aqueduct',   t=>/content apis? introduction|\/api\/content-api/.test(t.txt)],
  ['barge',      t=>/data (import|export|management|transfer)|transfer locally|\bimport\b|\bexport\b/.test(t.txt)],
  ['canallocks', t=>/database migrations/.test(t.txt)],
  ['bridge',     t=>/migration|upgrade|codemod|v4.*v5|step-by-step/.test(t.txt)],
  ['gantry',     t=>/deploy/.test(t.txt)],
  ['lighthouse', t=>/observability|monitor|sentry/.test(t.txt)],
  ['ticker',     t=>/\blogs?\b/.test(t.txt)],
  ['press',      t=>/draft (&|and) publish|draft-and-publish/.test(t.txt)],
  ['pressgate',  t=>/publication[ -]filter/.test(t.txt)],
  ['corridor',   t=>/content history/.test(t.txt)],
  ['editions',   t=>/releases?\b|release notes|what's new|changelog/.test(t.txt)],
  ['spyglass',   t=>/preview/.test(t.txt)],
  ['relay',      t=>/review workflows?/.test(t.txt)],
  ['stairflag',  t=>/quick start|getting started|setting up|first steps/.test(t.txt)],
  ['toolbox',    t=>/installation\b|\/cms\/installation/.test(t.txt)],
  ['cutaway',    t=>/project structure|plugin structure/.test(t.txt)],
  ['switchyard', t=>/\broutes?\b|routing/.test(t.txt)],
  ['tollroad',   t=>/middleware/.test(t.txt)],
  ['tribunal',   t=>/polic(y|ies)|validation|sanitiz/.test(t.txt)],
  ['funnelworks',t=>/filter/.test(t.txt)],
  ['marshalling',t=>/sort|order|pagination/.test(t.txt)],
  ['magnetwell', t=>/populat/.test(t.txt)],
  ['chains',     t=>/relations?\b/.test(t.txt)],
  ['flags',      t=>/internationalization|locale|localization|translation|i18n/.test(t.txt)],
  ['semaphore',  t=>/\bstatus\b/.test(t.txt)],
  ['cylinders',  t=>/database|transactions?\b/.test(t.txt)],
  ['weathervanes',t=>/environment|env variables|variables/.test(t.txt)],
  ['monolith',   t=>/\bcli\b|command line|commands/.test(t.txt)],
  ['helm',       t=>/admin panel$|the admin panel|features\/admin-panel/.test(t.txt)],
  ['atelier',    t=>/admin-panel-customization|wysiwyg|favicon|logos|theme|homepage customization|bundlers/.test(t.txt)],
  ['kitchen',    t=>/examples|cookbook/.test(t.txt)],
  ['bluedesk',   t=>/typescript|models\b|customization$|back-?end customization/.test(t.txt)],
  ['kitchen',    t=>/examples|cookbook/.test(t.txt)],
  ['bazaar',     t=>/marketplace/.test(t.txt)],
  ['plugbay',    t=>/plugin/.test(t.txt)],
  ['automaton',  t=>/lifecycle|functions\b|hooks?\b/.test(t.txt)],
  ['gauntlet',   t=>/testing/.test(t.txt)],
  ['safetynet',  t=>/error handling|errors\b/.test(t.txt)],
  ['moulds',     t=>/templates?\b/.test(t.txt)],
  ['roundtable', t=>/collaboration|community/.test(t.txt)],
  ['kiosk',      t=>/\bfaq\b|support/.test(t.txt)],
  ['codex',      t=>/documentation plugin|docs\b/.test(t.txt)],
  ['gearworks',  t=>/configuration|configurations|settings|server\b|features$|options/.test(t.txt)],
  ['spanner',    t=>/strapi-utils|utils|upgrade tool|tooling|client\b|sdk/.test(t.txt)],
  ['magnetwell', t=>/fields?\b|select/.test(t.txt)],
  ['bluedesk',   t=>/develop|custom/.test(t.txt)],
  ['temple',     t=>/\bapi\b|crud|operations|query engine|document service|entity service|requests/.test(t.txt)],
  ['skyharbor',  t=>/cloud/.test(t.txt)],
];
/* the provider row: each foreign gate carries its OWN drawn emblem */
const PF_EMBLEMS=['discord','github','google','microsoft','keycloak','okta','auth-zero',
  'aws-cognito','facebook','instagram','linkedin','patreon','reddit','twitch','twitter',
  'vk','cas','amazon-s3','cloudinary','local-upload','nodemailer','mailgun'];
function pfProviderOf(slug){
  const last=slug.split('/').pop();
  for(const e of PF_EMBLEMS) if(last.indexOf(e)>=0) return e;
  if(/email-custom/.test(slug)) return 'nodemailer';
  return last;
}
function pfSubjectFor(slug, meta, series){
  const txt=(String(meta.title||'')+' '+String(meta.fullTitle||'')+' '+slug).toLowerCase();
  const t={slug, txt};
  for(const [id,test] of PF_RULES){ if(test(t)) return id; }
  return 'monogram';
}
/* the edict family reads its verdict from the page's own verb */
function pfEdictMode(title){
  const s=String(title||'').toLowerCase();
  if(/instead of|replaced by|replaces|uses? | use /.test(s)) return 'handover';
  if(/removed|removes\b/.test(s)) return 'toppled';
  if(/deprecated/.test(s)) return 'roped';
  if(/unsupported|no longer|no .*support|not the default|\bno\b/.test(s)) return 'boarded';
  if(/refactored|rewritten|updated|modified|shortened|moved/.test(s)) return 'scaffold';
  return 'newflag';
}
/* the figure takes the pose the title's verb demands */
function pfPoseFor(txt,h){
  const s=txt.toLowerCase();
  if(/deploy|publish|launch|release|ship/.test(s)) return ['leap','fly'][h%2];
  if(/delete|remov|unsupported|breaking|deprecat|error/.test(s)) return 'warn';
  if(/migrat|upgrad|transfer|step|import|export|install/.test(s)) return ['run','lift'][h%2];
  if(/token|permission|secur|role|sso|auth|protect/.test(s)) return ['brace','stand'][h%2];
  if(/creat|add|new|build|setup|custom/.test(s)) return ['lift','point'][h%2];
  if(/config|setting|option|variable|cli|command/.test(s)) return ['console','point'][h%2];
  if(/understand|intro|concept|overview|structure|faq/.test(s)) return ['think','monologue'][h%2];
  return ['stand','point','raise','think'][h%4];
}

/* ---- the design solver: page structure chooses the composition ---- */
const PF_TERRAIN={doors:'interior',vault:'interior',ledger:'interior',meters:'interior',
  counter:'interior',gallery:'interior',press:'interior',tribunal:'interior',
  funnelworks:'interior',bluedesk:'interior',kitchen:'interior',plugbay:'interior',
  automaton:'interior',roundtable:'interior',atelier:'interior',oracle:'interior',
  organ:'interior',moulds:'interior',codex:'interior',corridor:'interior',scriptorium:'interior',
  forgeshield:'interior',spanner:'interior',
  quay:'water',barge:'water',canallocks:'water',lighthouse:'water',helm:'water',
  semaphore:'water',
  monolith:'desert',
  wires:'hills',temple:'hills',aqueduct:'hills',bridge:'hills',tollroad:'hills',
  chains:'hills',stairflag:'hills',sentrybox:'hills',
  constellation:'field',gantry:'field',signpost:'field',switchyard:'field',
  marshalling:'field',magnetwell:'field',cylinders:'field',gauntlet:'field',
  toolbox:'field',
  skyharbor:'sky',
  masonry:'city',gatebanners:'city',bellpost:'interior',belfry:'city',clockworks:'city',
  edict:'city',editions:'city',spyglass:'city',cutaway:'city',flags:'city',
  weathervanes:'city',bazaar:'city',safetynet:'city',kiosk:'city',embassy:'city',
  ticker:'city',relay:'city',pressgate:'interior',gearworks:'interior'};
const PF_NIGHTY={constellation:1,lighthouse:1,ticker:0.8,spyglass:0.6,belfry:0.5,
  clockworks:0.5,sentrybox:0.7,editions:0.3,wires:0.6};
/* ---- the art-direction ledger: per-page layout re-rolls, tuned by eye
   against the pairwise contact sheets. A page listed here re-shuffles its
   OWN composition genome (never a shared scene) so no two plates in the
   whole atlas rhyme at thumbnail scale. ---- */
/*ARTDIR-BEGIN*/
const PF_ARTDIR={"/cms/plugins/installing-plugins-via-marketplace":1,"/cms/configurations/users-and-permissions-providers/instagram":3,"/cms/configurations/sso-providers/discord":3,"/cms/migration/v4-to-v5/breaking-changes/database-identifiers-shortened":2,"/cms/api/graphql/locale":1,"/cms/api/graphql":4,"/cms/api/document-service/middlewares":2,"/cms/configurations/sso-providers/keycloak":6,"/cms/api/document-service/locale":6,"/cms/migration/v4-to-v5/breaking-changes/mysql5-unsupported":4,"/cms/migration/v4-to-v5/breaking-changes/publication-state-removed":1,"/cms/migration/v4-to-v5/breaking-changes/attributes-and-content-types-names-reserved":11,"/cms/configurations/users-and-permissions-providers/auth-zero":4,"/cms/backend-customization/examples/middlewares":4,"/cms/migration/v4-to-v5/breaking-changes/strapi-container":1,"/cms/api/query-engine/populating":2,"/cms/configurations/users-and-permissions-providers/keycloak":1,"/cms/configurations/guides/access-cast-environment-variables":6,"/cms/migration/v4-to-v5/breaking-changes/components-and-dynamic-zones-do-not-return-id":3,"/cms/plugins-development/plugin-sdk":3,"/cms/features/content-type-builder":1,"/cms/admin-panel-customization/homepage":7,"/cms/project-structure":1,"/cms/api/rest":3,"/cms/api/query-engine/single-operations":3,"/cms/plugins-development/server-api":3,"/cms/configurations/media-library-providers/cloudinary":2,"/cms/configurations":1,"/cms/api/query-engine/order-pagination":1,"/cloud/projects/notifications":4,"/cms/quick-start":1,"/cms/features/data-management/export":3,"/cms/configurations/features":7,"/cms/community":1,"/cms/configurations/users-and-permissions-providers/cas":6,"/cms/typescript":2,"/cms/plugins-development/server-routes":6,"/cms/features/data-management/import":5,"/cms/migration/v4-to-v5/breaking-changes/morph-many-serialization":3,"/cms/api/rest/sort-pagination":2,"/cloud/getting-started/caching":2,"/cms/api/rest/locale":1,"/cloud/projects/collaboration":16,"/cms/api/document-service/fields":1,"/cms/api/entity-service/filter":3,"/cms/api/rest/guides/populate-creator-fields":3,"/cms/migration/v4-to-v5/breaking-changes/edit-view-layout-and-list-view-layout-rewritten":5,"/cms/plugins-development/developing-plugins":1,"/cms/migration/v4-to-v5/breaking-changes/remove-webhook-populate-relations":1,"/cms/plugins-development/server-controllers-services":1,"/cms/plugins-development/server-configuration":4,"/cloud/advanced/email":7,"/cms/plugins-development/plugin-structure":1,"/cloud/advanced/upload":2,"/cloud/cli/cloud-cli":4,"/cms/plugins/documentation":3,"/cms/migration/v4-to-v5/breaking-changes/helper-plugin-deprecated":1,"/cms/api/content-api":1,"/cms/admin-panel-customization/locales-translations":12,"/cms/api/query-engine/filtering":4,"/cms/backend-customization/middlewares":2,"/cms/backend-customization/examples/routes":1,"/cms/configurations/plugins":3,"/cms/configurations/users-and-permissions-providers/vk":3,"/cms/migration/v4-to-v5/breaking-changes/strict-requirements-config-files":2,"/cms/faq":3,"/cms/migration/v4-to-v5/breaking-changes/only-mysql2-package-for-mysql":2,"/cms/features/custom-fields":3,"/cms/api/entity-service/populate":4,"/cms/ai/docs-mcp-server":6,"/cms/ai/for-developers":4,"/cms/configurations/admin-panel":6,"/cms/migration/v4-to-v5/breaking-changes/publishedat-always-set-when-dandp-disabled":6,"/cms/api/rest/relations":1,"/cms/features/review-workflows":1,"/cms/api/document-service/publication-filter":1,"/cms/configurations/media-library-providers":1,"/cms/migration/v4-to-v5/breaking-changes/strapi-imports":7,"/cms/api/rest/filters":3,"/cms/api/rest/status":2,"/cms/database-migrations":3,"/cms/backend-customization/controllers":2,"/cms/backend-customization/guides/customizing-users-permissions-plugin-routes":1,"/cms/configurations/functions":1,"/cms/intro":3,"/cms/configurations/guides/access-configuration-values":1,"/cms/configurations/sso-providers/google":1,"/cms/configurations/typescript":3,"/cms/migration/v4-to-v5/breaking-changes/lifecycle-hooks-document-service":1,"/cms/features/admin-tokens":2,"/cms/error-handling":1,"/cms/features/internationalization":9,"/cms/upgrades":2,"/cms/migration/v4-to-v5/breaking-changes/reserved-attributes-status":3,"/cloud/getting-started/deployment":10,"/cms/api/entity-service/crud":5,"/cms/configurations/guides/configure-sso":4,"/cms/configurations/users-and-permissions-providers/github":1,"/cms/migration/v4-to-v5/breaking-changes/register-allowed-fields":1,"/cms/migration/v4-to-v5/breaking-changes/model-config-path-uses-uid":4,"/cms/backend-customization/policies":7,"/cloud/projects/settings":3,"/cms/migration/v4-to-v5/breaking-changes/only-better-sqlite3-for-sqlite":1,"/cms/plugins-development/admin-fetch-client":6,"/cms/admin-panel-customization/host-port-path":6,"/cms/backend-customization/services":3,"/cloud/account/account-billing":1,"/cms/backend-customization/examples/policies":2,"/cms/api/client":2,"/cms/api/document":3,"/cms/backend-customization/examples/authentication":3,"/cms/features/draft-and-publish":1,"/cms/features/strapi-mcp-server":2,"/cms/plugins-development/guides/create-components-for-plugins":3,"/cms/plugins-development/server-lifecycle":1,"/cms/features/sso":1,"/cms/plugins-development/admin-navigation-settings":1,"/cms/database-transactions":8,"/cms/features/api-tokens":3,"/cms/typescript/development":1,"/cms/api/graphql/advanced-queries":5,"/cms/typescript/adding-support-to-existing-project":5,"/cms/configurations/users-and-permissions-providers/reddit":1,"/cms/templates":2,"/cms/configurations/users-and-permissions-providers/aws-cognito":6,"/cms/configurations/users-and-permissions-providers/google":3,"/release-notes":2,"/cms/migration/v4-to-v5/breaking-changes/templates":3,"/cms/admin-panel-customization/wysiwyg-editor":1,"/cms/configurations/sso-providers/github":4,"/cms/customization":1,"/cms/configurations/database":4,"/cms/migration/v4-to-v5/breaking-changes/fetch":2,"/release-notes-archives":1,"/cms/migration/v4-to-v5/additional-resources/plugins-migration":6,"/cms/migration/v4-to-v5/breaking-changes/graphql-api-updated":4,"/cms/api/rest/parameters":1,"/cms/plugins-development/admin-localization":4,"/cms/migration/v4-to-v5/breaking-changes/inject-content-manager-component":1,"/cms/configurations/users-and-permissions-providers/twitch":7,"/cloud/getting-started/deployment-options":1,"/cms/configurations/sso-providers/microsoft":2,"/cms/migration/v4-to-v5/breaking-changes/watch-admin-enabled-by-default":3,"/cms/usage-information":2,"/cms/features/data-management":6,"/cms/configurations/users-and-permissions-providers/discord":2,"/cms/plugins-development/guides/store-and-access-data":2,"/cms/plugins-development/server-policies-middlewares":1,"/cms/configurations/email-custom-providers":2,"/cloud/advanced/upload-size-limits":1,"/cms/configurations/media-library-providers/amazon-s3":4,"/cms/ai/for-content-managers":4,"/cms/migration/v4-to-v5/breaking-changes/mailgun-provider-variables":5,"/cms/migration/v4-to-v5/breaking-changes/use-document-id":2,"/cms/migration/v4-to-v5/breaking-changes/no-find-page-in-document-service":3,"/cms/testing":1,"/cms/migration/v4-to-v5/breaking-changes/server-default-log-level":1,"/cms/migration/v4-to-v5/breaking-changes/removed-support-for-some-env-options":1,"/cms/plugins-development/create-a-plugin":4,"/cms/backend-customization":1,"/cms/configurations/email-nodemailer":1,"/cloud/getting-started/usage-billing":2,"/cms/plugins-development/admin-hooks":1,"/cms/migration/v4-to-v5/breaking-changes/yarn-not-default":1,"/cms/migration/v4-to-v5/additional-resources/helper-plugin":1,"/cms/plugins/sentry":1,"/cms/typescript/guides":2,"/cms/plugins-development/content-manager-apis":2,"/cms/features/users-permissions":1,"/cms/migration/v4-to-v5/breaking-changes/react-router-dom-6":2,"/cms/api/rest/interactive-query-builder":1,"/cms/plugins-development/server-content-types":2,"/cms/configurations/users-and-permissions-providers/new-provider-guide":5,"/cms/migration/v4-to-v5/breaking-changes/entity-service-deprecated":1,"/cms/plugins-development/guides/pass-data-from-server-to-admin":1,"/cms/api/document-service/populate":6,"/cms/backend-customization/examples":1,"/cms/billing-portal":1,"/cms/configurations/users-and-permissions-providers/patreon":4,"/cloud/projects/overview":5,"/cms/api/document-service/filters":4,"/cms/features/audit-logs":1,"/cms/migration/v4-to-v5/breaking-changes/webpack-aliases-removed":2,"/cms/backend-customization/requests-responses":6,"/cms/deployment":3,"/cms/admin-panel-customization/extension":1,"/cms/configurations/users-and-permissions-providers":1,"/cms/admin-panel-customization/bundlers":1,"/cms/admin-panel-customization/theme-extension":3,"/cms/api/entity-service":3,"/cms/configurations/environment":7,"/cms/configurations/guides/rbac":1,"/cms/features/rbac":2,"/cms/configurations/server":1,"/cms/api/rest/populate-select":4,"/cms/migration/v4-to-v5/breaking-changes":2,"/cms/api/document-service/status":3,"/cms/configurations/sso-providers/okta":1,"/cms/configurations/users-and-permissions-providers/facebook":1,"/cms/configurations/cron":1,"/cms/api/rest/guides/understanding-populate":2,"/cms/features/users-permissions/graphql-api":1,"/cms/backend-customization/routes":2,"/cms/installation":3,"/cms/api/openapi":1};
/*ARTDIR-END*/
/* ---- the breaking-change pages read their OWN subject: the thing that
   broke is the thing that is drawn. mailgun variables break in the mail
   hall, better-sqlite3 breaks among the silos, strapi imports break on
   the freight barge — never twice in the same square. ---- */
const EDICT_RIGS=[
  [/mailgun|nodemailer|sendmail|\bmail\b|email/,'bellpost'],
  [/sqlite|mysql|postgres|database|\bdb\b/,'cylinders'],
  [/upload|media/,'gallery'],
  [/graphql/,'constellation'],
  [/webhook/,'wires'],
  [/i18n|locale|translation|internationaliz/,'flags'],
  [/token/,'vault'],
  [/permission|rbac|\brole\b|users?[ -]and[ -]permissions/,'doors'],
  [/document.?service|entity.?service/,'scriptorium'],
  [/query.?engine/,'gearworks'],
  [/\broutes?\b/,'switchyard'],
  [/middleware/,'tollroad'],
  [/polic|sanitiz|validat/,'tribunal'],
  [/filter/,'funnelworks'],
  [/sort|paginat|order/,'marshalling'],
  [/populat/,'magnetwell'],
  [/relations?\b/,'chains'],
  [/plugin/,'plugbay'],
  [/vite|webpack|bundl|watch-admin/,'atelier'],
  [/\bcli\b|command|argument/,'monolith'],
  [/admin panel|the admin\b|homepage/,'helm'],
  [/component|dynamic.?zone|content.?type|attribute|field/,'masonry'],
  [/import|export|transfer|strapi.?factory|package/,'barge'],
  [/fetch|axios|\bhttp\b|request|rest\b|endpoint/,'temple'],
  [/draft|publish/,'press'],
  [/preview/,'spyglass'],
  [/helper|util|strapi-utils/,'spanner'],
  [/typescript|\bmodels?\b/,'bluedesk'],
  [/config|server|option|\benv\b|environment|setting/,'gearworks'],
  [/lifecycle|hook/,'automaton'],
  [/log\b|logs\b|logger/,'ticker'],
  [/session|sso|auth/,'gatebanners'],
];
function pfEdictRig(slug,m){
  const txt=(String(m.title||'')+' '+String(m.fullTitle||'')+' '+slug.split('/').pop()).toLowerCase();
  for(const [re,rig] of EDICT_RIGS){ if(re.test(txt)) return rig; }
  return null; /* the bare plaza, itself re-staged per page */
}
function pfDesign(slug, meta, series){
  const seed=hash32('plate'+slug);
  const h=hash32('forge'+slug);
  const salt=(typeof window!=='undefined'&&window.__fcArtSalt&&window.__fcArtSalt[slug]!=null)
    ?window.__fcArtSalt[slug]:(PF_ARTDIR[slug]||0);
  /* the genome hash: the page's own name + its art-direction re-rolls */
  const gh=hash32('genome:'+slug+':'+salt);
  const m=meta||{}; const st=m.stats||{words:300,code:0,img:0,table:0,admon:0,steps:0,paras:6,tabs:0};
  /* REAL headings, deduped — a page that says SETTINGS four times still
     letters its picture only once per word */
  const seenH2=new Set(), seenH3=new Set();
  /* dedupe on the LETTERED form: two headings that would paint the same
     short word keep only their first appearance on the plate */
  const heads=(m.heads||[]).filter(x=>x.l===2).filter(x=>{
    const k2=pfShort(String(x.t),18).toUpperCase(); if(seenH2.has(k2))return false; seenH2.add(k2); return true;});
  const heads3=(m.heads||[]).filter(x=>x.l===3).filter(x=>{
    const k3=pfShort(String(x.t),18).toUpperCase();
    if(seenH3.has(k3)||seenH2.has(k3))return false; seenH3.add(k3); return true;});
  const sub=pfSubjectFor(slug,m,series);
  /* a breaking-change page reads its OWN subject: the thing that broke is
     the thing that is drawn */
  const edict=sub==='edict'?pfEdictMode(m.title):null;
  const rig=sub==='edict'?pfEdictRig(slug,m):null;
  const rigSub=rig||sub;
  let terrain=PF_TERRAIN[rigSub]||['city','hills','field'][h%3];
  if(rigSub==='monolith'&&(m.product==='cloud'||/cloud/.test(slug))) terrain='sky';
  /* the hour: seeded, bent by what the subject wants of the sky; one page
     in five swings its hour to the far side of the day */
  let tod=((h>>>3)%97)/97;                        /* 0 dawn → .5 dusk → 1 night */
  const nightBias=PF_NIGHTY[rigSub]||0;
  tod=clamp(tod*(1-nightBias)+nightBias*(0.8+((h>>>5)%20)/100),0,1);
  if(!nightBias&&((gh>>>27)%5)===0) tod=clamp(1-tod,0,1);
  const night=tod>0.72, dusk=tod>0.45&&!night, dawn=tod<0.18;
  const interiorBase=terrain==='interior';
  /* THE COMP GENOME — the macro-composition is dealt from the page's own
     numbers, never from the subject: the same subject stands in a vista on
     one page, fills a close-up on the next, burns inside an iris on a third */
  const compRoll=(gh>>>2)%20;
  let comp;
  if(interiorBase) comp= compRoll<8?'interior': compRoll<12?'closeup'
                       : compRoll<15?'iris'   : compRoll<18?'panel':'closeup';
  else             comp= compRoll<7?'vista'  : compRoll<11?'closeup'
                       : compRoll<14?'iris'   : compRoll<17?'worm':'panel';
  if(comp==='panel'&&(heads.length+heads3.length)<2) comp=interiorBase?'closeup':'vista';
  if(terrain==='sky'&&comp==='worm') comp='vista';
  const interior=(comp==='interior')||(interiorBase&&(comp==='panel'||comp==='iris'));
  /* structure → skeleton: the horizon walks the whole wall, page by page */
  const wordsN=clamp((st.words||0)/1500,0,1);
  let hz;
  if(comp==='worm')            hz=0.56+((gh>>>5)%18)/100;
  else if(terrain==='sky')     hz=0.42+((gh>>>5)%26)/100;
  else                         hz=clamp(0.17+((gh>>>5)%36)/100+wordsN*0.06,0.16,0.58);
  /* the focal side swings with the page's own heading arithmetic */
  const sideRoll=((heads.length*3+heads3.length+String(m.title||'').length)+(gh>>>9))%5;
  const fx=[0.26,0.38,0.5,0.62,0.72][sideRoll];
  const primeW=clamp(0.48+((h>>>11)%17)*0.014+st.img*0.006,0.48,0.74);
  const prime={x:clamp(fx-primeW/2,0.02,0.96-primeW), y:0, w:primeW, h:0};
  /* the flat field behind a close-up or around an iris: eight tones, from
     bare paper to deep night ink — the plate's whole polarity turns on it */
  const field=['paper','C25','M25','Y25','dark','deepblue','rays','dots','dark'][(gh>>>6)%9];
  /* iris: the page's subject seen through its own lens */
  /* iris deal: r16 tried widening centre/radius spread (jz1 residual
     note) — both wider deals REGRESSED the hard gate (maxNCC40 0.6506
     then 0.8273 vs 0.5788, pairs>=0.60 appearing) because re-dealt discs
     collide on new pages; the certified spread below is the measured
     optimum of the deals tried, so it stands */
  const iris={cx:0.35+((gh>>>8)%31)/100, cy:0.37+((gh>>>10)%15)/100, r:0.29+((gh>>>13)%9)/100};
  /* panel: a predella of the page's own sections under (or over) the scene */
  const panel={frac:0.66+((gh>>>15)%14)/100, top:((gh>>>17)&1)===1};
  /* rig scale: how far the vantage leans into the subject */
  const rigK= comp==='closeup'?1.35+((gh>>>18)%40)/100
            : comp==='worm'  ?1.16+((gh>>>18)%22)/100
            : comp==='iris'  ?1.00+((gh>>>18)%22)/100
            : 1+((gh>>>18)%12)/100;
  const shelfY=0.80+((gh>>>16)%8)/100;   /* the close-up's ground shelf */
  /* stations: one per real h2, marching along the page's own path */
  const k=Math.min(heads.length, interior?3:(2+((gh>>>7)%3)));
  const stations=[];
  const pathX0=fx<0.5?0.72:0.28;
  for(let i=0;i<k;i++){
    const tn=k===1?0.55:(i/(k-1));           /* 0 = far, 1 = near our feet */
    const sy=clamp(hz+0.07+tn*(0.80-hz-0.07),hz+0.05,0.82);
    const side=(i%2?1:-1)*(0.13+tn*0.10);
    let sx=clamp(fx+(pathX0-fx)*tn+side,0.08,0.92);
    stations.push({fx:sx, fy:sy, s:0.62+tn*0.62,
      text:pfShort(heads[i].t,20).toUpperCase(), prop:propFor(heads[i].t)});
  }
  /* the predella cells: the page's own h3s (h2s when it has no h3s) */
  const predSrc=(heads3.length?heads3:heads).slice(0,3);
  const pred=predSrc.map(x2=>({text:pfShort(x2.t,16).toUpperCase(), prop:propFor(x2.t)}));
  /* the hero walks in at the scale the vantage allows */
  const pose=pfPoseFor(String(m.title||'')+' '+slug,(h>>>15));
  const light= night?{mode:'rim',dir:[fx<0.5?-0.8:0.8,-0.3],tint:'rgba(210,220,255,.45)'}
            : dusk?{mode:'screen',at:[tod>0.58?0.12:0.88,0.2],tint:'rgba(255,196,84,.4)'}
            : dawn?{mode:'screen',at:[0.85,0.15],tint:'rgba(255,224,150,.4)'}:null;
  let figs;
  if(comp==='closeup'){
    /* a small witness at the foot of the giant subject */
    const fh=0.15+((h>>>13)%5)*0.012;
    const fxF=((gh>>>12)&1)?0.08+((gh>>>14)%8)/100:0.76+((gh>>>14)%10)/100;
    figs=[{kind:'hero',pose,box:[fxF,shelfY-fh+0.03,fh*0.62,fh],
      flip:fxF>0.5, noFx:true, light}];
  } else if(comp==='iris'){
    /* the hero stands OUTSIDE the lens, shown the vision */
    const fh=0.20+((h>>>13)%6)*0.012;
    const fxF=iris.cx<0.5?0.74+((gh>>>14)%10)/100:0.06+((gh>>>14)%8)/100;
    figs=[{kind:'hero',pose:'point',box:[fxF,0.93-fh,fh*0.62,fh],
      flip:fxF>iris.cx, noFx:true, light}];
  } else if(comp==='worm'){
    /* the worm's-eye witness looms in the near corner, looking up */
    const fh=0.30+((h>>>13)%8)*0.012;
    const fxF=fx<0.5?0.72+((gh>>>14)%10)/100:0.04+((gh>>>14)%8)/100;
    figs=[{kind:'hero',pose:['raise','point','think','warn'][(gh>>>20)%4],
      box:[fxF,0.97-fh,fh*0.62,fh], flip:fxF>fx, noFx:true, light}];
  } else {
    const figH=interior?0.36+((h>>>13)%7)*0.012:0.26+((h>>>13)%9)*0.010;
    let figX=fx<0.5?clamp(fx+primeW/2+0.06,0.05,0.78):clamp(fx-primeW/2-0.26,0.03,0.78);
    /* the hero's berth walks with the page, not with the wall: four
       stations dealt from the genome — no fixed lower-band post */
    const berth=(gh>>>28)%4;
    if(interior){
      if(berth===1) figX=clamp(fx+(fx<0.5?-0.30:0.30),0.05,0.80);
      else if(berth===2) figX=clamp((fx<0.5?0.66:0.14)+((gh>>>26)%8)/100,0.05,0.80);
      else if(berth===3) figX=clamp(0.44+(((gh>>>26)%9)-4)/50,0.05,0.80);
    } else figX=clamp(figX+(berth-1.5)*0.045,0.03,0.80);
    const groundY=interior?(0.90+((gh>>>19)%7)*0.011)
                 :(comp==='panel'?0.90:0.90+((h>>>17)%4)*0.01);
    figs=[{kind:'hero',pose,box:[figX,groundY-figH,figH*0.62,figH],
      flip:figX>fx, noFx:true, light}];
    if(comp==='panel'){ /* the hero keeps to the main register */
      const f0=figs[0];
      if(panel.top) f0.box[1]=clamp(f0.box[1],1-panel.frac+0.02,0.96-f0.box[3]);
      else f0.box[1]=Math.min(f0.box[1],panel.frac-f0.box[3]-0.01);
    }
  }
  /* weather and crowd from the body's own counts */
  const weather={clouds:clamp(Math.round((st.paras||0)/8),0,3),
    streaks:clamp(st.admon||0,1,6), birds:clamp(st.img||0,0,4)};
  const crowdN=clamp(m.inb||0,0,12);
  /* the near dark, the last-pass light, the letter of the signage — all
     dealt from the genome so no habit hardens into a skeleton */
  const FG_POOL={city:['parapet','grass','none','parapet','none'],
    hills:['grass','parapet','none','grass','none'],
    field:['grass','none','parapet','grass','none'],
    water:['reeds','none','parapet','reeds','none'],
    desert:['dune','none','grass','dune','none'],
    sky:['sill','none','sill','none','none'],
    interior:['floor','none','floor','floor','none']};
  const fgPool=FG_POOL[interior?'interior':terrain]||FG_POOL.field;
  const fgKind=(comp==='closeup'||comp==='iris')
    ? (((gh>>>24)&1)?'none':'shelfline') : fgPool[(gh>>>24)%fgPool.length];
  const vigStr=((gh>>>26)%9===8)?0:(0.5+((gh>>>26)%8)/10);
  return { seed, slug, m, series, sub, rig, terrain, tod, night, dusk, dawn, hz,
    fx, prime, stations, figs, weather, crowdN, h, gh,
    comp, field, iris, panel, rigK, shelfY, pred,
    ribbon: sub==='edict'&&((gh>>>22)%3===0),
    capDark:(night||((gh>>>29)%4===0)),
    fgKind, vigStr, signStyle:(gh>>>3)%4, capRot:(gh>>>21)%10,
    capW:(42+((gh>>>23)%20)),
    labels:heads.map(x=>pfShort(x.t,20).toUpperCase()),
    labels3:heads3.map(x=>pfShort(x.t,18).toUpperCase()),
    labels3F:heads3.map(x=>String(x.t).toUpperCase()),
    toks:pfWords(m.title||slug).slice(0,4),
    interior, edict,
    provider: sub==='embassy'?pfProviderOf(slug):null,
    venue: /sso/.test(slug)?'THE SSO GATE':/users-and-permissions/.test(slug)?'U&P CUSTOMS'
          :/media-library/.test(slug)?'MEDIA FREIGHT':/email/.test(slug)?'THE MAIL ROAD'
          :String(m.section||'').toUpperCase() };
}

/* ---- the weathered stage: sky, far plane, ground — all from the design ---- */
function pfP2(f){ const p=new Path2D(); f(p); return p; }
function pfSkyPass(x,d,W,H){
  const hzY=d.hz*H, seed=d.seed;
  /* eight sky stones: each page prints its own weather from its own hash */
  const RECS=[
    [[['C',.5]],[['C',.25]],[]],
    [[['C',.5],['M',.25]],[['M',.25]],[['Y',.25]]],
    [[['C',.25],['Y',.25]],[['Y',.25]],[]],
    [[['M',.5]],[['M',.25],['Y',.25]],[['Y',.5]]],
    [[['C',.5],['K',.25]],[['C',.25]],[]],
    [[['Y',.5]],[['Y',.25]],[['M',.25]]],
    [[['C',.25]],[],[['Y',.25]]],
    [[['M',.25],['K',.25]],[['M',.25]],[['Y',.25]]],
  ];
  const rec=RECS[(d.h>>>2)%8];
  const overcast=!d.night&&((d.h>>>19)%4===0||d.weather.streaks>=5);
  if(d.night){
    fillScreened(x,pfP2(p=>p.rect(0,0,W,hzY)),[['C',.5],['K',.5]],null,2);
    x.fillStyle='rgba(20,18,34,.42)'; x.fillRect(0,0,W,hzY);
    plateStars(x,W,H,seed,20+((seed>>>6)%14),hzY*0.85);
    const mx=W*(0.14+((d.h>>>4)%60)/100), my=hzY*(0.16+((d.h>>>8)%22)/100);
    x.fillStyle='#f6efdd'; x.beginPath(); x.arc(mx,my,20+((d.h>>>5)%10),0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
    if((d.h>>>10)%2){ x.fillStyle='rgba(22,20,36,.94)';
      x.beginPath(); x.arc(mx+10,my-4,19+((d.h>>>5)%10),0,7); x.fill(); }
  } else {
    /* three courses of the chosen stone, cut at seeded heights */
    const c1=hzY*(0.30+((d.h>>>6)%20)/100), c2=hzY*(0.62+((d.h>>>9)%18)/100);
    if(rec[0].length) fillScreened(x,pfP2(p=>p.rect(0,0,W,c1+8)),rec[0],null,2);
    if(rec[1].length) fillScreened(x,pfP2(p=>p.rect(0,c1,W,c2-c1+8)),rec[1],null,2);
    if(rec[2].length) fillScreened(x,pfP2(p=>p.rect(0,c2,W,hzY-c2+4)),rec[2],null,2);
    if(d.dusk){ x.fillStyle='rgba(233,150,60,.15)'; x.fillRect(0,0,W,hzY); }
    if(d.dawn){ x.fillStyle='rgba(255,224,150,.12)'; x.fillRect(0,0,W,hzY); }
    if(overcast){
      x.fillStyle='rgba(90,88,80,.16)'; x.fillRect(0,0,W,hzY);
      /* a heavy ceiling of scalloped cloud */
      x.fillStyle='rgba(74,70,60,.85)';
      x.beginPath(); x.moveTo(-10,0); x.lineTo(W+10,0); x.lineTo(W+10,hzY*0.16);
      for(let cx2=W+10;cx2>-30;cx2-=54) x.arc(cx2,hzY*0.16,27,0,Math.PI,false);
      x.closePath(); x.fill();
      x.strokeStyle=INKC; x.lineWidth=1.4;
      x.beginPath(); for(let cx2=W+10;cx2>-30;cx2-=54) x.arc(cx2,hzY*0.16,27,0,Math.PI,false);
      x.stroke();
    } else {
      /* the page's own sun: high at noon, low and swollen at the doors of day */
      const sunT=d.dusk?0.9:d.dawn?0.82:0.30+((d.h>>>4)%30)/100;
      const sx=W*(0.12+((d.h>>>12)%72)/100), sy=hzY*sunT, sr=d.dusk||d.dawn?24:17+((d.h>>>7)%6);
      x.fillStyle=d.dusk?'#e9c81f':d.dawn?'#f2d789':'#f0d558';
      x.beginPath();
      if(d.dusk&&sunT>0.85) x.arc(sx,sy,sr,Math.PI,0,false); else x.arc(sx,sy,sr,0,7);
      x.fill(); x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
      if(!d.dusk&&!d.dawn&&((d.h>>>15)%2)){
        x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1.4;
        for(let i=0;i<10;i++){ const a=i*Math.PI/5;
          x.beginPath(); x.moveTo(sx+Math.cos(a)*(sr+6),sy+Math.sin(a)*(sr+6));
          x.lineTo(sx+Math.cos(a)*(sr+12+(i%2)*5),sy+Math.sin(a)*(sr+12+(i%2)*5)); x.stroke(); }
      }
    }
  }
  /* the page's own weather: clouds by its bulk, streaks by its cautions */
  const banks=[];
  const nCl=overcast?d.weather.clouds+2:d.weather.clouds;
  for(let i=0;i<nCl;i++)
    banks.push([W*(0.12+((hash32('cl'+d.slug+i))%70)/100), hzY*(0.2+((hash32('cy'+d.slug+i))%40)/100),
      0.8+((hash32('cs'+d.slug+i))%50)/100, d.night||d.dusk||overcast?((i%2)===1):false]);
  if(banks.length) plateClouds(x,W,seed,banks);
  plateSkyTex(x,W,hzY*0.1,hzY*0.7,seed,
    d.night?'rgba(120,130,190,.30)':d.dusk?'rgba(255,214,140,.4)':overcast?'rgba(70,66,58,.35)':'rgba(253,248,234,.5)',
    d.weather.streaks+3);
  for(let i=0;i<d.weather.birds;i++){
    const bx=W*(0.1+((hash32('bd'+d.slug+i))%80)/100), by=hzY*(0.18+((hash32('be'+d.slug+i))%40)/100);
    x.strokeStyle='rgba(35,28,18,.8)'; x.lineWidth=1.3;
    x.beginPath(); x.moveTo(bx-4,by); x.quadraticCurveTo(bx-2,by-3.4,bx,by);
    x.quadraticCurveTo(bx+2,by-3.4,bx+4,by); x.stroke();
  }
}
function pfFarPass(x,d,W,H){
  const hzY=d.hz*H, seed=d.seed;
  if(d.terrain==='city'){
    /* four city horizons: towers, the old wall, the orchard edge, or the
       open plain — the skyline strip is a page's choice, not a habit */
    const cv=(d.gh>>>28)%4;
    if(cv<2){
      plateCity(x,W,hzY+2,H*(0.10+((d.gh>>>25)%9)/100),seed^3,
        {fill:d.night?'#241f16':'#4a4436', win:d.night?'#e9c81f':'rgba(35,28,18,.5)',
         winDensity:d.night?0.55:0.4});
    } else if(cv===2){
      /* the old wall with its gate */
      x.fillStyle=d.night?'#2a251c':'#6e6650';
      x.fillRect(0,hzY-H*0.045,W,H*0.05);
      x.strokeStyle=INKC; x.lineWidth=1.8;
      x.beginPath(); x.moveTo(0,hzY-H*0.045); x.lineTo(W,hzY-H*0.045); x.stroke();
      for(let cx2=4;cx2<W;cx2+=22){ x.fillRect(cx2,hzY-H*0.045-6,12,6); }
      const gx2=W*(0.2+((d.gh>>>26)%60)/100);
      x.fillStyle=d.night?'#33291f':'#8d8266';
      x.fillRect(gx2-16,hzY-H*0.085,32,H*0.09);
      x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(gx2-16,hzY-H*0.085,32,H*0.09);
      x.fillStyle='#231c12';
      x.beginPath(); x.moveTo(gx2-7,hzY+2); x.lineTo(gx2-7,hzY-H*0.03);
      x.arc(gx2,hzY-H*0.03,7,Math.PI,0); x.lineTo(gx2+7,hzY+2); x.closePath(); x.fill();
    } else {
      /* the orchard edge */
      for(let i=0;i<7;i++){
        const tx2=W*((hash32('or'+d.slug+i))%100)/100, ts=5+((seed>>>(i&13))%5);
        x.strokeStyle=INKC; x.lineWidth=1.6;
        x.beginPath(); x.moveTo(tx2,hzY+2); x.lineTo(tx2,hzY-ts); x.stroke();
        x.fillStyle=d.night?'#26231b':'#57713f';
        x.beginPath(); x.arc(tx2,hzY-ts-4,4+ts*0.5,0,7); x.fill();
        x.strokeStyle=INKC; x.lineWidth=1.2; x.stroke();
      }
    }
  } else if(d.terrain==='water'){
    /* the sea takes the whole ground band; far sail + wave courses */
    fillScreened(x,pfP2(p=>p.rect(0,hzY,W,H-hzY)),[['C',.5]],null,2);
    if(d.night){ x.fillStyle='rgba(20,22,40,.35)'; x.fillRect(0,hzY,W,H-hzY); }
    x.strokeStyle=d.night?'rgba(200,214,255,.35)':'rgba(246,239,221,.55)'; x.lineCap='round';
    for(let i=0;i<9;i++){ const wy=hzY+6+i*(H-hzY)*0.09, ww=30+((seed>>>(i&13))%40);
      x.lineWidth=1+i*0.16;
      x.beginPath(); x.moveTo(W*((seed>>>(i&7))%60)/100+10,wy);
      x.quadraticCurveTo(W*0.5,wy+2,W*((seed>>>(i&7))%60)/100+10+ww*3,wy); x.stroke(); }
    const sx2=W*(0.12+((d.h>>>6)%20)/100);
    x.fillStyle=INKC;
    x.beginPath(); x.moveTo(sx2,hzY-2); x.lineTo(sx2+7,hzY-14); x.lineTo(sx2+7,hzY-2); x.closePath(); x.fill();
    x.fillRect(sx2-4,hzY-3,16,2.6);
  } else if(d.terrain==='hills'){
    x.fillStyle=d.night?'#2c2a22':'#6d6b4e';
    x.beginPath(); x.moveTo(0,hzY+14);
    x.quadraticCurveTo(W*0.22,hzY-H*0.07,W*0.46,hzY+8);
    x.quadraticCurveTo(W*0.6,hzY+14,W,hzY+2); x.lineTo(W,hzY+22); x.lineTo(0,hzY+22);
    x.closePath(); x.fill();
    x.fillStyle=d.night?'#211f18':'#57553f';
    x.beginPath(); x.moveTo(0,hzY+20);
    x.quadraticCurveTo(W*0.6,hzY-H*0.035,W,hzY+16); x.lineTo(W,hzY+30); x.lineTo(0,hzY+30);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.6;
    const tx=W*(0.16+((d.h>>>7)%60)/100);
    x.beginPath(); x.moveTo(tx,hzY+6); x.lineTo(tx,hzY-8); x.stroke();
    x.fillStyle=INKC; x.beginPath(); x.arc(tx,hzY-11,5,0,7); x.fill();
  } else if(d.terrain==='desert'){
    x.fillStyle=d.night?'#33291c':'#8d6b3f';
    for(const [mx,mw,mh] of [[W*0.1,W*0.13,H*0.06],[W*0.78,W*0.17,H*0.075]]){
      x.beginPath(); x.moveTo(mx,hzY+2); x.lineTo(mx+mw*0.14,hzY-mh); x.lineTo(mx+mw*0.86,hzY-mh);
      x.lineTo(mx+mw,hzY+2); x.closePath(); x.fill();
      x.strokeStyle=INKC; x.lineWidth=1.6; x.stroke(); }
  } else if(d.terrain==='field'){
    x.strokeStyle='rgba(35,28,18,.6)'; x.lineWidth=1.6;
    x.beginPath(); x.moveTo(0,hzY); x.lineTo(W,hzY); x.stroke();
    x.fillStyle=d.night?'#26231b':'#5d5b40';
    for(let i=0;i<7;i++){ const bx2=W*((hash32('hg'+d.slug+i))%100)/100;
      x.beginPath(); x.arc(bx2,hzY-2,3+((seed>>>(i&7))%4),Math.PI,0); x.fill(); }
    const bx3=W*(0.7+((d.h>>>9)%20)/100);
    x.fillStyle=d.night?'#26231b':'#6d4a33';
    x.fillRect(bx3,hzY-12,20,12);
    x.beginPath(); x.moveTo(bx3-2,hzY-12); x.lineTo(bx3+10,hzY-20); x.lineTo(bx3+22,hzY-12);
    x.closePath(); x.fill(); x.strokeStyle=INKC; x.lineWidth=1.4; x.stroke();
  } else if(d.terrain==='sky'){
    /* below the horizon is CLOUD FLOOR — the world is down there somewhere */
    x.fillStyle='#e7ddc0';
    x.beginPath(); x.moveTo(0,hzY+10);
    for(let cx2=0;cx2<=W+30;cx2+=44)
      x.arc(cx2,hzY+12,24,Math.PI,0,false);
    x.lineTo(W,H); x.lineTo(0,H); x.closePath(); x.fill();
    x.strokeStyle='rgba(35,28,18,.45)'; x.lineWidth=1.4;
    x.beginPath(); for(let cx2=0;cx2<=W+30;cx2+=44) x.arc(cx2,hzY+12,24,Math.PI,0,false); x.stroke();
  }
}
function pfGroundPass(x,d,W,H){
  if(d.terrain==='water'||d.terrain==='sky') return; /* their far pass owns the floor */
  const hzY=d.hz*H;
  const GROUNDS={
    desert:[[['Y',.5],['M',.25]],[['Y',.5]],[['M',.25],['K',.25]]],
    field:[[['Y',.5]],[['Y',.25],['C',.25]],[['C',.25],['K',.25]]],
    hills:[[['Y',.25],['C',.25]],[['C',.5]],[['Y',.5],['K',.25]]],
    city:[[[ (d.series&&d.series.combo&&d.series.combo[0][0])||'C',.25]],
          [['M',.25],['Y',.25]],[['K',.25],['C',.25]],[['K',.5]]]};
  const gp0=GROUNDS[d.terrain]||GROUNDS.city;
  const mix=gp0[(d.gh>>>20)%gp0.length];
  fillScreened(x,pfP2(p=>p.rect(0,hzY+2,W,H-hzY)),mix,null,2);
  if(d.night){ x.fillStyle='rgba(22,20,34,.30)'; x.fillRect(0,hzY+2,W,H-hzY); }
  plateGroundTex(x,W,hzY+H*0.05,H*0.62,d.seed,
    d.terrain==='city'?'cobble':d.terrain==='field'?'tuft':d.terrain==='desert'?'crack':'tuft');
  plateGroundTex(x,W,H*0.55,H*0.92,d.seed^0x77,
    d.terrain==='city'?'cobble':d.terrain==='field'?'tuft':d.terrain==='desert'?'crack':'tuft');
  const gg=x.createLinearGradient(0,hzY,0,H);
  gg.addColorStop(0,'rgba(35,28,18,.14)'); gg.addColorStop(0.25,'rgba(35,28,18,0)');
  gg.addColorStop(0.78,'rgba(35,28,18,0)'); gg.addColorStop(1,'rgba(35,28,18,.20)');
  x.fillStyle=gg; x.fillRect(0,hzY,W,H-hzY);
  /* the walked path: from our feet to the subject's ground — when the page
     keeps one at all, and never twice from the same corner */
  if(d.terrain!=='desert'&&((d.gh>>>23)%3)!==0){
    const px0=W*(0.2+((d.gh>>>24)%60)/100), pw0=W*(0.14+((d.gh>>>26)%6)*0.04);
    x.fillStyle='rgba(35,28,18,.17)';
    x.beginPath(); x.moveTo(px0-pw0/2,H); x.lineTo(px0+pw0/2,H);
    x.lineTo(W*d.fx+W*0.05,hzY+(H-hzY)*0.40); x.lineTo(W*d.fx-W*0.05,hzY+(H-hzY)*0.40);
    x.closePath(); x.fill();
    x.strokeStyle='rgba(35,28,18,.35)'; x.lineWidth=1.3;
    for(let i2=0;i2<7;i2++){ const t2=0.14+i2*0.13;
      const yy=H-(H-(hzY+(H-hzY)*0.42))*t2;
      const cxp=px0+(W*d.fx-px0)*t2, wd=(pw0/2)*(1-t2*0.8);
      x.beginPath(); x.moveTo(cxp-wd*0.7,yy); x.lineTo(cxp+wd*0.5,yy-1); x.stroke(); }
  }
  /* incident: the page's own small things live on this ground — a crate
     of its first section, a prop of its second, tone patches worn by use.
     No acre of dots is left unworked */
  const rd9=mulberry(d.seed^0x1c1d);
  const nPatch=3+((d.gh>>>8)%3);
  for(let i=0;i<nPatch;i++){
    const pxq=W*rd9(), pyq=hzY+(H-hzY)*(0.25+rd9()*0.6);
    const pwq=W*(0.06+rd9()*0.12), phq=(H-hzY)*(0.03+rd9()*0.04);
    x.fillStyle=d.night?'rgba(20,18,30,.20)':'rgba(35,28,18,.09)';
    x.beginPath(); x.ellipse(pxq,pyq,pwq,phq,0,0,7); x.fill();
  }
  if(d.pred&&d.pred.length&&((d.gh>>>10)%3)!==2){
    const nInc=Math.min(2,d.pred.length);
    for(let i=0;i<nInc;i++){
      if(!d.pred[i].prop) continue;
      const ix2=W*(0.10+(((d.gh>>>(11+i*3))%80))/100);
      const iy2=hzY+(H-hzY)*(0.5+((d.gh>>>(13+i*2))%30)/100);
      if(Math.abs(ix2-W*d.fx)<W*0.16) continue; /* keep off the subject */
      try{ drawProp(x,d.pred[i].prop,ix2,iy2,10+((d.gh>>>(15+i))%8),'#8a3b2a'); }catch(e){}
    }
  }
}
function pfInteriorPass(x,d,W,H){
  /* a period room CUT FOR THIS PAGE: its own paper, floor, and light */
  const seed=d.seed, h=d.h;
  const flY=H*(0.58+((d.gh>>>16)%12)*0.018);
  d.flY=flY/H;
  const WALLS=[[['M',.25]],[['Y',.25]],[['C',.25]],[['Y',.25],['M',.25]],[['K',.25]],
    [['C',.25],['Y',.25]],[['K',.5]],[['C',.5],['K',.25]]];
  const wallMix=WALLS[(d.gh>>>5)%8];
  fillScreened(x,pfP2(p=>p.rect(0,0,W,flY)),wallMix,null,2);
  if(d.night){ x.fillStyle='rgba(30,26,40,.22)'; x.fillRect(0,0,W,flY); }
  else if(d.dusk){ x.fillStyle='rgba(226,150,60,.10)'; x.fillRect(0,0,W,flY); }
  /* the room's VALUE STRUCTURE is dealt per page: shadowed ceiling with
     beams, a lamplit split, a high dark dado — or the plain wall */
  const wallShade=(d.gh>>>18)%4;
  if(wallShade===1){
    const ceilH=H*(0.14+((d.gh>>>20)%10)/100);
    x.fillStyle='rgba(24,20,14,.6)'; x.fillRect(0,0,W,ceilH);
    x.strokeStyle=INKC; x.lineWidth=2;
    x.beginPath(); x.moveTo(0,ceilH); x.lineTo(W,ceilH); x.stroke();
    x.strokeStyle='rgba(35,28,18,.8)'; x.lineWidth=4;
    for(let b9=1;b9<4;b9++){ const bx9=W*b9/4;
      x.beginPath(); x.moveTo(bx9,0); x.lineTo(bx9,ceilH-2); x.stroke(); }
  } else if(wallShade===2){
    const darkLeft=d.fx<0.5; /* the far side from the window falls dark */
    const g9=x.createLinearGradient(darkLeft?0:W,0,darkLeft?W*0.7:W*0.3,0);
    g9.addColorStop(0,'rgba(24,20,14,.5)'); g9.addColorStop(1,'rgba(24,20,14,0)');
    x.fillStyle=g9; x.fillRect(0,0,W,flY);
  } else if(wallShade===3){
    x.fillStyle='rgba(35,28,18,.45)';
    x.fillRect(0,flY-H*(0.26+((d.gh>>>20)%10)/100),W,H*(0.26+((d.gh>>>20)%10)/100));
  }
  /* and one large furnishing mass, when the page keeps one: a tapestry of
     its own letter, or a shelf course of its own books */
  const wallFurn=(d.gh>>>24)%3;
  if(wallFurn===1){
    const tw9=W*(0.16+((d.gh>>>25)%10)/100), tx9=d.fx<0.5?W*0.78:W*0.08;
    const ty9=H*0.16, th9=H*(0.24+((d.gh>>>26)%8)/100);
    x.fillStyle=['#8a3b2a','#31647e','#57553f'][(d.gh>>>27)%3];
    x.fillRect(tx9,ty9,tw9,th9);
    x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(tx9,ty9,tw9,th9);
    x.strokeStyle='rgba(246,239,221,.6)'; x.lineWidth=1.4;
    x.strokeRect(tx9+5,ty9+5,tw9-10,th9-10);
    const ch9=(String(d.m.title||d.slug).replace(/[^A-Za-z0-9]/g,'')[0]||'S').toUpperCase();
    x.fillStyle='rgba(246,239,221,.85)'; x.textAlign='center';
    x.font='700 '+Math.round(th9*0.4)+'px Oswald,sans-serif';
    x.fillText(ch9,tx9+tw9/2,ty9+th9*0.62); x.textAlign='left';
    for(let f9=0;f9<5;f9++){ x.strokeStyle=INKC; x.lineWidth=1.4;
      x.beginPath(); x.moveTo(tx9+f9*tw9/4.5+3,ty9+th9); x.lineTo(tx9+f9*tw9/4.5+3,ty9+th9+6); x.stroke(); }
  } else if(wallFurn===2){
    const sy9=H*(0.24+((d.gh>>>25)%12)/100);
    x.fillStyle='#6b4a2e'; x.fillRect(0,sy9,W,5);
    x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(0,sy9,W,5);
    const rd9=mulberry(d.seed^0x5e1f);
    for(let b9=0;b9<11;b9++){
      const bx9=W*(0.03+b9*0.09)+rd9()*8, bw9=7+rd9()*7, bh9=13+rd9()*10;
      if(Math.abs(bx9-(d.fx<0.5?W*0.84:W*0.13))<W*0.11) continue; /* clear of the window */
      x.fillStyle=['#8a3b2a','#31647e','#57553f','#b9a06a'][b9%4];
      x.fillRect(bx9,sy9-bh9,bw9,bh9);
      x.strokeStyle=INKC; x.lineWidth=1.1; x.strokeRect(bx9,sy9-bh9,bw9,bh9);
    }
  }
  /* picture rail */
  x.strokeStyle='rgba(35,28,18,.55)'; x.lineWidth=1.2;
  x.beginPath(); x.moveTo(0,H*0.13); x.lineTo(W,H*0.13); x.stroke();
  const deco=(h>>>8)%3;
  if(deco===0){ /* panel moulding */
    x.strokeStyle='rgba(35,28,18,.35)'; x.lineWidth=1.4;
    for(let p9=0;p9<3;p9++){ const pxq=W*(0.08+p9*0.33), pwq=W*0.24;
      x.strokeRect(pxq,H*0.17,pwq,H*0.22); x.strokeRect(pxq+5,H*0.17+5,pwq-10,H*0.22-10); }
  } else if(deco===1){ /* striped paper */
    x.strokeStyle='rgba(35,28,18,.16)'; x.lineWidth=6;
    for(let sx9=8;sx9<W;sx9+=26){ x.beginPath(); x.moveTo(sx9,H*0.135); x.lineTo(sx9,flY-H*0.16); x.stroke(); }
  } /* deco 2: plain wash */
  /* wainscot, its own wood */
  const wain=(h>>>11)%4!==0;
  if(wain){
    x.fillStyle=['rgba(35,28,18,.16)','rgba(106,74,46,.30)','rgba(49,100,126,.18)'][(h>>>13)%3];
    x.fillRect(0,flY-H*0.14,W,H*0.14);
    x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=2;
    x.beginPath(); x.moveTo(0,flY-H*0.14); x.lineTo(W,flY-H*0.14); x.stroke();
    x.strokeStyle='rgba(35,28,18,.4)'; x.lineWidth=1;
    for(let w9=0;w9<9;w9++){ x.beginPath(); x.moveTo(w9*W/9+8,flY-H*0.135);
      x.lineTo(w9*W/9+8,flY-2); x.stroke(); }
  }
  /* the window keeps the hour — arched, square or a porthole; some rooms
     have none and keep books instead */
  const winKind=(h>>>3)%4;
  const winX=d.fx<0.5?W*0.84:W*0.13, winW=W*0.13, winH=H*0.17, winY=H*0.15;
  if(winKind===3){ /* the bookcase wall instead */
    x.fillStyle='#6b4a2e'; x.fillRect(winX-winW*0.7,winY,winW*1.4,winH*1.5);
    x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(winX-winW*0.7,winY,winW*1.4,winH*1.5);
    for(let s9=0;s9<3;s9++){
      const sy9=winY+(s9+1)*winH*1.5/3;
      x.fillRect(winX-winW*0.7,sy9-3,winW*1.4,3);
      for(let b9=0;b9<5;b9++){
        const bh9=winH*0.3+((seed>>>(s9*5+b9))%8);
        x.fillStyle=['#8a3b2a','#31647e','#57553f','#b9a06a'][(s9+b9)%4];
        x.fillRect(winX-winW*0.62+b9*winW*0.26,sy9-4-bh9,winW*0.2,bh9);
        x.strokeStyle=INKC; x.lineWidth=1; x.strokeRect(winX-winW*0.62+b9*winW*0.26,sy9-4-bh9,winW*0.2,bh9);
        x.fillStyle='#6b4a2e';
      }
    }
  } else {
    x.save();
    x.fillStyle=d.night?'#1d2038':d.dusk?'#d98e4a':d.dawn?'#e8c98f':'#bcd6e2';
    if(winKind===2){ x.beginPath(); x.arc(winX,winY+winH*0.5,winW*0.62,0,7); x.fill();
      x.clip(); }
    else if(winKind===1){ x.beginPath(); x.moveTo(winX-winW/2,winY+winH);
      x.lineTo(winX-winW/2,winY+winH*0.3); x.arc(winX,winY+winH*0.3,winW/2,Math.PI,0);
      x.lineTo(winX+winW/2,winY+winH); x.closePath(); x.fill(); x.clip(); }
    else { x.fillRect(winX-winW/2,winY,winW,winH);
      x.beginPath(); x.rect(winX-winW/2,winY,winW,winH); x.clip(); }
    if(d.night){ plateStars(x,W,H,seed^9,6,winY+winH,winX-winW,winX+winW);
      x.fillStyle='#f6efdd'; x.beginPath(); x.arc(winX+winW*0.2,winY+winH*0.3,7,0,7); x.fill(); }
    else { x.fillStyle=d.dusk?'#e9c81f':'#f6efdd';
      x.beginPath(); x.arc(winX-winW*0.15,winY+winH*(d.dusk?0.72:0.3),8,0,7); x.fill(); }
    x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1.2;
    x.beginPath(); x.moveTo(winX-winW,winY+winH*0.8); x.lineTo(winX+winW,winY+winH*0.75); x.stroke();
    x.restore();
    x.strokeStyle=INKC; x.lineWidth=2.6;
    if(winKind===2){ x.beginPath(); x.arc(winX,winY+winH*0.5,winW*0.62,0,7); x.stroke();
      x.lineWidth=1.4;
      x.beginPath(); x.moveTo(winX-winW*0.62,winY+winH*0.5); x.lineTo(winX+winW*0.62,winY+winH*0.5);
      x.moveTo(winX,winY+winH*0.5-winW*0.62); x.lineTo(winX,winY+winH*0.5+winW*0.62); x.stroke(); }
    else if(winKind===1){ x.beginPath(); x.moveTo(winX-winW/2,winY+winH);
      x.lineTo(winX-winW/2,winY+winH*0.3); x.arc(winX,winY+winH*0.3,winW/2,Math.PI,0);
      x.lineTo(winX+winW/2,winY+winH); x.stroke();
      x.lineWidth=1.4; x.beginPath(); x.moveTo(winX,winY+winH*0.3-winW/2); x.lineTo(winX,winY+winH); x.stroke(); }
    else { x.strokeRect(winX-winW/2,winY,winW,winH);
      x.lineWidth=1.4;
      x.beginPath(); x.moveTo(winX,winY); x.lineTo(winX,winY+winH);
      x.moveTo(winX-winW/2,winY+winH/2); x.lineTo(winX+winW/2,winY+winH/2); x.stroke(); }
    /* light falls into the room from the window */
    const lg=x.createLinearGradient(winX,winY,winX+(d.fx<0.5?-1:1)*W*0.3,flY);
    lg.addColorStop(0,d.night?'rgba(210,220,255,.12)':'rgba(255,244,200,.20)');
    lg.addColorStop(1,'rgba(255,244,200,0)');
    x.fillStyle=lg;
    x.beginPath(); x.moveTo(winX-winW/2,winY); x.lineTo(winX+winW/2,winY);
    x.lineTo(winX+(d.fx<0.5?-1:1)*W*0.34+winW,flY); x.lineTo(winX+(d.fx<0.5?-1:1)*W*0.34-winW,flY);
    x.closePath(); x.fill();
  }
  /* the floor: boards, checker tiles, or a long carpet */
  const floorKind=(h>>>21)%3;
  if(floorKind===1){
    fillScreened(x,pfP2(p=>p.rect(0,flY,W,H-flY)),[['C',.25]],null,2);
    x.fillStyle='rgba(35,28,18,.30)';
    const ts=26;
    for(let r9=0;r9<6;r9++){
      const rowY=flY+r9*(H-flY)/5.2, rh9=(H-flY)/5.2, sk=(r9%2)*ts/2;
      for(let c9=-1;c9<Math.ceil(W/ts)+1;c9++)
        if((c9+r9)%2===0) x.fillRect(c9*ts+sk,rowY,ts,rh9+0.5);
    }
  } else {
    fillScreened(x,pfP2(p=>p.rect(0,flY,W,H-flY)),floorKind===2?[['M',.25]]:[['Y',.25],['M',.25]],null,2);
    x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1.2;
    for(let i=0;i<6;i++){ const fy2=flY+4+i*(H-flY)/6;
      x.beginPath(); x.moveTo(0,fy2); x.lineTo(W,fy2); x.stroke(); }
    for(let i=0;i<8;i++){ const fx2=W*((seed>>>(i&13))%100)/100;
      x.beginPath(); x.moveTo(fx2,flY+4+(i%5)*(H-flY)/6); x.lineTo(fx2,flY+4+((i%5)+1)*(H-flY)/6); x.stroke(); }
    if(floorKind===2){ /* the long carpet toward the subject */
      fillScreened(x,pfP2(p=>{p.moveTo(W*d.fx-W*0.14,flY); p.lineTo(W*d.fx+W*0.14,flY);
        p.lineTo(W*d.fx+W*0.24,H); p.lineTo(W*d.fx-W*0.24,H); p.closePath();}),[['M',.5]],null,2);
      x.strokeStyle=INKC; x.lineWidth=1.8;
      x.beginPath(); x.moveTo(W*d.fx-W*0.14,flY); x.lineTo(W*d.fx-W*0.24,H);
      x.moveTo(W*d.fx+W*0.14,flY); x.lineTo(W*d.fx+W*0.24,H); x.stroke();
    }
  }
  if(d.night) pfLamp(x,d.fx<0.5?W*0.68:W*0.30,flY,1.1,true);
}
/* ---- the interior letterer: where THIS room hangs its heading furniture.
   Four habits — staggered plaques, a wall stack, floor easels, strings from
   the ceiling — dealt from the genome and SHARED by painter and caption
   solver, so the plaque row stops being a fixed top band ---- */
function pfIntStations(d){
  const n=(d.stations||[]).length; if(!n) return [];
  const mode=(d.gh>>>7)%4;
  const fl=0.58+((d.gh>>>16)%12)*0.018;   /* the same floor the painter lays */
  const out=[];
  for(let i=0;i<n;i++){
    let bx,by,anchor='banner';
    if(mode===0){ /* plaques under the rail, row height dealt, hung uneven */
      const y0=0.145+((d.gh>>>9)%8)/100;
      const x0=0.17+((d.gh>>>11)%10)/100, x1=0.83-((d.gh>>>14)%8)/100;
      bx=n===1?0.5:(x0+i*((x1-x0)/Math.max(1,n-1)));
      by=y0+(i%2)*(0.035+((d.gh>>>12)%3)/100);
    } else if(mode===1){ /* the wall stack, away from the window */
      bx=clamp((d.fx<0.5?0.16:0.84)+(((d.gh>>>9)%7)-3)/100,0.10,0.90);
      by=0.17+i*(0.105+((d.gh>>>11)%4)/100);
      anchor='stack';
    } else if(mode===2){ /* floor easels among the furniture — never on the
      hero's own boards */
      bx=clamp(0.5+(i-(n-1)/2)*(0.30+((d.gh>>>11)%8)/100)+(((d.gh>>>13)%5)-2)/50,0.10,0.90);
      by=clamp(fl+0.10+(i%2)*0.05,0.3,0.93);
      const f0=d.figs&&d.figs[0];
      if(f0){ const fcx=f0.box[0]+f0.box[2]*0.5, dx0=bx-fcx;
        if(Math.abs(dx0)<0.15) bx=clamp(fcx+(dx0<0?-0.17:0.17),0.08,0.92); }
      anchor='sign';
    } else { /* strings from the ceiling, uneven drops */
      bx=n===1?0.5:(0.20+((d.gh>>>9)%8)/100+i*(0.58/Math.max(1,n-1)));
      by=0.085+((i*2+((d.gh>>>13)%3))%3)*0.055;
      anchor='hung';
    }
    out.push({bx,by,anchor,mode});
  }
  return out;
}
/* ---- the gear train layout: normalized, deterministic, and SHARED by the
   gearworks painter and the caption solver — a dial the solver cannot see
   is a dial a caption will sit on ---- */
function pfGearLayout(d){
  const rcx=d.prime.x+d.prime.w/2, rw=d.prime.w;
  const A=0.70;                       /* the plate's width:height convention */
  const nG=clamp(2+(d.labels.length||2)%4,2,5);
  let gx=rcx-rw*(0.24+((d.gh>>>6)%10)/100), gy=0.38+((d.gh>>>4)%12)/100, lastR=0;
  const gears=[];
  for(let i=0;i<nG;i++){
    const hh=hash32('gear'+d.slug+(d.labels[i]||i));
    const gr=rw*(0.10+(hh%11)/100);
    if(i>0){ const ang=((hh>>>4)%2?1:-1)*(0.5+((hh>>>6)%60)/100);
      gx+=Math.cos(ang*0.6)*(lastR+gr)*0.96;
      gy+=Math.sin(ang*0.6)*(lastR+gr)*0.9*((hh>>>8)&1?1:-1)*A;   /* x-frac → y-frac */
    }
    gy=clamp(gy,0.22,0.62);
    gears.push({x:gx,y:gy,r:gr,teeth:7+(hh%4),ang:((hh>>>9)%60)/100-0.3});
    lastR=gr;
  }
  const dials=[];
  for(let i=0;i<Math.min(3,(d.labels.length||3));i++){
    const gp=gears[i%gears.length];
    const hh2=hash32('dial'+d.slug+i);
    const dx=clamp(gp.x+((hh2&1)?1:-1)*(gp.r+(26+(hh2>>>3)%24)/560),0.07,0.93);
    const dy=clamp(gp.y+((hh2>>>5)&1?1:-1)*(gp.r*0.6*A+(18+(hh2>>>7)%28)/800),0.14,0.78);
    dials.push({x:dx,y:dy});
  }
  return {gears,dials};
}
function pfStationsPass(x,d,W,H){
  /* the page's REAL h2 headings step into the picture as lettered furniture.
     The letterer changes habit page by page: planks, hung banners, boundary
     stones, swinging shingles — and never walks off the plate's edge */
  let i=0;
  for(const st of d.stations){
    const s=st.s||0.94;
    const estW=Math.max(34,Math.min(W*0.26,st.text.length*6.4+14))*s;
    const sx=clamp(st.fx*W,estW/2+6,W-estW/2-6), sy=st.fy*H;
    if(d.interior){
      /* the room's own letterer: plaques, a stack, easels, or strings */
      const L9=d._intSt||(d._intSt=pfIntStations(d));
      const st9=L9[i]||{bx:0.5,by:0.155,anchor:'banner'};
      const bx9=st9.bx*W, by9=st9.by*H;
      if(st9.anchor==='sign'){
        pfSign(x,clamp(bx9,60,W-60),by9,st.text,{s:0.9,post:16+(i%2)*8,
          tone:i%2?'#e8d9ac':'#d9c8a2',maxW:W*0.24});
      } else if(st9.anchor==='hung'){
        x.strokeStyle='rgba(35,28,18,.75)'; x.lineWidth=1.6;
        x.beginPath(); x.moveTo(bx9,0); x.lineTo(bx9,by9); x.stroke();
        pfBanner(x,bx9,by9,st.text,{tone:i%2?'#31647e':'#8a3b2a',s:0.88,maxW:W*0.24});
      } else if(st9.anchor==='stack'){
        pfBanner(x,bx9,by9,st.text,{tone:i%2?'#31647e':'#8a3b2a',s:0.80,maxW:W*0.19});
      } else {
        pfBanner(x,bx9,by9,st.text,{tone:i%2?'#31647e':'#8a3b2a',s:0.92,maxW:W*0.24});
      }
    } else if(d.signStyle===1){
      /* cloth banners on standing poles */
      x.strokeStyle=INKC; x.lineWidth=2.8*s;
      x.beginPath(); x.moveTo(sx,sy); x.lineTo(sx,sy-(34+(i%3)*7)*s); x.stroke();
      pfBanner(x,sx,sy-(34+(i%3)*7)*s,st.text,{tone:i%2?'#31647e':'#8a3b2a',s:s*0.9,maxW:W*0.24});
    } else if(d.signStyle===2){
      /* boundary stones, carved */
      const bw2=estW*0.7, bh2=24*s;
      x.fillStyle=i%2?'#b9ab84':'#c9bd96';
      x.beginPath(); x.moveTo(sx-bw2/2,sy); x.lineTo(sx-bw2/2+3,sy-bh2);
      x.arc(sx,sy-bh2,bw2/2-3,Math.PI,0); x.lineTo(sx+bw2/2,sy); x.closePath(); x.fill();
      x.strokeStyle=INKC; x.lineWidth=1.8*s; x.stroke();
      pfCarve(x,sx,sy-bh2*0.36,st.text,{maxW:bw2-8,size:8.4*s,ink:'rgba(35,28,18,.72)'});
    } else if(d.signStyle===3){
      /* swinging shingles hung from an arm */
      const ph2=(30+(i%3)*8)*s;
      x.strokeStyle=INKC; x.lineWidth=3.2*s;
      x.beginPath(); x.moveTo(sx,sy); x.lineTo(sx,sy-ph2); x.stroke();
      const dir=st.fx<0.5?1:-1;
      x.lineWidth=2.4*s;
      x.beginPath(); x.moveTo(sx,sy-ph2); x.lineTo(sx+dir*estW*0.6,sy-ph2); x.stroke();
      const hx=sx+dir*estW*0.32;
      x.lineWidth=1.3*s;
      x.beginPath(); x.moveTo(hx-estW*0.2,sy-ph2); x.lineTo(hx-estW*0.2,sy-ph2+6*s);
      x.moveTo(hx+estW*0.2,sy-ph2); x.lineTo(hx+estW*0.2,sy-ph2+6*s); x.stroke();
      x.save(); x.translate(hx,sy-ph2+6*s); x.rotate(((hash32('sh'+d.slug+i)%9)-4)*0.02);
      x.fillStyle=i%2?'#e8d9ac':'#d9c8a2'; x.fillRect(-estW*0.28,0,estW*0.56,15*s);
      x.strokeStyle=INKC; x.lineWidth=1.5*s; x.strokeRect(-estW*0.28,0,estW*0.56,15*s);
      x.fillStyle=INKC; x.textAlign='center';
      pfFitFont(x,st.text,estW*0.5,9*s,'600 %px Oswald,"Arial Narrow",sans-serif');
      x.fillText(st.text,0,11*s); x.textAlign='left'; x.restore();
    } else {
      pfSign(x,sx,sy,st.text,{s,ang:((hash32('sa'+d.slug+i)%9)-4)*0.012,
        tone:i%2?'#e8d9ac':'#d9c8a2',maxW:W*0.26,post:(18+(i%3)*7)});
    }
    i++;
  }
}
function pfFgPass(x,d,W,H){
  /* the near dark: a spot-black threshold the reader stands behind —
     when the genome deals one at all */
  const seed=d.seed;
  x.fillStyle=INKC;
  const kind=d.fgKind||(d.interior?'floor':
    d.terrain==='water'?'reeds':d.terrain==='desert'?'dune':
    d.terrain==='sky'?'sill':d.terrain==='field'?'grass':'parapet');
  if(kind==='none') return;
  if(kind==='shelfline'){
    x.strokeStyle='rgba(35,28,18,.75)'; x.lineWidth=3;
    x.beginPath(); x.moveTo(0,H*d.shelfY+8); x.lineTo(W,H*d.shelfY+8); x.stroke();
    x.strokeStyle='rgba(35,28,18,.35)'; x.lineWidth=1.4;
    x.beginPath(); x.moveTo(0,H*d.shelfY+13); x.lineTo(W,H*d.shelfY+13); x.stroke();
    return;
  }
  if(kind==='parapet'){
    const lh=H*0.935;
    x.beginPath(); x.moveTo(0,H); x.lineTo(0,lh);
    let lx=0;
    while(lx<W){ const seg=36+((seed>>>(lx&7))&15);
      x.lineTo(lx+4,lh); x.lineTo(lx+4,lh-6); x.lineTo(lx+seg-6,lh-6);
      x.lineTo(lx+seg-6,lh); x.lineTo(lx+seg,lh); lx+=seg; }
    x.lineTo(W,lh); x.lineTo(W,H); x.closePath(); x.fill();
  } else if(kind==='reeds'){
    x.beginPath(); x.moveTo(0,H); x.lineTo(0,H*0.955);
    x.quadraticCurveTo(W*0.4,H*0.94,W,H*0.958); x.lineTo(W,H); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=2; x.lineCap='round';
    for(let i=0;i<11;i++){ const rx=W*(0.03+i*0.095)+((seed>>>(i&7))%8);
      x.beginPath(); x.moveTo(rx,H*0.965);
      x.quadraticCurveTo(rx+((i%2)?5:-4),H*0.90,rx+((i%2)?9:-6),H*0.865); x.stroke();
      if(i%3===0){ x.fillStyle=INKC; x.fillRect(rx+((i%2)?7:-8),H*0.858,3.4,9); } }
  } else if(kind==='dune'){
    x.beginPath(); x.moveTo(0,H); x.lineTo(0,H*0.94);
    x.quadraticCurveTo(W*0.3,H*0.895,W*0.62,H*0.945);
    x.quadraticCurveTo(W*0.84,H*0.975,W,H*0.95); x.lineTo(W,H); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.4; x.lineCap='round';
    for(let i=0;i<7;i++){ const gx=W*(0.08+i*0.14);
      x.beginPath(); x.moveTo(gx,H*0.94); x.quadraticCurveTo(gx+3,H*0.91,gx+7,H*0.90); x.stroke(); }
  } else if(kind==='sill'){
    x.beginPath(); x.moveTo(0,H); x.lineTo(0,H*0.95);
    for(let cx2=0;cx2<=W+30;cx2+=52) x.arc(cx2,H*0.955,26,Math.PI,0,false);
    x.lineTo(W,H); x.closePath(); x.fill();
  } else if(kind==='grass'){
    x.beginPath(); x.moveTo(0,H); x.lineTo(0,H*0.952);
    x.quadraticCurveTo(W*0.5,H*0.936,W,H*0.955); x.lineTo(W,H); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.6; x.lineCap='round';
    for(let i=0;i<14;i++){ const gx=W*(0.02+i*0.072)+((seed>>>(i&13))%6);
      x.beginPath(); x.moveTo(gx,H*0.952); x.quadraticCurveTo(gx+2,H*0.925,gx+5,H*0.915); x.stroke();
      x.beginPath(); x.moveTo(gx+2,H*0.952); x.quadraticCurveTo(gx-1,H*0.928,gx-4,H*0.92); x.stroke(); }
  } else { /* floor: a desk edge or rug line at the foot of the room */
    x.fillStyle='rgba(35,28,18,.9)';
    x.fillRect(0,H*0.972,W,H*0.028);
    fillScreened(x,pfP2(p=>p.rect(W*0.1,H*0.955,W*0.8,H*0.02)),[['M',.5]],null,2);
    x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(W*0.1,H*0.955,W*0.8,H*0.02);
  }
}
/* ---- the flat field: the ground a close-up or an iris stands against.
   Eight tones from bare paper to deep night ink — the plate's whole
   polarity is dealt here ---- */
function pfFieldPass(x,d,W,H,withShelf){
  const f=d.field||'paper';
  if(f==='dark'){
    x.fillStyle='#2c2517'; x.fillRect(0,0,W,H);
    fillScreened(x,pfP2(p=>p.rect(0,0,W,H)),[['K',.25]],null,2);
  } else if(f==='deepblue'){
    fillScreened(x,pfP2(p=>p.rect(0,0,W,H)),[['C',.5],['K',.25]],null,2);
    x.fillStyle='rgba(18,20,38,.45)'; x.fillRect(0,0,W,H);
  } else if(f==='C25'){ fillScreened(x,pfP2(p=>p.rect(0,0,W,H)),[['C',.25]],null,2); }
  else if(f==='M25'){ fillScreened(x,pfP2(p=>p.rect(0,0,W,H)),[['M',.25]],null,2); }
  else if(f==='Y25'){ fillScreened(x,pfP2(p=>p.rect(0,0,W,H)),[['Y',.25]],null,2); }
  else if(f==='rays'){
    fillScreened(x,pfP2(p=>p.rect(0,0,W,H)),[['Y',.25]],null,2);
    const cx0=W*(d.fx||0.5), cy0=H*0.45;
    x.fillStyle='rgba(35,28,18,.07)';
    for(let i=0;i<12;i+=2){ const a0=i*Math.PI/6+((d.gh>>>5)%7)/10, a1=a0+Math.PI/12;
      x.beginPath(); x.moveTo(cx0,cy0);
      x.lineTo(cx0+Math.cos(a0)*W*1.6,cy0+Math.sin(a0)*W*1.6);
      x.lineTo(cx0+Math.cos(a1)*W*1.6,cy0+Math.sin(a1)*W*1.6); x.closePath(); x.fill(); }
  } else if(f==='dots'){
    fillScreened(x,pfP2(p=>p.rect(0,0,W,H)),[['C',.09]],null,2);
    x.fillStyle='rgba(35,28,18,.75)';
    const rd=mulberry(d.seed^0xd07);
    for(let i=0;i<15;i++){ const a=rd()*Math.PI*2, r=rd()*H*0.4;
      x.beginPath(); x.arc(W*(d.fx<0.5?0.82:0.18)+Math.cos(a)*r,H*0.26+Math.sin(a)*r*0.7,
        1.6+rd()*4.4,0,7); x.fill(); }
  } else { /* paper: faint tooth only */
    x.fillStyle='rgba(253,248,234,.4)'; x.fillRect(0,0,W,H);
    x.strokeStyle='rgba(35,28,18,.10)'; x.lineWidth=1;
    const rd=mulberry(d.seed^0x9a9);
    for(let i=0;i<7;i++){ const yy=H*0.1+rd()*H*0.8;
      x.beginPath(); x.moveTo(W*rd()*0.3,yy); x.lineTo(W*(0.7+rd()*0.3),yy+rd()*6-3); x.stroke(); }
  }
  const darkF=(f==='dark'||f==='deepblue');
  if(withShelf){
    const sy=H*(d.shelfY||0.84);
    /* the stage shelf the giant subject stands on */
    x.fillStyle=darkF?'rgba(246,239,221,.14)':'rgba(35,28,18,.14)';
    x.fillRect(0,sy,W,H-sy);
    x.strokeStyle=darkF?'rgba(246,239,221,.7)':'rgba(35,28,18,.7)'; x.lineWidth=2.4;
    x.beginPath(); x.moveTo(0,sy); x.lineTo(W,sy); x.stroke();
  }
  d.fieldDark=darkF;
}
/* ---- the close-up's specimen tags: the page's own h3s, strung to the
   subject like a naturalist's labels ---- */
function pfTagsPass(x,d,W,H){
  let tags=(d.labels3.length?d.labels3:d.labels).slice(0,3);
  if(!tags.length) tags=d.toks.slice(0,2).filter(Boolean).map(t=>String(t).toUpperCase());
  if(!tags.length) return;
  const cx0=W*(d.fx||0.5), cy0=H*0.5;
  const rd=mulberry(d.seed^0x7a6);
  const baseA=((d.gh>>>9)%13)/13*Math.PI*2;
  tags.forEach((t2,i)=>{
    const a=baseA+i*(Math.PI*2/Math.max(3,tags.length))+rd()*0.5;
    const rr=Math.min(W,H)*(0.33+rd()*0.09);
    let tx2=cx0+Math.cos(a)*rr, ty2=cy0+Math.sin(a)*rr*0.86;
    const tw=Math.max(40,Math.min(96,t2.length*6.4+14));
    tx2=clamp(tx2,tw/2+8,W-tw/2-8); ty2=clamp(ty2,H*0.10,H*0.86);
    /* the string to the subject */
    x.strokeStyle=d.fieldDark?'rgba(246,239,221,.55)':'rgba(35,28,18,.55)';
    x.lineWidth=1.3; x.setLineDash([4,3]);
    x.beginPath(); x.moveTo(tx2,ty2);
    x.quadraticCurveTo((tx2+cx0)/2+8,(ty2+cy0)/2-8,
      cx0+(tx2>cx0?1:-1)*W*0.09,cy0+(ty2>cy0?1:-1)*H*0.07);
    x.stroke(); x.setLineDash([]);
    /* the tag card, a corner clipped like a luggage label */
    x.save(); x.translate(tx2,ty2); x.rotate((rd()*2-1)*0.06);
    x.fillStyle='#fdf8ea';
    x.beginPath(); x.moveTo(-tw/2+6,-10); x.lineTo(tw/2,-10); x.lineTo(tw/2,10);
    x.lineTo(-tw/2+6,10); x.lineTo(-tw/2,0); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.5; x.stroke();
    x.fillStyle=INKC; x.beginPath(); x.arc(-tw/2+6,0,1.6,0,7); x.fill();
    x.textAlign='center';
    pfFitFont(x,t2,tw-16,8.4,'600 %px Oswald,"Arial Narrow",sans-serif');
    x.fillText(t2,3,3); x.textAlign='left'; x.restore();
  });
}
/* ---- the iris ring: the subject seen through the page's own lens, its
   headings riveted to the bezel ---- */
function pfIrisRing(x,d,W,H){
  const cx0=d.iris.cx*W, cy0=d.iris.cy*H, r=d.iris.r*Math.min(W,H);
  x.strokeStyle=INKC; x.lineWidth=7;
  x.beginPath(); x.arc(cx0,cy0,r,0,7); x.stroke();
  x.strokeStyle=d.fieldDark?'rgba(246,239,221,.5)':'rgba(35,28,18,.4)'; x.lineWidth=2;
  x.beginPath(); x.arc(cx0,cy0,r+7,0,7); x.stroke();
  /* rivets */
  x.fillStyle=d.fieldDark?'#d9c8a2':INKC;
  for(let i=0;i<8;i++){ const a=i*Math.PI/4+0.4;
    x.beginPath(); x.arc(cx0+Math.cos(a)*(r+3.5),cy0+Math.sin(a)*(r+3.5),2.2,0,7); x.fill(); }
  /* the page's own headings plate the bezel — its own name when it keeps
     no headings at all */
  let tags=(d.labels.length?d.labels:d.labels3).slice(0,3);
  if(!tags.length) tags=d.toks.slice(0,2).filter(Boolean).map(t=>String(t).toUpperCase());
  const a0=((d.gh>>>11)%7)/7*Math.PI*2;
  tags.forEach((t2,i)=>{
    const a=a0+i*(Math.PI*2/Math.max(3,tags.length));
    let px2=cx0+Math.cos(a)*(r+16), py2=cy0+Math.sin(a)*(r+16);
    const tw=Math.max(40,Math.min(100,t2.length*6.4+14));
    px2=clamp(px2,tw/2+8,W-tw/2-8); py2=clamp(py2,H*0.06,H*0.92);
    x.save(); x.translate(px2,py2); x.rotate(0);
    x.fillStyle='#e8d9ac'; x.fillRect(-tw/2,-9,tw,18);
    x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(-tw/2,-9,tw,18);
    x.fillStyle=INKC; x.textAlign='center';
    pfFitFont(x,t2,tw-10,8.6,'600 %px Oswald,"Arial Narrow",sans-serif');
    x.fillText(t2,0,3); x.textAlign='left'; x.restore();
  });
}
/* ---- the predella: a band of small drawn cells, one per section of the
   page, under (or over) the main scene like an altarpiece's footer ---- */
function pfPredellaPass(x,d,W,H){
  const top=d.panel.top, frac=d.panel.frac;
  const by0=top?0:H*frac, bh=top?H*(1-frac):H*(1-frac);
  const y0=top?0:H*frac;
  /* the band's own ground — opposite value to the scene's sky */
  const darkBand=((d.gh>>>19)&1)===1;
  if(darkBand){ x.fillStyle='#2e2718'; x.fillRect(0,y0,W,bh);
    fillScreened(x,pfP2(p=>p.rect(0,y0,W,bh)),[['K',.25]],null,2); }
  else { fillScreened(x,pfP2(p=>p.rect(0,y0,W,bh)),
    [[['C','M','Y'][(d.gh>>>20)%3],.25]],null,2); }
  x.strokeStyle=INKC; x.lineWidth=3;
  x.beginPath(); x.moveTo(0,top?y0+bh:y0); x.lineTo(W,top?y0+bh:y0); x.stroke();
  const cells=d.pred.length?d.pred:[{text:(d.toks[0]||'THE PAGE'),prop:null}];
  const n=Math.min(3,cells.length);
  for(let i=0;i<n;i++){
    const cx2=W*((i+0.5)/n), cw=W/n;
    if(i>0){ x.strokeStyle='rgba(35,28,18,.55)'; x.lineWidth=1.6;
      x.beginPath(); x.moveTo(W*i/n,y0+6); x.lineTo(W*i/n,y0+bh-6); x.stroke(); }
    const ink=darkBand?'rgba(246,239,221,.9)':INKC;
    if(cells[i].prop) drawProp(x,cells[i].prop,cx2,y0+bh*0.44,
      Math.min(30,bh*0.34),darkBand?'#d9c8a2':'#8a3b2a');
    x.fillStyle=ink; x.textAlign='center';
    pfFitFont(x,cells[i].text,cw-18,9,'600 %px Oswald,"Arial Narrow",sans-serif');
    x.fillText(cells[i].text,cx2,y0+bh-9); x.textAlign='left';
  }
}
/* ---- the verdict furniture: how THIS page's breaking change is served
   on its own subject — rope, planks, wire-hung banner, or the corner
   ribbon; the page's verb picks the instrument ---- */
function pfVerdictPass(x,d,R,W,H){
  const tok=pfShort(pfToken(d.m.title)||pfTok(d,0,'THE OLD WAY'),16);
  const cy=d.interior?H*0.55:d.hz*H+(H-d.hz*H)*0.42;
  const mode=d.edict;
  if(mode==='toppled'||mode==='roped'){
    /* stakes and a condemnation rope strung across the subject */
    const y1=cy+H*0.10;
    for(const sx of [R.cx-R.w*0.42,R.cx+R.w*0.42]){
      x.strokeStyle=INKC; x.lineWidth=2.6;
      x.beginPath(); x.moveTo(sx,y1+16); x.lineTo(sx,y1-14); x.stroke();
      x.fillStyle='#e9c81f'; x.beginPath(); x.arc(sx,y1-17,3.2,0,7); x.fill();
      x.strokeStyle=INKC; x.lineWidth=1.2; x.stroke();
    }
    x.strokeStyle='#8a3b2a'; x.lineWidth=2.8;
    x.beginPath(); x.moveTo(R.cx-R.w*0.42,y1-14);
    x.quadraticCurveTo(R.cx,y1-2,R.cx+R.w*0.42,y1-14); x.stroke();
    pfSign(x,R.cx+((d.gh>>>13)&1?-1:1)*R.w*0.28,y1+18,tok,
      {s:0.9,post:12,maxW:110,tone:'#e8d9ac'});
  } else if(mode==='boarded'){
    /* planks nailed straight across the subject */
    for(const [dy,ang] of [[-H*0.06,0.16],[H*0.02,-0.2],[H*0.10,0.1]]){
      x.save(); x.translate(R.cx,cy+dy); x.rotate(ang);
      x.fillStyle='#c9a86a'; x.fillRect(-R.w*0.34,-6,R.w*0.68,12);
      x.strokeStyle=INKC; x.lineWidth=1.7; x.strokeRect(-R.w*0.34,-6,R.w*0.68,12);
      x.fillStyle=INKC;
      x.beginPath(); x.arc(-R.w*0.30,0,1.4,0,7); x.arc(R.w*0.30,0,1.4,0,7); x.fill();
      x.restore(); }
    x.save(); x.translate(R.cx+R.w*0.22,cy-H*0.12); x.rotate(0.08);
    x.fillStyle='#fdf6e2'; x.fillRect(-26,-15,52,30);
    x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(-26,-15,52,30);
    x.fillStyle='#c22a1c'; x.textAlign='center';
    x.font='700 8px Oswald,sans-serif'; x.fillText('CLOSED',0,-3);
    x.fillStyle=INKC;
    pfFitFont(x,tok,46,7,'700 %px "Courier Prime",monospace');
    x.fillText(tok,0,9); x.textAlign='left'; x.restore();
  } else if(mode==='handover'){
    /* the new name runs up the pole while the old is crated at its foot */
    const px2=R.cx+((d.gh>>>13)&1?-1:1)*R.w*0.34;
    const newTok=pfShort((String(d.m.title||'').split(/instead of|replaces|replaced by| uses? /i)[0]||'').trim()||pfTok(d,1,'THE NEW WAY'),16);
    pfFlag(x,px2,cy+H*0.14,H*0.30,newTok,'#5fae57',px2<R.cx?1:-1);
    pfCrate(x,px2+(px2<R.cx?1:-1)*40,cy+H*0.13,36,20,pfShort(tok,8));
  } else if(mode==='scaffold'){
    /* the subject under working scaffold — being rebuilt, not buried */
    for(const sx of [R.cx-R.w*0.36,R.cx+R.w*0.30]){
      x.strokeStyle=INKC; x.lineWidth=2.6;
      x.beginPath(); x.moveTo(sx,cy+H*0.14); x.lineTo(sx,cy-H*0.2); x.stroke(); }
    x.lineWidth=1.8;
    for(let r2=0;r2<3;r2++){ const yy=cy+H*0.08-r2*H*0.1;
      x.beginPath(); x.moveTo(R.cx-R.w*0.36,yy); x.lineTo(R.cx+R.w*0.30,yy); x.stroke(); }
    pfLadder(x,R.cx+R.w*0.02,cy+H*0.13,H*0.22,0.05);
    pfSign(x,R.cx-R.w*0.2,cy+H*0.16,tok,{s:0.86,post:10,maxW:100,tone:'#e8d9ac'});
  } else { /* newflag */
    const px2=R.cx+((d.gh>>>13)&1?-1:1)*R.w*0.3;
    pfFlag(x,px2,cy+H*0.14,H*0.30,tok,'#c22a1c',px2<R.cx?1:-1);
  }
}
/* the breaking-change ribbon: unscaled, riding one corner of the plate */
function pfEdictRibbon(x,d,W,H){
  const corner=(d.gh>>>15)%4; /* 0 tl,1 tr,2 bl,3 br */
  const cx0=(corner%2)?W:0, cy0=(corner<2)?0:H;
  const sgnX=(corner%2)?-1:1, sgnY=(corner<2)?1:-1;
  const off=Math.min(W,H)*0.245;
  x.save();
  x.translate(cx0+sgnX*off*0.5,cy0+sgnY*off*0.5);
  x.rotate(sgnX*sgnY*Math.PI/4);
  x.fillStyle='#c22a1c'; x.fillRect(-off*1.5,-13,off*3,26);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(-off*1.5,-13,off*3,26);
  x.fillStyle='#fdf6e2'; x.textAlign='center';
  x.font='700 11px Oswald,sans-serif';
  x.fillText('BREAKING CHANGE',0,-1);
  const tok=pfShort(pfToken(d.m.title)||pfTok(d,0,''),18);
  if(tok){ x.font='700 7.5px "Courier Prime",monospace'; x.fillText(tok,0,9); }
  x.textAlign='left'; x.restore();
}

/* ---- the subjects: each painter draws THIS page's own thing ---- */
function pfLab(d,i,fb){ return (d.labels3[i]||d.labels[i]||fb||'').toUpperCase(); }
function pfTok(d,i,fb){ return (d.toks[i]||fb||'').toUpperCase(); }
const MOTIF_PAINT={
doors(x,d,R,W,H){
  /* a wall of named doors — every key hangs in sight, each fits one only */
  const n=clamp(d.labels3.length||3,3,4);
  const dw=Math.min(96,R.w/n*0.86), dh=Math.min(H*0.335,dw*2.5), wy=H*0.72;
  const x0=R.cx-((n-1)/2)*(dw*1.28);
  for(let i=0;i<n;i++){
    const dx=x0+i*(dw*1.28), open=i===((d.h>>>6)%n);
    x.fillStyle='rgba(35,28,18,.25)'; x.fillRect(dx-dw/2-4,wy-dh-8,dw+8,dh+8);
    if(i%2){ x.fillStyle=open?'#f3e2b0':'#6b4a2e';
      x.beginPath(); x.moveTo(dx-dw/2,wy); x.lineTo(dx-dw/2,wy-dh*0.72);
      x.arc(dx,wy-dh*0.72,dw/2,Math.PI,0); x.lineTo(dx+dw/2,wy); x.closePath(); x.fill();
      x.strokeStyle=INKC; x.lineWidth=2.4; x.stroke(); }
    else { x.fillStyle=open?'#f3e2b0':'#4a3320';
      x.fillRect(dx-dw/2,wy-dh,dw,dh);
      x.strokeStyle=INKC; x.lineWidth=2.4; x.strokeRect(dx-dw/2,wy-dh,dw,dh); }
    if(open){ x.fillStyle='rgba(233,200,31,.5)';
      x.beginPath(); x.moveTo(dx-dw/2,wy); x.lineTo(dx+dw/2,wy);
      x.lineTo(dx+dw*1.1,H*0.86); x.lineTo(dx-dw*1.1,H*0.86); x.closePath(); x.fill(); }
    else { x.strokeStyle='rgba(35,28,18,.6)'; x.lineWidth=1.2;
      x.strokeRect(dx-dw*0.3,wy-dh*0.8,dw*0.6,dh*0.34);
      x.fillStyle='#e9c81f'; x.beginPath(); x.arc(dx+dw*0.28,wy-dh*0.42,2.6,0,7); x.fill(); }
    /* the door's name is its VERB — the page's own operations */
    const wsrc=(d.labels3F[i]||d.labels[i]||'ENTER').split(' ');
    let lb=wsrc[0];
    for(let j=0;j<i;j++){ const pw2=(d.labels3F[j]||d.labels[j]||'').split(' ')[0];
      if(pw2===lb){ const mw2=pfWords(d.labels3F[i]||d.labels[i]||'').filter(w=>w!==lb&&w!=='NEW');
        if(mw2.length){ lb=mw2[mw2.length-1]; } break; } }
    lb=pfShort(lb,12);
    x.fillStyle='#e9c81f'; x.fillRect(dx-dw*0.34,wy-dh*0.86,dw*0.68,15);
    x.strokeStyle=INKC; x.lineWidth=1.5; x.strokeRect(dx-dw*0.34,wy-dh*0.86,dw*0.68,15);
    x.save(); x.fillStyle=INKC; x.textAlign='center';
    pfFitFont(x,lb,dw*0.6,8.6,'600 %px Oswald,sans-serif');
    x.fillText(lb,dx,wy-dh*0.86+11); x.textAlign='left'; x.restore();
    /* each door's key hangs on its own hook above the lintel */
    x.strokeStyle=INKC; x.lineWidth=1.6;
    x.beginPath(); x.moveTo(dx,wy-dh-16); x.lineTo(dx,wy-dh-4); x.stroke();
    pfKeyBig(x,dx,wy-dh-20,1.05,Math.PI/2+((d.h>>>i)%7-3)*0.06);
  }
  /* the key-rack on the upper wall: every key accounted for */
  const rkx=d.fx<0.5?R.cx+R.w*0.30:R.cx-R.w*0.30, rky=H*0.26;
  x.fillStyle='#6b4a2e'; x.fillRect(rkx-56,rky,112,84);
  x.strokeStyle=INKC; x.lineWidth=2.2; x.strokeRect(rkx-56,rky,112,84);
  x.fillStyle='#e8d9ac'; x.fillRect(rkx-50,rky+6,100,18);
  x.strokeStyle=INKC; x.lineWidth=1.4; x.strokeRect(rkx-50,rky+6,100,18);
  x.save(); x.fillStyle=INKC; x.textAlign='center';
  pfFitFont(x,'KEYS OF OFFICE',92,9,'600 %px Oswald,sans-serif');
  x.fillText('KEYS OF OFFICE',rkx,rky+19); x.textAlign='left'; x.restore();
  for(let kk=0;kk<3;kk++){
    const hx9=rkx-32+kk*32;
    x.strokeStyle=INKC; x.lineWidth=1.6;
    x.beginPath(); x.moveTo(hx9,rky+32); x.lineTo(hx9,rky+40); x.stroke();
    if(kk!==((d.h>>>7)%3)) pfKeyBig(x,hx9,rky+50,1.0,Math.PI/2);
    else { x.strokeStyle='rgba(35,28,18,.45)'; x.lineWidth=1.2;
      x.beginPath(); x.arc(hx9,rky+50,7,0,7); x.stroke(); } /* one hook empty: that key walked */
  }
  /* the one great key on the floor before the wall — reach it who can */
  const kx9=d.figs.length?(d.figs[0].box[0]+d.figs[0].box[2]*1.3)*W:R.cx-R.w*0.2;
  pfKeyBig(x,kx9,H*0.875,3.0,-0.14);
  const kg=x.createRadialGradient(kx9,H*0.87,6,kx9,H*0.87,70);
  kg.addColorStop(0,'rgba(233,200,31,.30)'); kg.addColorStop(1,'rgba(233,200,31,0)');
  x.fillStyle=kg; x.beginPath(); x.arc(kx9,H*0.87,70,0,7); x.fill();
  x.fillStyle='rgba(35,28,18,.25)';
  x.beginPath(); x.ellipse(kx9,H*0.895,44,8,0,0,7); x.fill();
},
vault(x,d,R,W,H){
  /* the strongroom door: tokens live behind a wheel no stranger turns */
  const cy=H*0.46, r=Math.min(R.w*0.36,H*0.26);
  x.fillStyle='#57553f'; x.fillRect(R.cx-r*1.7,cy-r*1.55,r*3.4,r*3.2);
  x.strokeStyle=INKC; x.lineWidth=3; x.strokeRect(R.cx-r*1.7,cy-r*1.55,r*3.4,r*3.2);
  for(const [bx2,by2] of [[-1.5,-1.35],[1.5,-1.35],[-1.5,1.45],[1.5,1.45]]){
    x.fillStyle='#d9c8a2'; x.beginPath(); x.arc(R.cx+bx2*r,cy+by2*r,4,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.4; x.stroke(); }
  x.fillStyle='#8d8266'; x.beginPath(); x.arc(R.cx,cy,r,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=3.4; x.stroke();
  x.fillStyle='#6e6650'; x.beginPath(); x.arc(R.cx,cy,r*0.8,0,7); x.fill();
  x.lineWidth=2; x.stroke();
  /* the wheel */
  x.strokeStyle=INKC; x.lineWidth=4;
  x.beginPath(); x.arc(R.cx,cy,r*0.42,0,7); x.stroke();
  for(let i=0;i<6;i++){ const a=i*Math.PI/3+0.2;
    x.beginPath(); x.moveTo(R.cx+Math.cos(a)*r*0.1,cy+Math.sin(a)*r*0.1);
    x.lineTo(R.cx+Math.cos(a)*r*0.56,cy+Math.sin(a)*r*0.56); x.stroke(); }
  for(let i=0;i<8;i++){ const a=i*Math.PI/4;
    x.fillStyle='#d9c8a2'; x.beginPath();
    x.arc(R.cx+Math.cos(a)*r*0.9,cy+Math.sin(a)*r*0.9,3.4,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.2; x.stroke(); }
  pfCarve(x,R.cx,cy-r*1.2,pfTok(d,0,'TOKENS')+' RESERVE',{maxW:r*2.8,size:12});
  /* the issued tokens hang chained by the door, each named */
  const n=clamp(d.labels.length,2,4);
  for(let i=0;i<n;i++){
    const tx=R.cx+r*1.95, ty=H*0.34+i*H*0.09;
    x.strokeStyle=INKC; x.lineWidth=1.6;
    x.beginPath(); x.moveTo(tx,ty-14); x.lineTo(tx,ty-4); x.stroke();
    x.fillStyle=i===0?'#e9c81f':'#d9c8a2'; x.fillRect(tx-24,ty-4,48,18);
    x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(tx-24,ty-4,48,18);
    x.save(); x.fillStyle=INKC; x.textAlign='center';
    pfFitFont(x,pfLab(d,i,'TOKEN'),44,7.5,'600 %px Oswald,sans-serif');
    x.fillText(pfLab(d,i,'TOKEN'),tx,ty+8); x.textAlign='left'; x.restore();
  }
},
ledger(x,d,R,W,H){
  /* the audit ledger: every deed a line, every line a signature */
  const dy=H*0.72;
  x.fillStyle='#6b4a2e'; x.fillRect(R.cx-R.w*0.4,dy-8,R.w*0.8,H*0.16);
  x.strokeStyle=INKC; x.lineWidth=2.6; x.strokeRect(R.cx-R.w*0.4,dy-8,R.w*0.8,H*0.16);
  x.fillRect(R.cx-R.w*0.36,dy+H*0.08,10,H*0.13); x.fillRect(R.cx+R.w*0.33,dy+H*0.08,10,H*0.13);
  pfBookBig(x,R.cx,dy-H*0.09,R.w*0.62,{ang:-0.03,cover:'#8a3b2a'});
  /* its lines are the page's own recorded deeds */
  x.save(); x.translate(R.cx,dy-H*0.09); x.rotate(-0.03);
  x.fillStyle='rgba(35,28,18,.75)'; x.textAlign='left';
  const rows=d.labels3.length?d.labels3:d.labels;
  for(let i=0;i<Math.min(3,rows.length);i++){
    pfFitFont(x,rows[i],R.w*0.24,7,'600 %px "Courier Prime",monospace');
    x.fillText(rows[i],-R.w*0.27,-8+i*9);
  }
  x.textAlign='left'; x.restore();
  /* quill and standish */
  x.strokeStyle=INKC; x.lineWidth=2;
  x.beginPath(); x.moveTo(R.cx+R.w*0.3,dy-H*0.1); x.quadraticCurveTo(R.cx+R.w*0.37,dy-H*0.2,R.cx+R.w*0.33,dy-H*0.26); x.stroke();
  x.fillStyle=INKC; x.beginPath(); x.ellipse(R.cx+R.w*0.3,dy-H*0.093,7,3.4,0,0,7); x.fill();
  /* the seals of office hang above */
  for(let i=0;i<3;i++){
    const sx=R.cx-R.w*0.26+i*R.w*0.2;
    x.strokeStyle=INKC; x.lineWidth=1.4;
    x.beginPath(); x.moveTo(sx,H*0.30); x.lineTo(sx,H*0.37); x.stroke();
    x.fillStyle=['#c22a1c','#31647e','#e9c81f'][i];
    x.beginPath(); x.arc(sx,H*0.40,11,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.8; x.stroke();
    x.strokeStyle='rgba(246,239,221,.7)'; x.lineWidth=1.2;
    x.beginPath(); x.arc(sx,H*0.40,6.4,0,7); x.stroke();
  }
  pfCarve(x,R.cx,H*0.26,'EVERY ACTION IS ENTERED',{maxW:R.w*0.9,size:10,ink:'rgba(35,28,18,.6)'});
},
meters(x,d,R,W,H){
  /* the counting wall: dials spin, the chute pays the strongbox */
  const n=3, mw=Math.min(100,R.w*0.32);
  for(let i=0;i<n;i++){
    const mx=R.cx-((n-1)/2)*(mw*1.25)+i*(mw*1.25), my=H*0.40;
    x.fillStyle='#44403a'; x.fillRect(mx-mw/2,my-mw*0.65,mw,mw*0.95);
    x.strokeStyle=INKC; x.lineWidth=2.6; x.strokeRect(mx-mw/2,my-mw*0.65,mw,mw*0.95);
    x.fillStyle='#f6efdd'; x.fillRect(mx-mw*0.36,my-mw*0.5,mw*0.72,mw*0.3);
    x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(mx-mw*0.36,my-mw*0.5,mw*0.72,mw*0.3);
    x.fillStyle=INKC; x.font='700 '+Math.round(mw*0.2)+'px "Courier Prime",monospace'; x.textAlign='center';
    const num=String((d.seed>>> (i*5))%100000).padStart(5,'0');
    x.fillText(num,mx,my-mw*0.27);
    /* the needle dial below */
    x.fillStyle='#f6efdd'; x.beginPath(); x.arc(mx,my+mw*0.08,mw*0.2,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.6; x.stroke();
    x.lineWidth=2.6; x.beginPath(); x.moveTo(mx,my+mw*0.08);
    const a=Math.PI*(0.75+((d.h>>>(i*3))%100)/100*1.5);
    x.lineTo(mx+Math.cos(a)*mw*0.15,my+mw*0.08+Math.sin(a)*mw*0.15); x.stroke();
    pfBanner(x,mx,my-mw*0.65-20,pfLab(d,i,['PLAN','USAGE','INVOICE'][i]),{tone:'#31647e',s:0.8,maxW:mw*1.2,h:17});
  }
  x.textAlign='left';
  /* coin chute into the strongbox */
  x.strokeStyle=INKC; x.lineWidth=3;
  x.beginPath(); x.moveTo(R.cx+R.w*0.3,H*0.5); x.lineTo(R.cx+R.w*0.36,H*0.68); x.stroke();
  for(let i=0;i<4;i++){ x.fillStyle='#e9c81f';
    x.beginPath(); x.arc(R.cx+R.w*0.32+i*4,H*0.54+i*9,4,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.1; x.stroke(); }
  x.fillStyle='#57553f'; x.fillRect(R.cx+R.w*0.24,H*0.68,R.w*0.24,H*0.1);
  x.strokeStyle=INKC; x.lineWidth=2.2; x.strokeRect(R.cx+R.w*0.24,H*0.68,R.w*0.24,H*0.1);
  x.fillStyle='#e9c81f'; x.fillRect(R.cx+R.w*0.33,H*0.7,R.w*0.06,H*0.03);
},
counter(x,d,R,W,H){
  /* the permits office: three windows, one queue, many stamps */
  const n=3, cw=Math.min(112,R.w*0.34), wy=H*0.68;
  for(let i=0;i<n;i++){
    const cx2=R.cx-((n-1)/2)*(cw*1.2)+i*(cw*1.2);
    x.fillStyle='#8d8266'; x.fillRect(cx2-cw/2,wy-cw*1.1,cw,cw*1.1);
    x.strokeStyle=INKC; x.lineWidth=2.4; x.strokeRect(cx2-cw/2,wy-cw*1.1,cw,cw*1.1);
    x.fillStyle=i===1?'#f3e2b0':'#3a352b';
    x.beginPath(); x.moveTo(cx2-cw*0.3,wy-cw*0.2); x.lineTo(cx2-cw*0.3,wy-cw*0.75);
    x.arc(cx2,wy-cw*0.75,cw*0.3,Math.PI,0); x.lineTo(cx2+cw*0.3,wy-cw*0.2); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
    x.lineWidth=1.4;
    for(let b=1;b<4;b++){ x.beginPath(); x.moveTo(cx2-cw*0.3+b*cw*0.15,wy-cw*0.2);
      x.lineTo(cx2-cw*0.3+b*cw*0.15,wy-cw*(i===1?0.95:0.9)); x.stroke(); }
    x.fillStyle='#d9c8a2'; x.fillRect(cx2-cw*0.34,wy-cw*0.2,cw*0.68,5);
    x.strokeStyle=INKC; x.strokeRect(cx2-cw*0.34,wy-cw*0.2,cw*0.68,5);
    pfBanner(x,cx2,wy-cw*1.1-18,pfLab(d,i,['REGISTER','LOGIN','PROVIDERS'][i]),
      {tone:i===1?'#c22a1c':'#31647e',s:0.84,maxW:cw*1.16,h:17});
  }
  plateCrowd(x,H*0.80,R.cx-R.w*0.42,R.cx-R.w*0.05,d.seed,6,1.35,true);
  /* the great rubber stamp and its permit */
  x.fillStyle='#fdf8ea'; x.fillRect(R.cx+R.w*0.22,H*0.78,52,32);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(R.cx+R.w*0.22,H*0.78,52,32);
  x.save(); x.translate(R.cx+R.w*0.22+26,H*0.78+16); x.rotate(-0.14);
  x.strokeStyle='#c22a1c'; x.lineWidth=1.8; x.strokeRect(-20,-8,40,16);
  x.fillStyle='#c22a1c'; x.font='700 9px Oswald,sans-serif'; x.textAlign='center';
  x.fillText('GRANTED',0,3); x.textAlign='left'; x.restore();
},
masonry(x,d,R,W,H){
  /* the builder's yard: a tower of typed stones rises inside the scaffold */
  const bw=Math.min(58,R.w*0.20), by=H*0.87;
  const rows=clamp(d.labels.length+4,6,8);
  const blocks=['TEXT','NUMBER','MEDIA','RELATION','JSON','UID','DATE','EMAIL'];
  for(let r2=0;r2<rows;r2++){
    const nr=r2<2?4:(r2<4?3:(r2<6?2:1));
    for(let c2=0;c2<nr;c2++){
      const bx2=R.cx-((nr-1)/2)*(bw*1.06)+c2*(bw*1.06), by2=by-r2*(bw*0.62);
      x.fillStyle=['#d9c8a2','#c9a86a','#b9ab84'][(r2+c2)%3];
      x.fillRect(bx2-bw/2,by2-bw*0.56,bw,bw*0.56);
      x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(bx2-bw/2,by2-bw*0.56,bw,bw*0.56);
      const lb=blocks[(r2*3+c2)%blocks.length];
      x.save(); x.fillStyle=INKC; x.textAlign='center';
      pfFitFont(x,lb,bw-8,9,'600 %px Oswald,sans-serif');
      x.fillText(lb,bx2,by2-bw*0.19); x.textAlign='left'; x.restore();
    }
  }
  /* scaffold round the work */
  x.strokeStyle=INKC; x.lineWidth=3;
  for(const sx of [R.cx-bw*2.6,R.cx+bw*2.6]){
    x.beginPath(); x.moveTo(sx,by+6); x.lineTo(sx,by-rows*bw*0.62-24); x.stroke(); }
  x.lineWidth=1.8;
  for(let r2=1;r2<=2;r2++){ const py=by-r2*rows*bw*0.31;
    x.beginPath(); x.moveTo(R.cx-bw*2.6,py); x.lineTo(R.cx+bw*2.6,py); x.stroke();
    x.fillStyle='#8d8266'; x.fillRect(R.cx-bw*2.6,py-3,bw*5.2,3.4); }
  pfLadder(x,R.cx+bw*1.6,by+4,rows*bw*0.5,0.06);
  /* the crane hook swings the next stone in */
  x.strokeStyle=INKC; x.lineWidth=2.6;
  x.beginPath(); x.moveTo(R.cx-bw*2.6,by-rows*bw*0.62-24); x.lineTo(R.cx-bw*0.2,by-rows*bw*0.62-44); x.stroke();
  x.lineWidth=1.6;
  x.beginPath(); x.moveTo(R.cx-bw*0.5,by-rows*bw*0.62-42); x.lineTo(R.cx-bw*0.5,by-rows*bw*0.62-6); x.stroke();
  x.fillStyle='#c9a86a'; x.fillRect(R.cx-bw*0.5-bw/2,by-rows*bw*0.62-6,bw,bw*0.56);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(R.cx-bw*0.5-bw/2,by-rows*bw*0.62-6,bw,bw*0.56);
  /* the blueprint tacked to the hoarding */
  x.fillStyle='#31647e'; x.fillRect(R.cx-R.w*0.48,H*0.62,R.w*0.2,H*0.14);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(R.cx-R.w*0.48,H*0.62,R.w*0.2,H*0.14);
  x.strokeStyle='rgba(246,239,221,.85)'; x.lineWidth=1.2;
  x.strokeRect(R.cx-R.w*0.45,H*0.645,R.w*0.06,H*0.05);
  x.strokeRect(R.cx-R.w*0.37,H*0.645,R.w*0.05,H*0.03);
  x.beginPath(); x.moveTo(R.cx-R.w*0.45,H*0.72); x.lineTo(R.cx-R.w*0.31,H*0.72); x.stroke();
},
gallery(x,d,R,W,H){
  /* the salon wall: this library hangs its own pictures */
  const rng=mulberry(d.seed^0xa11e);
  const wallX0=R.cx-R.w*0.55, wallW=R.w*1.1;
  /* skylight beam */
  x.fillStyle='rgba(255,244,200,.16)';
  x.beginPath(); x.moveTo(R.cx-40,0); x.lineTo(R.cx+40,0);
  x.lineTo(R.cx+120,H*0.8); x.lineTo(R.cx-120,H*0.8); x.closePath(); x.fill();
  const cells=[[0.03,0.19,0.29,0.25],[0.36,0.15,0.34,0.31],[0.74,0.21,0.25,0.21],
               [0.05,0.50,0.25,0.23],[0.36,0.52,0.27,0.21],[0.68,0.48,0.29,0.27]];
  cells.forEach((c2,i)=>{
    pfFrame(x,wallX0+wallW*(c2[0]+c2[2]/2),H*(c2[1]+c2[3]/2),wallW*c2[2],H*c2[3],
      d.seed+i,{gold:i%2===0,kind:(d.seed>>>i)%4});
    /* hanging wire to the picture rail */
    x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1;
    x.beginPath(); x.moveTo(wallX0+wallW*(c2[0]+c2[2]/2),H*c2[1]);
    x.lineTo(wallX0+wallW*(c2[0]+c2[2]/2),H*0.145); x.stroke();
  });
  /* folder plaques borrow the page's own headings */
  for(let i=0;i<Math.min(2,d.labels.length);i++)
    pfBanner(x,wallX0+wallW*(0.25+i*0.5),H*0.78,d.labels[i],{tone:'#8a3b2a',s:0.9,maxW:wallW*0.4,h:18,rod:false});
  /* the plinth and bust keep the room honest */
  const px2=wallX0+wallW*0.88;
  x.fillStyle='#b9ab84'; x.fillRect(px2-20,H*0.68,40,H*0.14);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(px2-20,H*0.68,40,H*0.14);
  x.fillStyle='#d9c8a2';
  x.beginPath(); x.arc(px2,H*0.64,11,0,7); x.fill(); x.lineWidth=1.8; x.stroke();
  x.beginPath(); x.moveTo(px2-13,H*0.68); x.quadraticCurveTo(px2,H*0.645,px2+13,H*0.68);
  x.closePath(); x.fill(); x.stroke();
  /* velvet rope */
  for(const rx of [wallX0+wallW*0.12,wallX0+wallW*0.5]){
    x.strokeStyle=INKC; x.lineWidth=2.6;
    x.beginPath(); x.moveTo(rx,H*0.9); x.lineTo(rx,H*0.8); x.stroke();
    x.fillStyle='#e9c81f'; x.beginPath(); x.arc(rx,H*0.795,3.4,0,7); x.fill();
  }
  x.strokeStyle='#8a3b2a'; x.lineWidth=3;
  x.beginPath(); x.moveTo(wallX0+wallW*0.12,H*0.81);
  x.quadraticCurveTo(wallX0+wallW*0.31,H*0.86,wallX0+wallW*0.5,H*0.81); x.stroke();
},
quay(x,d,R,W,H){
  /* the container quay: cargo stacked, crane live, ship waiting */
  const hzY=d.hz*H, qy=H*0.80;
  /* the quay apron */
  x.fillStyle='#8d8266'; x.fillRect(0,qy-8,W,H*0.16);
  x.strokeStyle=INKC; x.lineWidth=2; x.beginPath(); x.moveTo(0,qy-8); x.lineTo(W,qy-8); x.stroke();
  /* the ship beyond the apron */
  pfBoatHull(x,R.cx+R.w*0.42,qy-26,R.w*0.62,'#3a352b');
  x.fillStyle='#d9c8a2'; x.fillRect(R.cx+R.w*0.5,qy-56,34,22);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(R.cx+R.w*0.5,qy-56,34,22);
  x.fillStyle='#c22a1c'; x.fillRect(R.cx+R.w*0.58,qy-74,10,20);
  x.strokeStyle=INKC; x.strokeRect(R.cx+R.w*0.58,qy-74,10,20);
  pfSmokeCurl(x,R.cx+R.w*0.63,qy-76,1.4);
  /* the stacks: containers lettered with the page's own words — every box
     its OWN word: deduped on the lettered form, topped up from the hold */
  const cw2=Math.min(88,R.w*0.31), ch=cw2*0.44;
  const rawN=[pfTok(d,0,''),pfLab(d,0,''),pfLab(d,1,''),pfTok(d,1,''),pfLab(d,2,''),
    pfLab(d,3,''),pfTok(d,2,''),pfTok(d,3,'')];
  const names=[], seenN=new Set();
  for(const nm0 of rawN){ const nm=String(nm0||'').trim();
    if(!nm) continue; const k9=nm.toUpperCase();
    if(seenN.has(k9)) continue; seenN.add(k9); names.push(nm); }
  for(const fb of ['IMAGE','VOLUME','ENV','PORTS','CACHE','APP','REGISTRY','COMPOSE']){
    if(names.length>=6) break;
    if(!seenN.has(fb)){ seenN.add(fb); names.push(fb); } }
  let ci9=0;
  const stacks=[[0,3],[1,2],[2,1]];
  stacks.forEach(([col,n2])=>{
    for(let r2=0;r2<n2;r2++){
      const bx2=R.cx-R.w*0.42+col*(cw2*1.06), by2=qy-10-r2*(ch+2);
      x.fillStyle=['#c22a1c','#31647e','#5fae57','#e9c81f'][(col+r2)%4];
      x.fillRect(bx2-cw2/2,by2-ch,cw2,ch);
      x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(bx2-cw2/2,by2-ch,cw2,ch);
      x.lineWidth=1;
      for(let v=1;v<5;v++){ x.beginPath(); x.moveTo(bx2-cw2/2+v*cw2/5,by2-ch+2);
        x.lineTo(bx2-cw2/2+v*cw2/5,by2-2); x.stroke(); }
      const lb=names[(ci9++)%names.length];
      x.save(); x.fillStyle='#f6efdd'; x.textAlign='center';
      pfFitFont(x,lb,cw2-10,8,'600 %px Oswald,sans-serif');
      x.fillText(lb,bx2,by2-ch*0.36); x.textAlign='left'; x.restore();
    }
  });
  /* the gantry crane over everything */
  x.strokeStyle=INKC; x.lineWidth=4;
  x.beginPath(); x.moveTo(R.cx-R.w*0.52,qy-4); x.lineTo(R.cx-R.w*0.52,H*0.24);
  x.lineTo(R.cx+R.w*0.3,H*0.24); x.stroke();
  x.lineWidth=2;
  x.beginPath(); x.moveTo(R.cx-R.w*0.52,H*0.30); x.lineTo(R.cx-R.w*0.38,H*0.24); x.stroke();
  const hx=R.cx+R.w*0.05;
  x.lineWidth=1.6; x.beginPath(); x.moveTo(hx,H*0.24); x.lineTo(hx,H*0.40); x.stroke();
  x.fillStyle='#31647e'; x.fillRect(hx-cw2/2,H*0.40,cw2,ch);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(hx-cw2/2,H*0.40,cw2,ch);
  x.save(); x.fillStyle='#f6efdd'; x.textAlign='center';
  pfFitFont(x,pfTok(d,0,'APP'),cw2-10,8,'600 %px Oswald,sans-serif');
  x.fillText(pfTok(d,0,'APP'),hx,H*0.40+ch*0.62); x.textAlign='left'; x.restore();
  /* bollard and hawser at our feet */
  x.fillStyle=INKC; x.beginPath(); x.arc(R.cx-R.w*0.1,H*0.885,9,Math.PI,0); x.fill();
  x.fillRect(R.cx-R.w*0.1-9,H*0.885,18,10);
  x.strokeStyle='rgba(35,28,18,.8)'; x.lineWidth=3;
  x.beginPath(); x.moveTo(R.cx-R.w*0.1,H*0.885);
  x.quadraticCurveTo(R.cx+R.w*0.2,H*0.93,R.cx+R.w*0.4,qy+6); x.stroke();
},
wires(x,d,R,W,H){
  /* the signal line: word leaves the moment the deed is done */
  const hzY=d.hz*H;
  const poles=[[R.cx-R.w*0.44,H*0.30],[R.cx+R.w*0.02,H*0.24],[R.cx+R.w*0.46,H*0.31]];
  poles.forEach(([px2,pt],i)=>{
    const py=hzY+(H-hzY)*0.32;
    x.strokeStyle=INKC; x.lineWidth=5;
    x.beginPath(); x.moveTo(px2,py); x.lineTo(px2,pt); x.stroke();
    x.lineWidth=3;
    for(let a2=0;a2<2;a2++){ x.beginPath(); x.moveTo(px2-20+a2*4,pt+10+a2*14);
      x.lineTo(px2+20-a2*4,pt+10+a2*14); x.stroke(); }
    x.fillStyle='#f6efdd';
    for(const dx2 of [-16,-6,6,16]){ x.beginPath(); x.arc(px2+dx2,pt+8,2.6,0,7); x.fill();
      x.strokeStyle=INKC; x.lineWidth=1; x.stroke(); }
  });
  for(let i=0;i<poles.length-1;i++)
    for(let w2=0;w2<2;w2++)
      pfWireRun(x,poles[i][0],poles[i][1]+10+w2*14,poles[i+1][0],poles[i+1][1]+10+w2*14,16,{lw:1.7});
  pfWireRun(x,poles[2][0],poles[2][1]+10,W+20,poles[2][1]+4,14,{lw:1.7});
  pfWireRun(x,poles[0][0],poles[0][1]+10,-20,poles[0][1]+18,14,{lw:1.7});
  /* the riding capsule, mid-flight between poles, speed ticks behind */
  const mx=(poles[0][0]+poles[1][0])/2, my=(poles[0][1]+poles[1][1])/2+22;
  x.fillStyle='#e9c81f';
  x.beginPath(); x.ellipse(mx,my,13,7,-0.1,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
  x.beginPath(); x.moveTo(mx-3,my-12); x.lineTo(mx+3,my-12); x.lineTo(mx,my-6); x.closePath();
  x.fillStyle=INKC; x.fill();
  x.strokeStyle='rgba(35,28,18,.6)'; x.lineWidth=1.6;
  for(let t2=0;t2<3;t2++){ x.beginPath(); x.moveTo(mx-18-t2*8,my-2+t2*2); x.lineTo(mx-28-t2*8,my-2+t2*2); x.stroke(); }
  /* each station posts the page's own events — boards kept ON the plate */
  poles.forEach(([px2,pt],i)=>{
    if(d.labels[i]) pfSign(x,clamp(px2,62,W-62),hzY+(H-hzY)*0.36,
      pfShort(d.labels[i],18),{s:0.9,post:18,maxW:110});
  });
},
bellpost(x,d,R,W,H){
  /* the mail room: pigeonholes, flying letters, the dispatch bell */
  const gx0=R.cx-R.w*0.46, gw=R.w*0.6, gy0=H*0.3, gh=H*0.34;
  x.fillStyle='#6b4a2e'; x.fillRect(gx0-8,gy0-8,gw+16,gh+16);
  x.strokeStyle=INKC; x.lineWidth=2.6; x.strokeRect(gx0-8,gy0-8,gw+16,gh+16);
  const cols=5,rows=4;
  for(let c2=0;c2<cols;c2++)for(let r2=0;r2<rows;r2++){
    const hx=gx0+c2*gw/cols, hy=gy0+r2*gh/rows;
    x.fillStyle='#3a352b'; x.fillRect(hx+2,hy+2,gw/cols-4,gh/rows-4);
    x.strokeStyle=INKC; x.lineWidth=1.2; x.strokeRect(hx+2,hy+2,gw/cols-4,gh/rows-4);
    if(((d.seed>>>(c2*4+r2))&1)===0){
      pfEnvelope(x,hx+gw/cols/2,hy+gh/rows/2,gw/cols*0.6,-0.06);
    }
  }
  /* letters on the wing, riding a drawn arc out the chute */
  for(let i=0;i<4;i++){
    const t2=i/3, ex=gx0+gw+20+t2*R.w*0.4, ey=H*0.42-Math.sin(t2*Math.PI)*H*0.14+t2*H*0.1;
    pfEnvelope(x,ex,ey,26-i*3,-0.3+t2*0.5);
    x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1.2;
    x.beginPath(); x.moveTo(ex-14,ey+6); x.quadraticCurveTo(ex-22,ey+9,ex-30,ey+8); x.stroke();
  }
  /* the dispatch bell on its bracket */
  x.strokeStyle=INKC; x.lineWidth=3;
  x.beginPath(); x.moveTo(gx0+gw+34,gy0-8); x.lineTo(gx0+gw+34,gy0+12); x.stroke();
  pfBellShape(x,gx0+gw+34,gy0+34,1.3);
  for(let a2=0;a2<3;a2++){ x.strokeStyle='rgba(35,28,18,.55)'; x.lineWidth=1.4;
    x.beginPath(); x.arc(gx0+gw+34,gy0+26,20+a2*8,-0.6,0.6); x.stroke(); }
  /* the sorting desk below, headed by the page's own sections */
  for(let i=0;i<Math.min(3,d.labels.length);i++)
    pfBanner(x,gx0+gw*(0.18+i*0.32),gy0+gh+30,d.labels[i],{tone:i%2?'#31647e':'#8a3b2a',s:0.82,maxW:gw*0.36,h:16});
},
belfry(x,d,R,W,H){
  /* the notice bell: one tower, rings that reach every roof */
  const hzY=d.hz*H, tw=Math.min(R.w*0.38,128), ty=hzY+(H-hzY)*0.30;
  x.fillStyle=d.night?'#2c2418':'#8d6b4a';
  x.fillRect(R.cx-tw/2,ty-H*0.42,tw,H*0.42);
  x.strokeStyle=INKC; x.lineWidth=2.6; x.strokeRect(R.cx-tw/2,ty-H*0.42,tw,H*0.42);
  /* the open bell chamber */
  x.fillStyle='#231c12';
  x.beginPath(); x.moveTo(R.cx-tw*0.32,ty-H*0.3); x.lineTo(R.cx-tw*0.32,ty-H*0.38);
  x.arc(R.cx,ty-H*0.38,tw*0.32,Math.PI,0); x.lineTo(R.cx+tw*0.32,ty-H*0.3); x.closePath(); x.fill();
  pfBellShape(x,R.cx,ty-H*0.315,1.5,'#e9c81f');
  /* the spire and vane */
  x.fillStyle='#57553f';
  x.beginPath(); x.moveTo(R.cx-tw*0.56,ty-H*0.42); x.lineTo(R.cx,ty-H*0.54);
  x.lineTo(R.cx+tw*0.56,ty-H*0.42); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
  x.lineWidth=2.2; x.beginPath(); x.moveTo(R.cx,ty-H*0.54); x.lineTo(R.cx,ty-H*0.60); x.stroke();
  /* the rings go out over the town */
  for(let a2=0;a2<4;a2++){
    x.strokeStyle=a2%2?'rgba(233,200,31,.8)':'rgba(35,28,18,.6)'; x.lineWidth=2.2-a2*0.3;
    x.beginPath(); x.arc(R.cx,ty-H*0.33,tw*0.5+a2*22,-2.4,-0.7); x.stroke();
    x.beginPath(); x.arc(R.cx,ty-H*0.33,tw*0.5+a2*22,Math.PI+0.7,Math.PI+2.4); x.stroke();
  }
  /* pigeons off the ledge */
  x.strokeStyle='rgba(35,28,18,.85)'; x.lineWidth=1.4;
  for(let i=0;i<3;i++){ const bx2=R.cx+tw*0.7+i*18, by2=ty-H*0.36-i*10;
    x.beginPath(); x.moveTo(bx2-4,by2); x.quadraticCurveTo(bx2-2,by2-3.6,bx2,by2);
    x.quadraticCurveTo(bx2+2,by2-3.6,bx2+4,by2); x.stroke(); }
  /* the town crier's board carries the page's own alerts */
  if(d.labels.length) pfSign(x,R.cx-tw*1.2,ty+H*0.06,d.labels[0],{s:1,post:26,maxW:130});
  if(d.labels[1]) pfSign(x,R.cx+tw*1.15,ty+H*0.08,d.labels[1],{s:0.9,post:20,maxW:120});
},
clockworks(x,d,R,W,H){
  /* the scheduled tower: the face keeps the cron's own hour */
  const hzY=d.hz*H, tw=Math.min(R.w*0.42,150), ty=H*0.84;
  x.fillStyle=d.night?'#2a251c':'#7d7357';
  x.fillRect(R.cx-tw/2,ty-H*0.52,tw,H*0.52);
  x.strokeStyle=INKC; x.lineWidth=2.8; x.strokeRect(R.cx-tw/2,ty-H*0.52,tw,H*0.52);
  x.fillStyle='#57553f';
  x.beginPath(); x.moveTo(R.cx-tw*0.6,ty-H*0.52); x.lineTo(R.cx,ty-H*0.62);
  x.lineTo(R.cx+tw*0.6,ty-H*0.52); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
  /* the face */
  const fr=tw*0.38, fy=ty-H*0.40;
  x.fillStyle='#f6efdd'; x.beginPath(); x.arc(R.cx,fy,fr,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=3; x.stroke();
  x.lineWidth=1.6;
  for(let i=0;i<12;i++){ const a2=i*Math.PI/6;
    x.beginPath(); x.moveTo(R.cx+Math.cos(a2)*fr*0.82,fy+Math.sin(a2)*fr*0.82);
    x.lineTo(R.cx+Math.cos(a2)*fr*0.94,fy+Math.sin(a2)*fr*0.94); x.stroke(); }
  const hh=((d.seed>>>3)%12)*Math.PI/6-Math.PI/2, mm=((d.seed>>>7)%60)*Math.PI/30-Math.PI/2;
  x.lineWidth=3.4; x.beginPath(); x.moveTo(R.cx,fy);
  x.lineTo(R.cx+Math.cos(hh)*fr*0.5,fy+Math.sin(hh)*fr*0.5); x.stroke();
  x.lineWidth=2; x.beginPath(); x.moveTo(R.cx,fy);
  x.lineTo(R.cx+Math.cos(mm)*fr*0.72,fy+Math.sin(mm)*fr*0.72); x.stroke();
  x.fillStyle=INKC; x.beginPath(); x.arc(R.cx,fy,3,0,7); x.fill();
  /* the pendulum swings in the open arch */
  x.fillStyle='#231c12';
  x.beginPath(); x.moveTo(R.cx-tw*0.26,ty); x.lineTo(R.cx-tw*0.26,ty-H*0.2);
  x.arc(R.cx,ty-H*0.2,tw*0.26,Math.PI,0); x.lineTo(R.cx+tw*0.26,ty); x.closePath(); x.fill();
  const pa=Math.sin((d.seed%100)/16)*0.4;
  x.strokeStyle='#e9c81f'; x.lineWidth=2.6;
  x.beginPath(); x.moveTo(R.cx,ty-H*0.2);
  x.lineTo(R.cx+Math.sin(pa)*H*0.13,ty-H*0.2+Math.cos(pa)*H*0.13); x.stroke();
  x.fillStyle='#e9c81f';
  x.beginPath(); x.arc(R.cx+Math.sin(pa)*H*0.13,ty-H*0.2+Math.cos(pa)*H*0.13,8,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.8; x.stroke();
  /* the duty pegs: every task hangs its tag on the hour */
  const tags=(d.labels3.length?d.labels3:d.labels);
  for(let i=0;i<Math.min(3,tags.length);i++){
    const px2=R.cx+tw*0.72, py=ty-H*0.34+i*H*0.09;
    x.strokeStyle=INKC; x.lineWidth=1.6;
    x.beginPath(); x.moveTo(px2,py-10); x.lineTo(px2,py-2); x.stroke();
    x.fillStyle='#fdf8ea'; x.fillRect(px2-6,py-2,66,15);
    x.strokeStyle=INKC; x.lineWidth=1.4; x.strokeRect(px2-6,py-2,66,15);
    x.save(); x.fillStyle=INKC;
    pfFitFont(x,tags[i],58,7,'700 %px "Courier Prime",monospace');
    x.fillText(tags[i],px2-2,py+9); x.restore();
  }
},
constellation(x,d,R,W,H){
  /* the queried sky: named stars, ruled lines — ask and the map answers */
  const rng=mulberry(d.seed^0x57a5);
  const n=clamp(4+(d.labels.length%4),4,7);
  /* the cluster drifts to the corner of the sky this page's own numbers
     name; its spread and altitude are the page's too */
  const ccx=R.cx+(((d.gh>>>4)%3)-1)*R.w*0.16;
  const spread=R.w*(0.42+((d.gh>>>6)%20)/100);
  const alt=H*(0.10+((d.gh>>>8)%10)/100);
  const pts=[];
  for(let i=0;i<n;i++)
    pts.push([ccx-spread/2+spread*((i+0.5)/n)+((rng()*2-1)*R.w*0.08),
      alt+rng()*H*0.34]);
  /* the ruled query lines */
  x.strokeStyle='rgba(246,239,221,.85)'; x.lineWidth=1.9; x.setLineDash([6,4]);
  for(let i=0;i<n-1;i++){ x.beginPath(); x.moveTo(pts[i][0],pts[i][1]);
    x.lineTo(pts[i+1][0],pts[i+1][1]); x.stroke(); }
  x.beginPath(); x.moveTo(pts[0][0],pts[0][1]); x.lineTo(pts[Math.floor(n/2)][0],pts[Math.floor(n/2)][1]); x.stroke();
  x.setLineDash([]);
  /* the stars themselves, one haloed — the field you asked for */
  pts.forEach((p2,i)=>{
    const r2=i===1?10:6+((d.seed>>>i)%4);
    if(i===1){ const g2=x.createRadialGradient(p2[0],p2[1],2,p2[0],p2[1],26);
      g2.addColorStop(0,'rgba(233,200,31,.5)'); g2.addColorStop(1,'rgba(233,200,31,0)');
      x.fillStyle=g2; x.beginPath(); x.arc(p2[0],p2[1],26,0,7); x.fill(); }
    x.fillStyle=i===1?'#e9c81f':'#f6efdd';
    x.beginPath(); x.arc(p2[0],p2[1],r2,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.4; x.stroke();
    x.strokeStyle='rgba(246,239,221,.5)'; x.lineWidth=1;
    x.beginPath(); x.arc(p2[0],p2[1],r2+4,0,7); x.stroke();
  });
  /* their names are the page's own words */
  const names=[pfTok(d,0,'QUERY'),pfTok(d,1,'MUTATION'),...d.labels];
  pts.forEach((p2,i)=>{ if(names[i]) pfCarve(x,p2[0],p2[1]-18,names[i],{maxW:100,size:10.5,ink:'rgba(246,239,221,.9)'}); });
  /* the astronomer's telescope waits on its tripod — on the page's side */
  const tx=R.cx+((d.gh>>>10)&1?1:-1)*R.w*(0.28+((d.gh>>>12)%10)/100), ty2=H*(0.76+((d.gh>>>14)%8)/100);
  x.strokeStyle=INKC; x.lineWidth=4;
  x.beginPath(); x.moveTo(tx-22,ty2); x.lineTo(tx,ty2-38); x.lineTo(tx+22,ty2); x.stroke();
  x.beginPath(); x.moveTo(tx,ty2-38); x.lineTo(tx,ty2-12); x.stroke();
  x.save(); x.translate(tx,ty2-46); x.rotate(-0.62);
  x.fillStyle='#8a5a2e'; x.fillRect(-9,-11,68,22);
  x.strokeStyle=INKC; x.lineWidth=2.4; x.strokeRect(-9,-11,68,22);
  x.fillStyle='#e9c81f'; x.fillRect(59,-8,12,16); x.strokeRect(59,-8,12,16);
  x.restore();
},
organ(x,d,R,W,H){
  /* the query organ: pull a stop, sound a parameter */
  const bw=R.w*0.9, bx0=R.cx-bw/2, by=H*0.78;
  /* pipes */
  const n=9;
  for(let i=0;i<n;i++){
    const ph=H*(0.18+0.16*Math.abs(Math.sin(i*1.7+d.seed%7)))+i%2*H*0.03;
    const pw=bw/n*0.72, px2=bx0+bw*(i+0.5)/n;
    x.fillStyle=i%2?'#d9c8a2':'#b9ab84';
    x.fillRect(px2-pw/2,by-H*0.22-ph,pw,ph);
    x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(px2-pw/2,by-H*0.22-ph,pw,ph);
    x.fillStyle=INKC; x.beginPath();
    x.ellipse(px2,by-H*0.22-ph+8,pw*0.24,4,0,0,7); x.fill();
  }
  /* the case and keyboard */
  x.fillStyle='#6b4a2e'; x.fillRect(bx0-8,by-H*0.22,bw+16,H*0.13);
  x.strokeStyle=INKC; x.lineWidth=2.4; x.strokeRect(bx0-8,by-H*0.22,bw+16,H*0.13);
  x.fillStyle='#f6efdd'; x.fillRect(bx0+bw*0.1,by-H*0.155,bw*0.8,H*0.045);
  x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(bx0+bw*0.1,by-H*0.155,bw*0.8,H*0.045);
  x.lineWidth=1;
  for(let i=1;i<14;i++){ x.beginPath(); x.moveTo(bx0+bw*0.1+i*bw*0.8/14,by-H*0.155);
    x.lineTo(bx0+bw*0.1+i*bw*0.8/14,by-H*0.11); x.stroke(); }
  x.fillStyle=INKC;
  for(let i=0;i<13;i++){ if(i%7===2||i%7===6)continue;
    x.fillRect(bx0+bw*0.1+i*bw*0.8/14+bw*0.02,by-H*0.155,bw*0.022,H*0.026); }
  /* the stops: knobs pulled by name — the page's own parameters */
  const stops=(d.labels.length?d.labels:['FILTERS','SORT','POPULATE']);
  for(let i=0;i<Math.min(4,stops.length);i++){
    const sx=bx0+bw*(0.16+i*0.24), sy=by-H*0.19;
    x.strokeStyle=INKC; x.lineWidth=2.4;
    x.beginPath(); x.moveTo(sx,sy); x.lineTo(sx,sy-14); x.stroke();
    x.fillStyle=i===1?'#c22a1c':'#e9c81f';
    x.beginPath(); x.arc(sx,sy-19,7,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.6; x.stroke();
    pfCarve(x,sx,sy-32,stops[i],{maxW:bw*0.24,size:8,ink:'rgba(35,28,18,.75)'});
  }
  /* sound made visible */
  x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1.6;
  for(let i=0;i<3;i++){ x.beginPath();
    x.arc(R.cx,H*0.16,18+i*10,-0.5-i*0.1,0.5+i*0.1); x.stroke(); }
},
oracle(x,d,R,W,H){
  /* the answering engine wears a different body on every page: the slot
     cabinet, the brass head on its column, or the punched-card loom */
  const form=(d.gh>>>4)%3;
  const my0=H*(0.74+((d.gh>>>6)%8)/100);
  if(form===1){ /* the brass head on the column */
    const hx=R.cx+(((d.gh>>>8)%3)-1)*R.w*0.12, hy=H*0.42;
    pfColumn(x,hx,my0,R.w*0.16,H*0.26,'#b9ab84');
    /* the head */
    x.fillStyle='#c9a86a'; x.beginPath(); x.arc(hx,hy,R.w*0.13,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=2.6; x.stroke();
    /* rivet seam + fixed gaze */
    x.strokeStyle='rgba(35,28,18,.55)'; x.lineWidth=1.2;
    x.beginPath(); x.moveTo(hx-R.w*0.13,hy); x.lineTo(hx+R.w*0.13,hy); x.stroke();
    x.fillStyle=INKC;
    x.beginPath(); x.arc(hx-R.w*0.05,hy-R.w*0.03,3.4,0,7);
    x.arc(hx+R.w*0.05,hy-R.w*0.03,3.4,0,7); x.fill();
    x.fillStyle='#e9c81f';
    x.beginPath(); x.arc(hx-R.w*0.05,hy-R.w*0.03,1.4,0,7);
    x.arc(hx+R.w*0.05,hy-R.w*0.03,1.4,0,7); x.fill();
    /* the mouth speaks ticker-tape */
    x.fillStyle='#2e2a22'; x.fillRect(hx-R.w*0.045,hy+R.w*0.045,R.w*0.09,6);
    x.fillStyle='#fdf8ea';
    x.beginPath(); x.moveTo(hx,hy+R.w*0.045+6);
    x.quadraticCurveTo(hx+R.w*0.13,hy+R.w*0.14,hx+R.w*0.09,my0-8);
    x.lineTo(hx+R.w*0.14,my0-4);
    x.quadraticCurveTo(hx+R.w*0.19,hy+R.w*0.13,hx+R.w*0.05,hy+R.w*0.045+6);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.4; x.stroke();
    x.fillStyle='rgba(35,28,18,.7)'; x.font='700 7px "Courier Prime",monospace';
    x.save(); x.translate(hx+R.w*0.115,hy+R.w*0.16); x.rotate(1.25);
    x.fillText((d.toks[0]||'ANSWER'),0,0); x.restore();
    /* laurel of lamps */
    for(let i=0;i<5;i++){ const a=Math.PI*(1.15+i*0.175);
      x.fillStyle=i%2?'#e9c81f':'#c22a1c';
      x.beginPath(); x.arc(hx+Math.cos(a)*R.w*0.19,hy+Math.sin(a)*R.w*0.19,3.2,0,7); x.fill();
      x.strokeStyle=INKC; x.lineWidth=1.2; x.stroke(); }
    pfCarve(x,hx,my0-H*0.02,'ASK THE DOCS',{maxW:R.w*0.3,size:8});
    return;
  }
  if(form===2){ /* the punched-card loom */
    const lw2=R.w*0.7, ly=my0, lx0=R.cx-lw2/2;
    /* frame */
    x.strokeStyle=INKC; x.lineWidth=3.4;
    x.beginPath(); x.moveTo(lx0,ly); x.lineTo(lx0,ly-H*0.3);
    x.moveTo(lx0+lw2,ly); x.lineTo(lx0+lw2,ly-H*0.3); x.stroke();
    x.lineWidth=2.4;
    x.beginPath(); x.moveTo(lx0-8,ly-H*0.3); x.lineTo(lx0+lw2+8,ly-H*0.3); x.stroke();
    /* the warp of threads */
    x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1.1;
    for(let i=0;i<9;i++){ const tx2=lx0+lw2*(i+0.5)/9;
      x.beginPath(); x.moveTo(tx2,ly-H*0.3); x.lineTo(tx2,ly-H*0.06); x.stroke(); }
    /* the punched cards riding the chain */
    for(let i=0;i<3;i++){
      const cx2=lx0+lw2*(0.2+i*0.3), cy2=ly-H*(0.34+((d.gh>>>(8+i))%5)/100);
      x.save(); x.translate(cx2,cy2); x.rotate(-0.06+i*0.05);
      x.fillStyle='#e8d9ac'; x.fillRect(-22,-14,44,28);
      x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(-22,-14,44,28);
      x.fillStyle=INKC;
      for(let r2=0;r2<3;r2++) for(let c2=0;c2<6;c2++)
        if(((d.gh>>>(r2*6+c2))&1)) x.fillRect(-18+c2*6,-9+r2*8,3,5);
      x.restore();
    }
    /* the woven answer coming off the beam */
    x.fillStyle='#fdf8ea'; x.fillRect(lx0+lw2*0.12,ly-H*0.05,lw2*0.76,H*0.045);
    x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(lx0+lw2*0.12,ly-H*0.05,lw2*0.76,H*0.045);
    x.fillStyle='rgba(35,28,18,.75)'; x.font='700 8px "Courier Prime",monospace'; x.textAlign='center';
    x.fillText((d.toks[0]||'ANSWER')+' · '+(d.toks[1]||'WOVEN'),R.cx,ly-H*0.018);
    x.textAlign='left';
    pfCarve(x,R.cx,ly-H*0.33,'ASK THE DOCS',{maxW:lw2,size:8.5});
    return;
  }
  /* form 0: the slot cabinet (its measures dealt per page) */
  const mw=Math.min(R.w*(0.5+((d.gh>>>8)%18)/100),235), my=my0;
  x.fillStyle='#44403a'; x.fillRect(R.cx-mw/2,my-H*0.34,mw,H*0.34);
  x.strokeStyle=INKC; x.lineWidth=2.8; x.strokeRect(R.cx-mw/2,my-H*0.34,mw,H*0.34);
  x.fillStyle='#2e2a22'; x.fillRect(R.cx-mw*0.36,my-H*0.30,mw*0.72,H*0.09);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(R.cx-mw*0.36,my-H*0.30,mw*0.72,H*0.09);
  x.fillStyle='#9fe08a'; x.font='700 11px "Courier Prime",monospace'; x.textAlign='center';
  x.fillText('ASK THE DOCS',R.cx,my-H*0.245); x.textAlign='left';
  /* the question slot */
  x.fillStyle=INKC; x.fillRect(R.cx-mw*0.2,my-H*0.17,mw*0.4,6);
  x.fillStyle='#fdf8ea'; x.save(); x.translate(R.cx-mw*0.05,my-H*0.19); x.rotate(-0.2);
  x.fillRect(-16,-11,32,22); x.strokeStyle=INKC; x.lineWidth=1.4; x.strokeRect(-16,-11,32,22);
  x.fillStyle=INKC; x.font='700 13px Oswald,sans-serif'; x.textAlign='center';
  x.fillText('?',0,5); x.textAlign='left'; x.restore();
  /* the horn and its ribbon of answer */
  x.fillStyle='#d9c8a2';
  x.beginPath(); x.moveTo(R.cx+mw/2,my-H*0.28); x.lineTo(R.cx+mw/2+26,my-H*0.33);
  x.lineTo(R.cx+mw/2+26,my-H*0.21); x.lineTo(R.cx+mw/2,my-H*0.24); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
  x.fillStyle='#fdf8ea';
  x.beginPath(); x.moveTo(R.cx+mw/2+26,my-H*0.30);
  x.quadraticCurveTo(R.cx+mw/2+70,my-H*0.28,R.cx+mw/2+62,my-H*0.12);
  x.quadraticCurveTo(R.cx+mw/2+56,my-H*0.02,R.cx+mw/2+90,my+H*0.02);
  x.lineTo(R.cx+mw/2+86,my+H*0.05);
  x.quadraticCurveTo(R.cx+mw/2+46,my,R.cx+mw/2+54,my-H*0.13);
  x.quadraticCurveTo(R.cx+mw/2+60,my-H*0.25,R.cx+mw/2+26,my-H*0.26);
  x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.4; x.stroke();
  x.fillStyle='rgba(35,28,18,.7)'; x.font='700 7px "Courier Prime",monospace';
  x.save(); x.translate(R.cx+mw/2+58,my-H*0.16); x.rotate(1.2);
  x.fillText((d.toks[0]||'ANSWER'),0,0); x.restore();
  /* dials and lamps */
  for(let i=0;i<3;i++){
    x.fillStyle=['#c22a1c','#e9c81f','#5fae57'][i];
    x.beginPath(); x.arc(R.cx-mw*0.3+i*mw*0.14,my-H*0.06,5,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.4; x.stroke(); }
  const g2=x.createRadialGradient(R.cx,my-H*0.26,6,R.cx,my-H*0.26,60);
  g2.addColorStop(0,'rgba(159,224,138,.30)'); g2.addColorStop(1,'rgba(159,224,138,0)');
  x.fillStyle=g2; x.beginPath(); x.arc(R.cx,my-H*0.26,60,0,7); x.fill();
},
scriptorium(x,d,R,W,H){
  /* the document scriptorium: copyist desks in rows, and THE DOCUMENT
     itself pinned high with its ribbons — draft, published, locales */
  const by=H*0.82;
  /* THE DOCUMENT, master copy, pinned to the back wall */
  const mx=R.cx+R.w*0.02, mw=R.w*0.34, mh=H*0.30, my=H*0.18;
  x.save(); x.translate(mx,my+mh/2); x.rotate(0.015);
  x.fillStyle='#fdf8ea'; x.fillRect(-mw/2,-mh/2,mw,mh);
  x.strokeStyle=INKC; x.lineWidth=2.4; x.strokeRect(-mw/2,-mh/2,mw,mh);
  x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1.2;
  for(let i=0;i<7;i++){ x.beginPath(); x.moveTo(-mw*0.36,-mh*0.28+i*mh*0.11);
    x.lineTo(mw*(i%3===2?0.16:0.36),-mh*0.28+i*mh*0.11); x.stroke(); }
  /* the great initial */
  x.fillStyle='#8a3b2a'; x.font='700 '+Math.round(mh*0.2)+'px Bangers,Impact,sans-serif';
  x.fillText('D',-mw*0.4,-mh*0.22);
  x.restore();
  x.fillStyle=INKC; x.beginPath(); x.arc(mx,my-3,3,0,7); x.fill();
  /* its ribbons: the states and tongues this service serves */
  const ribs=['DRAFT','PUBLISHED','EN','FR'];
  ribs.forEach((rb,i)=>{
    const rx=mx-mw/2+8+i*(mw-16)/3.2;
    x.fillStyle=['#8d8266','#e9c81f','#31647e','#c22a1c'][i];
    x.beginPath(); x.moveTo(rx-8,my+mh); x.lineTo(rx+8,my+mh);
    x.lineTo(rx+8,my+mh+26+i*4); x.lineTo(rx,my+mh+20+i*4); x.lineTo(rx-8,my+mh+26+i*4);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.3; x.stroke();
    x.save(); x.fillStyle=i===1?INKC:'#f6efdd'; x.textAlign='center';
    pfFitFont(x,rb,15,5.4,'600 %px Oswald,sans-serif');
    x.save(); x.translate(rx,my+mh+12); x.rotate(1.5708); x.fillText(rb,4,2); x.restore();
    x.textAlign='left'; x.restore();
  });
  /* the copyist desks, two rows, each with lamp and sheet */
  for(let r9=0;r9<2;r9++)for(let c9=0;c9<3;c9++){
    const dx2=R.cx-R.w*0.40+c9*R.w*0.26+(r9%2)*R.w*0.10;
    const dy2=by-r9*H*0.13, s9=1-r9*0.18;
    x.fillStyle='#8d6b4a';
    x.beginPath(); x.moveTo(dx2-26*s9,dy2); x.lineTo(dx2+26*s9,dy2);
    x.lineTo(dx2+20*s9,dy2-16*s9); x.lineTo(dx2-20*s9,dy2-16*s9); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.8*s9; x.stroke();
    x.fillRect(dx2-22*s9,dy2,4*s9,10*s9); x.fillRect(dx2+18*s9,dy2,4*s9,10*s9);
    /* the sheet on the slope */
    x.fillStyle='#fdf8ea';
    x.save(); x.translate(dx2,dy2-9*s9); x.rotate(-0.1);
    x.fillRect(-9*s9,-6*s9,18*s9,12*s9);
    x.strokeStyle='rgba(35,28,18,.6)'; x.lineWidth=1; x.strokeRect(-9*s9,-6*s9,18*s9,12*s9);
    x.restore();
    /* the copyist's candle */
    if(c9===2||r9===1){ x.fillStyle='#f6efdd'; x.fillRect(dx2+24*s9,dy2-24*s9,3*s9,8*s9);
      plateFlame(x,dx2+25*s9,dy2-24*s9,0.6*s9,d.seed+r9*3+c9); }
  }
},

temple(x,d,R,W,H){
  /* the API temple: carved verbs hold the roof up */
  const hzY=d.hz*H, by=hzY+(H-hzY)*0.42;
  const tw=R.w*0.94, n=clamp(d.labels.length||4,3,6), colW=Math.min(22,tw*0.4/n);
  /* steps */
  for(let s2=0;s2<3;s2++){
    x.fillStyle=['#d9c8a2','#c9bd96','#b9ab84'][s2];
    x.fillRect(R.cx-tw/2-10+s2*8,by+s2*9,tw+20-s2*16,9);
    x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(R.cx-tw/2-10+s2*8,by+s2*9,tw+20-s2*16,9);
  }
  const colH=H*0.24;
  for(let i=0;i<n;i++)
    pfColumn(x,R.cx-tw*0.42+i*(tw*0.84/(n-1)),by,colW,colH,'#e0d2a8');
  /* architrave carved with the page's own verbs */
  x.fillStyle='#d9c8a2'; x.fillRect(R.cx-tw/2,by-colH-26,tw,22);
  x.strokeStyle=INKC; x.lineWidth=2.2; x.strokeRect(R.cx-tw/2,by-colH-26,tw,22);
  const verbs=(d.m.stats&&d.m.stats.endp>0)?['GET','POST','PUT','DELETE']
    :(d.labels.length?d.labels.slice(0,4):['GET','POST','PUT','DELETE']);
  verbs.slice(0,n).forEach((v2,i)=>pfCarve(x,R.cx-tw*0.42+i*(tw*0.84/(n-1)),by-colH-11,pfShort(v2,10),{maxW:tw*0.84/n-6,size:10,mono:true,ink:'rgba(35,28,18,.7)'}));
  /* the roof this temple was given */
  const roofK=(d.h>>>6)%3;
  x.fillStyle='#e0d2a8';
  if(roofK===0){
    x.beginPath(); x.moveTo(R.cx-tw/2-8,by-colH-26); x.lineTo(R.cx,by-colH-26-tw*0.16);
    x.lineTo(R.cx+tw/2+8,by-colH-26); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
  } else if(roofK===1){
    x.fillRect(R.cx-tw/2-10,by-colH-40,tw+20,14);
    x.strokeStyle=INKC; x.lineWidth=2.2; x.strokeRect(R.cx-tw/2-10,by-colH-40,tw+20,14);
    for(const ax9 of [-tw/2-6,0,tw/2+6]){
      x.fillRect(R.cx+ax9-5,by-colH-52,10,12); x.strokeRect(R.cx+ax9-5,by-colH-52,10,12); }
  } else {
    x.strokeStyle=INKC; x.lineWidth=8;
    x.beginPath(); x.arc(R.cx,by-colH-26,tw*0.34,Math.PI+0.3,-0.3); x.stroke();
    x.strokeStyle='#e0d2a8'; x.lineWidth=5;
    x.beginPath(); x.arc(R.cx,by-colH-26,tw*0.34,Math.PI+0.3,-0.3); x.stroke();
  }
  pfCarve(x,R.cx,by-colH-30-tw*0.05,pfTok(d,0,'API'),{maxW:tw*0.5,size:13});
  /* the brazier burning at the door */
  x.fillStyle='#57553f'; x.fillRect(R.cx-6,by-16,12,16);
  x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(R.cx-6,by-16,12,16);
  plateFlame(x,R.cx,by-16,1.6,d.seed);
},
aqueduct(x,d,R,W,H){
  /* one source, three channels: the content flows to every city */
  const hzY=d.hz*H, ay=hzY+(H-hzY)*0.3;
  /* the high arches crossing the whole plate */
  x.fillStyle='#b9ab84';
  x.fillRect(0,ay-16,W,20);
  x.strokeStyle=INKC; x.lineWidth=2.2;
  x.beginPath(); x.moveTo(0,ay-16); x.lineTo(W,ay-16); x.moveTo(0,ay+4); x.lineTo(W,ay+4); x.stroke();
  const n=5;
  for(let i=0;i<=n;i++){
    const px2=W*(i/n);
    x.fillStyle='#b9ab84'; x.fillRect(px2-9,ay+4,18,H*0.2);
    x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(px2-9,ay+4,18,H*0.2);
    if(i<n){ x.strokeStyle=INKC; x.lineWidth=2;
      x.beginPath(); x.arc(px2+W/n/2,ay+4+H*0.09,W/n/2-10,Math.PI,0,true); x.stroke(); }
  }
  /* water in the channel, and the three named spouts */
  x.fillStyle='rgba(90,150,190,.8)'; x.fillRect(0,ay-13,W,7);
  const spouts=['REST','GRAPHQL','DOCUMENT'];
  for(let i=0;i<3;i++){
    const sx=R.cx-R.w*0.3+i*R.w*0.3;
    x.strokeStyle='rgba(90,150,190,.9)'; x.lineWidth=4;
    x.beginPath(); x.moveTo(sx,ay-8);
    x.quadraticCurveTo(sx+6,ay+H*0.1,sx,ay+H*0.24); x.stroke();
    /* the basin */
    x.fillStyle='#d9c8a2';
    x.beginPath(); x.ellipse(sx,ay+H*0.27,26,8,0,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.8; x.stroke();
    x.fillStyle='rgba(90,150,190,.8)';
    x.beginPath(); x.ellipse(sx,ay+H*0.265,20,5,0,0,7); x.fill();
    pfSign(x,sx,ay+H*0.36,spouts[i],{s:0.9,post:0,maxW:90});
  }
  pfCarve(x,W*0.5,ay-24,'ONE SOURCE FEEDS ALL',{maxW:W*0.6,size:10,ink:'rgba(35,28,18,.65)'});
},
barge(x,d,R,W,H){
  /* the freight of records: crates go over the water, none may spill */
  const wy=H*0.72;
  pfBoatHull(x,R.cx,wy,R.w*0.8,'#6b4a2e');
  /* wheelhouse */
  x.fillStyle='#8d8266'; x.fillRect(R.cx+R.w*0.22,wy-R.w*0.14,R.w*0.13,R.w*0.1);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(R.cx+R.w*0.22,wy-R.w*0.14,R.w*0.13,R.w*0.1);
  pfWindowGlow(x,R.cx+R.w*0.285,wy-R.w*0.095,R.w*0.05,R.w*0.04,d.night);
  /* the cargo: the page's own crates */
  const cw2=Math.min(46,R.w*0.18);
  const names=[pfTok(d,0,'ENTRIES'),pfTok(d,1,'ASSETS'),pfLab(d,0,'SCHEMA'),pfLab(d,1,'LINKS')];
  for(let i=0;i<4;i++){
    const bx2=R.cx-R.w*0.28+(i%3)*cw2*1.1+(i>2?cw2*0.5:0), by2=wy-R.w*0.055-(i>2?cw2*0.62:0);
    pfCrate(x,bx2,by2,cw2,cw2*0.62,names[i%names.length]);
  }
  /* tug ahead on the hawser */
  pfBoatHull(x,R.cx-R.w*0.62,wy-4,R.w*0.2,'#3a352b');
  x.fillStyle='#c22a1c'; x.fillRect(R.cx-R.w*0.66,wy-R.w*0.11,8,R.w*0.07);
  x.strokeStyle=INKC; x.lineWidth=1.4; x.strokeRect(R.cx-R.w*0.66,wy-R.w*0.11,8,R.w*0.07);
  pfSmokeCurl(x,R.cx-R.w*0.62,wy-R.w*0.12,1.2);
  x.strokeStyle='rgba(35,28,18,.8)'; x.lineWidth=2;
  x.beginPath(); x.moveTo(R.cx-R.w*0.52,wy+2); x.quadraticCurveTo(R.cx-R.w*0.45,wy+8,R.cx-R.w*0.38,wy+3); x.stroke();
  /* wake */
  x.strokeStyle='rgba(246,239,221,.6)'; x.lineWidth=1.6;
  for(let i=0;i<3;i++){ x.beginPath(); x.moveTo(R.cx+R.w*0.42,wy+8+i*6);
    x.quadraticCurveTo(R.cx+R.w*0.55,wy+10+i*6,R.cx+R.w*0.68,wy+6+i*6); x.stroke(); }
},
canallocks(x,d,R,W,H){
  /* the schema lock: water climbs from one version to the next */
  const loY=H*0.72, hiY=H*0.52;
  /* high basin left, low basin right */
  fillScreened(x,pfP2(p=>p.rect(0,hiY,R.cx-R.w*0.1,H-hiY)),[['C',.5]],null,2);
  fillScreened(x,pfP2(p=>p.rect(R.cx+R.w*0.1,loY,W-R.cx-R.w*0.1,H-loY)),[['C',.5]],null,2);
  x.strokeStyle='rgba(246,239,221,.6)'; x.lineWidth=1.4;
  x.beginPath(); x.moveTo(10,hiY+8); x.lineTo(R.cx-R.w*0.14,hiY+8); x.stroke();
  x.beginPath(); x.moveTo(R.cx+R.w*0.14,loY+8); x.lineTo(W-10,loY+8); x.stroke();
  /* the chamber between the gates, half filled */
  fillScreened(x,pfP2(p=>p.rect(R.cx-R.w*0.1,(hiY+loY)/2,R.w*0.2,H-(hiY+loY)/2)),[['C',.5]],null,2);
  /* the two gate beams */
  for(const [gx,gy] of [[R.cx-R.w*0.1,hiY],[R.cx+R.w*0.1,loY]]){
    x.fillStyle='#6b4a2e'; x.fillRect(gx-7,gy-34,14,H-gy+34-((H-gy)*0.1));
    x.strokeStyle=INKC; x.lineWidth=2.2; x.strokeRect(gx-7,gy-34,14,H-gy+34-((H-gy)*0.1));
    x.lineWidth=1.4;
    x.beginPath(); x.moveTo(gx-7,gy-14); x.lineTo(gx+7,gy-14); x.stroke();
    /* balance beam */
    x.strokeStyle=INKC; x.lineWidth=4;
    x.beginPath(); x.moveTo(gx,gy-34); x.lineTo(gx+(gx<R.cx?-44:44),gy-46); x.stroke();
  }
  pfCarve(x,R.cx-R.w*0.32,hiY-14,'V5 LEVEL',{maxW:90,size:10});
  pfCarve(x,R.cx+R.w*0.34,loY-14,'V4 LEVEL',{maxW:90,size:10});
  /* the barge waiting in the chamber with its schema crate */
  pfBoatHull(x,R.cx,(hiY+loY)/2+6,R.w*0.16,'#3a352b');
  pfCrate(x,R.cx,(hiY+loY)/2-2,26,17,pfTok(d,0,'SCHEMA'));
  /* the winch on the quay */
  x.fillStyle='#57553f'; x.fillRect(R.cx-R.w*0.02-9,H*0.40,18,14);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(R.cx-R.w*0.02-9,H*0.40,18,14);
  x.beginPath(); x.arc(R.cx-R.w*0.02,H*0.40+7,10,0,7); x.stroke();
  x.lineWidth=2.6; x.beginPath(); x.moveTo(R.cx-R.w*0.02+8,H*0.40); x.lineTo(R.cx-R.w*0.02+20,H*0.37); x.stroke();
},
bridge(x,d,R,W,H){
  /* the crossing: everything the old bank held walks the span. Each page
     crosses its OWN gorge — span height, sag, direction and the size of
     the procession are all dealt from the page */
  const hzY=d.hz*H, gy=hzY+(H-hzY)*(0.18+((d.gh>>>4)%22)/100);
  const dir=((d.gh>>>7)&1)?1:-1;   /* which bank burns */
  const sag=R.w*(0.12+((d.gh>>>11)%14)/100);
  /* the gorge */
  x.fillStyle='rgba(35,28,18,.85)';
  x.beginPath(); x.moveTo(R.cx-R.w*0.34,gy);
  x.quadraticCurveTo(R.cx-R.w*0.1,H*0.98,R.cx-R.w*0.05,H+4);
  x.lineTo(R.cx+R.w*0.22,H+4);
  x.quadraticCurveTo(R.cx+R.w*0.2,H*0.9,R.cx+R.w*0.36,gy);
  x.closePath(); x.fill();
  /* the span and its underslung arc */
  x.fillStyle='#8d6b4a'; x.fillRect(R.cx-R.w*0.42,gy-8,R.w*0.84,10);
  x.strokeStyle=INKC; x.lineWidth=2.4; x.strokeRect(R.cx-R.w*0.42,gy-8,R.w*0.84,10);
  x.lineWidth=3;
  x.beginPath(); x.moveTo(R.cx-R.w*0.42,gy+2);
  x.quadraticCurveTo(R.cx,gy+sag*2,R.cx+R.w*0.42,gy+2); x.stroke();
  x.lineWidth=1.6;
  for(let i=1;i<6;i++){ const bx2=R.cx-R.w*0.42+i*R.w*0.84/6;
    const sg2=Math.sin(Math.PI*i/6)*sag;
    x.beginPath(); x.moveTo(bx2,gy+2); x.lineTo(bx2,gy+2+sg2); x.stroke(); }
  /* rails */
  x.lineWidth=1.8;
  x.beginPath(); x.moveTo(R.cx-R.w*0.42,gy-20); x.lineTo(R.cx+R.w*0.42,gy-20); x.stroke();
  for(let i=0;i<9;i++){ const bx2=R.cx-R.w*0.42+i*R.w*0.84/8;
    x.beginPath(); x.moveTo(bx2,gy-20); x.lineTo(bx2,gy-8); x.stroke(); }
  /* the procession, laden — as long as the page is heavy */
  plateCrowd(x,gy-8,R.cx-R.w*0.36,R.cx+R.w*0.36,d.seed,5+((d.gh>>>9)%5),1.4);
  /* bank obelisks carry the versions' names — heights dealt per page */
  for(const [ox,lb,hh] of [[R.cx-dir*R.w*0.5,'V4',46+((d.gh>>>13)%16)],
                            [R.cx+dir*R.w*0.5,'V5',52+((d.gh>>>17)%22)]]){
    x.fillStyle='#b9ab84';
    x.beginPath(); x.moveTo(ox-11,gy+2); x.lineTo(ox-7,gy-hh); x.lineTo(ox+7,gy-hh); x.lineTo(ox+11,gy+2);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
    pfCarve(x,ox,gy-hh*0.55,lb,{maxW:20,size:12});
  }
  /* behind the old bank, the low burning of what is left */
  plateFlame(x,R.cx-dir*R.w*0.56,gy+4,1.2+((d.gh>>>19)%9)/10,d.seed);
  pfSmokeCurl(x,R.cx-dir*R.w*0.56,gy-12,1.6);
},
edict(x,d,R,W,H){
  /* the bare breaking-change plaza (only for a page whose subject names no
     rig): even here the board walks, the staging side flips per page */
  const hzY=d.hz*H, py=hzY+(H-hzY)*(0.34+((d.gh>>>7)%16)/100);
  const eb=R.cx+(((d.gh>>>4)&1)?1:-1)*R.w*(0.24+((d.gh>>>6)%12)/100);
  const oldTok=pfShort(pfToken(d.m.title)||pfTok(d,0,'THE OLD WAY'),16);
  const mode=d.edict||'newflag';
  /* the town crier's edict board stands in every plaza */
  x.fillStyle='#6b4a2e'; x.fillRect(eb,py-70,8,80);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(eb,py-70,8,80);
  x.fillStyle='#fdf6e2'; x.fillRect(eb-28,py-66,64,44);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(eb-28,py-66,64,44);
  x.fillStyle='#c22a1c'; x.font='700 9px Oswald,sans-serif'; x.textAlign='center';
  x.fillText('BREAKING',eb+4,py-52);
  x.fillStyle=INKC; x.font='600 8px Oswald,sans-serif';
  x.fillText('CHANGE',eb+4,py-42);
  x.font='700 7px "Courier Prime",monospace';
  x.fillText(pfShort(oldTok,13),eb+4,py-30); x.textAlign='left';
  if(mode==='toppled'){
    pfStatue(x,R.cx-R.w*0.18,py,1.5,{headless:true,crack:true});
    /* the fallen head and a thrown rope */
    x.fillStyle='#b9ab84'; x.beginPath(); x.arc(R.cx-R.w*0.02,py-6,9,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.8; x.stroke();
    x.strokeStyle='rgba(35,28,18,.8)'; x.lineWidth=2;
    x.beginPath(); x.moveTo(R.cx-R.w*0.18,py-56);
    x.quadraticCurveTo(R.cx+R.w*0.06,py-40,R.cx+R.w*0.14,py-2); x.stroke();
    pfCarve(x,R.cx-R.w*0.18,py-10,oldTok,{maxW:R.w*0.3,size:9,mono:true});
    plateCrowd(x,py+14,R.cx-R.w*0.46,R.cx-R.w*0.3,d.seed,3,1.3,true);
  } else if(mode==='roped'){
    pfStatue(x,R.cx-R.w*0.14,py,1.6,{pose:'hail'});
    pfCarve(x,R.cx-R.w*0.14,py-10,oldTok,{maxW:R.w*0.3,size:9,mono:true});
    for(const sx of [R.cx-R.w*0.34,R.cx+R.w*0.06]){
      x.strokeStyle=INKC; x.lineWidth=2.4;
      x.beginPath(); x.moveTo(sx,py+12); x.lineTo(sx,py-16); x.stroke();
      x.fillStyle='#e9c81f'; x.beginPath(); x.arc(sx,py-19,3,0,7); x.fill(); }
    x.strokeStyle='#8a3b2a'; x.lineWidth=2.6;
    x.beginPath(); x.moveTo(R.cx-R.w*0.34,py-16);
    x.quadraticCurveTo(R.cx-R.w*0.14,py-6,R.cx+R.w*0.06,py-16); x.stroke();
    pfSign(x,R.cx-R.w*0.14,py+26,'DO NOT USE',{s:0.9,post:12,maxW:100,tone:'#e8d9ac'});
  } else if(mode==='handover'){
    const newTok=pfShort((d.m.title.split(/instead of|replaces|replaced by| uses? /i)[0]||'').trim()||pfTok(d,1,'THE NEW WAY'),16);
    pfStatue(x,R.cx-R.w*0.26,py,1.3,{tilt:0.5,crack:true});
    pfCarve(x,R.cx-R.w*0.26,py+16,oldTok,{maxW:R.w*0.26,size:8,mono:true});
    pfStatue(x,R.cx+R.w*0.1,py,1.7,{pose:'hail'});
    pfCarve(x,R.cx+R.w*0.1,py-12,newTok,{maxW:R.w*0.3,size:9,mono:true});
    x.strokeStyle=INKC; x.lineWidth=2.2;
    x.beginPath(); x.moveTo(R.cx+R.w*0.1,py-92); x.lineTo(R.cx+R.w*0.3,py-108); x.stroke();
  } else if(mode==='boarded'){
    x.fillStyle='#4a3320';
    x.beginPath(); x.moveTo(R.cx-R.w*0.16,py); x.lineTo(R.cx-R.w*0.16,py-64);
    x.arc(R.cx,py-64,R.w*0.16,Math.PI,0); x.lineTo(R.cx+R.w*0.16,py); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=2.4; x.stroke();
    x.fillStyle='#c9a86a';
    for(const [ya,yb] of [[-52,-20],[-38,-52],[-16,-38]]){
      x.save(); x.translate(R.cx,py+(ya+yb)/2*0.5); x.rotate((ya-yb)/140);
      x.fillRect(-R.w*0.2,-5,R.w*0.4,10);
      x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(-R.w*0.2,-5,R.w*0.4,10);
      x.restore(); }
    x.fillStyle='#fdf6e2'; x.save(); x.translate(R.cx+R.w*0.02,py-30); x.rotate(0.06);
    x.fillRect(-24,-16,48,32); x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(-24,-16,48,32);
    x.fillStyle=INKC; x.textAlign='center';
    pfFitFont(x,oldTok,42,7,'700 %px "Courier Prime",monospace');
    x.fillText(oldTok,0,-2);
    x.font='600 7px Oswald,sans-serif'; x.fillText('CLOSED',0,10);
    x.textAlign='left'; x.restore();
  } else if(mode==='scaffold'){
    pfStatue(x,R.cx-R.w*0.1,py,1.7,{pose:'hail'});
    pfCarve(x,R.cx-R.w*0.1,py-12,oldTok,{maxW:R.w*0.3,size:9,mono:true});
    x.strokeStyle=INKC; x.lineWidth=2.6;
    for(const sx of [R.cx-R.w*0.3,R.cx+R.w*0.1]){
      x.beginPath(); x.moveTo(sx,py+10); x.lineTo(sx,py-100); x.stroke(); }
    x.lineWidth=1.8;
    for(let r2=0;r2<3;r2++){ const yy=py-20-r2*30;
      x.beginPath(); x.moveTo(R.cx-R.w*0.3,yy); x.lineTo(R.cx+R.w*0.1,yy); x.stroke(); }
    pfLadder(x,R.cx+R.w*0.02,py+8,84,0.05);
  } else { /* newflag */
    x.strokeStyle=INKC; x.lineWidth=4;
    x.beginPath(); x.moveTo(R.cx-R.w*0.06,py+10); x.lineTo(R.cx-R.w*0.06,py-110); x.stroke();
    pfFlag(x,R.cx-R.w*0.06,py+10,116,oldTok,'#c22a1c',1);
    /* the old colours folded in a box at the foot */
    pfCrate(x,R.cx-R.w*0.22,py+12,34,20,'OLD');
    x.fillStyle='#8d8266';
    x.beginPath(); x.moveTo(R.cx-R.w*0.3,py+12); x.lineTo(R.cx-R.w*0.14,py+12);
    x.lineTo(R.cx-R.w*0.17,py+4); x.lineTo(R.cx-R.w*0.27,py+4); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.4; x.stroke();
  }
},

embassy(x,d,R,W,H){
  /* each provider keeps its OWN trade on our street: the media houses run
     freight, the mail houses run post, the auth houses keep the gate — and
     no two buildings share a wall, a roof, or a floor plan */
  const prov=String(d.provider||'the-house');
  const ph=hash32('emb'+prov);
  const trade=/s3|cloudinary|local-upload|upload/.test(prov)?'freight'
        :/mailgun|nodemailer|sendgrid|ses|mandrill|postmark/.test(prov)?'mail':'gate';
  const hzY=d.hz*H, by=hzY+(H-hzY)*(0.42+((d.gh>>>8)%16)/100);
  const provName=prov.replace(/-/g,' ').toUpperCase();
  if(trade==='freight'){
    /* the freight house: this provider's crates on OUR dock, its mark
       stencilled on every one */
    const shW=R.w*(0.5+(ph%20)/100), shH=H*(0.2+((ph>>>3)%10)/100);
    const shX=R.cx-((ph>>>5)&1?1:-1)*R.w*0.16;
    x.fillStyle=d.night?'#33291f':'#8d6b4a';
    x.fillRect(shX-shW/2,by-shH,shW,shH);
    x.strokeStyle=INKC; x.lineWidth=2.4; x.strokeRect(shX-shW/2,by-shH,shW,shH);
    /* gambrel roof */
    x.fillStyle='#57553f';
    x.beginPath(); x.moveTo(shX-shW/2-8,by-shH); x.lineTo(shX-shW*0.3,by-shH-H*0.07);
    x.lineTo(shX+shW*0.3,by-shH-H*0.07); x.lineTo(shX+shW/2+8,by-shH);
    x.closePath(); x.fill(); x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
    /* the big loading door + hoist beam */
    x.fillStyle='#3a352b'; x.fillRect(shX-shW*0.16,by-shH*0.62,shW*0.32,shH*0.62);
    x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(shX-shW*0.16,by-shH*0.62,shW*0.32,shH*0.62);
    x.lineWidth=2.6;
    x.beginPath(); x.moveTo(shX,by-shH-H*0.07); x.lineTo(shX,by-shH-H*0.10); x.stroke();
    x.beginPath(); x.moveTo(shX-14,by-shH-H*0.10); x.lineTo(shX+26,by-shH-H*0.10); x.stroke();
    /* hoist rope down to the hanging crate */
    x.lineWidth=1.8;
    x.beginPath(); x.moveTo(shX+22,by-shH-H*0.10); x.lineTo(shX+22,by-shH*0.5); x.stroke();
    pfCrate(x,shX+22,by-shH*0.5+22,26,22,null,'#c9a86a');
    pfEmblem(x,prov,shX+22,by-shH*0.5+11,9);
    /* the crate train on the dock, every one franked with the mark */
    const nCr=2+((ph>>>7)%3);
    for(let i=0;i<nCr;i++){
      const cx2=shX+((ph>>>5)&1?-1:1)*(shW*0.5+30+i*44), cw2=30+((ph>>>(i+3))%12);
      if(cx2<20||cx2>W-20) continue;
      pfCrate(x,cx2,by,cw2,20+((ph>>>(i+6))%10),null,i%2?'#d9c8a2':'#c9a86a');
      pfEmblem(x,prov,cx2,by-12,8);
    }
    pfBanner(x,shX,by-shH-H*0.085-14,provName,{tone:'#31647e',s:0.95,maxW:shW,h:20});
    pfSign(x,clamp(shX-shW*0.72,60,W-60),by+6,'MEDIA FREIGHT',{s:0.9,post:22,maxW:110});
  } else if(trade==='mail'){
    /* the post house: the provider's horn over the door, today's post
       sacked and franked with its mark */
    const phW=R.w*(0.44+(ph%18)/100), phH=H*(0.24+((ph>>>3)%12)/100);
    const phX=R.cx+((ph>>>5)&1?1:-1)*R.w*0.1;
    x.fillStyle=d.night?'#2e2820':'#a08a5f';
    x.fillRect(phX-phW/2,by-phH,phW,phH);
    x.strokeStyle=INKC; x.lineWidth=2.4; x.strokeRect(phX-phW/2,by-phH,phW,phH);
    /* clock gable — the post keeps hours */
    x.fillStyle='#8a3b2a';
    x.beginPath(); x.moveTo(phX-phW*0.34,by-phH); x.lineTo(phX,by-phH-H*0.09);
    x.lineTo(phX+phW*0.34,by-phH); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
    x.fillStyle='#f6efdd'; x.beginPath(); x.arc(phX,by-phH-H*0.033,9,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.6; x.stroke();
    x.beginPath(); x.moveTo(phX,by-phH-H*0.033); x.lineTo(phX,by-phH-H*0.033-6);
    x.moveTo(phX,by-phH-H*0.033); x.lineTo(phX+4,by-phH-H*0.033+2); x.stroke();
    /* the door with the provider's mark as the franking seal above it */
    x.fillStyle='#3a352b';
    x.beginPath(); x.moveTo(phX-phW*0.12,by); x.lineTo(phX-phW*0.12,by-phH*0.4);
    x.arc(phX,by-phH*0.4,phW*0.12,Math.PI,0); x.lineTo(phX+phW*0.12,by); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
    pfEmblem(x,prov,phX,by-phH*0.72,phW*0.13);
    /* the pigeon rail: a line of letters flying OUT with the mark */
    for(let i=0;i<3;i++)
      pfEnvelope(x,phX+phW*0.55+i*34,by-phH*(0.8+0.14*Math.sin(i*1.7)),
        18+((ph>>>(i+4))%6),-0.2+i*0.12,'#fdf6e2');
    /* the mail sacks slumped by the door */
    for(let i=0;i<2;i++){
      const sx2=phX-phW*0.55-i*26;
      x.fillStyle='#8d8266';
      x.beginPath(); x.moveTo(sx2-11,by); x.quadraticCurveTo(sx2-13,by-26,sx2,by-30);
      x.quadraticCurveTo(sx2+13,by-26,sx2+11,by); x.closePath(); x.fill();
      x.strokeStyle=INKC; x.lineWidth=1.8; x.stroke();
      x.beginPath(); x.moveTo(sx2-4,by-28); x.lineTo(sx2+4,by-28); x.stroke();
    }
    pfBanner(x,phX,by-phH-H*0.10,provName,{tone:'#8a3b2a',s:0.95,maxW:phW*1.1,h:20});
    pfSign(x,clamp(phX+phW*0.78,60,W-60),by+6,'THE MAIL ROAD',{s:0.9,post:22,maxW:110});
  } else {
    /* the auth embassy: the house itself is dealt from the provider's own
       name — and the MASSING first of all: one mansion, a curtain wall
       with its gatehouse, twin towers over the gate, or a tall chancery
       with an annex. Two providers no longer share a silhouette. */
    const bw=R.w*(0.5+(ph%25)/100), bh=H*(0.26+((ph>>>3)%16)/100);
    const style=ph%5;
    const massing=(ph>>>16)%4;
    const bx0=R.cx+(((ph>>>18)%5)-2)*R.w*0.06;   /* the house walks the block */
    const wallFill=d.night?'#33291f':'#a08a5f';
    let doorX=bx0+((ph>>>9)%3-1)*bw*0.18, doorW=bw*0.09, doorH=bh*0.3;
    let roofCx=bx0, roofW=bw, roofBase=by-bh;
    let emX=bx0+((ph>>>11)%3-1)*bw*0.12, emY=by-bh*(0.6+((ph>>>6)%14)/100),
        emS=bw*(0.13+((ph>>>13)%9)/100);
    let banX=bx0, banY=by-bh-26-((ph>>>8)%14);
    let winCx=bx0, winW=bw;
    if(massing===0){ /* the single mansion */
      x.fillStyle=wallFill; x.fillRect(bx0-bw/2,by-bh,bw,bh);
      x.strokeStyle=INKC; x.lineWidth=2.6; x.strokeRect(bx0-bw/2,by-bh,bw,bh);
    } else if(massing===1){ /* curtain wall + gatehouse tower */
      const ww=R.w*0.92, wh=H*(0.10+((ph>>>7)%5)/100);
      x.fillStyle=wallFill; x.fillRect(R.cx-ww/2,by-wh,ww,wh);
      x.strokeStyle=INKC; x.lineWidth=2.4; x.strokeRect(R.cx-ww/2,by-wh,ww,wh);
      x.fillStyle=wallFill;
      for(let c9=0;c9<11;c9++){ const cx9=R.cx-ww/2+8+c9*(ww-26)/10;
        x.fillRect(cx9,by-wh-7,10,7);
        x.strokeStyle=INKC; x.lineWidth=1.3; x.strokeRect(cx9,by-wh-7,10,7); }
      const tw9=bw*0.42, thh=bh*1.05;
      x.fillStyle=wallFill; x.fillRect(bx0-tw9/2,by-thh,tw9,thh);
      x.strokeStyle=INKC; x.lineWidth=2.6; x.strokeRect(bx0-tw9/2,by-thh,tw9,thh);
      roofW=tw9; roofBase=by-thh; doorX=bx0; doorW=tw9*0.26; doorH=thh*0.30;
      emX=bx0; emY=by-thh*0.60; emS=Math.min(emS,tw9*0.33);
      banY=by-thh-24-((ph>>>8)%12); winCx=bx0; winW=tw9*1.05;
    } else if(massing===2){ /* twin towers, the gate between */
      const tw9=bw*0.27, thh=bh*(0.95+((ph>>>7)%20)/100),
            gap=bw*(0.36+((ph>>>12)%10)/100);
      for(const s9 of [-1,1]){
        x.fillStyle=wallFill; x.fillRect(bx0+s9*gap-tw9/2,by-thh,tw9,thh);
        x.strokeStyle=INKC; x.lineWidth=2.6; x.strokeRect(bx0+s9*gap-tw9/2,by-thh,tw9,thh);
        x.fillStyle='#57553f';
        x.beginPath(); x.moveTo(bx0+s9*gap-tw9*0.62,by-thh);
        x.lineTo(bx0+s9*gap,by-thh-tw9*0.55);
        x.lineTo(bx0+s9*gap+tw9*0.62,by-thh); x.closePath(); x.fill();
        x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
      }
      const wh=bh*0.44;
      x.fillStyle=wallFill; x.fillRect(bx0-gap+tw9/2,by-wh,gap*2-tw9,wh);
      x.strokeStyle=INKC; x.lineWidth=2.2; x.strokeRect(bx0-gap+tw9/2,by-wh,gap*2-tw9,wh);
      roofW=0; /* the towers carry their own caps */
      doorX=bx0; doorW=bw*0.11; doorH=wh*0.74;
      emX=bx0; emS=Math.min(emS,gap*0.5); emY=by-wh-emS*0.8;
      banY=by-thh-16; winCx=bx0; winW=0;
    } else { /* the tall chancery with its annex */
      const tw9=bw*0.38, thh=bh*1.3,
            as9=((ph>>>10)&1)?1:-1, ax9=bx0+as9*(tw9/2+bw*0.18),
            aw=bw*0.34, ah=bh*0.5;
      x.fillStyle=wallFill; x.fillRect(bx0-tw9/2,by-thh,tw9,thh);
      x.strokeStyle=INKC; x.lineWidth=2.6; x.strokeRect(bx0-tw9/2,by-thh,tw9,thh);
      x.fillStyle=wallFill; x.fillRect(ax9-aw/2,by-ah,aw,ah);
      x.strokeStyle=INKC; x.lineWidth=2.2; x.strokeRect(ax9-aw/2,by-ah,aw,ah);
      roofW=tw9; roofBase=by-thh;
      doorX=((ph>>>19)&1)?ax9:bx0; doorW=bw*0.085;
      doorH=(doorX===bx0)?thh*0.20:ah*0.62;
      emX=bx0; emY=by-thh*(0.66+((ph>>>6)%10)/100); emS=Math.min(emS,tw9*0.36);
      banY=by-thh-24-((ph>>>8)%12); winCx=bx0; winW=tw9*1.05;
    }
    if(roofW>0){
      if(style===0){ /* dome */
        x.fillStyle='#7f95b0'; x.beginPath(); x.arc(roofCx,roofBase,roofW*0.26,Math.PI,0); x.fill();
        x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
        x.lineWidth=2; x.beginPath(); x.moveTo(roofCx,roofBase-roofW*0.26); x.lineTo(roofCx,roofBase-roofW*0.26-12); x.stroke();
      } else if(style===1){ /* spire */
        x.fillStyle='#8a3b2a';
        x.beginPath(); x.moveTo(roofCx-roofW*0.2,roofBase); x.lineTo(roofCx,roofBase-roofW*0.4);
        x.lineTo(roofCx+roofW*0.2,roofBase); x.closePath(); x.fill();
        x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
      } else if(style===2){ /* stepped gable */
        x.fillStyle='#a08a5f';
        for(let s2=0;s2<4;s2++){ const sw=roofW*(0.66-s2*0.16);
          x.fillRect(roofCx-sw/2,roofBase-(s2+1)*10,sw,10);
          x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(roofCx-sw/2,roofBase-(s2+1)*10,sw,10); }
      } else if(style===3){ /* pagoda eave */
        x.fillStyle='#57553f';
        x.beginPath(); x.moveTo(roofCx-roofW*0.42,roofBase);
        x.quadraticCurveTo(roofCx,roofBase-roofW*0.24,roofCx+roofW*0.42,roofBase);
        x.quadraticCurveTo(roofCx+roofW*0.3,roofBase+6,roofCx-roofW*0.3,roofBase+6);
        x.closePath(); x.fill();
        x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
      } else { /* parapet flags */
        x.strokeStyle=INKC; x.lineWidth=2;
        for(let i=0;i<4;i++){ const fx2=roofCx-roofW*0.3+i*roofW*0.2;
          x.beginPath(); x.moveTo(fx2,roofBase); x.lineTo(fx2,roofBase-14); x.stroke();
          x.fillStyle=['#c22a1c','#e9c81f','#31647e','#5fae57'][i];
          x.beginPath(); x.moveTo(fx2,roofBase-14); x.lineTo(fx2+10,roofBase-11); x.lineTo(fx2,roofBase-8);
          x.closePath(); x.fill(); }
      }
    }
    /* the gate itself is dealt three ways: arch, lintel, or double doors */
    const dk=(ph>>>21)%3;
    x.fillStyle='#3a352b';
    if(dk===0){
      x.beginPath(); x.moveTo(doorX-doorW,by); x.lineTo(doorX-doorW,by-doorH);
      x.arc(doorX,by-doorH,doorW,Math.PI,0); x.lineTo(doorX+doorW,by); x.closePath(); x.fill();
      x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
    } else if(dk===1){
      x.fillRect(doorX-doorW,by-doorH-doorW*0.5,doorW*2,doorH+doorW*0.5);
      x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(doorX-doorW,by-doorH-doorW*0.5,doorW*2,doorH+doorW*0.5);
      x.fillStyle='#8d8266'; x.fillRect(doorX-doorW-4,by-doorH-doorW*0.5-6,doorW*2+8,6);
      x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(doorX-doorW-4,by-doorH-doorW*0.5-6,doorW*2+8,6);
    } else {
      x.fillRect(doorX-doorW*1.1,by-doorH,doorW*2.2,doorH);
      x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(doorX-doorW*1.1,by-doorH,doorW*2.2,doorH);
      x.lineWidth=1.6; x.beginPath(); x.moveTo(doorX,by-doorH); x.lineTo(doorX,by); x.stroke();
      x.fillStyle='#e9c81f';
      x.beginPath(); x.arc(doorX-doorW*0.34,by-doorH*0.5,2.2,0,7);
      x.arc(doorX+doorW*0.34,by-doorH*0.5,2.2,0,7); x.fill();
    }
    /* the windows count the page's own heads */
    if(winW>0){
      const nWin=clamp(d.labels.length||2,1,3);
      for(let i=0;i<nWin;i++){
        const wx2=winCx-winW*0.3+i*(winW*0.6/Math.max(1,nWin-1||1));
        if(Math.abs(wx2-doorX)>winW*0.14)
          pfWindowGlow(x,wx2,by-bh*(0.58+((ph>>>(i+2))%12)/100),winW*0.12,bh*0.18,d.night);
      }
    }
    /* THE EMBLEM — large or colossal as the name's own hash decides */
    pfEmblem(x,prov,emX,emY,emS);
    pfBanner(x,banX,banY,provName,{tone:['#8a3b2a','#31647e','#57553f'][(ph>>>4)%3],s:1,maxW:bw*0.9,h:22});
    const sgs=((ph>>>14)&1?1:-1);   /* the street sign changes sidewalks too */
    pfSign(x,clamp(bx0+sgs*bw*0.72,60,W-60),by+6,d.venue||'THE GATE',{s:0.95,post:24,maxW:120});
    /* the customs rope where papers are shown — side dealt by the name */
    const rs=((ph>>>10)&1?1:-1);
    x.strokeStyle=INKC; x.lineWidth=2.2;
    x.beginPath(); x.moveTo(bx0+rs*bw*0.62,by+8); x.lineTo(bx0+rs*bw*0.62,by-22); x.stroke();
    x.strokeStyle='#8a3b2a'; x.lineWidth=2.2;
    x.beginPath(); x.moveTo(bx0+rs*bw*0.62,by-20);
    x.quadraticCurveTo(bx0+rs*bw*0.4,by-10,bx0+rs*bw*0.18,by-16); x.stroke();
  }
},
forgeshield(x,d,R,W,H){
  /* the smith cuts a NEW provider's arms — the wall shows the old houses */
  const by=H*0.8;
  /* wall of finished shields */
  const done=['github','google','discord','keycloak','facebook','okta'];
  done.forEach((p2,i)=>{
    const sx=R.cx-R.w*0.42+(i%3)*R.w*0.16, sy=H*0.24+Math.floor(i/3)*H*0.13;
    x.fillStyle='#d9c8a2';
    x.beginPath(); x.moveTo(sx-14,sy-16); x.lineTo(sx+14,sy-16); x.lineTo(sx+14,sy+2);
    x.quadraticCurveTo(sx+14,sy+14,sx,sy+18); x.quadraticCurveTo(sx-14,sy+14,sx-14,sy+2);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.8; x.stroke();
    pfEmblem(x,p2,sx,sy-1,11);
  });
  /* the anvil */
  x.fillStyle=INKC;
  x.beginPath(); x.moveTo(R.cx-30,by-34); x.lineTo(R.cx+34,by-34); x.lineTo(R.cx+46,by-26);
  x.lineTo(R.cx+30,by-22); x.lineTo(R.cx+18,by-10); x.lineTo(R.cx-14,by-10);
  x.lineTo(R.cx-22,by-22); x.closePath(); x.fill();
  x.fillRect(R.cx-16,by-10,28,10);
  /* the blank shield on the easel, half-carved */
  const ex=R.cx+R.w*0.3;
  x.strokeStyle=INKC; x.lineWidth=3;
  x.beginPath(); x.moveTo(ex-22,by); x.lineTo(ex,by-64); x.lineTo(ex+22,by); x.stroke();
  x.beginPath(); x.moveTo(ex,by-64); x.lineTo(ex,by-12); x.stroke();
  x.fillStyle='#f3e2b0';
  x.beginPath(); x.moveTo(ex-20,by-58); x.lineTo(ex+20,by-58); x.lineTo(ex+20,by-34);
  x.quadraticCurveTo(ex+20,by-18,ex,by-12); x.quadraticCurveTo(ex-20,by-18,ex-20,by-34);
  x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
  x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1.2;
  x.beginPath(); x.moveTo(ex-12,by-46); x.lineTo(ex+4,by-46); x.stroke();
  x.beginPath(); x.moveTo(ex-12,by-38); x.lineTo(ex-2,by-38); x.stroke();
  pfCarve(x,ex,by-66,'YOUR HOUSE HERE',{maxW:100,size:8,ink:'rgba(35,28,18,.7)'});
  /* mallet + chisel on the bench */
  x.fillStyle='#8d6b4a'; x.fillRect(R.cx-R.w*0.42,by-6,R.w*0.3,8);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(R.cx-R.w*0.42,by-6,R.w*0.3,8);
  x.save(); x.translate(R.cx-R.w*0.3,by-14); x.rotate(-0.5);
  x.fillStyle='#6b4a2e'; x.fillRect(-3,-16,6,18);
  x.fillStyle='#8d8266'; x.fillRect(-9,-26,18,12);
  x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(-9,-26,18,12); x.restore();
  x.strokeStyle=INKC; x.lineWidth=2.4;
  x.beginPath(); x.moveTo(R.cx-R.w*0.2,by-8); x.lineTo(R.cx-R.w*0.14,by-22); x.stroke();
  /* forge glow */
  const g2=x.createRadialGradient(R.cx-R.w*0.05,by-30,4,R.cx-R.w*0.05,by-30,70);
  g2.addColorStop(0,'rgba(226,120,44,.35)'); g2.addColorStop(1,'rgba(226,120,44,0)');
  x.fillStyle=g2; x.beginPath(); x.arc(R.cx-R.w*0.05,by-30,70,0,7); x.fill();
  plateFlame(x,R.cx+6,by-34,1.4,d.seed);
},
gatebanners(x,d,R,W,H){
  /* one gate, one key, many houses — sign once, walk everywhere */
  const hzY=d.hz*H, by=hzY+(H-hzY)*0.5;
  const gw=R.w*0.5, gh=H*0.34;
  /* the wall runs off both edges */
  x.fillStyle=d.night?'#2e2820':'#8d8266';
  x.fillRect(0,by-gh*0.62,W,gh*0.62);
  x.strokeStyle=INKC; x.lineWidth=2;
  x.beginPath(); x.moveTo(0,by-gh*0.62); x.lineTo(W,by-gh*0.62); x.stroke();
  /* crenellation */
  for(let cx2=6;cx2<W;cx2+=26){ x.fillRect(cx2,by-gh*0.62-8,14,8);
    x.strokeRect(cx2,by-gh*0.62-8,14,8); }
  /* the gate tower */
  x.fillStyle=d.night?'#39312a':'#a08a5f';
  x.fillRect(R.cx-gw/2,by-gh,gw,gh);
  x.strokeStyle=INKC; x.lineWidth=2.6; x.strokeRect(R.cx-gw/2,by-gh,gw,gh);
  x.fillStyle='#231c12';
  x.beginPath(); x.moveTo(R.cx-gw*0.24,by); x.lineTo(R.cx-gw*0.24,by-gh*0.5);
  x.arc(R.cx,by-gh*0.5,gw*0.24,Math.PI,0); x.lineTo(R.cx+gw*0.24,by); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
  /* portcullis half-raised */
  x.strokeStyle='rgba(217,200,162,.9)'; x.lineWidth=2;
  for(let i=0;i<5;i++){ const px2=R.cx-gw*0.18+i*gw*0.09;
    x.beginPath(); x.moveTo(px2,by-gh*0.66); x.lineTo(px2,by-gh*0.34); x.stroke(); }
  x.beginPath(); x.moveTo(R.cx-gw*0.2,by-gh*0.48); x.lineTo(R.cx+gw*0.2,by-gh*0.48); x.stroke();
  /* THE ONE KEY hangs over the arch on a chain */
  x.strokeStyle=INKC; x.lineWidth=1.8;
  x.beginPath(); x.moveTo(R.cx,by-gh); x.lineTo(R.cx,by-gh*0.82); x.stroke();
  pfKeyBig(x,R.cx,by-gh*0.74,2.1,Math.PI/2);
  const g2=x.createRadialGradient(R.cx,by-gh*0.74,4,R.cx,by-gh*0.74,44);
  g2.addColorStop(0,'rgba(233,200,31,.4)'); g2.addColorStop(1,'rgba(233,200,31,0)');
  x.fillStyle=g2; x.beginPath(); x.arc(R.cx,by-gh*0.74,44,0,7); x.fill();
  /* the houses' banners strung across the approach */
  x.strokeStyle=INKC; x.lineWidth=1.6;
  x.beginPath(); x.moveTo(R.cx-gw*1.1,by-gh*1.02); x.quadraticCurveTo(R.cx,by-gh*0.9,R.cx+gw*1.1,by-gh*1.02); x.stroke();
  const hs=['#c22a1c','#31647e','#e9c81f','#5fae57','#8a3b2a'];
  for(let i=0;i<5;i++){
    const t2=(i+0.5)/5, bx2=R.cx-gw*1.1+t2*gw*2.2, by3=by-gh*(1.02-0.1*Math.sin(Math.PI*t2))+2;
    x.fillStyle=hs[i];
    x.beginPath(); x.moveTo(bx2-9,by3); x.lineTo(bx2+9,by3); x.lineTo(bx2,by3+16); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.2; x.stroke();
  }
  pfSign(x,R.cx+gw*1.1,by+8,'ONE KEY OPENS ALL',{s:0.9,post:20,maxW:120});
},
press(x,d,R,W,H){
  /* the two-state press: what the day drafts, the lever publishes */
  const by=H*0.8, pw=R.w*0.5;
  /* the machine frame */
  x.fillStyle='#8d8266'; x.fillRect(R.cx-pw*0.36,by-H*0.34,pw*0.72,H*0.34);
  x.strokeStyle=INKC; x.lineWidth=2.8; x.strokeRect(R.cx-pw*0.36,by-H*0.34,pw*0.72,H*0.34);
  x.fillStyle='#44403a'; x.fillRect(R.cx-pw*0.30,by-H*0.30,pw*0.60,H*0.08);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(R.cx-pw*0.30,by-H*0.30,pw*0.60,H*0.08);
  x.fillStyle='#c22a1c';
  for(let i9=0;i9<2;i9++){ x.beginPath(); x.arc(R.cx-pw*0.22+i9*pw*0.44,by-H*0.26,7,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.6; x.stroke(); }
  /* the great screw and platen */
  x.fillStyle='#8d8266'; x.fillRect(R.cx-8,by-H*0.42,16,H*0.09);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(R.cx-8,by-H*0.42,16,H*0.09);
  x.lineWidth=1.4;
  for(let i=0;i<4;i++){ x.beginPath(); x.moveTo(R.cx-8,by-H*0.41+i*7); x.lineTo(R.cx+8,by-H*0.405+i*7); x.stroke(); }
  x.fillStyle='#57553f'; x.fillRect(R.cx-pw*0.26,by-H*0.33,pw*0.52,12);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(R.cx-pw*0.26,by-H*0.33,pw*0.52,12);
  /* the long lever arm, a hand's reach */
  x.strokeStyle=INKC; x.lineWidth=5; x.lineCap='round';
  x.beginPath(); x.moveTo(R.cx+6,by-H*0.40); x.lineTo(R.cx+pw*0.6,by-H*0.5); x.stroke();
  x.fillStyle='#c22a1c'; x.beginPath(); x.arc(R.cx+pw*0.6,by-H*0.5,7,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.8; x.stroke();
  /* the bed: a sheet mid-press */
  x.fillStyle='#fdf8ea'; x.fillRect(R.cx-pw*0.2,by-H*0.19,pw*0.4,H*0.07);
  x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(R.cx-pw*0.2,by-H*0.19,pw*0.4,H*0.07);
  /* DRAFT pile left — grey, loose; PUBLISHED pallet right — square, stamped */
  for(let i=0;i<4;i++){
    x.fillStyle='#efe6cf';
    x.save(); x.translate(R.cx-pw*0.62,by-8-i*7); x.rotate(((d.seed>>>i)%9-4)*0.02);
    x.fillRect(-30,-5,60,7); x.strokeStyle='rgba(35,28,18,.7)'; x.lineWidth=1.2; x.strokeRect(-30,-5,60,7);
    x.restore(); }
  pfSign(x,R.cx-pw*0.62,by+14,'DRAFT',{s:0.86,post:0,maxW:70,tone:'#d9c8a2'});
  for(let i=0;i<4;i++){
    x.fillStyle='#fdf8ea'; x.fillRect(R.cx+pw*0.44,by-10-i*8,64,8);
    x.strokeStyle=INKC; x.lineWidth=1.3; x.strokeRect(R.cx+pw*0.44,by-10-i*8,64,8); }
  x.save(); x.translate(R.cx+pw*0.44+32,by-24); x.rotate(-0.12);
  x.strokeStyle='#c22a1c'; x.lineWidth=1.8; x.strokeRect(-24,-9,48,18);
  x.fillStyle='#c22a1c'; x.font='700 9px Oswald,sans-serif'; x.textAlign='center';
  x.fillText('PUBLISHED',0,3); x.textAlign='left'; x.restore();
  /* drying line overhead with sheets */
  pfWireRun(x,R.cx-pw*0.7,H*0.24,R.cx+pw*0.7,H*0.22,10,{lw:1.4});
  for(let i=0;i<4;i++){
    const t2=(i+0.5)/4, sx=R.cx-pw*0.7+t2*pw*1.4, sy=H*0.23+Math.sin(Math.PI*t2)*9;
    x.fillStyle='#fdf8ea'; x.fillRect(sx-11,sy,22,26);
    x.strokeStyle=INKC; x.lineWidth=1.2; x.strokeRect(sx-11,sy,22,26);
    x.strokeStyle='rgba(35,28,18,.5)';
    x.beginPath(); x.moveTo(sx-7,sy+7); x.lineTo(sx+7,sy+7);
    x.moveTo(sx-7,sy+12); x.lineTo(sx+4,sy+12); x.stroke();
  }
},
pressgate(x,d,R,W,H){
  /* the sorting gate: one conveyor in, two chutes out, a lever decides */
  const cy=H*0.6;
  /* conveyor */
  x.fillStyle='#57553f'; x.fillRect(R.cx-R.w*0.5,cy-8,R.w,16);
  x.strokeStyle=INKC; x.lineWidth=2.2; x.strokeRect(R.cx-R.w*0.5,cy-8,R.w,16);
  for(let i=0;i<7;i++){ x.beginPath(); x.arc(R.cx-R.w*0.44+i*R.w*0.15,cy+8,6,0,7);
    x.fillStyle='#8d8266'; x.fill(); x.strokeStyle=INKC; x.lineWidth=1.4; x.stroke(); }
  /* sheets riding in */
  for(let i=0;i<3;i++){
    const sx=R.cx-R.w*0.42+i*R.w*0.14;
    x.fillStyle='#fdf8ea'; x.fillRect(sx-12,cy-24,24,16);
    x.strokeStyle=INKC; x.lineWidth=1.3; x.strokeRect(sx-12,cy-24,24,16);
  }
  /* the gate frame and its swinging paddle */
  x.fillStyle='#44403a'; x.fillRect(R.cx-10,cy-72,20,64);
  x.strokeStyle=INKC; x.lineWidth=2.2; x.strokeRect(R.cx-10,cy-72,20,64);
  x.save(); x.translate(R.cx,cy-40); x.rotate(0.5);
  x.fillStyle='#c22a1c'; x.fillRect(0,-4,40,8);
  x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(0,-4,40,8); x.restore();
  /* two chutes with the page's own states carved above */
  for(const [dx2,lb,tone] of [[-1,'DRAFT','#8d8266'],[1,'PUBLISHED','#e9c81f']]){
    x.fillStyle=tone;
    x.beginPath(); x.moveTo(R.cx+dx2*R.w*0.14,cy+10);
    x.lineTo(R.cx+dx2*R.w*0.34,cy+H*0.16);
    x.lineTo(R.cx+dx2*R.w*0.26,cy+H*0.18);
    x.lineTo(R.cx+dx2*R.w*0.08,cy+14); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
    pfSign(x,R.cx+dx2*R.w*0.34,cy+H*0.26,lb,{s:0.9,post:10,maxW:90});
    /* bins */
    x.fillStyle='#6b4a2e'; x.fillRect(R.cx+dx2*R.w*0.34-24,cy+H*0.26,48,26);
    x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(R.cx+dx2*R.w*0.34-24,cy+H*0.26,48,26);
  }
  /* the deciding lever, big as a signal switch */
  x.strokeStyle=INKC; x.lineWidth=4.4; x.lineCap='round';
  x.beginPath(); x.moveTo(R.cx-R.w*0.4,cy-10); x.lineTo(R.cx-R.w*0.32,cy-52); x.stroke();
  x.fillStyle='#e9c81f'; x.beginPath(); x.arc(R.cx-R.w*0.32,cy-54,6.4,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.8; x.stroke();
  pfCarve(x,R.cx,cy-84,(d.toks[0]||'STATUS')+' DECIDES',{maxW:R.w*0.6,size:10,ink:'rgba(35,28,18,.7)'});
},
corridor(x,d,R,W,H){
  /* the versions corridor: the same portrait, older and older */
  /* one-point perspective walls */
  const vx=R.cx, vy=H*0.42;
  x.strokeStyle='rgba(35,28,18,.6)'; x.lineWidth=1.6;
  x.beginPath(); x.moveTo(0,H*0.1); x.lineTo(vx-60,vy-30); x.stroke();
  x.beginPath(); x.moveTo(0,H*0.86); x.lineTo(vx-60,vy+42); x.stroke();
  x.beginPath(); x.moveTo(W,H*0.1); x.lineTo(vx+60,vy-30); x.stroke();
  x.beginPath(); x.moveTo(W,H*0.86); x.lineTo(vx+60,vy+42); x.stroke();
  /* end wall with the CURRENT portrait, lit */
  x.fillStyle='#5b4a36'; x.fillRect(vx-60,vy-30,120,72);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(vx-60,vy-30,120,72);
  pfFrame(x,vx,vy+4,44,54,d.seed,{gold:true,kind:1});
  const g2=x.createRadialGradient(vx,vy,8,vx,vy,80);
  g2.addColorStop(0,'rgba(255,244,200,.30)'); g2.addColorStop(1,'rgba(255,244,200,0)');
  x.fillStyle=g2; x.beginPath(); x.arc(vx,vy,80,0,7); x.fill();
  pfCarve(x,vx,vy-38,'CURRENT',{maxW:100,size:9});
  /* receding frames, each a version older */
  const steps=[[0.10,1.0],[0.30,0.78],[0.48,0.58],[0.62,0.42]];
  steps.forEach(([t2,s2],i)=>{
    const fw=64*s2, fh=80*s2;
    const lx=t2*(vx-60), ly=H*0.1+t2*(vy-30-H*0.1);
    pfFrame(x,lx+fw*0.4,ly+fh*0.8,fw,fh,d.seed+i+1,{kind:1});
    pfCarve(x,lx+fw*0.4,ly+fh*0.8+fh*0.62,'V'+(steps.length-i),{maxW:40,size:8});
    const rx=W-t2*(W-vx-60);
    pfFrame(x,rx-fw*0.4,ly+fh*0.8,fw,fh,d.seed+i+11,{kind:1});
  });
  /* candle sconces */
  for(const t2 of [0.2,0.55]){
    const lx=t2*(vx-60), ly=H*0.5;
    x.strokeStyle=INKC; x.lineWidth=2;
    x.beginPath(); x.moveTo(lx,ly); x.lineTo(lx+8,ly-8); x.stroke();
    plateFlame(x,lx+9,ly-9,0.9,d.seed+t2*10);
  }
  /* one frame being rehung: the ladder and the rope */
  pfLadder(x,vx+90,H*0.84,H*0.3,-0.05);
},
editions(x,d,R,W,H){
  /* the news-stand of shipped editions — every date still on sale */
  const by=H*0.78, kw=R.w*0.7;
  /* the kiosk */
  x.fillStyle='#31647e'; x.fillRect(R.cx-kw/2,by-H*0.34,kw,H*0.34);
  x.strokeStyle=INKC; x.lineWidth=2.6; x.strokeRect(R.cx-kw/2,by-H*0.34,kw,H*0.34);
  /* striped awning */
  x.save();
  for(let i=0;i<7;i++){
    x.fillStyle=i%2?'#c22a1c':'#f6efdd';
    x.beginPath(); x.moveTo(R.cx-kw/2-10+i*(kw+20)/7,by-H*0.34);
    x.lineTo(R.cx-kw/2-10+(i+1)*(kw+20)/7,by-H*0.34);
    x.lineTo(R.cx-kw/2-10+(i+0.5)*(kw+20)/7,by-H*0.30); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.2; x.stroke();
  }
  x.restore();
  /* racked editions: little lettered covers, dates from the page */
  const dates=(d.labels.length?d.labels:['THIS WEEK','LAST WEEK','ARCHIVE']);
  for(let r2=0;r2<2;r2++)for(let c2=0;c2<4;c2++){
    const ex=R.cx-kw*0.36+c2*kw*0.24, ey=by-H*0.25+r2*H*0.125;
    x.fillStyle=['#fdf8ea','#f3e2b0'][(r2+c2)%2]; x.fillRect(ex-kw*0.09,ey-H*0.05,kw*0.18,H*0.1);
    x.strokeStyle=INKC; x.lineWidth=1.4; x.strokeRect(ex-kw*0.09,ey-H*0.05,kw*0.18,H*0.1);
    x.fillStyle=['#c22a1c','#31647e','#5fae57','#e9c81f'][(r2*4+c2)%4];
    x.fillRect(ex-kw*0.09,ey-H*0.05,kw*0.18,H*0.024);
    x.strokeRect(ex-kw*0.09,ey-H*0.05,kw*0.18,H*0.024);
    x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1;
    x.beginPath(); x.moveTo(ex-kw*0.06,ey); x.lineTo(ex+kw*0.06,ey);
    x.moveTo(ex-kw*0.06,ey+H*0.02); x.lineTo(ex+kw*0.03,ey+H*0.02); x.stroke();
  }
  pfBanner(x,R.cx,by-H*0.42,dates[0],{tone:'#8a3b2a',s:1,maxW:kw*0.9,h:20});
  /* the paper-boy's sack and a flying edition */
  x.fillStyle='#8d6b4a'; x.beginPath(); x.ellipse(R.cx+kw*0.6,by-8,20,12,0.3,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.8; x.stroke();
  x.save(); x.translate(R.cx+kw*0.52,by-70); x.rotate(-0.4);
  x.fillStyle='#fdf8ea'; x.fillRect(-12,-8,24,16);
  x.strokeStyle=INKC; x.lineWidth=1.3; x.strokeRect(-12,-8,24,16); x.restore();
  x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1.4;
  x.beginPath(); x.moveTo(R.cx+kw*0.45,by-52); x.quadraticCurveTo(R.cx+kw*0.4,by-40,R.cx+kw*0.44,by-30); x.stroke();
},
spyglass(x,d,R,W,H){
  /* the preview balcony: see the show before the town does */
  /* the stage across the street, framed and lit */
  const sx=R.cx+R.w*0.26, sy=H*0.34, sw=R.w*0.4, sh=H*0.22;
  x.fillStyle='#2c2418'; x.fillRect(sx-sw/2-8,sy-sh/2-8,sw+16,sh+16);
  x.strokeStyle=INKC; x.lineWidth=2.4; x.strokeRect(sx-sw/2-8,sy-sh/2-8,sw+16,sh+16);
  x.fillStyle='#f3e2b0'; x.fillRect(sx-sw/2,sy-sh/2,sw,sh);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(sx-sw/2,sy-sh/2,sw,sh);
  /* the coming attraction on the stage: a little scene */
  x.fillStyle='#31647e'; x.fillRect(sx-sw*0.34,sy-sh*0.2,sw*0.3,sh*0.44);
  x.fillStyle='#c22a1c'; x.beginPath(); x.arc(sx+sw*0.2,sy,sh*0.2,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.4;
  x.strokeRect(sx-sw*0.34,sy-sh*0.2,sw*0.3,sh*0.44);
  x.beginPath(); x.arc(sx+sw*0.2,sy,sh*0.2,0,7); x.stroke();
  /* curtain edges */
  x.fillStyle='#8a3b2a';
  x.beginPath(); x.moveTo(sx-sw/2,sy-sh/2); x.quadraticCurveTo(sx-sw*0.4,sy,sx-sw/2,sy+sh/2);
  x.closePath(); x.fill();
  x.beginPath(); x.moveTo(sx+sw/2,sy-sh/2); x.quadraticCurveTo(sx+sw*0.4,sy,sx+sw/2,sy+sh/2);
  x.closePath(); x.fill();
  pfBanner(x,sx,sy-sh/2-22,'NOT YET PUBLIC',{tone:'#c22a1c',s:0.9,maxW:sw,h:18});
  /* our balcony rail and the long glass */
  x.fillStyle='#57553f'; x.fillRect(0,H*0.78,W*0.62,10);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(0,H*0.78,W*0.62,10);
  for(let i=0;i<7;i++){ x.beginPath(); x.moveTo(20+i*W*0.085,H*0.788); x.lineTo(20+i*W*0.085,H*0.86); x.stroke(); }
  const tx=R.cx-R.w*0.3, ty2=H*0.74;
  x.strokeStyle=INKC; x.lineWidth=3;
  x.beginPath(); x.moveTo(tx-12,H*0.78+8); x.lineTo(tx,ty2); x.lineTo(tx+12,H*0.78+8); x.stroke();
  x.save(); x.translate(tx,ty2); x.rotate(-0.48);
  x.fillStyle='#8a5a2e'; x.fillRect(0,-8,58,16);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(0,-8,58,16);
  x.fillStyle='#d9c8a2'; x.fillRect(58,-6,10,12); x.strokeRect(58,-6,10,12);
  x.restore();
  /* the sight-line */
  x.strokeStyle='rgba(233,200,31,.5)'; x.lineWidth=1.6; x.setLineDash([7,5]);
  x.beginPath(); x.moveTo(tx+50,ty2-34); x.lineTo(sx-sw*0.2,sy+sh*0.2); x.stroke();
  x.setLineDash([]);
},
relay(x,d,R,W,H){
  /* the approval relay: the scroll passes stage to stage, hand to hand */
  const hzY=d.hz*H, gy=hzY+(H-hzY)*0.42;
  const stages=(d.labels3.length>=2?d.labels3:d.labels.length?d.labels:['REVIEW','APPROVE','PUBLISH']).slice(0,4);
  const n=stages.length;
  /* chalked track arcs */
  x.strokeStyle='rgba(246,239,221,.7)'; x.lineWidth=2; x.setLineDash([9,7]);
  x.beginPath(); x.moveTo(R.cx-R.w*0.48,gy+8);
  x.quadraticCurveTo(R.cx,gy+26,R.cx+R.w*0.48,gy+4); x.stroke(); x.setLineDash([]);
  for(let i=0;i<n;i++){
    const t2=n===1?0.5:i/(n-1), px2=R.cx-R.w*0.46+t2*R.w*0.92;
    const py=gy+8+Math.sin(Math.PI*t2)*16;
    /* checkpoint arch */
    x.strokeStyle=INKC; x.lineWidth=3;
    x.beginPath(); x.moveTo(px2-16,py); x.lineTo(px2-16,py-40);
    x.arc(px2,py-40,16,Math.PI,0); x.lineTo(px2+16,py); x.stroke();
    pfFlag(x,px2+16,py,54,null,['#c22a1c','#e9c81f','#5fae57','#31647e'][i%4],1);
    pfSign(x,px2,py+16,stages[i],{s:0.84,post:8,maxW:100});
    /* the runners: small silhouettes leaning forward */
    if(i<n-1){
      const rx=px2+R.w*0.92/(n-1)*0.45;
      plateCrowd(x,py+4,rx-6,rx+6,d.seed+i,1,1.7);
    }
  }
  /* the baton scroll mid-pass, big, between the last two stages */
  const bx2=R.cx+R.w*(n>2?0.18:0.02), by2=gy-26;
  x.save(); x.translate(bx2,by2); x.rotate(-0.3);
  x.fillStyle='#fdf8ea'; x.fillRect(-22,-7,44,14);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(-22,-7,44,14);
  x.fillStyle='#8a3b2a'; x.fillRect(-26,-8,6,16); x.fillRect(20,-8,6,16);
  x.strokeRect(-26,-8,6,16); x.strokeRect(20,-8,6,16);
  x.restore();
  x.strokeStyle='rgba(35,28,18,.55)'; x.lineWidth=1.6;
  for(let t3=0;t3<3;t3++){ x.beginPath(); x.moveTo(bx2-30-t3*8,by2+4+t3*2); x.lineTo(bx2-40-t3*8,by2+6+t3*2); x.stroke(); }
},
stairflag(x,d,R,W,H){
  /* the first climb: numbered landings, the flag at the top */
  const hzY=d.hz*H;
  const x0=R.cx-R.w*0.46, y0=hzY+(H-hzY)*0.5;
  const steps=clamp((d.m.stats&&d.m.stats.steps)||d.labels.length||4,3,6);
  const stepW=R.w*0.92/steps, stepH=(y0-H*0.24)/steps;
  for(let i=0;i<steps;i++){
    const sx=x0+i*stepW, sy=y0-i*stepH;
    x.fillStyle=i%2?'#c9bd96':'#d9c8a2';
    x.fillRect(sx,sy-stepH,stepW+2,stepH+((steps-i)*2));
    x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(sx,sy-stepH,stepW+2,stepH+((steps-i)*2));
    /* the landing keeps its own heading */
    if(d.labels[i]) pfCarve(x,sx+stepW/2,sy-stepH/2,pfShort(d.labels[i],14),{maxW:stepW-6,size:8,ink:'rgba(35,28,18,.7)'});
    else pfCarve(x,sx+stepW/2,sy-stepH/2,String(i+1),{maxW:20,size:11});
  }
  /* the summit flag takes the light */
  const fx2=x0+steps*stepW-stepW*0.3, fy2=y0-steps*stepH;
  pfFlag(x,fx2,fy2,64,'START HERE','#c22a1c',1);
  const g2=x.createRadialGradient(fx2,fy2-64,6,fx2,fy2-64,60);
  g2.addColorStop(0,'rgba(233,200,31,.35)'); g2.addColorStop(1,'rgba(233,200,31,0)');
  x.fillStyle=g2; x.beginPath(); x.arc(fx2,fy2-64,60,0,7); x.fill();
  /* chalk arrows the whole way up */
  x.strokeStyle='rgba(246,239,221,.8)'; x.lineWidth=2;
  for(let i=0;i<steps-1;i++){
    const ax=x0+(i+0.75)*stepW, ay=y0-(i+0.4)*stepH;
    x.beginPath(); x.moveTo(ax,ay); x.lineTo(ax+12,ay-10); x.stroke();
    x.beginPath(); x.moveTo(ax+12,ay-10); x.lineTo(ax+5,ay-10); x.moveTo(ax+12,ay-10); x.lineTo(ax+12,ay-3); x.stroke();
  }
},
toolbox(x,d,R,W,H){
  /* landing day: the chest is open, the parts are counted */
  const by=H*0.78;
  /* the great chest */
  const cw2=R.w*0.44;
  x.fillStyle='#8a3b2a'; x.fillRect(R.cx-cw2/2,by-cw2*0.36,cw2,cw2*0.36);
  x.strokeStyle=INKC; x.lineWidth=2.6; x.strokeRect(R.cx-cw2/2,by-cw2*0.36,cw2,cw2*0.36);
  /* open lid */
  x.save(); x.translate(R.cx-cw2/2,by-cw2*0.36); x.rotate(-0.9);
  x.fillStyle='#6b2f22'; x.fillRect(0,-cw2*0.3,cw2,cw2*0.3);
  x.strokeStyle=INKC; x.lineWidth=2.2; x.strokeRect(0,-cw2*0.3,cw2,cw2*0.3);
  x.restore();
  /* tray of tools */
  x.fillStyle='#d9c8a2'; x.fillRect(R.cx-cw2*0.42,by-cw2*0.30,cw2*0.84,8);
  x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(R.cx-cw2*0.42,by-cw2*0.30,cw2*0.84,8);
  /* tools laid on the cloth, each named for a requirement */
  const cloth=[R.cx+cw2*0.7,by];
  x.fillStyle='#f3e2b0';
  x.beginPath(); x.moveTo(cloth[0]-56,cloth[1]); x.lineTo(cloth[0]+56,cloth[1]);
  x.lineTo(cloth[0]+44,cloth[1]-30); x.lineTo(cloth[0]-44,cloth[1]-30); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.6; x.stroke();
  /* wrench */
  x.strokeStyle=INKC; x.lineWidth=4; x.lineCap='round';
  x.beginPath(); x.moveTo(cloth[0]-30,cloth[1]-8); x.lineTo(cloth[0]-6,cloth[1]-22); x.stroke();
  x.beginPath(); x.arc(cloth[0]-34,cloth[1]-6,5,0.6,5.2); x.stroke();
  /* hammer */
  x.lineWidth=3;
  x.beginPath(); x.moveTo(cloth[0]+8,cloth[1]-6); x.lineTo(cloth[0]+30,cloth[1]-20); x.stroke();
  x.fillStyle='#57553f'; x.fillRect(cloth[0]+26,cloth[1]-27,14,9);
  x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(cloth[0]+26,cloth[1]-27,14,9);
  const reqs=(d.labels.length?d.labels:['NODE','DATABASE','YARN']);
  pfSign(x,cloth[0],cloth[1]+16,pfShort(reqs[0],16),{s:0.8,post:0,maxW:110});
  /* crates still coming off the cart */
  pfCrate(x,R.cx-cw2*0.9,by,44,30,pfShort(reqs[1]||'PARTS',10));
  pfCrate(x,R.cx-cw2*0.9+18,by-30,36,24,pfShort(reqs[2]||'DEPS',9));
  /* the cart wheel edge, leaving frame */
  x.strokeStyle=INKC; x.lineWidth=3;
  x.beginPath(); x.arc(R.cx-cw2*1.3,by-10,26,-0.6,1.8); x.stroke();
  for(let i=0;i<4;i++){ const a2=-0.4+i*0.5;
    x.lineWidth=2;
    x.beginPath(); x.moveTo(R.cx-cw2*1.3,by-10);
    x.lineTo(R.cx-cw2*1.3+Math.cos(a2)*24,by-10+Math.sin(a2)*24); x.stroke(); }
  /* the chest plate says whose kit this is */
  pfBanner(x,R.cx,by-cw2*0.36-18,pfTok(d,0,'INSTALL')+' KIT',{tone:'#31647e',s:0.9,maxW:cw2,h:18});
},

cutaway(x,d,R,W,H){
  /* the doll's-house: the project sliced open, every floor a folder */
  const hzY=d.hz*H, by=H*0.84;
  const bw=R.w*0.62, floors=clamp(d.labels.length||4,3,5), fh=Math.min(H*0.11,(by-H*0.2)/floors);
  const rooms=['/src','/config','/api','/public','/database'];
  /* intact half */
  x.fillStyle=d.night?'#33291f':'#a08a5f';
  x.fillRect(R.cx-bw*0.5,by-floors*fh,bw*0.44,floors*fh);
  x.strokeStyle=INKC; x.lineWidth=2.4; x.strokeRect(R.cx-bw*0.5,by-floors*fh,bw*0.44,floors*fh);
  for(let f2=0;f2<floors;f2++)for(let c2=0;c2<2;c2++)
    pfWindowGlow(x,R.cx-bw*0.4+c2*bw*0.2,by-floors*fh+fh*(f2+0.5),bw*0.09,fh*0.44,d.night&&((d.seed>>>(f2*2+c2))&1));
  /* the sliced half: rooms with their folder names and furniture */
  for(let f2=0;f2<floors;f2++){
    const fy2=by-(f2+1)*fh;
    x.fillStyle=['#f3e2b0','#e8d9ac'][f2%2]; x.fillRect(R.cx-bw*0.06,fy2,bw*0.56,fh);
    x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(R.cx-bw*0.06,fy2,bw*0.56,fh);
    const lb=(d.labels[floors-1-f2]||rooms[f2%rooms.length]);
    pfCarve(x,R.cx+bw*0.22,fy2+fh*0.34,pfShort(lb,16),{maxW:bw*0.5,size:8,mono:true,ink:'rgba(35,28,18,.75)'});
    /* furniture per floor: desk / shelf / boiler / bed */
    x.fillStyle='#8d6b4a';
    if(f2%4===0){ x.fillRect(R.cx+bw*0.02,fy2+fh*0.6,bw*0.16,fh*0.14);
      x.fillRect(R.cx+bw*0.03,fy2+fh*0.74,3,fh*0.2); x.fillRect(R.cx+bw*0.15,fy2+fh*0.74,3,fh*0.2); }
    else if(f2%4===1){ for(let s2=0;s2<3;s2++) x.fillRect(R.cx+bw*0.34,fy2+fh*(0.3+s2*0.2),bw*0.16,3); }
    else if(f2%4===2){ x.fillStyle='#57553f'; x.fillRect(R.cx+bw*0.36,fy2+fh*0.4,bw*0.1,fh*0.5);
      pfSmokeCurl(x,R.cx+bw*0.41,fy2+fh*0.34,0.8); }
    else { x.fillRect(R.cx+bw*0.04,fy2+fh*0.66,bw*0.2,fh*0.12); }
  }
  /* the saw-tooth cut line */
  x.strokeStyle=INKC; x.lineWidth=2.6;
  x.beginPath(); x.moveTo(R.cx-bw*0.06,by);
  for(let yy=by;yy>by-floors*fh;yy-=12) x.lineTo(R.cx-bw*0.06+((yy/12)%2?5:-3),yy-12);
  x.stroke();
  /* roof over the intact half */
  x.fillStyle='#8a3b2a';
  x.beginPath(); x.moveTo(R.cx-bw*0.56,by-floors*fh); x.lineTo(R.cx-bw*0.28,by-floors*fh-fh*0.9);
  x.lineTo(R.cx-bw*0.0,by-floors*fh); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
  pfSmokeCurl(x,R.cx-bw*0.44,by-floors*fh-fh*0.5,1.1);
},
switchyard(x,d,R,W,H){
  /* the routing yard: every request takes the track thrown for it */
  const hzY=d.hz*H, y0=H*0.9;
  /* the main line comes at us and branches */
  const branch=(bx2,tx2)=>{ x.strokeStyle=INKC; x.lineWidth=3;
    x.beginPath(); x.moveTo(R.cx,y0); x.quadraticCurveTo(R.cx+(bx2-R.cx)*0.3,hzY+(y0-hzY)*0.5,bx2,tx2); x.stroke();
    x.strokeStyle='rgba(35,28,18,.7)'; x.lineWidth=1.4;
    for(let t2=0.12;t2<0.95;t2+=0.11){
      const px2=R.cx+(bx2-R.cx)*(t2*t2*0.3+t2*0.7), py=y0+(tx2-y0)*t2;
      const wdt=10*(1-t2*0.7);
      x.beginPath(); x.moveTo(px2-wdt,py); x.lineTo(px2+wdt,py); x.stroke(); } };
  const ends=[[R.cx-R.w*0.42,hzY+14],[R.cx-R.w*0.1,hzY+8],[R.cx+R.w*0.22,hzY+12],[R.cx+R.w*0.46,hzY+18]];
  ends.forEach(e2=>branch(e2[0],e2[1]));
  /* route boards where each line leaves */
  const routes=(d.labels.length?d.labels:['GET /PAGES','POST /PAGES','PUT /PAGES']);
  ends.slice(0,routes.length).forEach((e2,i)=>
    pfSign(x,e2[0],e2[1]+4,pfShort(routes[i],16),{s:0.82,post:14,maxW:104}));
  /* the signal box on stilts */
  const sx=R.cx+R.w*0.34, sy=y0-H*0.16;
  x.fillStyle='#8d6b4a'; x.fillRect(sx-30,sy-34,60,34);
  x.strokeStyle=INKC; x.lineWidth=2.2; x.strokeRect(sx-30,sy-34,60,34);
  pfWindowGlow(x,sx-12,sy-20,18,14,d.night); pfWindowGlow(x,sx+12,sy-20,18,14,d.night);
  x.lineWidth=2.6;
  x.beginPath(); x.moveTo(sx-22,sy); x.lineTo(sx-22,y0-8); x.moveTo(sx+22,sy); x.lineTo(sx+22,y0-8); x.stroke();
  /* the levers thrown */
  for(let i=0;i<3;i++){
    x.strokeStyle=INKC; x.lineWidth=3; x.lineCap='round';
    x.beginPath(); x.moveTo(sx-40-i*12,y0-6);
    x.lineTo(sx-40-i*12+(i%2?-8:8),y0-26); x.stroke();
    x.fillStyle=i%2?'#c22a1c':'#e9c81f';
    x.beginPath(); x.arc(sx-40-i*12+(i%2?-8:8),y0-28,4,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.4; x.stroke();
  }
  /* the waiting lantern on the near track */
  pfLamp(x,R.cx-R.w*0.3,y0-4,1,d.night||d.dusk);
},
tollroad(x,d,R,W,H){
  /* the middleware road: no request passes a gate unquestioned */
  const hzY=d.hz*H;
  /* the road switchbacks up the hill */
  x.fillStyle='#c9bd96';
  x.beginPath();
  x.moveTo(R.cx-R.w*0.5,H*0.92); x.lineTo(R.cx+R.w*0.1,H*0.9);
  x.lineTo(R.cx+R.w*0.44,H*0.74); x.lineTo(R.cx-R.w*0.2,H*0.68);
  x.lineTo(R.cx-R.w*0.44,H*0.56); x.lineTo(R.cx+R.w*0.2,H*0.5);
  x.lineTo(R.cx+R.w*0.36,hzY+8);
  x.lineTo(R.cx+R.w*0.28,hzY+4);
  x.lineTo(R.cx+R.w*0.06,H*0.46); x.lineTo(R.cx-R.w*0.52,H*0.52);
  x.lineTo(R.cx-R.w*0.3,H*0.64) ; x.lineTo(R.cx+R.w*0.3,H*0.70);
  x.lineTo(R.cx-R.w*0.02,H*0.84); x.lineTo(R.cx-R.w*0.5,H*0.86);
  x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
  /* three gates astride the road, each named by the page */
  const gates=[[R.cx-R.w*0.05,H*0.865,1],[R.cx+R.w*0.03,H*0.685,0.82],[R.cx-R.w*0.16,H*0.525,0.66]];
  const names=(d.labels.length?d.labels:['CORS','LOGGER','AUTH']);
  gates.forEach(([gx,gy,s2],i)=>{
    x.fillStyle='#8d6b4a'; x.fillRect(gx-26*s2,gy-30*s2,14*s2,30*s2);
    x.strokeStyle=INKC; x.lineWidth=2*s2; x.strokeRect(gx-26*s2,gy-30*s2,14*s2,30*s2);
    x.fillStyle='#57553f';
    x.beginPath(); x.moveTo(gx-30*s2,gy-30*s2); x.lineTo(gx-19*s2,gy-40*s2); x.lineTo(gx-8*s2,gy-30*s2);
    x.closePath(); x.fill(); x.stroke();
    /* the barrier arm, striped */
    x.save(); x.translate(gx-14*s2,gy-22*s2); x.rotate(i===1?-0.5:-0.06);
    for(let b2=0;b2<5;b2++){ x.fillStyle=b2%2?'#c22a1c':'#f6efdd';
      x.fillRect(b2*11*s2,-3.4*s2,11*s2,6.8*s2); }
    x.strokeStyle=INKC; x.lineWidth=1.6*s2; x.strokeRect(0,-3.4*s2,55*s2,6.8*s2);
    x.restore();
    if(names[i]) pfSign(x,gx+26*s2,gy-4,pfShort(names[i],14),{s:0.8*s2+0.2,post:12,maxW:96});
  });
  /* the cart waiting at the first gate with its papers */
  pfCrate(x,R.cx-R.w*0.3,H*0.9,38,24,pfTok(d,0,'REQ'));
  x.strokeStyle=INKC; x.lineWidth=2.6;
  x.beginPath(); x.arc(R.cx-R.w*0.3-14,H*0.905,9,0,7); x.stroke();
  x.beginPath(); x.arc(R.cx-R.w*0.3+16,H*0.905,9,0,7); x.stroke();
},
tribunal(x,d,R,W,H){
  /* the policy bench: the request states its case, the stamp answers */
  const by=H*0.66;
  /* the high bench */
  x.fillStyle='#6b4a2e'; x.fillRect(R.cx-R.w*0.4,by-H*0.13,R.w*0.8,H*0.13);
  x.strokeStyle=INKC; x.lineWidth=2.6; x.strokeRect(R.cx-R.w*0.4,by-H*0.13,R.w*0.8,H*0.13);
  x.fillStyle='#8a5a37'; x.fillRect(R.cx-R.w*0.44,by-H*0.15,R.w*0.88,H*0.03);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(R.cx-R.w*0.44,by-H*0.15,R.w*0.88,H*0.03);
  /* the scales on the bench */
  const scx=R.cx-R.w*0.2;
  x.strokeStyle=INKC; x.lineWidth=2.6;
  x.beginPath(); x.moveTo(scx,by-H*0.15); x.lineTo(scx,by-H*0.27); x.stroke();
  x.beginPath(); x.moveTo(scx-26,by-H*0.24); x.lineTo(scx+26,by-H*0.255); x.stroke();
  for(const [px2,py] of [[scx-26,by-H*0.24],[scx+26,by-H*0.255]]){
    x.lineWidth=1.4;
    x.beginPath(); x.moveTo(px2-9,py+16); x.lineTo(px2,py); x.lineTo(px2+9,py+16); x.stroke();
    x.beginPath(); x.arc(px2,py+18,10,0,Math.PI); x.stroke();
  }
  /* the gavel raised */
  x.save(); x.translate(R.cx+R.w*0.16,by-H*0.24); x.rotate(-0.6);
  x.fillStyle='#8d6b4a'; x.fillRect(-3,-2,6,30);
  x.fillStyle='#57553f'; x.fillRect(-13,-14,26,13);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(-13,-14,26,13);
  x.restore();
  /* the two verdict chutes */
  for(const [dx2,lb,tone] of [[-1,'ALLOW','#5fae57'],[1,'DENY','#c22a1c']]){
    const chx=R.cx+dx2*R.w*0.34;
    x.fillStyle=tone;
    x.beginPath(); x.moveTo(chx-16,by); x.lineTo(chx+16,by);
    x.lineTo(chx+dx2*10+10,by+H*0.12); x.lineTo(chx+dx2*10-10,by+H*0.12); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
    pfSign(x,chx+dx2*10,by+H*0.17,lb,{s:0.86,post:0,maxW:70});
  }
  /* the scroll under judgment, and the rule-book */
  x.fillStyle='#fdf8ea'; x.save(); x.translate(R.cx,by-H*0.05); x.rotate(0.04);
  x.fillRect(-20,-13,40,26); x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(-20,-13,40,26);
  x.strokeStyle='rgba(35,28,18,.55)'; x.lineWidth=1;
  x.beginPath(); x.moveTo(-13,-5); x.lineTo(13,-5); x.moveTo(-13,1); x.lineTo(8,1); x.stroke();
  x.restore();
  pfBookBig(x,R.cx+R.w*0.33,by-H*0.19,52,{cover:'#31647e',ang:0.05});
  /* the rules carved on the wall are the page's own */
  const rules=(d.labels.length?d.labels:['IS-AUTHENTICATED','IS-OWNER']);
  for(let i=0;i<Math.min(2,rules.length);i++)
    pfBanner(x,R.cx-R.w*0.22+i*R.w*0.44,H*0.20,pfShort(rules[i],18),{tone:i?'#8a3b2a':'#31647e',s:0.9,maxW:R.w*0.4,h:18});
},
funnelworks(x,d,R,W,H){
  /* the filtering works: everything pours in, only the asked-for falls out.
     Each page rigs the works its own way round, its own throat. */
  const cy=H*0.34, sgn=((d.h>>>4)%2)?1:-1, narrow=((d.h>>>6)%2);
  const fx9=o=>R.cx+o*sgn;
  /* the feed chute */
  x.fillStyle='#8d8266';
  x.beginPath(); x.moveTo(fx9(-R.w*0.5),H*0.14); x.lineTo(fx9(-R.w*0.1),cy-30);
  x.lineTo(fx9(-R.w*0.1),cy-18); x.lineTo(fx9(-R.w*0.5),H*0.19); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
  /* tokens tumbling in */
  const GLY=['{a}','{b}','#12','TXT','[0]','{x}'];
  for(let i=0;i<6;i++){
    const t2=i/5, tx=fx9(-R.w*(0.44-t2*0.3)), ty2=H*(0.13+t2*0.1)+((d.seed>>>i)%8);
    x.fillStyle=['#e9c81f','#7f95b0','#d9c8a2'][i%3];
    x.fillRect(tx-9,ty2-7,18,14);
    x.strokeStyle=INKC; x.lineWidth=1.3; x.strokeRect(tx-9,ty2-7,18,14);
    x.fillStyle=INKC; x.font='700 7px "Courier Prime",monospace'; x.textAlign='center';
    x.fillText(GLY[i],tx,ty2+2.6); x.textAlign='left';
  }
  /* THE FUNNEL, riveted — a wide cone or a stepped hopper */
  x.fillStyle='#7d7357';
  if(narrow){
    x.beginPath(); x.moveTo(R.cx-R.w*0.26,cy-20); x.lineTo(R.cx+R.w*0.26,cy-20);
    x.lineTo(R.cx+R.w*0.16,cy+H*0.035); x.lineTo(R.cx+R.w*0.05,cy+H*0.05);
    x.lineTo(R.cx+R.w*0.05,cy+H*0.14); x.lineTo(R.cx-R.w*0.05,cy+H*0.14);
    x.lineTo(R.cx-R.w*0.05,cy+H*0.05); x.lineTo(R.cx-R.w*0.16,cy+H*0.035);
    x.closePath(); x.fill();
  } else {
    x.beginPath(); x.moveTo(R.cx-R.w*0.30,cy-20); x.lineTo(R.cx+R.w*0.30,cy-20);
    x.lineTo(R.cx+R.w*0.05,cy+H*0.14); x.lineTo(R.cx-R.w*0.05,cy+H*0.14); x.closePath(); x.fill();
  }
  x.strokeStyle=INKC; x.lineWidth=2.6; x.stroke();
  x.fillStyle=INKC;
  for(let i=0;i<5;i++){ x.beginPath(); x.arc(R.cx-R.w*0.2+i*R.w*0.1,cy-12,1.6,0,7); x.fill(); }
  /* the sieve mesh visible at the throat */
  x.strokeStyle='rgba(246,239,221,.6)'; x.lineWidth=1.2;
  for(let i=0;i<4;i++){ x.beginPath(); x.moveTo(R.cx-R.w*0.1+i*R.w*0.05,cy+H*0.02);
    x.lineTo(R.cx-R.w*0.08+i*R.w*0.05,cy+H*0.09); x.stroke(); }
  x.beginPath(); x.moveTo(R.cx-R.w*0.11,cy+H*0.055); x.lineTo(R.cx+R.w*0.11,cy+H*0.055); x.stroke();
  /* the one clause plate bolted to the funnel: the page's own operator */
  const clause=(d.labels3.find(l2=>/\$/.test(l2))||d.labels3[0]||d.labels[0]||'$EQ');
  x.fillStyle='#fdf6e2'; x.fillRect(R.cx-40,cy+2,80,20);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(R.cx-40,cy+2,80,20);
  x.save(); x.fillStyle=INKC; x.textAlign='center';
  pfFitFont(x,pfShort(clause,14),72,9,'700 %px "Courier Prime",monospace');
  x.fillText(pfShort(clause,14),R.cx,cy+16); x.textAlign='left'; x.restore();
  /* what passes: a neat single file into the pail */
  for(let i=0;i<3;i++){
    x.fillStyle='#e9c81f'; x.fillRect(R.cx-8,cy+H*0.16+i*20,16,12);
    x.strokeStyle=INKC; x.lineWidth=1.3; x.strokeRect(R.cx-8,cy+H*0.16+i*20,16,12);
  }
  x.fillStyle='#57553f';
  x.beginPath(); x.moveTo(R.cx-26,cy+H*0.24+40); x.lineTo(R.cx+26,cy+H*0.24+40);
  x.lineTo(R.cx+20,cy+H*0.24+70); x.lineTo(R.cx-20,cy+H*0.24+70); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
  /* what falls aside: rejected pile under the sieve lip */
  for(let i=0;i<4;i++){
    x.fillStyle='#b9ab84';
    x.save(); x.translate(fx9(R.w*0.26+i*10),cy+H*0.3+((d.seed>>>i)%10)); x.rotate(0.4*((i%3)-1));
    x.fillRect(-8,-6,16,12); x.strokeStyle='rgba(35,28,18,.6)'; x.lineWidth=1.1; x.strokeRect(-8,-6,16,12);
    x.restore();
  }
},

marshalling(x,d,R,W,H){
  /* the ordering yard: crates ranked by size, platform by platform */
  const hzY=d.hz*H, y0=hzY+(H-hzY)*0.32;
  const rows=3;
  for(let r2=0;r2<rows;r2++){
    const py=y0+r2*(H-y0)*0.26, pw=R.w*(0.9-r2*0.1);
    x.fillStyle='#8d8266'; x.fillRect(R.cx-pw/2,py,pw,8);
    x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(R.cx-pw/2,py,pw,8);
    x.fillStyle='#57553f';
    for(const lx9 of [R.cx-pw/2+8,R.cx,R.cx+pw/2-14]){
      x.fillRect(lx9,py+8,6,(H-y0)*0.26-10); x.strokeRect(lx9,py+8,6,(H-y0)*0.26-10); }
    pfCarve(x,R.cx-pw/2-14,py+7,String(r2+1),{maxW:20,size:11});
    /* crates in strict rank on each platform */
    const n2=4+r2, base=12+r2*2;
    for(let i=0;i<n2;i++){
      const cw2=base+(n2-i)*4;
      const bx2=R.cx-pw*0.42+i*(pw*0.84/n2);
      pfCrate(x,bx2,py,cw2,cw2*0.9,null,['#c9a86a','#d9c8a2'][i%2]);
    }
  }
  /* the sorting crane holding one crate mid-move */
  x.strokeStyle=INKC; x.lineWidth=3.4;
  x.beginPath(); x.moveTo(R.cx+R.w*0.46,H*0.9); x.lineTo(R.cx+R.w*0.46,H*0.3);
  x.lineTo(R.cx+R.w*0.1,H*0.24); x.stroke();
  x.lineWidth=1.6;
  x.beginPath(); x.moveTo(R.cx+R.w*0.2,H*0.255); x.lineTo(R.cx+R.w*0.2,H*0.34); x.stroke();
  pfCrate(x,R.cx+R.w*0.2,H*0.38,22,20,null,'#e9c81f');
  /* the order slip nailed to the crane leg: the page's own sort key */
  const key=(d.labels3.find(l2=>/:|ASC|DESC/i.test(l2))||d.labels[0]||'ORDER: ASC');
  pfSign(x,R.cx+R.w*0.46,H*0.56,pfShort(key,16),{s:0.86,post:0,maxW:104,ang:-0.03});
},
magnetwell(x,d,R,W,H){
  /* the populate derrick: reach down the well, bring up what's related */
  const hzY=d.hz*H, wy=hzY+(H-hzY)*0.5;
  /* the well mouth */
  x.fillStyle='#57553f'; x.beginPath(); x.ellipse(R.cx,wy,R.w*0.22,R.w*0.07,0,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2.4; x.stroke();
  x.fillStyle=INKC; x.beginPath(); x.ellipse(R.cx,wy,R.w*0.17,R.w*0.05,0,0,7); x.fill();
  x.fillStyle='#b9ab84';
  x.fillRect(R.cx-R.w*0.22,wy-14,10,14); x.fillRect(R.cx+R.w*0.22-10,wy-14,10,14);
  x.strokeStyle=INKC; x.lineWidth=1.6;
  x.strokeRect(R.cx-R.w*0.22,wy-14,10,14); x.strokeRect(R.cx+R.w*0.22-10,wy-14,10,14);
  /* the derrick */
  x.strokeStyle=INKC; x.lineWidth=3.4;
  x.beginPath(); x.moveTo(R.cx-R.w*0.3,wy); x.lineTo(R.cx-R.w*0.06,wy-H*0.34);
  x.lineTo(R.cx+R.w*0.2,wy-4); x.stroke();
  x.lineWidth=1.8;
  x.beginPath(); x.moveTo(R.cx-R.w*0.18,wy-H*0.17); x.lineTo(R.cx+R.w*0.07,wy-H*0.17); x.stroke();
  /* the chain and the horseshoe magnet */
  x.strokeStyle=INKC; x.lineWidth=2;
  x.beginPath(); x.moveTo(R.cx-R.w*0.06,wy-H*0.34); x.lineTo(R.cx-R.w*0.02,wy-H*0.12); x.stroke();
  x.save(); x.translate(R.cx-R.w*0.02,wy-H*0.10);
  x.strokeStyle='#c22a1c'; x.lineWidth=9; x.lineCap='butt';
  x.beginPath(); x.arc(0,0,13,Math.PI,0,false); x.stroke();
  x.strokeStyle='#f6efdd'; x.lineWidth=9;
  x.beginPath(); x.moveTo(-13,0); x.lineTo(-13,10); x.moveTo(13,0); x.lineTo(13,10); x.stroke();
  x.strokeStyle=INKC; x.lineWidth=1.6;
  x.beginPath(); x.arc(0,0,17.5,Math.PI,0,false); x.lineTo(17.5,10); x.moveTo(-17.5,10); x.lineTo(-17.5,0); x.stroke();
  x.beginPath(); x.arc(0,0,8.5,Math.PI,0,false); x.lineTo(8.5,10); x.moveTo(-8.5,10); x.lineTo(-8.5,0); x.stroke();
  x.restore();
  /* the catch: a chain of linked records rising out of the dark */
  const links=clamp(d.labels.length+2,3,5);
  for(let i=0;i<links;i++){
    const ly=wy-H*0.04+i*H*0.055, lx=R.cx-R.w*0.02+Math.sin(i*1.8)*8;
    x.fillStyle=i===0?'#e9c81f':'#d9c8a2';
    x.fillRect(lx-13,ly-8,26,16);
    x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(lx-13,ly-8,26,16);
    if(i<links-1){ x.strokeStyle='rgba(35,28,18,.8)'; x.lineWidth=1.6;
      x.beginPath(); x.moveTo(lx,ly+8); x.lineTo(R.cx-R.w*0.02+Math.sin((i+1)*1.8)*8,ly+H*0.055-8); x.stroke(); }
    x.fillStyle=INKC; x.font='700 6.5px "Courier Prime",monospace'; x.textAlign='center';
    x.fillText(pfShort((d.labels3[i]||d.labels[i]||['DOC','REL','MEDIA','TAG','REF'][i]),8),lx,ly+2.6);
    x.textAlign='left';
  }
  /* the pulled-up pile beside the well */
  pfCrate(x,R.cx+R.w*0.32,wy+8,34,22,pfTok(d,0,'DEEP'));
},
chains(x,d,R,W,H){
  /* the relation: two named monuments, one great chain between */
  const hzY=d.hz*H, gy=hzY+(H-hzY)*0.5;
  /* left obelisk, right column — different stones for different tables */
  x.fillStyle='#b9ab84';
  x.beginPath(); x.moveTo(R.cx-R.w*0.36-26,gy); x.lineTo(R.cx-R.w*0.36-16,gy-H*0.32);
  x.lineTo(R.cx-R.w*0.36+16,gy-H*0.32); x.lineTo(R.cx-R.w*0.36+26,gy); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
  x.fillStyle='#b9ab84';
  x.beginPath(); x.moveTo(R.cx-R.w*0.36-16,gy-H*0.32); x.lineTo(R.cx-R.w*0.36,gy-H*0.375);
  x.lineTo(R.cx-R.w*0.36+16,gy-H*0.32); x.closePath(); x.fill(); x.stroke();
  pfColumn(x,R.cx+R.w*0.36,gy,38,H*0.30,'#d9c8a2');
  /* their names are the page's own ends of the relation */
  pfCarve(x,R.cx-R.w*0.36,gy-H*0.15,pfTok(d,0,'AUTHOR'),{maxW:70,size:9,ang:-1.5708});
  pfCarve(x,R.cx+R.w*0.36,gy-H*0.13,pfTok(d,1,'BOOKS'),{maxW:70,size:9,ang:-1.5708});
  /* THE CHAIN — drawn link by link, sagging with its own weight */
  const n=9;
  for(let i=0;i<n;i++){
    const t2=(i+0.5)/n;
    const lx=R.cx-R.w*0.36+t2*R.w*0.72;
    const ly=gy-H*0.28+Math.sin(Math.PI*t2)*H*0.09;
    x.save(); x.translate(lx,ly); x.rotate(Math.cos(Math.PI*t2)*0.5+(i%2?1.5708:0));
    x.strokeStyle=INKC; x.lineWidth=5.6;
    x.beginPath(); x.ellipse(0,0,13,8,0,0,7); x.stroke();
    x.strokeStyle='rgba(246,239,221,.5)'; x.lineWidth=1.4;
    x.beginPath(); x.ellipse(0,0,10,6,0,-2.4,-1.2); x.stroke();
    x.restore();
  }
  /* one link forged bigger at the middle: the join itself */
  const mx=R.cx, my=gy-H*0.28+H*0.09;
  x.strokeStyle='#e9c81f'; x.lineWidth=6;
  x.beginPath(); x.ellipse(mx,my,14,9,0,0,7); x.stroke();
  x.strokeStyle=INKC; x.lineWidth=1.8;
  x.beginPath(); x.ellipse(mx,my,17.4,12.4,0,0,7); x.stroke();
  x.beginPath(); x.ellipse(mx,my,10.6,5.6,0,0,7); x.stroke();
  /* birds sit on the low of the chain */
  x.strokeStyle='rgba(35,28,18,.85)'; x.lineWidth=1.4;
  for(const t2 of [0.36,0.6]){
    const bx2=R.cx-R.w*0.36+t2*R.w*0.72, by2=gy-H*0.28+Math.sin(Math.PI*t2)*H*0.09-8;
    x.beginPath(); x.moveTo(bx2-3,by2); x.lineTo(bx2,by2-4); x.lineTo(bx2+3,by2); x.stroke();
  }
},
flags(x,d,R,W,H){
  /* the plaza of tongues: one fountain, every flag speaking it */
  const hzY=d.hz*H, gy=hzY+(H-hzY)*0.5;
  /* the fountain */
  x.fillStyle='#b9ab84'; x.beginPath(); x.ellipse(R.cx,gy,R.w*0.2,R.w*0.06,0,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
  x.fillStyle='rgba(90,150,190,.75)'; x.beginPath(); x.ellipse(R.cx,gy-2,R.w*0.15,R.w*0.04,0,0,7); x.fill();
  x.fillStyle='#b9ab84'; x.fillRect(R.cx-5,gy-H*0.1,10,H*0.1);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(R.cx-5,gy-H*0.1,10,H*0.1);
  x.strokeStyle='rgba(90,150,190,.85)'; x.lineWidth=2.4; x.lineCap='round';
  for(const a2 of [-0.7,0,0.7]){
    x.beginPath(); x.moveTo(R.cx,gy-H*0.1);
    x.quadraticCurveTo(R.cx+a2*26,gy-H*0.14,R.cx+a2*36,gy-4); x.stroke(); }
  /* the ring of locale flags: the page's own tongues where it names them */
  const locs=[...new Set(d.labels3.filter(l2=>l2.length<=8))];
  for(const p9 of ['EN','FR','DE','JA','PT','ES','IT','PL']){
    if(locs.length>=5) break; if(locs.indexOf(p9)<0) locs.push(p9); }
  const n=Math.min(clamp(locs.length,4,6),locs.length);
  for(let i=0;i<n;i++){
    const t2=i/(n-1), fx2=R.cx-R.w*0.44+t2*R.w*0.88;
    const fy2=gy+((i%2)?H*0.06:H*0.02);
    pfFlag(x,fx2,fy2,H*(0.16+(i%2)*0.03),pfShort(locs[i],7),
      ['#c22a1c','#31647e','#5fae57','#e9c81f','#8a3b2a'][i%5],i<n/2?1:-1);
  }
  /* the interpreter's lectern with the same word in two hands */
  x.fillStyle='#6b4a2e'; x.fillRect(R.cx+R.w*0.3,gy+H*0.09,34,26);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(R.cx+R.w*0.3,gy+H*0.09,34,26);
  pfCarve(x,R.cx+R.w*0.3+17,gy+H*0.09-6,'HELLO = BONJOUR',{maxW:110,size:8,ink:'rgba(35,28,18,.8)'});
},
semaphore(x,d,R,W,H){
  /* the status mast on the headland: the arms tell the harbor everything */
  const hzY=d.hz*H;
  /* the headland */
  x.fillStyle='#57553f';
  x.beginPath(); x.moveTo(0,H); x.lineTo(0,hzY+H*0.22);
  x.quadraticCurveTo(R.cx-R.w*0.1,hzY+H*0.13,R.cx+R.w*0.24,hzY+H*0.24);
  x.lineTo(R.cx+R.w*0.3,H); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
  /* the mast */
  const mx=R.cx-R.w*0.06, my=hzY+H*0.17;
  x.strokeStyle=INKC; x.lineWidth=5;
  x.beginPath(); x.moveTo(mx,my); x.lineTo(mx,my-H*0.34); x.stroke();
  x.lineWidth=2;
  x.beginPath(); x.moveTo(mx-16,my); x.lineTo(mx,my-H*0.1); x.moveTo(mx+16,my); x.lineTo(mx,my-H*0.1); x.stroke();
  /* the two arms: their angles are this page's own signal */
  const a1=((d.seed>>>4)%5)*0.31-0.62, a2=((d.seed>>>9)%5)*0.31+0.5;
  for(const [ay,aa,tone] of [[my-H*0.30,a1,'#c22a1c'],[my-H*0.22,a2,'#e9c81f']]){
    x.save(); x.translate(mx,ay); x.rotate(aa);
    x.fillStyle=tone; x.fillRect(0,-5,52,10);
    x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(0,-5,52,10);
    x.fillStyle=INKC; x.beginPath(); x.arc(0,0,3.4,0,7); x.fill();
    x.restore();
  }
  /* code pennants up the halyard: DRAFT over PUBLISHED */
  x.strokeStyle='rgba(35,28,18,.7)'; x.lineWidth=1.4;
  x.beginPath(); x.moveTo(mx+2,my-H*0.34); x.lineTo(mx+30,my-4); x.stroke();
  const pens=(d.labels.length?d.labels:['DRAFT','PUBLISHED']);
  for(let i=0;i<Math.min(3,pens.length);i++){
    const t2=(i+1)/4, px2=mx+2+t2*28, py=my-H*0.34+t2*(H*0.34-4);
    x.fillStyle=['#31647e','#e9c81f','#c22a1c'][i%3];
    x.beginPath(); x.moveTo(px2,py); x.lineTo(px2+18,py+4); x.lineTo(px2,py+10); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.2; x.stroke();
  }
  pfSign(x,mx+R.w*0.26,my+8,pfShort(pens[0],12)+' FLYING',{s:0.86,post:14,maxW:110});
  /* the keeper's hut with its lit window */
  x.fillStyle='#6b4a2e'; x.fillRect(mx-R.w*0.3,my-24,52,26);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(mx-R.w*0.3,my-24,52,26);
  x.fillStyle='#8a3b2a';
  x.beginPath(); x.moveTo(mx-R.w*0.3-5,my-24); x.lineTo(mx-R.w*0.3+26,my-38);
  x.lineTo(mx-R.w*0.3+57,my-24); x.closePath(); x.fill(); x.stroke();
  pfWindowGlow(x,mx-R.w*0.3+26,my-11,12,10,d.night||d.dusk);
},
cylinders(x,d,R,W,H){
  /* the record silos: what the app knows is kept in these */
  const hzY=d.hz*H, by=hzY+(H-hzY)*0.62;
  const n=clamp(2+(d.labels.length>3?1:0)+((d.seed>>>5)%2),2,4);
  const cw2=Math.min(R.w*0.8/n*0.86,116);
  for(let i=0;i<n;i++){
    const cx2=R.cx-((n-1)/2)*(cw2*1.2)+i*(cw2*1.2);
    const ch=H*(0.22+((d.seed>>>(i*3))%9)*0.012);
    pfCylDB(x,cx2,by,cw2,ch,['#7f95b0','#8ba98f','#b9a06a','#a08a9f'][i%4]);
    /* hatch + gauge on each */
    x.fillStyle='#3a352b'; x.beginPath(); x.arc(cx2,by-ch*0.45,6,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.4; x.stroke();
    if(d.labels[i]) pfSign(x,cx2,by+22,pfShort(d.labels[i],14),{s:0.8,post:8,maxW:96});
  }
  /* the pump house and its pipes to every silo */
  const phx=R.cx+R.w*0.42;
  x.fillStyle='#57553f'; x.fillRect(phx-24,by-30,48,30);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(phx-24,by-30,48,30);
  x.fillStyle='#44403a';
  x.beginPath(); x.moveTo(phx-28,by-30); x.lineTo(phx,by-44); x.lineTo(phx+28,by-30);
  x.closePath(); x.fill(); x.stroke();
  x.strokeStyle=INKC; x.lineWidth=3.4;
  for(let i=0;i<n;i++){
    const cx2=R.cx-((n-1)/2)*(cw2*1.2)+i*(cw2*1.2);
    x.beginPath(); x.moveTo(phx-24,by-12-i*5); x.lineTo(cx2+cw2*0.3,by-12-i*5);
    x.lineTo(cx2+cw2*0.3,by-H*0.06); x.stroke();
  }
  /* valve wheel on the main */
  x.strokeStyle=INKC; x.lineWidth=2.4;
  x.beginPath(); x.arc(phx-40,by-14,7,0,7); x.stroke();
  x.beginPath(); x.moveTo(phx-45,by-19); x.lineTo(phx-35,by-9);
  x.moveTo(phx-35,by-19); x.lineTo(phx-45,by-9); x.stroke();
},
weathervanes(x,d,R,W,H){
  /* the rooftop of variables: every vane answers a different wind */
  const ry=H*0.70;
  /* our own roof-line, big in frame */
  x.fillStyle='#8a3b2a';
  x.beginPath(); x.moveTo(R.cx-R.w*0.55,H*0.9); x.lineTo(R.cx-R.w*0.1,ry);
  x.lineTo(R.cx+R.w*0.55,H*0.86); x.lineTo(R.cx+R.w*0.55,H); x.lineTo(R.cx-R.w*0.55,H);
  x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2.4; x.stroke();
  /* tiling courses */
  x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1.2;
  for(let i=1;i<5;i++){ x.beginPath(); x.moveTo(R.cx-R.w*0.52,H*0.9-i*2+i*10);
    x.quadraticCurveTo(R.cx-R.w*0.1,ry+i*(H*0.9-ry)/5,R.cx+R.w*0.53,H*0.86+i*8); x.stroke(); }
  /* chimney pots */
  for(const [chx,chh] of [[R.cx-R.w*0.34,34],[R.cx+R.w*0.3,44]]){
    x.fillStyle='#6b4a2e'; x.fillRect(chx-12,ry+18-chh,24,chh);
    x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(chx-12,ry+18-chh,24,chh);
    x.fillRect(chx-15,ry+16-chh,30,5); x.strokeRect(chx-15,ry+16-chh,30,5);
    pfSmokeCurl(x,chx,ry+8-chh,1.2);
  }
  /* the vanes: arrow, cock, key — each mast tagged with a REAL variable */
  const vars=[...new Set(d.labels3.filter(l2=>/[A-Z]_|URL|HOST|PORT|KEY|ENV/.test(l2)))];
  if(!vars.length) for(const l2 of d.labels){ if(vars.indexOf(l2)<0) vars.push(l2); }
  for(const p9 of ['HOST','PORT','APP_KEYS']){
    if(vars.length>=3) break; if(vars.indexOf(p9)<0) vars.push(p9); }
  const masts=[[R.cx-R.w*0.1,ry,3],[R.cx+R.w*0.16,ry+8,2],[R.cx-R.w*0.38,ry+22,1]];
  masts.forEach(([mx,my,kind],i)=>{
    x.strokeStyle=INKC; x.lineWidth=2.6;
    x.beginPath(); x.moveTo(mx,my); x.lineTo(mx,my-84-i*10); x.stroke();
    x.lineWidth=1.6;
    x.beginPath(); x.moveTo(mx-10,my-58-i*10); x.lineTo(mx+10,my-58-i*10); x.stroke();
    x.save(); x.translate(mx,my-84-i*10); x.rotate(((d.seed>>>(i*4))%7-3)*0.16);
    if(kind===3){ /* arrow */
      x.strokeStyle=INKC; x.lineWidth=2.6;
      x.beginPath(); x.moveTo(-18,0); x.lineTo(18,0); x.stroke();
      x.fillStyle=INKC;
      x.beginPath(); x.moveTo(18,0); x.lineTo(10,-5); x.lineTo(10,5); x.closePath(); x.fill();
      x.beginPath(); x.moveTo(-18,-4); x.lineTo(-18,4); x.lineTo(-11,0); x.closePath(); x.fill();
    } else if(kind===2){ /* the weather-cock */
      x.fillStyle=INKC;
      x.beginPath(); x.moveTo(-10,0); x.quadraticCurveTo(-14,-10,-4,-9);
      x.quadraticCurveTo(2,-14,6,-8); x.lineTo(12,-6); x.lineTo(7,-2);
      x.quadraticCurveTo(8,4,0,3); x.closePath(); x.fill();
    } else { /* a key vane — the secret one */
      pfKeyBig(x,0,0,0.9,0);
    }
    x.restore();
    if(i<vars.length)
      pfBanner(x,mx,my-52-i*10,pfShort(vars[i],14),{tone:i%2?'#31647e':'#57553f',s:0.78,maxW:100,h:15,rod:false});
  });
  /* the wind made visible, one direction for all */
  x.strokeStyle='rgba(246,239,221,.7)'; x.lineWidth=1.8;
  for(let i=0;i<3;i++){ x.beginPath(); x.moveTo(R.cx-R.w*0.5+i*24,H*0.30+i*14);
    x.quadraticCurveTo(R.cx-R.w*0.2+i*24,H*0.27+i*14,R.cx+R.w*0.1+i*24,H*0.30+i*14); x.stroke(); }
},
monolith(x,d,R,W,H){
  /* the desert terminal: carved with this page's own commands */
  const hzY=d.hz*H, by=hzY+(H-hzY)*0.55;
  const mw=Math.min(R.w*0.38,200), mh=H*0.46;
  /* side face */
  x.fillStyle='#3a352b';
  x.beginPath(); x.moveTo(R.cx+mw/2,by-mh); x.lineTo(R.cx+mw/2+16,by-mh+7);
  x.lineTo(R.cx+mw/2+16,by+5); x.lineTo(R.cx+mw/2,by); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
  x.fillStyle=INKC; x.fillRect(R.cx-mw/2,by-mh,mw,mh);
  /* edge glint */
  x.strokeStyle='rgba(242,231,201,.4)'; x.lineWidth=1.4;
  x.beginPath(); x.moveTo(R.cx-mw/2+2,by-mh+2); x.lineTo(R.cx-mw/2+2,by-4); x.stroke();
  /* THE COMMANDS OF THIS PAGE, carved in rows */
  const cmds=(d.labels3.length?d.labels3:d.labels.length?d.labels:['STRAPI START','STRAPI BUILD']);
  x.font='700 8px "Courier Prime",monospace'; x.fillStyle='rgba(242,231,201,.45)';
  for(let i=0;i<Math.min(6,cmds.length);i++)
    x.fillText(pfShort(cmds[i].toLowerCase(),18),R.cx-mw*0.4,by-mh*0.82+i*15);
  /* the live prompt burns near the base */
  x.font='700 16px "Courier Prime",monospace'; x.fillStyle='#9fe08a';
  x.fillText('>',R.cx-mw*0.4,by-24);
  x.fillRect(R.cx-mw*0.4+13,by-36,8,14);
  const g2=x.createRadialGradient(R.cx-mw*0.2,by-28,4,R.cx-mw*0.2,by-28,54);
  g2.addColorStop(0,'rgba(159,224,138,.35)'); g2.addColorStop(1,'rgba(159,224,138,0)');
  x.fillStyle=g2; x.beginPath(); x.arc(R.cx-mw*0.2,by-28,54,0,7); x.fill();
  /* long shadow toward us */
  x.fillStyle='rgba(35,28,18,.35)';
  x.beginPath(); x.moveTo(R.cx-mw/2,by); x.lineTo(R.cx+mw/2,by);
  x.lineTo(R.cx+mw*1.5,H); x.lineTo(R.cx-mw*1.8,H); x.closePath(); x.fill();
  /* saguaro + skull, the desert keeps its own furniture */
  const sx=R.cx-R.w*0.42;
  x.strokeStyle=INKC; x.lineWidth=7; x.lineCap='round';
  x.beginPath(); x.moveTo(sx,by+10); x.lineTo(sx,by-34); x.stroke();
  x.lineWidth=5;
  x.beginPath(); x.moveTo(sx,by-16); x.lineTo(sx-11,by-22); x.lineTo(sx-11,by-34) ; x.stroke();
  x.beginPath(); x.moveTo(sx,by-8); x.lineTo(sx+10,by-14); x.lineTo(sx+10,by-26); x.stroke();
  x.fillStyle='#efe6cf';
  x.beginPath(); x.ellipse(R.cx+R.w*0.34,H*0.88,9,6.4,0.3,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.2; x.stroke();
  x.fillStyle=INKC;
  x.beginPath(); x.arc(R.cx+R.w*0.34-3,H*0.88,1.6,0,7); x.arc(R.cx+R.w*0.34+2,H*0.878,1.6,0,7); x.fill();
},
helm(x,d,R,W,H){
  /* the admin bridge: one wheel steers the whole ship */
  /* the bridge windows look over the bow to the sea */
  x.fillStyle='#6b4a2e'; x.fillRect(0,H*0.52,W,H*0.34);
  x.strokeStyle=INKC; x.lineWidth=2.4;
  x.beginPath(); x.moveTo(0,H*0.52); x.lineTo(W,H*0.52); x.stroke();
  /* the wheel, dead center, spokes and handles */
  const wy=H*0.60, wr=Math.min(R.w*0.3,H*0.17);
  x.strokeStyle='#8a5a2e'; x.lineWidth=9;
  x.beginPath(); x.arc(R.cx,wy,wr,0,7); x.stroke();
  x.strokeStyle=INKC; x.lineWidth=2;
  x.beginPath(); x.arc(R.cx,wy,wr+5,0,7); x.stroke();
  x.beginPath(); x.arc(R.cx,wy,wr-5,0,7); x.stroke();
  for(let i=0;i<8;i++){ const a2=i*Math.PI/4+0.4;
    x.strokeStyle='#8a5a2e'; x.lineWidth=5;
    x.beginPath(); x.moveTo(R.cx,wy); x.lineTo(R.cx+Math.cos(a2)*(wr+16),wy+Math.sin(a2)*(wr+16)); x.stroke();
    x.strokeStyle=INKC; x.lineWidth=1.6;
    x.beginPath(); x.arc(R.cx+Math.cos(a2)*(wr+16),wy+Math.sin(a2)*(wr+16),3.4,0,7); x.stroke();
  }
  x.fillStyle='#57553f'; x.beginPath(); x.arc(R.cx,wy,9,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
  /* the binnacle and telegraph beside, levers named by the page */
  const bx2=R.cx+R.w*0.36;
  x.fillStyle='#8a5a2e'; x.fillRect(bx2-12,wy-8,24,H*0.2);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(bx2-12,wy-8,24,H*0.2);
  x.fillStyle='#e9c81f'; x.beginPath(); x.arc(bx2,wy-18,13,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
  x.lineWidth=2.4;
  x.beginPath(); x.moveTo(bx2,wy-18); x.lineTo(bx2+7,wy-27); x.stroke();
  const tags=(d.labels.length?d.labels:['CONTENT','SETTINGS']);
  for(let i=0;i<Math.min(2,tags.length);i++)
    pfBanner(x,bx2,wy+H*0.14+18+i*20,pfShort(tags[i],14),{tone:i?'#31647e':'#8a3b2a',s:0.74,maxW:104,h:14,rod:false});
  /* through the glass: the bow and the sea's horizon */
  x.save(); x.beginPath(); x.rect(0,0,W,H*0.52); x.clip();
  x.fillStyle='#57553f';
  x.beginPath(); x.moveTo(R.cx-R.w*0.6,H*0.52);
  x.quadraticCurveTo(R.cx,H*0.36,R.cx+R.w*0.6,H*0.52); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
  /* bow flag */
  pfFlag(x,R.cx,H*0.415,26,null,'#c22a1c',1);
  x.restore();
  /* window mullions */
  x.strokeStyle=INKC; x.lineWidth=3;
  for(let i=1;i<4;i++){ x.beginPath(); x.moveTo(i*W/4,0); x.lineTo(i*W/4,H*0.52); x.stroke(); }
},
atelier(x,d,R,W,H){
  /* the customization atelier: what THIS page customizes sits for its own
     portrait, LARGE on the canvas — the easel walks the room per page */
  const by=H*(0.78+((d.gh>>>4)%8)/100);
  const eo=((d.gh>>>6)&1)?1:-1;
  const ex=R.cx+eo*R.w*(0.04+((d.gh>>>8)%10)/100), ew=R.w*(0.38+((d.gh>>>10)%14)/100), eh=H*(0.26+((d.gh>>>12)%8)/100);
  x.strokeStyle=INKC; x.lineWidth=3.4;
  x.beginPath(); x.moveTo(ex-ew*0.5,by); x.lineTo(ex,by-eh-30); x.lineTo(ex+ew*0.5,by); x.stroke();
  x.beginPath(); x.moveTo(ex,by-eh-30); x.lineTo(ex,by-8); x.stroke();
  x.fillStyle='#fdf8ea'; x.fillRect(ex-ew/2,by-eh-14,ew,eh);
  x.strokeStyle=INKC; x.lineWidth=2.4; x.strokeRect(ex-ew/2,by-eh-14,ew,eh);
  const t2=((d.m.title||'')+' '+d.slug).toLowerCase();
  const ccx=ex, ccy=by-14-eh/2;
  if(/favicon|logo/.test(t2)){
    /* the mark itself, huge on the canvas, compass ticks around it */
    x.fillStyle='#e9c81f'; x.beginPath(); x.arc(ccx,ccy,eh*0.3,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=2.4; x.stroke();
    x.fillStyle=INKC; x.font='700 '+Math.round(eh*0.34)+'px Oswald,sans-serif'; x.textAlign='center';
    x.fillText('S',ccx,ccy+eh*0.12); x.textAlign='left';
    x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1.2;
    for(let i=0;i<8;i++){ const a=i*Math.PI/4;
      x.beginPath(); x.moveTo(ccx+Math.cos(a)*eh*0.36,ccy+Math.sin(a)*eh*0.36);
      x.lineTo(ccx+Math.cos(a)*eh*0.42,ccy+Math.sin(a)*eh*0.42); x.stroke(); }
  } else if(/theme|color/.test(t2)){
    /* the swatch courses, painted edge to edge */
    ['#c22a1c','#e9c81f','#31647e','#5fae57'].forEach((c2,i)=>{
      x.fillStyle=c2; x.fillRect(ex-ew/2+4,by-eh-10+i*(eh-8)/4,ew-8,(eh-8)/4-3);
      x.strokeStyle=INKC; x.lineWidth=1.3;
      x.strokeRect(ex-ew/2+4,by-eh-10+i*(eh-8)/4,ew-8,(eh-8)/4-3); });
  } else if(/editor|wysiwyg|rich/.test(t2)){
    /* the great glyph and its toolbar */
    x.fillStyle='#44403a'; x.fillRect(ex-ew/2+4,by-eh-10,ew-8,eh*0.2);
    x.strokeStyle=INKC; x.lineWidth=1.4; x.strokeRect(ex-ew/2+4,by-eh-10,ew-8,eh*0.2);
    x.fillStyle='#f6efdd';
    for(let i=0;i<5;i++) x.fillRect(ex-ew/2+9+i*13,by-eh-6,9,eh*0.2-8);
    x.fillStyle=INKC; x.font='700 '+Math.round(eh*0.44)+'px "Courier Prime",monospace';
    x.textAlign='center'; x.fillText('Aa',ccx,ccy+eh*0.3); x.textAlign='left';
  } else if(/bundler|vite|webpack/.test(t2)){
    /* the bundle press: planks in, one strapped crate out */
    pfGearBig(x,ccx-ew*0.2,ccy-eh*0.1,eh*0.2,8,0.2,'#8d8266');
    pfCrate(x,ccx+ew*0.18,ccy+eh*0.3,ew*0.24,eh*0.28,'PKG');
    x.strokeStyle='#8a3b2a'; x.lineWidth=2.6;
    x.beginPath(); x.moveTo(ccx-ew*0.02,ccy); x.lineTo(ccx+ew*0.1,ccy+eh*0.1); x.stroke();
  } else if(/translation|locale/.test(t2)){
    pfFlag(x,ccx-ew*0.16,ccy+eh*0.34,eh*0.5,'FR','#31647e',1);
    pfFlag(x,ccx+ew*0.14,ccy+eh*0.34,eh*0.4,'JA','#c22a1c',-1);
  } else {
    /* the panel's own homepage, header and nav blocked in */
    x.fillStyle='#31647e'; x.fillRect(ex-ew/2,by-eh-14,ew,eh*0.14);
    x.fillStyle='#d9c8a2'; x.fillRect(ex-ew/2,by-eh-14+eh*0.14,ew*0.22,eh*0.86);
    x.strokeStyle=INKC; x.lineWidth=1.4;
    x.strokeRect(ex-ew/2,by-eh-14,ew,eh*0.14);
    x.strokeRect(ex-ew/2,by-eh-14+eh*0.14,ew*0.22,eh*0.86);
    x.strokeStyle='rgba(35,28,18,.45)'; x.lineWidth=1;
    for(let i=0;i<4;i++){ x.beginPath(); x.moveTo(ex-ew*0.22,by-eh*0.6+i*12);
      x.lineTo(ex+ew*0.4,by-eh*0.6+i*12); x.stroke(); }
    x.setLineDash([3,3]);
    x.strokeRect(ex+ew*0.06,by-eh-14+eh*0.2,ew*0.36,eh*0.3);
    x.setLineDash([]);
  }
  /* the sub-craft bench keeps a small model of the department */
  const tx=R.cx-eo*R.w*0.34, ty2=by-24;
  x.fillStyle='#8d6b4a'; x.fillRect(tx-34,ty2,68,24);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(tx-34,ty2,68,24);
  if(/favicon|logo/.test(t2)){
    x.fillStyle='#e9c81f'; x.beginPath(); x.arc(tx,ty2-14,12,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.8; x.stroke();
    x.fillStyle=INKC; x.font='700 12px Oswald,sans-serif'; x.textAlign='center';
    x.fillText('S',tx,ty2-9); x.textAlign='left';
  } else if(/theme|color/.test(t2)){
    x.fillStyle='#d9c8a2'; x.beginPath(); x.ellipse(tx,ty2-12,16,11,0.3,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.8; x.stroke();
    [['#c22a1c',-8,-4],['#e9c81f',0,-7],['#31647e',8,-3]].forEach(([c2,dx2,dy2])=>{
      x.fillStyle=c2; x.beginPath(); x.arc(tx+dx2,ty2-12+dy2,3,0,7); x.fill(); });
  } else if(/editor|wysiwyg|rich/.test(t2)){
    x.fillStyle='#44403a'; x.fillRect(tx-16,ty2-20,32,20);
    x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(tx-16,ty2-20,32,20);
    x.fillStyle='#f6efdd'; x.font='700 10px "Courier Prime",monospace'; x.textAlign='center';
    x.fillText('Aa',tx,ty2-6); x.textAlign='left';
  } else if(/bundler|vite|webpack/.test(t2)){
    x.strokeStyle=INKC; x.lineWidth=2.4;
    for(let i=0;i<4;i++){ x.beginPath(); x.moveTo(tx-10+i*6,ty2); x.lineTo(tx-10+i*6,ty2-22); x.stroke(); }
    x.strokeStyle='#8a3b2a'; x.lineWidth=3;
    x.beginPath(); x.moveTo(tx-14,ty2-11); x.lineTo(tx+12,ty2-11); x.stroke();
  } else if(/translation|locale/.test(t2)){
    pfFlag(x,tx-8,ty2,22,'FR','#31647e',1); pfFlag(x,tx+10,ty2,17,'JA','#c22a1c',-1);
  } else { /* homepage, extension, host, generic */
    x.fillStyle='#f3e2b0'; x.fillRect(tx-15,ty2-24,30,24);
    x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(tx-15,ty2-24,30,24);
    x.strokeRect(tx-9,ty2-18,10,8);
    x.strokeRect(tx-9,ty2-8,18,4);
  }
  /* paint pots and brush crock on the floor */
  ['#c22a1c','#e9c81f','#31647e'].forEach((c2,i)=>{
    x.fillStyle=c2; x.fillRect(R.cx-R.w*0.42+i*22,by-12,16,12);
    x.strokeStyle=INKC; x.lineWidth=1.4; x.strokeRect(R.cx-R.w*0.42+i*22,by-12,16,12);
  });
  x.strokeStyle=INKC; x.lineWidth=2;
  x.beginPath(); x.moveTo(R.cx-R.w*0.44,by-26); x.lineTo(R.cx-R.w*0.40,by-13); x.stroke();
},
bluedesk(x,d,R,W,H){
  /* the drafting room: this page's plan pinned white-on-blue. The room is
     dealt from the page — the board leans its own way, the tools hang on
     the wall the page chooses, the model rises where there is floor */
  const by=H*(0.74+((d.gh>>>4)%10)/100);
  const bo=((d.gh>>>6)&1)?1:-1;              /* which hand the room favours */
  const tilt=-0.2+((d.gh>>>8)%14)/70;
  /* the tilted drafting table */
  x.save(); x.translate(R.cx-bo*R.w*(0.02+((d.gh>>>10)%10)/100),by-H*0.16); x.rotate(tilt);
  x.fillStyle='#31647e'; x.fillRect(-R.w*0.3,-H*0.13,R.w*0.6,H*0.22);
  x.strokeStyle=INKC; x.lineWidth=2.6; x.strokeRect(-R.w*0.3,-H*0.13,R.w*0.6,H*0.22);
  /* the white-line plan is the page's own outline: one bay per heading */
  x.strokeStyle='rgba(246,239,221,.9)'; x.lineWidth=1.4;
  const bays=clamp(d.labels.length||3,2,5);
  for(let i=0;i<bays;i++){
    const bx2=-R.w*0.24+i*(R.w*0.48/bays);
    x.strokeRect(bx2,-H*0.08,R.w*0.48/bays-6,H*0.07+((d.seed>>>i)%12));
  }
  x.beginPath(); x.moveTo(-R.w*0.24,H*0.045); x.lineTo(R.w*0.24,H*0.045); x.stroke();
  x.setLineDash([4,3]);
  x.beginPath(); x.moveTo(-R.w*0.24,-H*0.10); x.lineTo(R.w*0.24,-H*0.10); x.stroke();
  x.setLineDash([]);
  /* the title block: every plan is stamped with ITS OWN name */
  const planTok=(d.toks[0]||'PLAN').toUpperCase();
  x.fillStyle='rgba(246,239,221,.92)'; x.fillRect(R.w*0.06,H*0.055,R.w*0.22,H*0.035);
  x.strokeStyle='rgba(246,239,221,.9)'; x.lineWidth=1.2;
  x.strokeRect(R.w*0.06,H*0.055,R.w*0.22,H*0.035);
  x.fillStyle='#1d3d50'; x.textAlign='center';
  pfFitFont(x,'PLAN · '+planTok,R.w*0.20,7.5,'700 %px Oswald,"Arial Narrow",sans-serif');
  x.fillText('PLAN · '+planTok,R.w*0.17,H*0.079); x.textAlign='left';
  /* the bays carry the page's own room names */
  x.fillStyle='rgba(246,239,221,.85)';
  for(let i=0;i<bays&&i<(d.labels3.length?d.labels3:d.labels).length;i++){
    const lb=(d.labels3.length?d.labels3:d.labels)[i];
    const bx2=-R.w*0.24+i*(R.w*0.48/bays)+(R.w*0.48/bays-6)/2;
    pfFitFont(x,pfShort(lb,9),R.w*0.48/bays-10,5.6,'600 %px Oswald,sans-serif');
    x.textAlign='center'; x.fillText(pfShort(lb,9),bx2,-H*0.012); x.textAlign='left';
  }
  /* dimension arrows */
  x.beginPath(); x.moveTo(-R.w*0.24,H*0.06); x.lineTo(-R.w*0.14,H*0.06); x.stroke();
  x.beginPath(); x.moveTo(-R.w*0.24,H*0.06); x.lineTo(-R.w*0.22,H*0.052); x.moveTo(-R.w*0.24,H*0.06); x.lineTo(-R.w*0.22,H*0.068); x.stroke();
  x.restore();
  /* table legs */
  x.strokeStyle=INKC; x.lineWidth=4;
  x.beginPath(); x.moveTo(R.cx-R.w*0.3,by); x.lineTo(R.cx-R.w*0.26,by-H*0.2); x.stroke();
  x.beginPath(); x.moveTo(R.cx+R.w*0.24,by); x.lineTo(R.cx+R.w*0.2,by-H*0.26); x.stroke();
  /* T-square hung on the wall + the pinned notes with REAL headings */
  const tqx=R.cx+bo*R.w*0.36, tqy=H*(0.17+((d.gh>>>12)%8)/100);
  x.strokeStyle=INKC; x.lineWidth=3;
  x.beginPath(); x.moveTo(tqx,tqy); x.lineTo(tqx,tqy+H*0.18); x.stroke();
  x.lineWidth=5;
  x.beginPath(); x.moveTo(tqx-R.w*0.06,tqy); x.lineTo(tqx+R.w*0.06,tqy); x.stroke();
  for(let i=0;i<Math.min(3,d.labels.length);i++){
    const nx=R.cx-bo*R.w*(0.42-i*0.13), ny=H*(0.20+((d.gh>>>14)%6)/100+(i%2)*0.05);
    x.save(); x.translate(nx,ny); x.rotate(((d.seed>>>i)%7-3)*0.03);
    x.fillStyle='#fdf8ea'; x.fillRect(-26,0,52,30);
    x.strokeStyle=INKC; x.lineWidth=1.3; x.strokeRect(-26,0,52,30);
    x.fillStyle=INKC; x.beginPath(); x.arc(0,3,1.8,0,7); x.fill();
    x.textAlign='center';
    pfFitFont(x,pfShort(d.labels[i],14),46,6.6,'600 %px Oswald,sans-serif');
    x.fillText(pfShort(d.labels[i],14),0,16); x.textAlign='left'; x.restore();
  }
  /* the model rising on the side: the plan made real, in blocks — as many
     courses as the page keeps h3s */
  const mx=R.cx+bo*R.w*(0.30+((d.gh>>>16)%10)/100);
  const courses=clamp(2+(d.labels3.length%3),2,4);
  for(let i=0;i<courses;i++){
    x.fillStyle=['#d9c8a2','#c9a86a','#b9ab84','#a08a5f'][i];
    x.fillRect(mx-16+i*2,by-16-i*14,32-i*4,14);
    x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(mx-16+i*2,by-16-i*14,32-i*4,14);
  }
  /* the architect's lamp throwing its cone on the plan */
  const lx=R.cx-bo*R.w*0.36;
  x.strokeStyle=INKC; x.lineWidth=2.6;
  x.beginPath(); x.moveTo(lx,by-H*0.3); x.lineTo(lx+bo*R.w*0.08,by-H*0.36); x.stroke();
  x.fillStyle='#57553f';
  x.beginPath(); x.moveTo(lx+bo*R.w*0.08,by-H*0.37); x.lineTo(lx+bo*R.w*0.14,by-H*0.33);
  x.lineTo(lx+bo*R.w*0.09,by-H*0.30); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.6; x.stroke();
  x.fillStyle='rgba(255,244,200,.18)';
  x.beginPath(); x.moveTo(lx+bo*R.w*0.10,by-H*0.33);
  x.lineTo(R.cx+bo*R.w*0.1,by-H*0.1); x.lineTo(lx+bo*R.w*0.16,by-H*0.04); x.closePath(); x.fill();
},

kitchen(x,d,R,W,H){
  /* the cookbook kitchen: recipes on the rail, pots at the boil */
  const by=H*0.78;
  /* the great range */
  x.fillStyle='#6e6650'; x.fillRect(R.cx-R.w*0.36,by-H*0.2,R.w*0.72,H*0.2);
  x.strokeStyle=INKC; x.lineWidth=2.6; x.strokeRect(R.cx-R.w*0.36,by-H*0.2,R.w*0.72,H*0.2);
  x.fillStyle='#d9c8a2'; x.fillRect(R.cx-R.w*0.36,by-H*0.205,R.w*0.72,H*0.02);
  x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(R.cx-R.w*0.36,by-H*0.205,R.w*0.72,H*0.02);
  /* oven doors + dials */
  x.fillStyle='#57553f';
  x.fillRect(R.cx-R.w*0.28,by-H*0.14,R.w*0.22,H*0.11);
  x.fillRect(R.cx+R.w*0.05,by-H*0.14,R.w*0.22,H*0.11);
  x.strokeStyle=INKC; x.lineWidth=1.8;
  x.strokeRect(R.cx-R.w*0.28,by-H*0.14,R.w*0.22,H*0.11);
  x.strokeRect(R.cx+R.w*0.05,by-H*0.14,R.w*0.22,H*0.11);
  x.strokeStyle='rgba(246,239,221,.6)'; x.lineWidth=1.2;
  x.strokeRect(R.cx-R.w*0.25,by-H*0.125,R.w*0.16,H*0.08);
  x.strokeRect(R.cx+R.w*0.08,by-H*0.125,R.w*0.16,H*0.08);
  for(let i=0;i<4;i++){ x.beginPath(); x.arc(R.cx-R.w*0.2+i*R.w*0.14,by-H*0.17,3.4,0,7);
    x.fillStyle='#d9c8a2'; x.fill(); x.stroke(); }
  /* pots with real steam */
  for(let i=0;i<3;i++){
    const px2=R.cx-R.w*0.22+i*R.w*0.22, pw2=26+(i%2)*10;
    x.fillStyle='#7f95b0'; x.fillRect(px2-pw2/2,by-H*0.2-16,pw2,16);
    x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(px2-pw2/2,by-H*0.2-16,pw2,16);
    x.beginPath(); x.moveTo(px2-pw2/2-5,by-H*0.2-16); x.lineTo(px2+pw2/2+5,by-H*0.2-16); x.stroke();
    pfSmokeCurl(x,px2,by-H*0.2-20,1,'rgba(120,120,120,.6)');
  }
  /* the recipe rail: every card a REAL example from this page */
  pfWireRun(x,R.cx-R.w*0.46,H*0.22,R.cx+R.w*0.46,H*0.2,6,{lw:2});
  const recs=(d.labels.length?d.labels:['AUTH FLOW','CUSTOM ROUTE']);
  for(let i=0;i<Math.min(4,recs.length);i++){
    const t2=(i+0.5)/Math.min(4,recs.length);
    const cx2=R.cx-R.w*0.46+t2*R.w*0.92, cy2=H*0.21+Math.sin(Math.PI*t2)*5;
    x.save(); x.translate(cx2,cy2); x.rotate(((d.seed>>>i)%7-3)*0.02);
    x.fillStyle='#fdf8ea'; x.fillRect(-25,0,50,34);
    x.strokeStyle=INKC; x.lineWidth=1.4; x.strokeRect(-25,0,50,34);
    x.fillStyle=INKC; x.beginPath(); x.arc(-18,3,1.6,0,7); x.arc(18,3,1.6,0,7); x.fill();
    x.textAlign='center';
    pfFitFont(x,pfShort(recs[i],13),44,6.6,'600 %px Oswald,sans-serif');
    x.fillText(pfShort(recs[i],13),0,14);
    x.strokeStyle='rgba(35,28,18,.45)'; x.lineWidth=1;
    x.beginPath(); x.moveTo(-18,21); x.lineTo(18,21); x.moveTo(-18,27); x.lineTo(10,27); x.stroke();
    x.textAlign='left'; x.restore();
  }
  /* ladles + the tasting spoon */
  x.strokeStyle=INKC; x.lineWidth=2.4;
  x.beginPath(); x.moveTo(R.cx+R.w*0.42,H*0.3); x.lineTo(R.cx+R.w*0.42,H*0.42); x.stroke();
  x.beginPath(); x.arc(R.cx+R.w*0.42,H*0.45,7,0,Math.PI); x.stroke();
  x.beginPath(); x.moveTo(R.cx+R.w*0.48,H*0.3); x.lineTo(R.cx+R.w*0.48,H*0.4); x.stroke();
  x.beginPath(); x.arc(R.cx+R.w*0.48,H*0.425,5,0,Math.PI); x.stroke();
},
bazaar(x,d,R,W,H){
  /* the plugin bazaar: three stalls, three merchants' cries */
  const hzY=d.hz*H, by=hzY+(H-hzY)*0.6;
  const stallW=R.w*0.3;
  const cries=[...new Set(d.labels.length?d.labels:[])];
  for(const p9 of ['SEO','SLUGIFY','SITEMAP']){
    if(cries.length>=3) break; if(cries.indexOf(p9)<0) cries.push(p9); }
  for(let i=0;i<3;i++){
    const sx=R.cx-R.w*0.35+i*R.w*0.35;
    /* counter */
    x.fillStyle='#8d6b4a'; x.fillRect(sx-stallW/2,by-30,stallW,30);
    x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(sx-stallW/2,by-30,stallW,30);
    /* posts + striped awning, each stall its own colours */
    x.strokeStyle=INKC; x.lineWidth=2.6;
    x.beginPath(); x.moveTo(sx-stallW/2,by-30); x.lineTo(sx-stallW/2,by-84); x.stroke();
    x.beginPath(); x.moveTo(sx+stallW/2,by-30); x.lineTo(sx+stallW/2,by-84); x.stroke();
    const c2=[['#c22a1c','#f6efdd'],['#31647e','#f6efdd'],['#5fae57','#e9c81f']][i];
    for(let a2=0;a2<5;a2++){
      x.fillStyle=c2[a2%2];
      x.beginPath(); x.moveTo(sx-stallW/2-6+a2*(stallW+12)/5,by-84);
      x.lineTo(sx-stallW/2-6+(a2+1)*(stallW+12)/5,by-84);
      x.lineTo(sx-stallW/2-6+(a2+0.5)*(stallW+12)/5,by-72); x.closePath(); x.fill();
      x.strokeStyle=INKC; x.lineWidth=1.1; x.stroke();
    }
    x.fillStyle=c2[0]; x.fillRect(sx-stallW/2-8,by-90,stallW+16,7);
    x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(sx-stallW/2-8,by-90,stallW+16,7);
    /* wares: little plug-boxes on the counter */
    for(let g2=0;g2<3;g2++)
      pfCrate(x,sx-stallW*0.3+g2*stallW*0.3,by-30,stallW*0.2,16,null,g2%2?'#d9c8a2':'#c9a86a');
    pfSign(x,sx,by-96,pfShort(cries[i%cries.length],12),{s:0.86,post:0,maxW:stallW+10});
  }
  /* bunting overhead + the market cat */
  pfWireRun(x,0,H*0.30,W,H*0.27,16,{lw:1.4});
  for(let i=0;i<8;i++){
    const t2=(i+0.5)/8, bx2=t2*W, by3=H*0.285+Math.sin(Math.PI*t2)*14;
    x.fillStyle=['#c22a1c','#e9c81f','#31647e','#5fae57'][i%4];
    x.beginPath(); x.moveTo(bx2-7,by3); x.lineTo(bx2+7,by3); x.lineTo(bx2,by3+12); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1; x.stroke();
  }
  x.fillStyle=INKC;
  x.beginPath(); x.ellipse(R.cx+R.w*0.42,H*0.88,12,6,0,0,7); x.fill();
  x.beginPath(); x.arc(R.cx+R.w*0.51,H*0.865,5,0,7); x.fill();
  x.beginPath(); x.moveTo(R.cx+R.w*0.51-4,H*0.865-4); x.lineTo(R.cx+R.w*0.51-2,H*0.865-8); x.lineTo(R.cx+R.w*0.51,H*0.865-4);
  x.moveTo(R.cx+R.w*0.51+4,H*0.865-4); x.lineTo(R.cx+R.w*0.51+2,H*0.865-8); x.lineTo(R.cx+R.w*0.51,H*0.865-4);
  x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.6;
  x.beginPath(); x.moveTo(R.cx+R.w*0.31,H*0.88); x.quadraticCurveTo(R.cx+R.w*0.27,H*0.85,R.cx+R.w*0.29,H*0.82); x.stroke();
},
plugbay(x,d,R,W,H){
  /* the extension bay: the great socket waits, the plug is carried in.
     Every bay is its own wiring job — socket height, pin count, which
     wall, how the cable snakes — all dealt from the page */
  const wy=H*(0.42+((d.gh>>>4)%18)/100);
  const so=((d.gh>>>6)&1)?1:-1;              /* socket wall: left or right */
  /* the wall socket, monumental */
  const sw=R.w*(0.28+((d.gh>>>8)%12)/100);
  const sx0=R.cx+(so>0?R.w*0.1:-R.w*0.1-sw);
  x.fillStyle='#d9c8a2'; x.fillRect(sx0,wy-sw*0.6,sw,sw*1.2);
  x.strokeStyle=INKC; x.lineWidth=2.8; x.strokeRect(sx0,wy-sw*0.6,sw,sw*1.2);
  x.fillStyle='#3a352b';
  const nPin=2+((d.gh>>>10)%2);               /* two- or three-pin bay */
  for(let i=0;i<nPin;i++){
    const pxx=sx0+sw*(nPin===2?(0.28+i*0.30):(0.18+i*0.24));
    x.fillRect(pxx,wy-sw*0.3,sw*0.12,sw*0.3);
    x.strokeStyle=INKC; x.lineWidth=1.8;
    x.strokeRect(pxx,wy-sw*0.3,sw*0.12,sw*0.3);
    x.fillStyle='#3a352b';
  }
  for(const [bx2,by2] of [[sw*0.14,-sw*0.48],[sw*0.86,-sw*0.48],[sw*0.14,sw*0.48],[sw*0.86,sw*0.48]]){
    x.beginPath(); x.arc(sx0+bx2,wy+by2,3.4,0,7);
    x.fillStyle='#8d8266'; x.fill(); x.strokeStyle=INKC; x.lineWidth=1.2; x.stroke(); }
  /* the plug, twice a man's height, mid-carry on its cable */
  const px2=R.cx-so*R.w*(0.16+((d.gh>>>12)%10)/100);
  x.fillStyle='#57553f'; x.fillRect(px2-sw*0.24,wy-sw*0.34,sw*0.48,sw*0.68);
  x.strokeStyle=INKC; x.lineWidth=2.6; x.strokeRect(px2-sw*0.24,wy-sw*0.34,sw*0.48,sw*0.68);
  x.fillStyle='#8d8266';
  const pgx=so>0?px2+sw*0.24:px2-sw*0.44;
  x.fillRect(pgx,wy-sw*0.2,sw*0.2,sw*0.09);
  x.fillRect(pgx,wy+sw*0.11,sw*0.2,sw*0.09);
  x.strokeStyle=INKC; x.lineWidth=1.8;
  x.strokeRect(pgx,wy-sw*0.2,sw*0.2,sw*0.09);
  x.strokeRect(pgx,wy+sw*0.11,sw*0.2,sw*0.09);
  /* the cable runs off-frame in loops, out the plug's own side */
  x.strokeStyle=INKC; x.lineWidth=5;
  x.beginPath(); x.moveTo(px2-so*sw*0.24,wy);
  x.bezierCurveTo(px2-so*sw*0.7,wy+20,px2-so*sw*0.5,wy+70,px2-so*sw*0.9,wy+80);
  x.bezierCurveTo(px2-so*sw*1.3,wy+92,px2-so*sw*1.1,wy+40,so>0?-30:W+30,H*0.8); x.stroke();
  /* the port labels: what this plugin may touch, in the page's words —
     lettered the way THIS bay letters: over the socket, tagged down the
     blank wall, or riding the cable out */
  const ports=(d.labels.length?d.labels:['ROUTES','CONTROLLERS']);
  const pmode=(d.gh>>>20)%3;
  if(pmode===0){
    pfBanner(x,sx0+sw/2,wy-sw*0.6-22,pfShort(ports[0],16),{tone:'#31647e',s:0.86,maxW:sw,h:17});
    for(let i=1;i<Math.min(3,ports.length);i++)
      pfSign(x,clamp(sx0+sw*(i-0.5),56,W-56),wy+sw*0.78,pfShort(ports[i],14),{s:0.8,post:8,maxW:104});
  } else if(pmode===1){
    /* the blank-wall stack, opposite the socket */
    pfBanner(x,sx0+sw/2,wy+sw*0.66,pfShort(ports[0],16),{tone:'#31647e',s:0.86,maxW:sw,h:17});
    const tx9=so>0?clamp(sx0-58,52,W-52):clamp(sx0+sw+58,52,W-52);
    for(let i=1;i<Math.min(3,ports.length);i++)
      pfSign(x,tx9,wy-sw*0.42+i*36,pfShort(ports[i],14),{s:0.78,post:0,maxW:100});
  } else {
    /* shipping tags riding the cable loops */
    pfBanner(x,sx0+sw/2,wy-sw*0.6-22,pfShort(ports[0],16),{tone:'#8a3b2a',s:0.86,maxW:sw,h:17});
    for(let i=1;i<Math.min(3,ports.length);i++){
      const tt=i===1?0.45:0.8;
      const cxx=clamp(px2-so*sw*(0.5+tt*0.6),52,W-52), cyy=wy+30+tt*55;
      x.strokeStyle='rgba(35,28,18,.6)'; x.lineWidth=1.2;
      x.beginPath(); x.moveTo(cxx,cyy-8); x.lineTo(cxx+8,cyy-16); x.stroke();
      pfSign(x,cxx,cyy,pfShort(ports[i],14),{s:0.76,post:0,maxW:96,tone:'#e8d9ac'});
    }
  }
  /* voltage spark waiting in the gap */
  x.strokeStyle='#e9c81f'; x.lineWidth=2.2;
  const gpx=so>0?px2+sw*0.46:px2-sw*0.46;
  x.beginPath(); x.moveTo(gpx,wy-4);
  x.lineTo(gpx+so*6,wy+2); x.lineTo(gpx+so*2,wy+2); x.lineTo(gpx+so*10,wy+9); x.stroke();
},
automaton(x,d,R,W,H){
  /* the lifecycle automaton: wound at the back, it acts on schedule */
  const by=H*0.78;
  /* the stand */
  x.fillStyle='#6b4a2e'; x.fillRect(R.cx-R.w*0.16,by-8,R.w*0.32,10);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(R.cx-R.w*0.16,by-8,R.w*0.32,10);
  /* the figure: brass body, open gear chest */
  const ay=by-14; x.save(); x.translate(R.cx,ay); x.scale(1.32,1.32); x.translate(-R.cx,-ay);
  x.fillStyle='#c9a86a';
  x.fillRect(R.cx-24,ay-92,48,66); /* torso */
  x.strokeStyle=INKC; x.lineWidth=2.4; x.strokeRect(R.cx-24,ay-92,48,66);
  x.beginPath(); x.arc(R.cx,ay-108,16,0,7); x.fillStyle='#d9c8a2'; x.fill(); x.stroke();
  /* fixed doll eyes + rivet mouth */
  x.fillStyle=INKC;
  x.beginPath(); x.arc(R.cx-6,ay-110,2.4,0,7); x.arc(R.cx+6,ay-110,2.4,0,7); x.fill();
  for(let i=0;i<3;i++){ x.beginPath(); x.arc(R.cx-4+i*4,ay-101,1.1,0,7); x.fill(); }
  /* the open chest hatch shows meshing gears */
  x.fillStyle='#3a352b'; x.fillRect(R.cx-16,ay-84,32,34);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(R.cx-16,ay-84,32,34);
  pfGearBig(x,R.cx-6,ay-72,8,7,0.2,'#e9c81f');
  pfGearBig(x,R.cx+7,ay-62,6,6,-0.1,'#d9c8a2');
  /* jointed arms — rod limbs with disc joints, one raised mid-act */
  x.strokeStyle=INKC; x.lineWidth=4.4; x.lineCap='round';
  x.beginPath(); x.moveTo(R.cx-24,ay-86); x.lineTo(R.cx-42,ay-70); x.lineTo(R.cx-40,ay-48); x.stroke();
  x.beginPath(); x.moveTo(R.cx+24,ay-86); x.lineTo(R.cx+44,ay-98); x.lineTo(R.cx+58,ay-112); x.stroke();
  for(const [jx,jy] of [[-42,-70],[44,-98],[-24,-86],[24,-86]]){
    x.fillStyle='#8d8266'; x.beginPath(); x.arc(R.cx+jx,ay+jy,4,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.4; x.stroke(); }
  /* legs to the stand */
  x.lineWidth=4.4;
  x.beginPath(); x.moveTo(R.cx-10,ay-26); x.lineTo(R.cx-12,ay); x.stroke();
  x.beginPath(); x.moveTo(R.cx+10,ay-26); x.lineTo(R.cx+12,ay); x.stroke();
  x.restore();
  /* THE WINDING KEY in its back */
  x.save(); x.translate(R.cx-34,ay-92); x.rotate(-0.5);
  x.strokeStyle=INKC; x.lineWidth=3.4;
  x.beginPath(); x.moveTo(0,0); x.lineTo(-18,0); x.stroke();
  x.lineWidth=2.6;
  x.beginPath(); x.ellipse(-26,0,8,12,0,0,7); x.stroke();
  x.restore();
  /* the duty board: the page's own hooks, in firing order */
  const hooks=(d.labels3.length?d.labels3:d.labels.length?d.labels:['REGISTER','BOOTSTRAP','DESTROY']);
  x.fillStyle='#2e2a22'; x.fillRect(R.cx+R.w*0.24,H*0.3,R.w*0.24,H*0.22);
  x.strokeStyle=INKC; x.lineWidth=2.2; x.strokeRect(R.cx+R.w*0.24,H*0.3,R.w*0.24,H*0.22);
  x.fillStyle='#f6efdd'; x.font='600 8px "Courier Prime",monospace';
  for(let i=0;i<Math.min(4,hooks.length);i++){
    x.fillText((i+1)+'. '+pfShort(hooks[i].toLowerCase(),13),R.cx+R.w*0.25+6,H*0.3+18+i*15);
  }
  x.strokeStyle='rgba(246,239,221,.6)'; x.lineWidth=1;
  x.beginPath(); x.moveTo(R.cx+R.w*0.25+4,H*0.3+24); x.lineTo(R.cx+R.w*0.25+8+90,H*0.3+24); x.stroke();
},
gauntlet(x,d,R,W,H){
  /* the proving ground: the dummy rides the rail through every trial */
  const hzY=d.hz*H, gy=hzY+(H-hzY)*0.5;
  /* the rail */
  x.strokeStyle=INKC; x.lineWidth=3.4;
  x.beginPath(); x.moveTo(R.cx-R.w*0.52,gy); x.lineTo(R.cx+R.w*0.52,gy); x.stroke();
  x.lineWidth=1.6;
  for(let i=0;i<10;i++){ x.beginPath(); x.moveTo(R.cx-R.w*0.5+i*R.w*0.104,gy);
    x.lineTo(R.cx-R.w*0.5+i*R.w*0.104,gy+8); x.stroke(); }
  /* trial 1: the hoop */
  x.strokeStyle=INKC; x.lineWidth=3;
  x.beginPath(); x.arc(R.cx-R.w*0.26,gy-34,24,0,7); x.stroke();
  /* trial 2: the swinging hammer */
  x.lineWidth=2.4;
  x.beginPath(); x.moveTo(R.cx,gy-92); x.lineTo(R.cx+16,gy-38); x.stroke();
  x.fillStyle='#57553f'; x.fillRect(R.cx+8,gy-42,20,16);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(R.cx+8,gy-42,20,16);
  x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1.4;
  x.beginPath(); x.arc(R.cx,gy-92,56,1.1,1.9); x.stroke();
  /* trial 3: the fire pit */
  x.fillStyle=INKC; x.fillRect(R.cx+R.w*0.24,gy,R.w*0.14,6);
  plateFlame(x,R.cx+R.w*0.27,gy,1.3,d.seed);
  plateFlame(x,R.cx+R.w*0.33,gy,1.1,d.seed^5);
  /* the dummy on its sled, mid-gauntlet, stitched face */
  const dx2=R.cx-R.w*0.1;
  x.fillStyle='#8d8266'; x.fillRect(dx2-16,gy-10,32,10);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(dx2-16,gy-10,32,10);
  x.fillStyle='#e8d9ac';
  x.fillRect(dx2-8,gy-42,16,32);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(dx2-8,gy-42,16,32);
  x.beginPath(); x.arc(dx2,gy-50,9,0,7); x.fill(); x.stroke();
  x.lineWidth=1.2;
  x.beginPath(); x.moveTo(dx2-4,gy-52); x.lineTo(dx2-1,gy-49); x.moveTo(dx2-1,gy-52); x.lineTo(dx2-4,gy-49); x.stroke();
  x.beginPath(); x.moveTo(dx2+2,gy-52); x.lineTo(dx2+5,gy-49); x.moveTo(dx2+5,gy-52); x.lineTo(dx2+2,gy-49); x.stroke();
  x.beginPath(); x.moveTo(dx2-3,gy-45); x.lineTo(dx2+3,gy-45); x.stroke();
  for(let i=0;i<3;i++){ x.beginPath(); x.moveTo(dx2-2+i*2,gy-46); x.lineTo(dx2-2+i*2,gy-44); x.stroke(); }
  /* the checklist board: the page's own suites, ticked so far */
  const suites=(d.labels.length?d.labels:['UNIT','INTEGRATION','E2E']);
  x.fillStyle='#fdf6e2'; x.fillRect(R.cx-R.w*0.5,H*0.2,R.w*0.26,H*0.18);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(R.cx-R.w*0.5,H*0.2,R.w*0.26,H*0.18);
  for(let i=0;i<Math.min(3,suites.length);i++){
    x.strokeStyle=INKC; x.lineWidth=1.4;
    x.strokeRect(R.cx-R.w*0.48,H*0.22+i*H*0.05,10,10);
    if(i<2){ x.strokeStyle='#5fae57'; x.lineWidth=2.2;
      x.beginPath(); x.moveTo(R.cx-R.w*0.48+2,H*0.22+i*H*0.05+5);
      x.lineTo(R.cx-R.w*0.48+4.4,H*0.22+i*H*0.05+8);
      x.lineTo(R.cx-R.w*0.48+9,H*0.22+i*H*0.05+2); x.stroke(); }
    x.save(); x.fillStyle=INKC;
    pfFitFont(x,pfShort(suites[i],13),R.w*0.18,7.4,'600 %px Oswald,sans-serif');
    x.fillText(pfShort(suites[i],13),R.cx-R.w*0.46+14,H*0.22+i*H*0.05+9); x.restore();
  }
  /* the PASS bell at the rail's end */
  x.strokeStyle=INKC; x.lineWidth=2.6;
  x.beginPath(); x.moveTo(R.cx+R.w*0.5,gy); x.lineTo(R.cx+R.w*0.5,gy-52); x.stroke();
  pfBellShape(x,R.cx+R.w*0.5,gy-34,1.1);
  pfSign(x,R.cx+R.w*0.5,gy-58,'PASS',{s:0.8,post:0,maxW:50,tone:'#9fe08a'});
},
safetynet(x,d,R,W,H){
  /* the error net: the walk may fail — the catch is rigged and named */
  const hzY=d.hz*H;
  /* two building edges hold the rope */
  x.fillStyle=d.night?'#241f16':'#4a4436';
  x.fillRect(-10,hzY-H*0.16,W*0.18,H); x.fillRect(W*0.82,hzY-H*0.2,W*0.2,H);
  x.strokeStyle=INKC; x.lineWidth=2;
  x.strokeRect(-10,hzY-H*0.16,W*0.18,H); x.strokeRect(W*0.82,hzY-H*0.2,W*0.2,H);
  x.fillStyle=d.night?'#e9c81f':'rgba(35,28,18,.5)';
  for(let f2=0;f2<4;f2++){ x.fillRect(W*0.03+ (f2%2)*W*0.07,hzY-H*0.1+Math.floor(f2/2)*H*0.12,W*0.045,H*0.05);
    x.fillRect(W*0.86+(f2%2)*W*0.07,hzY-H*0.14+Math.floor(f2/2)*H*0.12,W*0.045,H*0.05); }
  /* the tightrope */
  x.strokeStyle=INKC; x.lineWidth=2.2;
  x.beginPath(); x.moveTo(W*0.17,hzY-H*0.145);
  x.quadraticCurveTo(R.cx,hzY-H*0.08,W*0.82,hzY-H*0.185); x.stroke();
  /* the walker, balanced with the pole — a silhouette against the sky */
  const wx=R.cx-R.w*0.04, wyv=hzY-H*0.105;
  x.fillStyle=INKC;
  x.beginPath(); x.arc(wx,wyv-26,4.4,0,7); x.fill();
  x.fillRect(wx-3.4,wyv-22,6.8,14);
  x.strokeStyle=INKC; x.lineWidth=2.6; x.lineCap='round';
  x.beginPath(); x.moveTo(wx-2,wyv-8); x.lineTo(wx-5,wyv); x.stroke();
  x.beginPath(); x.moveTo(wx+2,wyv-8); x.lineTo(wx+6,wyv-1); x.stroke();
  x.lineWidth=2;
  x.beginPath(); x.moveTo(wx-24,wyv-14); x.lineTo(wx+24,wyv-18); x.stroke();
  /* THE NET below, wide, laced to stakes */
  x.strokeStyle='rgba(35,28,18,.85)'; x.lineWidth=1.6;
  const ny=H*0.66;
  x.beginPath(); x.moveTo(W*0.16,ny-14);
  x.quadraticCurveTo(R.cx,ny+26,W*0.84,ny-18); x.stroke();
  for(let i=0;i<9;i++){ const t2=(i+0.5)/9, nx=W*0.16+t2*W*0.68;
    x.beginPath(); x.moveTo(nx,ny-16+Math.sin(Math.PI*t2)*24+6);
    x.quadraticCurveTo(nx+6,ny+6+Math.sin(Math.PI*t2)*22,nx+12,ny-16+Math.sin(Math.PI*(t2+0.06))*24+6);
    x.stroke(); }
  for(let i=0;i<7;i++){ const t2=(i+1)/8, nx=W*0.16+t2*W*0.68;
    x.beginPath(); x.moveTo(nx,ny-18+Math.sin(Math.PI*t2)*26);
    x.lineTo(nx-4,ny+2+Math.sin(Math.PI*t2)*22); x.stroke(); }
  /* the falling error tiles the net has already caught */
  const codes=['404','500','400','403'];
  for(let i=0;i<4;i++){
    const tx=W*(0.3+i*0.14), ty2=ny+Math.sin(Math.PI*(0.2+i*0.2))*20-6-((i%2)*30);
    x.save(); x.translate(tx,ty2); x.rotate(((d.seed>>>i)%9-4)*0.1);
    x.fillStyle=i%2?'#c22a1c':'#e9c81f'; x.fillRect(-11,-8,22,16);
    x.strokeStyle=INKC; x.lineWidth=1.4; x.strokeRect(-11,-8,22,16);
    x.fillStyle=i%2?'#f6efdd':INKC; x.font='700 9px "Courier Prime",monospace'; x.textAlign='center';
    x.fillText(codes[i],0,3); x.textAlign='left'; x.restore();
  }
  /* the net's stakes and the handler's crank */
  for(const sx of [W*0.15,W*0.85]){
    x.strokeStyle=INKC; x.lineWidth=2.6;
    x.beginPath(); x.moveTo(sx,ny+10); x.lineTo(sx,H*0.8); x.stroke(); }
  pfSign(x,R.cx,H*0.84,(d.labels[0]||'CATCH EVERY FALL'),{s:0.9,post:12,maxW:150});
},
moulds(x,d,R,W,H){
  /* the template foundry: one pour, a whole town the same good shape.
     A WHOLE SHOP now — back wall, furnace, hoist beam — so no half of the
     plate is left as bare halftone */
  const by=H*0.76;
  const k9=Math.max(1,R.w/340);            /* the shop scales with the vantage */
  /* the foundry back wall with its arched openings */
  const wy0=H*(0.28+((d.gh>>>11)%5)/100), wx0=R.cx-R.w*0.5, ww0=R.w;
  x.fillStyle=d.fieldDark||d.night?'rgba(60,50,36,.55)':'rgba(160,138,95,.5)';
  x.fillRect(wx0,wy0,ww0,by-wy0);
  x.strokeStyle=INKC; x.lineWidth=2;
  x.beginPath(); x.moveTo(wx0,wy0); x.lineTo(wx0+ww0,wy0); x.stroke();
  /* clerestory panes along the wall top — the shop keeps its own light */
  for(let c9=0;c9<4;c9++){
    const cx9=R.cx-R.w*0.38+c9*R.w*0.25;
    x.fillStyle=d.night?'#1d2038':'rgba(188,214,226,.8)';
    x.fillRect(cx9-13,wy0+8,26,16);
    x.strokeStyle=INKC; x.lineWidth=1.4; x.strokeRect(cx9-13,wy0+8,26,16);
    x.beginPath(); x.moveTo(cx9,wy0+8); x.lineTo(cx9,wy0+24); x.stroke();
  }
  for(let a9=0;a9<3;a9++){
    const ax0=R.cx-R.w*0.34+a9*R.w*0.34, aw9=R.w*0.10, ah9=(by-wy0)*0.52;
    x.fillStyle='rgba(35,28,18,.5)';
    x.beginPath(); x.moveTo(ax0-aw9/2,by-8); x.lineTo(ax0-aw9/2,by-8-ah9*0.6);
    x.arc(ax0,by-8-ah9*0.6,aw9/2,Math.PI,0); x.lineTo(ax0+aw9/2,by-8); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.6; x.stroke();
  }
  /* the furnace at the pouring side: firebox, chimney, live glow */
  const fs9=((d.gh>>>9)&1)?1:-1, fx9=R.cx+fs9*R.w*0.40;
  x.fillStyle='#57553f'; x.fillRect(fx9-30*k9,by-64*k9,60*k9,64*k9);
  x.strokeStyle=INKC; x.lineWidth=2.4; x.strokeRect(fx9-30*k9,by-64*k9,60*k9,64*k9);
  x.fillStyle='#8a3b2a'; x.fillRect(fx9-9*k9,by-64*k9-40*k9,18*k9,40*k9);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(fx9-9*k9,by-64*k9-40*k9,18*k9,40*k9);
  pfSmokeCurl(x,fx9,by-64*k9-46*k9,1.2,'rgba(120,120,120,.55)');
  x.fillStyle='#e8842c';
  x.beginPath(); x.moveTo(fx9-14*k9,by); x.lineTo(fx9-9*k9,by-16*k9);
  x.lineTo(fx9,by-9*k9); x.lineTo(fx9+9*k9,by-18*k9); x.lineTo(fx9+14*k9,by);
  x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.6; x.stroke();
  const gF=x.createRadialGradient(fx9,by-12*k9,4,fx9,by-12*k9,60*k9);
  gF.addColorStop(0,'rgba(232,132,44,.4)'); gF.addColorStop(1,'rgba(232,132,44,0)');
  x.fillStyle=gF; x.beginPath(); x.arc(fx9,by-12*k9,60*k9,0,7); x.fill();
  /* the hoist beam across the shop, ladle chained to it, spare hooks idle */
  const beamY=wy0-H*0.045;
  x.strokeStyle=INKC; x.lineWidth=3.4;
  x.beginPath(); x.moveTo(wx0,beamY); x.lineTo(wx0+ww0,beamY); x.stroke();
  x.lineWidth=1.8;
  x.beginPath(); x.moveTo(R.cx-R.w*0.02,beamY); x.lineTo(R.cx-R.w*0.02,by-70*k9); x.stroke();
  for(const hk of [0.28,0.68]){
    const hx9=wx0+ww0*hk, hl9=H*(0.05+((d.seed>>>3)%4)/100);
    x.lineWidth=1.6;
    x.beginPath(); x.moveTo(hx9,beamY); x.lineTo(hx9,beamY+hl9); x.stroke();
    x.beginPath(); x.arc(hx9+3,beamY+hl9+5,5,-1.6,1.8); x.stroke();
  }
  /* the bench of house-moulds */
  x.fillStyle='#6b4a2e'; x.fillRect(R.cx-R.w*0.46,by,R.w*0.92,10*k9);
  x.strokeStyle=INKC; x.lineWidth=2.2; x.strokeRect(R.cx-R.w*0.46,by,R.w*0.92,10*k9);
  for(let i=0;i<3;i++){
    const mx=R.cx-R.w*0.32+i*R.w*0.24;
    /* open two-part mould with a house-shaped cavity */
    x.fillStyle='#8d8266'; x.fillRect(mx-24*k9,by-34*k9,48*k9,34*k9);
    x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(mx-24*k9,by-34*k9,48*k9,34*k9);
    x.fillStyle='#3a352b';
    x.beginPath(); x.moveTo(mx-12*k9,by-6*k9); x.lineTo(mx-12*k9,by-18*k9); x.lineTo(mx,by-27*k9);
    x.lineTo(mx+12*k9,by-18*k9); x.lineTo(mx+12*k9,by-6*k9); x.closePath(); x.fill();
    if(i===1){ /* the glowing pour */
      x.fillStyle='#e8842c';
      x.beginPath(); x.moveTo(mx-12*k9,by-6*k9); x.lineTo(mx-12*k9,by-14*k9); x.lineTo(mx+12*k9,by-14*k9);
      x.lineTo(mx+12*k9,by-6*k9); x.closePath(); x.fill();
      const g2=x.createRadialGradient(mx,by-12*k9,3,mx,by-12*k9,34*k9);
      g2.addColorStop(0,'rgba(232,132,44,.45)'); g2.addColorStop(1,'rgba(232,132,44,0)');
      x.fillStyle=g2; x.beginPath(); x.arc(mx,by-12*k9,34*k9,0,7); x.fill();
    }
  }
  /* the ladle tipping into the middle mould */
  x.save(); x.translate(R.cx-R.w*0.02,by-70*k9); x.rotate(0.5); x.scale(k9,k9);
  x.strokeStyle=INKC; x.lineWidth=3;
  x.beginPath(); x.moveTo(0,0); x.lineTo(44,-10) ; x.stroke();
  x.fillStyle='#57553f'; x.beginPath(); x.arc(-6,4,12,-0.4,Math.PI+0.4); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
  x.restore();
  x.strokeStyle='#e8842c'; x.lineWidth=3.4*k9;
  x.beginPath(); x.moveTo(R.cx-R.w*0.09,by-64*k9); x.lineTo(R.cx-R.w*0.08,by-30*k9); x.stroke();
  /* sparks off the pour */
  x.fillStyle='#e9c81f';
  for(let s9=0;s9<5;s9++){
    const sa=((d.seed>>>(s9*3))%100)/100;
    x.beginPath(); x.arc(R.cx-R.w*0.085+(sa-0.5)*26*k9,by-26*k9-sa*20*k9,1.4+sa,0,7); x.fill();
  }
  /* the finished casts, cooling in a row — identical little houses */
  for(let i=0;i<4;i++){
    const hx2=R.cx+R.w*(0.2+i*0.09), hy=by-2-i*1;
    x.fillStyle='#d9c8a2';
    x.beginPath(); x.moveTo(hx2-9*k9,hy); x.lineTo(hx2-9*k9,hy-10*k9); x.lineTo(hx2,hy-17*k9);
    x.lineTo(hx2+9*k9,hy-10*k9); x.lineTo(hx2+9*k9,hy); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.4; x.stroke();
    pfSmokeCurl(x,hx2,hy-19*k9,0.5,'rgba(120,120,120,.5)');
  }
  /* mould labels: the page's own template names */
  const kinds=[...new Set(d.labels.length?d.labels:[])];
  for(const p9 of ['BLOG','ECOMMERCE','CORPORATE']){
    if(kinds.length>=3) break; if(kinds.indexOf(p9)<0) kinds.push(p9); }
  for(let i=0;i<3;i++)
    pfSign(x,R.cx-R.w*0.32+i*R.w*0.24,by+26*k9,pfShort(kinds[i],16),{s:0.82,post:6,maxW:104});
},
roundtable(x,d,R,W,H){
  /* the round table: the work is one sheet and every chair is taken.
     Each council sits its own way — table girth, tilt of the sheet, how
     many came, which side keeps the ink — dealt from the page */
  const cy=H*(0.54+((d.gh>>>4)%14)/100);
  const tw=R.w*(0.32+((d.gh>>>6)%14)/100), th=tw*(0.36+((d.gh>>>8)%10)/100);
  const tcx=R.cx+(((d.gh>>>10)%3)-1)*R.w*0.10;
  const pale=d.fieldDark||d.night;   /* the dark hours letter in chalk */
  /* the council lamp: a cone of light works the dark acreage above */
  const lampY=Math.max(H*0.10,cy-th-H*0.26);
  x.strokeStyle=pale?'rgba(217,200,162,.8)':'rgba(35,28,18,.8)'; x.lineWidth=2;
  x.beginPath(); x.moveTo(tcx,0); x.lineTo(tcx,lampY); x.stroke();
  x.fillStyle='#57553f';
  x.beginPath(); x.moveTo(tcx-16,lampY+12); x.lineTo(tcx,lampY-4); x.lineTo(tcx+16,lampY+12);
  x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.8; x.stroke();
  x.fillStyle='#e9c81f'; x.beginPath(); x.arc(tcx,lampY+10,4,0,7); x.fill();
  const lg9=x.createLinearGradient(0,lampY,0,cy);
  lg9.addColorStop(0,'rgba(255,238,170,.30)'); lg9.addColorStop(1,'rgba(255,238,170,.05)');
  x.fillStyle=lg9;
  x.beginPath(); x.moveTo(tcx-10,lampY+12); x.lineTo(tcx+10,lampY+12);
  x.lineTo(tcx+tw*0.9,cy); x.lineTo(tcx-tw*0.9,cy); x.closePath(); x.fill();
  /* the table, seen a little from above */
  x.fillStyle='#8a5a2e'; x.beginPath(); x.ellipse(tcx,cy,tw,th,0,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2.6; x.stroke();
  x.fillStyle='#6b4a2e'; x.beginPath(); x.ellipse(tcx,cy+8,tw,th,0,0,Math.PI); x.fill();
  /* its shadow pools on the boards */
  x.fillStyle=pale?'rgba(0,0,0,.35)':'rgba(35,28,18,.18)';
  x.beginPath(); x.ellipse(tcx,cy+th+14,tw*1.05,th*0.35,0,0,7); x.fill();
  /* the shared sheets in the middle, corners held by paperweights */
  const nSheets=1+((d.gh>>>12)%2);
  for(let s9=0;s9<nSheets;s9++){
    x.save(); x.translate(tcx+(s9?tw*0.34:0),cy-4-(s9?6:0));
    x.rotate(-0.04+s9*0.18+(((d.gh>>>13)%7)-3)*0.02);
    const shw=nSheets>1?60:84, shh=nSheets>1?32:44;
    x.fillStyle='#fdf8ea'; x.fillRect(-shw/2,-shh/2,shw,shh);
    x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(-shw/2,-shh/2,shw,shh);
    x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1;
    for(let i=0;i<3;i++){ x.beginPath(); x.moveTo(-shw/2+10,-shh/2+10+i*(shh-16)/2);
      x.lineTo(shw/2-10,-shh/2+10+i*(shh-16)/2); x.stroke(); }
    x.restore();
  }
  for(const [px2,py] of [[-38,-20],[38,-16],[-34,16],[36,18]]){
    x.fillStyle='#57553f'; x.beginPath(); x.arc(tcx+px2*tw/84,cy-4+py*th/34,4,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.2; x.stroke(); }
  /* the council: silhouettes around the far rim, each with a quill or cup —
     kept VISIBLE on the dark plates: chalk-rimmed, warm-cloaked */
  const seats=3+((d.gh>>>15)%4);
  const bodyTone=pale?'#3a352b':null, rimTone=pale?'rgba(246,239,221,.85)':null;
  for(let i=0;i<seats;i++){
    const a2=Math.PI*(1.06+i*(0.88/Math.max(1,seats-1))),
      sx=tcx+Math.cos(a2)*tw*1.1, sy=cy+Math.sin(a2)*th*1.15-14;
    x.fillStyle=bodyTone||INKC;
    x.beginPath(); x.arc(sx,sy-14,6,0,7); x.fill();
    if(rimTone){ x.strokeStyle=rimTone; x.lineWidth=1.4; x.stroke(); }
    x.beginPath(); x.moveTo(sx-8,sy+8); x.quadraticCurveTo(sx,sy-10,sx+8,sy+8); x.closePath(); x.fill();
    if(rimTone){ x.strokeStyle=rimTone; x.lineWidth=1.4; x.stroke(); }
    if(i%2){ x.strokeStyle=rimTone||INKC; x.lineWidth=1.6;
      x.beginPath(); x.moveTo(sx+8,sy-4); x.lineTo(sx+15,sy-12); x.stroke(); }
  }
  /* the near seats: two or three empty chairs wait at OUR rim — the
     table is a council, not an altar */
  const nCh=2+((d.gh>>>18)%2);
  for(let i=0;i<nCh;i++){
    const a3=Math.PI*(0.22+i*(0.56/Math.max(1,nCh-1))),
      cx3=tcx+Math.cos(a3)*tw*1.22, cy3=cy+Math.sin(a3)*th*1.5;
    x.strokeStyle=pale?'rgba(217,200,162,.9)':INKC; x.lineWidth=2.2;
    x.fillStyle='#6b4a2e';
    x.fillRect(cx3-9,cy3-4,18,5);                 /* the seat */
    x.strokeRect(cx3-9,cy3-4,18,5);
    x.fillRect(cx3-9,cy3+1,3,12); x.fillRect(cx3+6,cy3+1,3,12);  /* legs */
    x.strokeRect(cx3-9,cy3+1,3,12); x.strokeRect(cx3+6,cy3+1,3,12);
    x.fillRect(cx3-9,cy3-22,18,4); x.strokeRect(cx3-9,cy3-22,18,4); /* back rail */
    x.beginPath(); x.moveTo(cx3-7,cy3-18); x.lineTo(cx3-7,cy3-4);
    x.moveTo(cx3+7,cy3-18); x.lineTo(cx3+7,cy3-4); x.stroke();
  }
  /* table props: the cups and scrolls of a working session */
  x.fillStyle='#d9c8a2';
  x.beginPath(); x.arc(tcx-tw*0.55,cy-th*0.15,4.4,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.3; x.stroke();
  x.save(); x.translate(tcx+tw*0.5,cy+th*0.35); x.rotate(0.4);
  x.fillStyle='#fdf8ea'; x.fillRect(-11,-3.4,22,6.8);
  x.strokeStyle=INKC; x.lineWidth=1.2; x.strokeRect(-11,-3.4,22,6.8);
  x.restore();
  /* the shared inkpot and the passing of one quill — the page's side */
  const io=((d.gh>>>17)&1)?1:-1;
  x.fillStyle=INKC; x.beginPath(); x.ellipse(tcx+io*tw*0.5,cy+2,7,4,0,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.8;
  x.beginPath(); x.moveTo(tcx+io*tw*0.5,cy); x.quadraticCurveTo(tcx+io*tw*0.65,cy-16,tcx+io*tw*0.6,cy-24); x.stroke();
  /* role cards at the near rim: the page's own seats */
  const roles=(d.labels.length?d.labels:['OWNER','DEVELOPER']);
  for(let i=0;i<Math.min(3,roles.length);i++)
    pfSign(x,clamp(tcx-tw*0.6+i*tw*0.6,52,W-52),cy+th*1.3+22,pfShort(roles[i],12),{s:0.8,post:6,maxW:90});
},
kiosk(x,d,R,W,H){
  /* the question kiosk: ask at the window, the answer rings back */
  const hzY=d.hz*H, by=hzY+(H-hzY)*0.55;
  const kw=R.w*0.4;
  /* the booth */
  x.fillStyle='#31647e'; x.fillRect(R.cx-kw/2,by-H*0.3,kw,H*0.3);
  x.strokeStyle=INKC; x.lineWidth=2.6; x.strokeRect(R.cx-kw/2,by-H*0.3,kw,H*0.3);
  x.fillStyle='#8a3b2a';
  x.beginPath(); x.moveTo(R.cx-kw*0.62,by-H*0.3); x.lineTo(R.cx,by-H*0.37);
  x.lineTo(R.cx+kw*0.62,by-H*0.3); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
  /* the window and the clerk's silhouette */
  x.fillStyle='#f3e2b0'; x.fillRect(R.cx-kw*0.3,by-H*0.24,kw*0.6,H*0.13);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(R.cx-kw*0.3,by-H*0.24,kw*0.6,H*0.13);
  x.fillStyle=INKC;
  x.beginPath(); x.arc(R.cx+kw*0.06,by-H*0.17,7,0,7); x.fill();
  x.beginPath(); x.moveTo(R.cx-kw*0.04,by-H*0.11); x.quadraticCurveTo(R.cx+kw*0.06,by-H*0.19,R.cx+kw*0.16,by-H*0.11);
  x.closePath(); x.fill();
  /* the big painted ? on the booth */
  x.fillStyle='#e9c81f'; x.font='700 34px Bangers,Impact,sans-serif'; x.textAlign='center';
  x.fillText('?',R.cx-kw*0.34,by-H*0.05);
  x.strokeStyle=INKC; x.lineWidth=1.2; x.strokeText('?',R.cx-kw*0.34,by-H*0.05);
  x.textAlign='left';
  /* pinned question cards: the page's own FAQs */
  const qs=(d.labels.length?d.labels:['LICENSING','HOSTING','SUPPORT']);
  for(let i=0;i<Math.min(3,qs.length);i++){
    const qx=R.cx+kw*0.7, qy2=by-H*0.26+i*H*0.09;
    x.save(); x.translate(qx,qy2); x.rotate(((d.seed>>>i)%7-3)*0.03);
    x.fillStyle='#fdf8ea'; x.fillRect(0,0,74,26);
    x.strokeStyle=INKC; x.lineWidth=1.4; x.strokeRect(0,0,74,26);
    x.fillStyle=INKC; x.beginPath(); x.arc(6,5,1.6,0,7); x.fill();
    pfFitFont(x,pfShort(qs[i],14),64,7,'600 %px Oswald,sans-serif');
    x.fillText(pfShort(qs[i],14),8,17); x.restore();
  }
  /* the queue leaning in with their own cards */
  plateCrowd(x,by+8,R.cx-kw*1.4,R.cx-kw*0.7,d.seed,4,1.5,true);
  /* the answer bell on the counter */
  pfBellShape(x,R.cx+kw*0.26,by-H*0.115,0.8);
},
codex(x,d,R,W,H){
  /* the chained codex: the reference itself, open to today's page */
  const by=H*0.72;
  /* shelf wall behind */
  x.fillStyle='#6b4a2e'; x.fillRect(R.cx-R.w*0.5,H*0.16,R.w,H*0.36);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(R.cx-R.w*0.5,H*0.16,R.w,H*0.36);
  for(let s2=0;s2<3;s2++){
    const sy=H*0.16+(s2+1)*H*0.36/3;
    x.fillRect(R.cx-R.w*0.5,sy-4,R.w,4);
    /* spines, dealt */
    for(let b2=0;b2<12;b2++){
      const bx2=R.cx-R.w*0.48+b2*R.w*0.08, bh2=H*0.07+((d.seed>>>(s2*4+b2))%14);
      x.fillStyle=['#8a3b2a','#31647e','#57553f','#b9a06a'][(s2+b2)%4];
      x.fillRect(bx2,sy-6-bh2,R.w*0.06,bh2);
      x.strokeStyle=INKC; x.lineWidth=1; x.strokeRect(bx2,sy-6-bh2,R.w*0.06,bh2);
    }
  }
  /* the lectern */
  x.fillStyle='#8a5a2e';
  x.beginPath(); x.moveTo(R.cx-34,by); x.lineTo(R.cx+34,by); x.lineTo(R.cx+16,by+H*0.14);
  x.lineTo(R.cx-16,by+H*0.14); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
  pfBookBig(x,R.cx,by-16,R.w*0.42,{ang:-0.02,cover:'#8a3b2a'});
  /* the chain that keeps it */
  x.strokeStyle=INKC; x.lineWidth=2;
  for(let i=0;i<5;i++){
    x.beginPath(); x.ellipse(R.cx+R.w*0.21+i*9,by-10+i*7,5,3.4,0.6,0,7); x.stroke(); }
  /* the candelabra and its three flames */
  const cx2=R.cx-R.w*0.34;
  x.strokeStyle=INKC; x.lineWidth=2.6;
  x.beginPath(); x.moveTo(cx2,by+H*0.1); x.lineTo(cx2,by-H*0.06); x.stroke();
  x.beginPath(); x.moveTo(cx2-14,by-H*0.06); x.lineTo(cx2+14,by-H*0.06); x.stroke();
  for(const dx2 of [-14,0,14]){
    x.fillStyle='#f6efdd'; x.fillRect(cx2+dx2-2,by-H*0.06-12,4,12);
    plateFlame(x,cx2+dx2,by-H*0.06-12,0.8,d.seed+dx2);
  }
  /* today's heading illuminated in the margin */
  if(d.labels[0]) pfCarve(x,R.cx,by-R.w*0.16,pfShort(d.labels[0],18),{maxW:R.w*0.4,size:9,ink:'rgba(35,28,18,.7)'});
},
gearworks(x,d,R,W,H){
  /* the settings wall: gears mesh, dials answer, one lever is a hand's.
     The GEAR TRAIN ITSELF is the page's: one wheel per real heading, each
     bored and placed by the heading's own name — no two trains mesh alike */
  const tones=['#d9c8a2','#c9a86a','#b9ab84','#a08a5f','#8d8266'];
  /* the train is laid out by the SHARED layout — what the painter draws,
     the caption solver knows */
  const GL=pfGearLayout(d);
  const gearPts=[];
  GL.gears.forEach((g,i)=>{
    pfGearBig(x,g.x*W,g.y*H,g.r*W,g.teeth,g.ang,tones[i%5]);
    gearPts.push([g.x*W,g.y*H,g.r*W]);
  });
  /* the drive belt to the small governor */
  const [lgx,lgy,lgr]=gearPts[gearPts.length-1];
  x.strokeStyle=INKC; x.lineWidth=2;
  x.beginPath(); x.moveTo(lgx+lgr*0.2,lgy-lgr*0.3);
  x.quadraticCurveTo(lgx+lgr+R.w*0.1,lgy-R.w*0.14,lgx+lgr+R.w*0.08,lgy-R.w*0.24); x.stroke();
  x.beginPath(); x.arc(lgx+lgr+R.w*0.08,lgy-R.w*0.28,R.w*0.04,0,7); x.stroke();
  /* dial gauges named with the page's own settings — each dial rides ITS
     wheel, offset by the heading's own hash: no row, no shared height */
  const dials=(d.labels.length?d.labels:['HOST','PORT','POOL']);
  for(let i=0;i<Math.min(3,dials.length);i++){
    const dl=GL.dials[i]; if(!dl) break;
    const gx=clamp(dl.x*W,42,W-42), gy2=dl.y*H;
    x.fillStyle='#f6efdd'; x.beginPath(); x.arc(gx,gy2,17,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
    x.lineWidth=1.2;
    for(let t3=0;t3<7;t3++){ const a2=Math.PI*0.75+t3*Math.PI*1.5/6;
      x.beginPath(); x.moveTo(gx+Math.cos(a2)*13,gy2+Math.sin(a2)*13);
      x.lineTo(gx+Math.cos(a2)*16,gy2+Math.sin(a2)*16); x.stroke(); }
    const na=Math.PI*(0.75+((d.seed>>>(i*4))%100)/100*1.5);
    x.lineWidth=2.2; x.beginPath(); x.moveTo(gx,gy2);
    x.lineTo(gx+Math.cos(na)*11,gy2+Math.sin(na)*11); x.stroke();
    pfBanner(x,gx,gy2+20,pfShort(dials[i],14),{tone:i%2?'#31647e':'#57553f',s:0.7,maxW:90,h:13,rod:false});
  }
  /* the one long lever, thrown — from whichever side the page works it */
  const lo=((d.gh>>>16)&1)?1:-1;
  x.strokeStyle=INKC; x.lineWidth=5; x.lineCap='round';
  x.beginPath(); x.moveTo(R.cx+lo*R.w*0.42,H*0.62); x.lineTo(R.cx+lo*R.w*0.34,H*0.42); x.stroke();
  x.fillStyle='#c22a1c'; x.beginPath(); x.arc(R.cx+lo*R.w*0.34,H*0.41,7,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.8; x.stroke();
  x.fillStyle='#57553f'; x.fillRect(R.cx+lo*R.w*0.46-(lo>0?R.w*0.1:0),H*0.62,R.w*0.1,10);
  x.strokeRect(R.cx+lo*R.w*0.46-(lo>0?R.w*0.1:0),H*0.62,R.w*0.1,10);
  /* steam where the work happens */
  pfSmokeCurl(x,gearPts[0][0]+R.w*0.03,gearPts[0][1]+R.w*0.01,1.3,'rgba(150,150,150,.5)');
},
spanner(x,d,R,W,H){
  /* the utility bench: the great spanner every worker borrows */
  const by=H*0.7;
  /* pegboard wall */
  x.fillStyle='#c9bd96'; x.fillRect(R.cx-R.w*0.44,H*0.2,R.w*0.88,H*0.34);
  x.strokeStyle=INKC; x.lineWidth=2.2; x.strokeRect(R.cx-R.w*0.44,H*0.2,R.w*0.88,H*0.34);
  x.fillStyle='rgba(35,28,18,.35)';
  for(let px2=0;px2<10;px2++)for(let py=0;py<5;py++){
    x.beginPath(); x.arc(R.cx-R.w*0.4+px2*R.w*0.088,H*0.23+py*H*0.06,1.4,0,7); x.fill(); }
  /* THE SPANNER, wall-mounted like a trophy */
  x.save(); x.translate(R.cx,H*0.36); x.rotate(-0.22);
  x.strokeStyle=INKC; x.lineWidth=3;
  x.fillStyle='#8d8266';
  x.beginPath(); x.arc(-R.w*0.26,0,16,0.7,5.6); x.fill(); x.stroke();
  x.fillRect(-R.w*0.26+8,-6,R.w*0.5,12); x.strokeRect(-R.w*0.26+8,-6,R.w*0.5,12);
  x.beginPath(); x.arc(R.w*0.26,0,13,3.8,2.5); x.fill(); x.stroke();
  x.restore();
  /* small borrowed tools hung around it, tagged by the page */
  const tools=(d.labels3.length?d.labels3:d.labels.length?d.labels:['SANITIZE','PARSE-TYPE','ERRORS']);
  for(let i=0;i<Math.min(3,tools.length);i++){
    const tx=R.cx-R.w*0.3+i*R.w*0.3, ty2=H*0.485;
    x.strokeStyle=INKC; x.lineWidth=2;
    if(i%3===0){ x.beginPath(); x.moveTo(tx,ty2-16); x.lineTo(tx,ty2); x.stroke();
      x.beginPath(); x.arc(tx,ty2-19,4,0,7); x.stroke(); }
    else if(i%3===1){ x.beginPath(); x.moveTo(tx-6,ty2-18); x.lineTo(tx+6,ty2); x.stroke();
      x.fillStyle='#57553f'; x.fillRect(tx+3,ty2-2,10,6); x.strokeRect(tx+3,ty2-2,10,6); }
    else { x.beginPath(); x.arc(tx,ty2-9,8,0.5,4.2); x.stroke(); }
    x.fillStyle='#fdf8ea'; x.fillRect(tx-24,ty2+6,48,13);
    x.strokeStyle=INKC; x.lineWidth=1.2; x.strokeRect(tx-24,ty2+6,48,13);
    x.save(); x.fillStyle=INKC; x.textAlign='center';
    pfFitFont(x,pfShort(tools[i],13),42,6.4,'700 %px "Courier Prime",monospace');
    x.fillText(pfShort(tools[i],13),tx,ty2+15.4); x.textAlign='left'; x.restore();
  }
  /* the bench with a half-assembled joint in the vice */
  x.fillStyle='#6b4a2e'; x.fillRect(R.cx-R.w*0.46,by,R.w*0.92,12);
  x.strokeStyle=INKC; x.lineWidth=2.2; x.strokeRect(R.cx-R.w*0.46,by,R.w*0.92,12);
  x.fillStyle='#57553f'; x.fillRect(R.cx-R.w*0.06,by-18,R.w*0.12,18);
  x.strokeRect(R.cx-R.w*0.06,by-18,R.w*0.12,18);
  x.strokeStyle=INKC; x.lineWidth=2.4;
  x.beginPath(); x.moveTo(R.cx+R.w*0.06,by-9); x.lineTo(R.cx+R.w*0.12,by-9); x.stroke();
  pfGearBig(x,R.cx,by-26,10,7,0.2,'#d9c8a2');
},
skyharbor(x,d,R,W,H){
  /* the cloud city: the platform rides above the weather, ships dock */
  const py=d.hz*H-H*0.06;
  /* the platform slab on its pylons through the cloud floor */
  x.fillStyle='#8d8266'; x.fillRect(R.cx-R.w*0.44,py,R.w*0.88,14);
  x.strokeStyle=INKC; x.lineWidth=2.4; x.strokeRect(R.cx-R.w*0.44,py,R.w*0.88,14);
  x.lineWidth=4;
  for(const t2 of [0.16,0.5,0.84]){
    x.beginPath(); x.moveTo(R.cx-R.w*0.44+t2*R.w*0.88,py+14);
    x.lineTo(R.cx-R.w*0.44+t2*R.w*0.88,py+H*0.16); x.stroke(); }
  /* the town on the slab */
  plateCity(x,W,py,H*0.16,d.seed^7,
    {x0:R.cx-R.w*0.42,x1:R.cx+R.w*0.28,fill:d.night?'#241f16':'#57553f',
     win:d.night?'#e9c81f':'rgba(246,239,221,.7)',winDensity:0.5});
  /* the mooring mast walks the slab; the fleet is the page's own count */
  const mx=R.cx+(((d.gh>>>4)&1)?1:-1)*R.w*(0.28+((d.gh>>>6)%10)/100);
  x.strokeStyle=INKC; x.lineWidth=3;
  x.beginPath(); x.moveTo(mx,py); x.lineTo(mx,py-H*0.18); x.stroke();
  x.lineWidth=1.4;
  x.beginPath(); x.moveTo(mx,py-H*0.18); x.lineTo(mx-30,py-H*0.155); x.stroke();
  const ax=mx-58, ay=py-H*(0.13+((d.gh>>>8)%8)/100);
  x.fillStyle='#d9c8a2'; x.beginPath(); x.ellipse(ax,ay,34,13,-0.06,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
  x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1.2;
  x.beginPath(); x.ellipse(ax,ay,34,13,-0.06,0.5,2.6); x.stroke();
  x.fillStyle='#57553f'; x.fillRect(ax-10,ay+11,20,7);
  x.strokeStyle=INKC; x.lineWidth=1.4; x.strokeRect(ax-10,ay+11,20,7);
  if(((d.gh>>>10)%3)!==0){ /* a second ship, hull-down in the far sky */
    const bx=R.cx-((d.gh>>>4)&1?1:-1)*R.w*(0.2+((d.gh>>>12)%14)/100), byy=py-H*(0.24+((d.gh>>>14)%10)/100);
    x.fillStyle='#c9bd96'; x.beginPath(); x.ellipse(bx,byy,18,7,0.04,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.4; x.stroke();
  }
  /* the lit gangway from the dock into the town */
  x.fillStyle='rgba(233,200,31,.35)';
  x.beginPath(); x.moveTo(mx-4,py); x.lineTo(mx+4,py);
  x.lineTo(mx+16,py-H*0.02); x.lineTo(mx-16,py-H*0.02); x.closePath(); x.fill();
  /* the harbor board carries the page's own berths */
  const berths=(d.labels.length?d.labels:['DEPLOYS','SETTINGS']);
  pfSign(x,clamp(R.cx-R.w*0.5,60,W-60),py+H*0.1,pfShort(berths[0],14),{s:0.9,post:18,maxW:110});
  if(berths[1]) pfSign(x,clamp(R.cx-R.w*0.1,60,W-60),py+H*0.13,pfShort(berths[1],14),{s:0.82,post:14,maxW:104});
  /* the cloud floor works for its living: the morning packet's freight is
     lowered through, and gull shadows cross the shelf */
  const rd8=mulberry(d.seed^0x5471);
  const fy0=py+H*0.2;
  for(let i=0;i<2+((d.gh>>>7)%2);i++){
    const cx8=W*(0.12+rd8()*0.7), cy8=fy0+rd8()*(H-fy0)*0.5;
    pfCrate(x,cx8,cy8,22+rd8()*14,16+rd8()*8,null,i%2?'#d9c8a2':'#c9a86a');
    x.strokeStyle='rgba(35,28,18,.6)'; x.lineWidth=1.4;
    x.beginPath(); x.moveTo(cx8,cy8-24-rd8()*10); x.lineTo(cx8,cy8-16); x.stroke();
  }
  x.fillStyle='rgba(35,28,18,.14)';
  for(let i=0;i<4;i++){
    const gx8=W*(0.1+rd8()*0.8), gy8=fy0+rd8()*(H-fy0)*0.7;
    x.beginPath(); x.ellipse(gx8,gy8,9+rd8()*6,3,0.2,0,7); x.fill();
  }
  x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1.2;
  for(let i=0;i<3;i++){ const bx8=W*(0.15+rd8()*0.7), by8=fy0+rd8()*(H-fy0)*0.6;
    x.beginPath(); x.moveTo(bx8-4,by8); x.quadraticCurveTo(bx8-2,by8-3,bx8,by8);
    x.quadraticCurveTo(bx8+2,by8-3,bx8+4,by8); x.stroke(); }
},
ticker(x,d,R,W,H){
  /* the log ticker: the building prints the night's every event */
  const hzY=d.hz*H;
  /* the press-house facade */
  const bw=R.w*0.66, by=H*0.86;
  x.fillStyle=d.night?'#241f16':'#4a4436';
  x.fillRect(R.cx-bw/2,hzY-H*0.10,bw,by-hzY+H*0.10);
  x.strokeStyle=INKC; x.lineWidth=2.4; x.strokeRect(R.cx-bw/2,hzY-H*0.10,bw,by-hzY+H*0.10);
  for(let f2=0;f2<3;f2++)for(let c2=0;c2<3;c2++)
    pfWindowGlow(x,R.cx-bw*0.3+c2*bw*0.3,hzY+f2*H*0.14,bw*0.14,H*0.06,d.night&&((d.seed>>>(f2*3+c2))&1));
  /* THE TICKER BAND wrapping the facade, lettered with live text */
  const ty2=hzY+H*0.045;
  x.fillStyle=INKC; x.fillRect(R.cx-bw/2-10,ty2-13,bw+20,26);
  x.strokeStyle=INKC; x.lineWidth=1; x.strokeRect(R.cx-bw/2-10,ty2-13,bw+20,26);
  x.fillStyle='#e9c81f'; x.font='700 11px "Courier Prime",monospace';
  const feed=((d.labels3[0]||d.labels[0]||'SERVER UP')+' • '+(d.labels[1]||'200 OK')+' • ').toUpperCase();
  let fx2=R.cx-bw/2-4;
  for(const ch of (feed+feed)){ if(fx2>R.cx+bw/2+2) break;
    x.fillText(ch,fx2,ty2+4); fx2+=8; }
  /* the tape river spilling from the mouth to the street */
  x.fillStyle='#fdf8ea';
  x.beginPath(); x.moveTo(R.cx+bw*0.18,ty2+13);
  x.bezierCurveTo(R.cx+bw*0.34,ty2+H*0.12,R.cx+bw*0.08,ty2+H*0.2,R.cx+bw*0.3,ty2+H*0.3);
  x.bezierCurveTo(R.cx+bw*0.44,ty2+H*0.37,R.cx+bw*0.2,ty2+H*0.42,R.cx+bw*0.34,H*0.9);
  x.lineTo(R.cx+bw*0.42,H*0.9);
  x.bezierCurveTo(R.cx+bw*0.3,ty2+H*0.4,R.cx+bw*0.52,ty2+H*0.35,R.cx+bw*0.38,ty2+H*0.28);
  x.bezierCurveTo(R.cx+bw*0.16,ty2+H*0.19,R.cx+bw*0.42,ty2+H*0.12,R.cx+bw*0.26,ty2+13);
  x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.4; x.stroke();
  x.strokeStyle='rgba(35,28,18,.4)'; x.lineWidth=1;
  for(let i=0;i<6;i++){ x.beginPath();
    x.moveTo(R.cx+bw*(0.22+((i%3))*0.05),ty2+H*(0.06+i*0.06));
    x.lineTo(R.cx+bw*(0.3+((i%3))*0.05),ty2+H*(0.065+i*0.06)); x.stroke(); }
  /* the reader under the lamp with a caught strip */
  pfLamp(x,R.cx-bw*0.62,by,1.2,true);
},
lighthouse(x,d,R,W,H){
  /* the watch light: the beam finds every ship that strays */
  const hzY=d.hz*H;
  /* the rock */
  x.fillStyle='#3a352b';
  x.beginPath(); x.moveTo(R.cx-R.w*0.3,H*0.9); x.lineTo(R.cx-R.w*0.16,hzY+H*0.06);
  x.lineTo(R.cx+R.w*0.14,hzY+H*0.09); x.lineTo(R.cx+R.w*0.26,H*0.92); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
  /* the tower, banded */
  const tx=R.cx-R.w*0.02, tby=hzY+H*0.075, th=H*0.34, tw2=R.w*0.15;
  for(let b2=0;b2<5;b2++){
    x.fillStyle=b2%2?'#c22a1c':'#f6efdd';
    const y1=tby-th*(b2+1)/5, w1=tw2*(1-b2*0.09), w0=tw2*(1-(b2)*0.09);
    x.beginPath(); x.moveTo(tx-w0/2,tby-th*b2/5); x.lineTo(tx-w1/2,y1);
    x.lineTo(tx+w1/2,y1); x.lineTo(tx+w0/2,tby-th*b2/5); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.8; x.stroke();
  }
  /* the lamp room and its cap */
  x.fillStyle='#231c12'; x.fillRect(tx-tw2*0.34,tby-th-16,tw2*0.68,16);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(tx-tw2*0.34,tby-th-16,tw2*0.68,16);
  x.fillStyle='#e9c81f'; x.fillRect(tx-tw2*0.22,tby-th-13,tw2*0.44,11);
  x.fillStyle='#57553f';
  x.beginPath(); x.moveTo(tx-tw2*0.4,tby-th-16); x.lineTo(tx,tby-th-27);
  x.lineTo(tx+tw2*0.4,tby-th-16); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.6; x.stroke();
  /* THE BEAM, sweeping right across the sea */
  x.fillStyle='rgba(233,200,31,.30)';
  x.beginPath(); x.moveTo(tx+tw2*0.2,tby-th-8);
  x.lineTo(W+20,hzY-H*0.13); x.lineTo(W+20,hzY+H*0.06); x.closePath(); x.fill();
  x.fillStyle='rgba(233,200,31,.14)';
  x.beginPath(); x.moveTo(tx-tw2*0.2,tby-th-8);
  x.lineTo(-20,hzY-H*0.02); x.lineTo(-20,hzY+H*0.09); x.closePath(); x.fill();
  /* the ship caught mid-beam, and one still dark */
  const shx=W*0.78;
  pfBoatHull(x,shx,hzY+H*0.05,R.w*0.24,'#231c12');
  x.fillStyle='#d9c8a2'; x.fillRect(shx-6,hzY+H*0.05-26,20,14);
  x.strokeStyle=INKC; x.lineWidth=1.4; x.strokeRect(shx-6,hzY+H*0.05-26,20,14);
  pfSmokeCurl(x,shx+6,hzY+H*0.05-30,1);
  /* the keeper's rail and door */
  x.strokeStyle=INKC; x.lineWidth=1.8;
  x.strokeRect(tx-6,tby-20,12,20);
  /* what the light is watching for, on the rock's board */
  if(d.labels[0]) pfSign(x,R.cx-R.w*0.34,H*0.88,pfShort(d.labels[0],16),{s:0.86,post:16,maxW:116});
},
gantry(x,d,R,W,H){
  /* launch morning: the ship stands bolted to the tower, the count runs.
     Every pad is its own: the ship changes side, girth and reach, the
     board hangs in the corner the page prefers */
  const hzY=d.hz*H, by=hzY+(H-hzY)*(0.45+((d.gh>>>4)%20)/100);
  const rs=((d.gh>>>5)&1)?1:-1;
  /* the pad */
  x.fillStyle='#8d8266'; x.fillRect(R.cx-R.w*0.4,by,R.w*0.8,10);
  x.strokeStyle=INKC; x.lineWidth=2.2; x.strokeRect(R.cx-R.w*0.4,by,R.w*0.8,10);
  /* the rocket */
  const rx=R.cx+rs*R.w*(0.05+((d.gh>>>6)%8)/100), rh=H*(0.27+((d.gh>>>9)%14)/100),
        rw=R.w*(0.11+((d.gh>>>11)%7)/100);
  x.fillStyle='#e8e2d2';
  x.beginPath(); x.moveTo(rx-rw/2,by); x.lineTo(rx-rw/2,by-rh*0.72);
  x.quadraticCurveTo(rx-rw/2,by-rh*0.94,rx,by-rh);
  x.quadraticCurveTo(rx+rw/2,by-rh*0.94,rx+rw/2,by-rh*0.72);
  x.lineTo(rx+rw/2,by); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2.4; x.stroke();
  x.fillStyle='#c22a1c';
  x.beginPath(); x.moveTo(rx-rw/2,by); x.lineTo(rx-rw*1.1,by); x.lineTo(rx-rw/2,by-rh*0.2); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(rx+rw/2,by); x.lineTo(rx+rw*1.1,by); x.lineTo(rx+rw/2,by-rh*0.2); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.8; x.stroke();
  x.fillStyle='#31647e'; x.beginPath(); x.arc(rx,by-rh*0.66,rw*0.2,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.6; x.stroke();
  pfCarve(x,rx,by-rh*0.42,pfTok(d,0,'APP'),{maxW:rw*0.9,size:9,ang:-1.5708,ink:'rgba(35,28,18,.7)'});
  /* the tower and its arms — always on the ship's landward side */
  const gx=rx-rs*rw*1.9;
  x.strokeStyle=INKC; x.lineWidth=3.4;
  x.beginPath(); x.moveTo(gx,by+8); x.lineTo(gx,by-rh-14); x.stroke();
  x.lineWidth=1.8;
  for(let i=0;i<6;i++){ const yy=by-6-i*(rh/6);
    x.beginPath(); x.moveTo(gx-8,yy); x.lineTo(gx+8,yy-10); x.stroke();
    x.beginPath(); x.moveTo(gx+8,yy); x.lineTo(gx-8,yy-10); x.stroke(); }
  x.lineWidth=2.6;
  x.beginPath(); x.moveTo(gx,by-rh*0.8); x.lineTo(rx-rs*rw/2,by-rh*0.8); x.stroke();
  x.beginPath(); x.moveTo(gx,by-rh*0.4); x.lineTo(rx-rs*rw/2,by-rh*0.4); x.stroke();
  /* umbilical dropping away: the deploy is GO */
  x.strokeStyle='rgba(35,28,18,.7)'; x.lineWidth=2;
  x.beginPath(); x.moveTo(rx-rs*rw/2,by-rh*0.55);
  x.quadraticCurveTo(gx+rs*14,by-rh*0.3,gx+rs*8,by-6); x.stroke();
  /* first steam under the nozzles */
  for(const dx2 of [-8,4,12]) pfSmokeCurl(x,rx+dx2,by+6,1.4,'rgba(200,200,200,.7)');
  /* the countdown board: the page's own steps, last one lit — hung in the
     corner the page prefers */
  const steps=(d.labels.length?d.labels:['BUILD','PUSH','RELEASE']);
  const cbx=((d.gh>>>14)&1)?R.cx+R.w*0.22:R.cx-R.w*0.46;
  const cby=H*(0.20+((d.gh>>>16)%14)/100);
  x.fillStyle='#2e2a22'; x.fillRect(cbx,cby,R.w*0.24,H*0.19);
  x.strokeStyle=INKC; x.lineWidth=2.2; x.strokeRect(cbx,cby,R.w*0.24,H*0.19);
  for(let i=0;i<Math.min(3,steps.length);i++){
    x.fillStyle=i===Math.min(3,steps.length)-1?'#9fe08a':'#8d8266';
    x.font='700 9px "Courier Prime",monospace';
    x.fillText(pfShort(steps[i],13),cbx+8,cby+20+i*17);
  }
},
monogram(x,d,R,W,H){
  /* the page's own initial, monumental — its headings stand as stelae */
  const hzY=d.hz*H, by=hzY+(H-hzY)*0.55;
  const ch=(String(d.m.title||d.slug).replace(/[^A-Za-z0-9]/g,'')[0]||'S').toUpperCase();
  /* the plinth */
  x.fillStyle='#b9ab84'; x.fillRect(R.cx-R.w*0.2,by-14,R.w*0.4,16);
  x.strokeStyle=INKC; x.lineWidth=2.2; x.strokeRect(R.cx-R.w*0.2,by-14,R.w*0.4,16);
  x.fillRect(R.cx-R.w*0.16,by-24,R.w*0.32,10); x.strokeRect(R.cx-R.w*0.16,by-24,R.w*0.32,10);
  /* THE LETTER, drawn as cut stone with a face and a shadow side */
  drawLettering(x,ch,{x:R.cx+4,y:by-32,w:R.w*0.5,size:H*0.24,color:'#8d8266',
    style:'schnapp',seed:d.seed,arc:0,telescope:0});
  drawLettering(x,ch,{x:R.cx,y:by-36,w:R.w*0.5,size:H*0.24,color:'#d9c8a2',
    style:'schnapp',seed:d.seed,arc:0,telescope:0});
  /* the ivy that says how long it has stood */
  x.strokeStyle='#57713f'; x.lineWidth=2;
  x.beginPath(); x.moveTo(R.cx-R.w*0.12,by-14);
  x.bezierCurveTo(R.cx-R.w*0.16,by-50,R.cx-R.w*0.04,by-70,R.cx-R.w*0.08,by-H*0.16);
  x.stroke();
  for(let i=0;i<4;i++){ x.fillStyle='#57713f';
    x.beginPath(); x.ellipse(R.cx-R.w*(0.13-i*0.02),by-26-i*22,4,2.6,0.6,0,7); x.fill(); }
  /* the stelae half-circle: one stone per real heading */
  const n=clamp(d.labels.length,0,5);
  for(let i=0;i<n;i++){
    const t2=n===1?0.5:i/(n-1);
    const sx=R.cx-R.w*0.46+t2*R.w*0.92, sy=by+10+Math.sin(Math.PI*t2)*H*0.05;
    const sh2=30+((d.seed>>>i)%12);
    x.fillStyle='#c9bd96';
    x.beginPath(); x.moveTo(sx-11,sy); x.lineTo(sx-9,sy-sh2);
    x.arc(sx,sy-sh2,9,Math.PI,0); x.lineTo(sx+11,sy); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.8; x.stroke();
    pfCarve(x,sx,sy-sh2*0.4,pfShort(d.labels[i],10),{maxW:26,size:6.4,ang:-1.5708,ink:'rgba(35,28,18,.7)'});
  }
},
};
/* the provider emblems: each foreign house wears its own drawn mark */
function pfEmblem(x,who,cx,cy,s){
  x.save(); x.translate(cx,cy);
  /* the medallion ground */
  x.fillStyle='#f6efdd'; x.beginPath(); x.arc(0,0,s,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=Math.max(2,s*0.09); x.stroke();
  x.lineWidth=Math.max(1.4,s*0.06);
  const k=String(who||'');
  if(/github/.test(k)){ /* the octocat idol: round head, two ears, tentacle */
    x.fillStyle=INKC;
    x.beginPath(); x.arc(0,-s*0.1,s*0.42,0,7); x.fill();
    x.beginPath(); x.moveTo(-s*0.34,-s*0.42); x.lineTo(-s*0.16,-s*0.56); x.lineTo(-s*0.12,-s*0.36); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(s*0.34,-s*0.42); x.lineTo(s*0.16,-s*0.56); x.lineTo(s*0.12,-s*0.36); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=s*0.12; x.lineCap='round';
    x.beginPath(); x.moveTo(-s*0.05,s*0.28); x.quadraticCurveTo(-s*0.3,s*0.42,-s*0.44,s*0.26); x.stroke();
    x.fillStyle='#f6efdd';
    x.beginPath(); x.arc(-s*0.14,-s*0.12,s*0.09,0,7); x.arc(s*0.14,-s*0.12,s*0.09,0,7); x.fill();
  } else if(/google/.test(k)){ /* the great lens */
    x.strokeStyle=INKC; x.lineWidth=s*0.12;
    x.beginPath(); x.arc(-s*0.08,-s*0.08,s*0.34,0,7); x.stroke();
    x.beginPath(); x.moveTo(s*0.16,s*0.16); x.lineTo(s*0.44,s*0.44); x.stroke();
    x.strokeStyle='#31647e'; x.lineWidth=s*0.07;
    x.beginPath(); x.arc(-s*0.08,-s*0.08,s*0.2,2.2,3.6); x.stroke();
  } else if(/microsoft/.test(k)){ /* the four-paned window */
    for(const [dx2,dy2,c2] of [[-1,-1,'#c22a1c'],[1,-1,'#5fae57'],[-1,1,'#31647e'],[1,1,'#e9c81f']]){
      x.fillStyle=c2; x.fillRect(dx2*s*0.06-(dx2<0?s*0.34:0),dy2*s*0.06-(dy2<0?s*0.34:0),s*0.34,s*0.34);
      x.strokeStyle=INKC; x.lineWidth=s*0.05;
      x.strokeRect(dx2*s*0.06-(dx2<0?s*0.34:0),dy2*s*0.06-(dy2<0?s*0.34:0),s*0.34,s*0.34); }
  } else if(/keycloak/.test(k)){ /* the cloak hung with keys */
    x.fillStyle='#57553f';
    x.beginPath(); x.moveTo(0,-s*0.5); x.quadraticCurveTo(-s*0.52,-s*0.1,-s*0.36,s*0.44);
    x.lineTo(s*0.36,s*0.44); x.quadraticCurveTo(s*0.52,-s*0.1,0,-s*0.5); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=s*0.06; x.stroke();
    pfKeyBig(x,-s*0.12,s*0.05,s*0.022,1.2); pfKeyBig(x,s*0.14,s*0.12,s*0.02,1.5);
  } else if(/discord/.test(k)){ /* the mask with two eyes */
    x.fillStyle='#31647e';
    x.beginPath(); x.moveTo(-s*0.4,-s*0.18); x.quadraticCurveTo(0,-s*0.44,s*0.4,-s*0.18);
    x.quadraticCurveTo(s*0.46,s*0.2,s*0.2,s*0.34); x.lineTo(s*0.12,s*0.22);
    x.lineTo(-s*0.12,s*0.22); x.lineTo(-s*0.2,s*0.34);
    x.quadraticCurveTo(-s*0.46,s*0.2,-s*0.4,-s*0.18); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=s*0.06; x.stroke();
    x.fillStyle='#f6efdd';
    x.beginPath(); x.ellipse(-s*0.15,0,s*0.08,s*0.11,0,0,7); x.ellipse(s*0.15,0,s*0.08,s*0.11,0,0,7); x.fill();
  } else if(/facebook/.test(k)){ /* the notice-board of faces */
    x.fillStyle='#31647e'; x.fillRect(-s*0.4,-s*0.34,s*0.8,s*0.68);
    x.strokeStyle=INKC; x.lineWidth=s*0.06; x.strokeRect(-s*0.4,-s*0.34,s*0.8,s*0.68);
    x.fillStyle='#f6efdd';
    for(const [dx2,dy2] of [[-0.2,-0.14],[0.14,-0.14],[-0.2,0.16],[0.14,0.16]]){
      x.fillRect(dx2*s,dy2*s-s*0.08,s*0.16,s*0.16); }
  } else if(/instagram/.test(k)){ /* the bellows camera */
    x.fillStyle='#57553f'; x.fillRect(-s*0.36,-s*0.2,s*0.72,s*0.44);
    x.strokeStyle=INKC; x.lineWidth=s*0.06; x.strokeRect(-s*0.36,-s*0.2,s*0.72,s*0.44);
    x.strokeStyle=INKC;
    for(let i=0;i<3;i++){ x.beginPath(); x.moveTo(-s*(0.3-i*0.08),-s*0.2);
      x.lineTo(-s*(0.34-i*0.08),s*0.24); x.stroke(); }
    x.fillStyle='#e9c81f'; x.beginPath(); x.arc(s*0.12,0,s*0.15,0,7); x.fill();
    x.strokeStyle=INKC; x.stroke();
    x.fillStyle='#f6efdd'; x.beginPath(); x.arc(s*0.16,-s*0.04,s*0.04,0,7); x.fill();
  } else if(/linkedin/.test(k)){ /* the handshake */
    x.strokeStyle=INKC; x.lineWidth=s*0.14; x.lineCap='round';
    x.beginPath(); x.moveTo(-s*0.42,-s*0.1); x.lineTo(-s*0.06,s*0.08); x.stroke();
    x.beginPath(); x.moveTo(s*0.42,-s*0.14); x.lineTo(s*0.08,s*0.06); x.stroke();
    x.fillStyle='#d9a86a'; x.beginPath(); x.ellipse(0,s*0.06,s*0.17,s*0.12,0.2,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=s*0.05; x.stroke();
  } else if(/patreon/.test(k)){ /* the patron's purse */
    x.fillStyle='#8a3b2a';
    x.beginPath(); x.moveTo(-s*0.26,-s*0.12); x.quadraticCurveTo(-s*0.38,s*0.36,0,s*0.4);
    x.quadraticCurveTo(s*0.38,s*0.36,s*0.26,-s*0.12); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=s*0.06; x.stroke();
    x.beginPath(); x.moveTo(-s*0.26,-s*0.12); x.quadraticCurveTo(0,-s*0.28,s*0.26,-s*0.12); x.stroke();
    x.fillStyle='#e9c81f';
    for(const dx2 of [-0.1,0.06]){ x.beginPath(); x.arc(dx2*s,-s*0.3,s*0.09,0,7); x.fill();
      x.strokeStyle=INKC; x.lineWidth=s*0.04; x.stroke(); }
  } else if(/reddit/.test(k)){ /* the antenna imp */
    x.fillStyle='#e0d2a8';
    x.beginPath(); x.ellipse(0,s*0.08,s*0.34,s*0.26,0,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=s*0.06; x.stroke();
    x.beginPath(); x.moveTo(0,-s*0.18); x.lineTo(s*0.1,-s*0.44); x.stroke();
    x.fillStyle='#c22a1c'; x.beginPath(); x.arc(s*0.12,-s*0.46,s*0.07,0,7); x.fill();
    x.fillStyle=INKC;
    x.beginPath(); x.arc(-s*0.12,s*0.04,s*0.05,0,7); x.arc(s*0.12,s*0.04,s*0.05,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=s*0.05;
    x.beginPath(); x.arc(0,s*0.14,s*0.12,0.3,Math.PI-0.3); x.stroke();
  } else if(/twitch/.test(k)){ /* the marquee lights */
    x.fillStyle='#57553f'; x.fillRect(-s*0.38,-s*0.3,s*0.76,s*0.6);
    x.strokeStyle=INKC; x.lineWidth=s*0.06; x.strokeRect(-s*0.38,-s*0.3,s*0.76,s*0.6);
    x.fillStyle='#e9c81f';
    for(let i=0;i<5;i++){ x.beginPath(); x.arc(-s*0.28+i*s*0.14,-s*0.2,s*0.05,0,7); x.fill(); }
    x.fillStyle='#f6efdd'; x.fillRect(-s*0.26,-s*0.06,s*0.2,s*0.26); x.fillRect(0.06*s,-s*0.06,s*0.2,s*0.26);
    x.strokeStyle=INKC; x.lineWidth=s*0.04;
    x.strokeRect(-s*0.26,-s*0.06,s*0.2,s*0.26); x.strokeRect(0.06*s,-s*0.06,s*0.2,s*0.26);
  } else if(/twitter/.test(k)){ /* the bird on its wire */
    x.strokeStyle=INKC; x.lineWidth=s*0.05;
    x.beginPath(); x.moveTo(-s*0.44,s*0.3); x.quadraticCurveTo(0,s*0.16,s*0.44,s*0.3); x.stroke();
    x.fillStyle='#31647e';
    x.beginPath(); x.ellipse(0,-s*0.02,s*0.22,s*0.16,-0.2,0,7); x.fill();
    x.beginPath(); x.arc(s*0.16,-s*0.16,s*0.1,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=s*0.05; x.stroke();
    x.fillStyle=INKC;
    x.beginPath(); x.moveTo(s*0.25,-s*0.18); x.lineTo(s*0.36,-s*0.14); x.lineTo(s*0.25,-s*0.1); x.closePath(); x.fill();
    x.strokeStyle=INKC;
    x.beginPath(); x.moveTo(-s*0.2,0); x.quadraticCurveTo(-s*0.34,-s*0.06,-s*0.3,-s*0.18); x.stroke();
  } else if(/vk/.test(k)){ /* the onion dome kiosk */
    x.fillStyle='#31647e';
    x.beginPath(); x.moveTo(-s*0.22,s*0.06); x.quadraticCurveTo(-s*0.3,-s*0.26,0,-s*0.44);
    x.quadraticCurveTo(s*0.3,-s*0.26,s*0.22,s*0.06); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=s*0.06; x.stroke();
    x.fillStyle='#d9c8a2'; x.fillRect(-s*0.26,s*0.06,s*0.52,s*0.3);
    x.strokeRect(-s*0.26,s*0.06,s*0.52,s*0.3);
  } else if(/auth-zero|auth0/.test(k)){ /* the nought arch */
    x.strokeStyle=INKC; x.lineWidth=s*0.14;
    x.beginPath(); x.ellipse(0,0,s*0.26,s*0.36,0,0,7); x.stroke();
    x.strokeStyle='#c22a1c'; x.lineWidth=s*0.07;
    x.beginPath(); x.moveTo(-s*0.2,s*0.28); x.lineTo(s*0.2,-s*0.28); x.stroke();
  } else if(/cognito/.test(k)){ /* the thinking head with a gear inside */
    x.fillStyle='#d9a86a';
    x.beginPath(); x.arc(-s*0.04,0,s*0.32,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=s*0.06; x.stroke();
    pfGearBig(x,-s*0.04,-s*0.04,s*0.14,6,0.2,'#f6efdd');
  } else if(/okta/.test(k)){ /* the ring of watchfires */
    for(let i=0;i<6;i++){ const a2=i*Math.PI/3;
      x.fillStyle=i%2?'#31647e':'#e9c81f';
      x.beginPath(); x.arc(Math.cos(a2)*s*0.28,Math.sin(a2)*s*0.28,s*0.09,0,7); x.fill();
      x.strokeStyle=INKC; x.lineWidth=s*0.04; x.stroke(); }
  } else if(/cas\b|^cas/.test(k)){ /* the central hub, spokes to little gates */
    x.fillStyle='#57553f'; x.beginPath(); x.arc(0,0,s*0.14,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=s*0.05; x.stroke();
    for(let i=0;i<5;i++){ const a2=i*Math.PI*2/5-0.5;
      x.beginPath(); x.moveTo(Math.cos(a2)*s*0.16,Math.sin(a2)*s*0.16);
      x.lineTo(Math.cos(a2)*s*0.4,Math.sin(a2)*s*0.4); x.stroke();
      x.fillStyle='#d9c8a2';
      x.fillRect(Math.cos(a2)*s*0.4-s*0.05,Math.sin(a2)*s*0.4-s*0.06,s*0.1,s*0.12);
      x.strokeRect(Math.cos(a2)*s*0.4-s*0.05,Math.sin(a2)*s*0.4-s*0.06,s*0.1,s*0.12); }
  } else if(/amazon-s3/.test(k)){ /* the stacked pails */
    for(let i=0;i<3;i++){
      x.fillStyle=['#c9a86a','#d9c8a2','#b9ab84'][i];
      x.beginPath(); x.moveTo(-s*0.26,s*0.3-i*s*0.24); x.lineTo(s*0.26,s*0.3-i*s*0.24);
      x.lineTo(s*0.2,s*0.06-i*s*0.24); x.lineTo(-s*0.2,s*0.06-i*s*0.24); x.closePath(); x.fill();
      x.strokeStyle=INKC; x.lineWidth=s*0.05; x.stroke(); }
  } else if(/cloudinary/.test(k)){ /* the framed cloud */
    x.fillStyle='#f6efdd';
    x.beginPath(); x.arc(-s*0.12,0,s*0.14,Math.PI*0.5,Math.PI*1.5);
    x.arc(0,-s*0.1,s*0.13,Math.PI*0.8,Math.PI*1.9);
    x.arc(s*0.14,-s*0.02,s*0.12,Math.PI*1.2,Math.PI*0.3);
    x.arc(s*0.08,s*0.08,s*0.1,Math.PI*1.6,Math.PI*0.55);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=s*0.05; x.stroke();
    x.strokeRect(-s*0.32,-s*0.3,s*0.64,s*0.56);
  } else if(/local/.test(k)){ /* the home shed */
    x.fillStyle='#8a3b2a';
    x.beginPath(); x.moveTo(-s*0.32,0); x.lineTo(0,-s*0.3); x.lineTo(s*0.32,0); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=s*0.05; x.stroke();
    x.fillStyle='#d9c8a2'; x.fillRect(-s*0.24,0,s*0.48,s*0.3);
    x.strokeRect(-s*0.24,0,s*0.48,s*0.3);
    x.fillStyle='#3a352b'; x.fillRect(-s*0.06,s*0.06,s*0.12,s*0.24);
  } else if(/nodemailer|mailgun/.test(k)){ /* the sealed letter */
    pfEnvelope(x,0,0,s*0.6,-0.06);
    x.fillStyle='#c22a1c'; x.beginPath(); x.arc(0,s*0.02,s*0.08,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=s*0.04; x.stroke();
  } else { /* unknown house: a blank shield with a chisel-mark */
    x.fillStyle='#d9c8a2';
    x.beginPath(); x.moveTo(-s*0.26,-s*0.3); x.lineTo(s*0.26,-s*0.3); x.lineTo(s*0.26,s*0.06);
    x.quadraticCurveTo(s*0.26,s*0.3,0,s*0.38); x.quadraticCurveTo(-s*0.26,s*0.3,-s*0.26,s*0.06);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=s*0.06; x.stroke();
    x.beginPath(); x.moveTo(-s*0.1,-s*0.05); x.lineTo(s*0.1,-s*0.05); x.stroke();
  }
  x.restore();
}

/* ---- the opening line of each myth is cut for ITS subject ---- */
function pfOpenLine(sub,title,d){
  const L={
  doors:'A WALL OF DOORS, A KEY FOR EACH — AND '+title+' DECIDES WHOSE HAND CLOSES ON WHICH.',
  vault:'BEHIND THE GREAT WHEEL SLEEP THE TOKENS OF '+title+'. THE WHEEL TURNS FOR PAPERS, NEVER FOR PLEAS.',
  ledger:'EVERY DEED IN THE CITY LANDS AS ONE LINE IN THE LEDGER OF '+title+'. NONE ARE FORGOTTEN.',
  meters:'THE DIALS OF '+title+' COUNT WHILE THE CITY SLEEPS — AND THE STRONGBOX NEVER MISCOUNTS.',
  counter:'AT THE WINDOWS OF '+title+' THE LINE FORMS EARLY. EVERY PASS IS STAMPED, OR IT IS NOTHING.',
  masonry:'STONE BY TYPED STONE THE MASONS RAISE '+title+' — AND THE BLUEPRINT ANSWERS ONLY TO THEM.',
  gallery:'EVERY PICTURE THE CITY OWNS HANGS IN THE SALON OF '+title+' — AND EACH KNOWS ITS OWN WALL.',
  quay:'ON THE QUAY OF '+title+' THE CARGO IS STACKED, SEALED AND IDENTICAL — SHIP IT ANYWHERE, IT RUNS.',
  wires:'THE WIRES OF '+title+' HUM THE INSTANT THE DEED IS DONE — WORD REACHES THE FAR STATION FIRST.',
  bellpost:'IN THE SORTING ROOM OF '+title+' NO LETTER SLEEPS — THE BELL RINGS AND THE POST FLIES.',
  belfry:'WHEN THE BELL OF '+title+' SPEAKS, EVERY ROOF IN THE CITY LEANS IN TO LISTEN.',
  clockworks:'THE TOWER OF '+title+' KEEPS ITS OWN HOUR — AND AT THE STROKE, THE DUTIES WALK.',
  constellation:'ASK THE NIGHT ONE SHAPED QUESTION AND '+title+' LIGHTS EXACTLY THOSE STARS — NO MORE, NO LESS.',
  organ:'PULL A STOP AND '+title+' SOUNDS — EVERY PARAMETER A PIPE, EVERY QUERY A CHORD.',
  oracle:'PUT YOUR QUESTION IN THE SLOT: '+title+' ANSWERS IN RIBBON, AND THE RIBBON DOES NOT LIE.',
  temple:'FOUR VERBS HOLD UP THE ROOF OF '+title+' — BRING THE RIGHT ONE AND THE DOOR IS YOURS.',
  aqueduct:'FROM ONE SPRING, '+title+' FEEDS EVERY BASIN IN THE VALLEY — CHOOSE YOUR CHANNEL AND DRINK.',
  barge:'THE FREIGHT OF '+title+' CROSSES LOADED TO THE WATERLINE — AND NOT ONE CRATE MAY SPILL.',
  canallocks:'IN THE LOCKS OF '+title+' THE WATER CLIMBS LEVEL BY LEVEL — NO CARGO LEAPS, ALL CARGO RISES.',
  bridge:'THE GREAT CROSSING. '+title+' LEADS EVERY PAGE OVER THE SPAN — BEHIND THEM THE OLD BANK BURNS LOW.',
  edict:'THE EDICT IS NAILED UP AND THE PLAZA READS IT TWICE: '+title+'. THE OLD WAY IS OVER.',
  embassy:'AT THE EMBASSY OF '+title+' THE PAPERS ARE FOREIGN BUT THE STAMP IS OURS.',
  forgeshield:'NO HOUSE ON THE WALL FITS? THE SMITHY OF '+title+' CUTS YOU A NEW SHIELD TONIGHT.',
  gatebanners:'ONE KEY OVER ONE GATE — '+title+' — AND EVERY BANNERED HOUSE HONORS IT.',
  press:'WHAT THE DAY DRAFTS, THE LEVER OF '+title+' PUBLISHES — AND THE PRESS PRINTS NO HALF-TRUTHS.',
  pressgate:'EVERY SHEET RIDES THE BELT TO '+title+' — AND THE GATE SWINGS DRAFT OR PUBLISHED, NEVER BOTH.',
  corridor:'WALK THE CORRIDOR OF '+title+': THE SAME FACE, OLDER FRAME BY FRAME — NOTHING IS EVER LOST.',
  editions:'EVERY EDITION EVER SHIPPED IS STILL ON THE RACK AT '+title+' — READ WHAT CHANGED, DATED AND INKED.',
  spyglass:'FROM THE BALCONY OF '+title+' YOU SEE THE SHOW BEFORE THE TOWN DOES — THE CURTAIN ISN\'T UP YET.',
  relay:'THE SCROLL OF '+title+' PASSES HAND TO HAND, STAGE TO STAGE — NO STEP MAY BE SKIPPED.',
  stairflag:'THE FIRST CLIMB IS CUT INTO '+title+' ITSELF — LANDING BY LANDING, TO THE FLAG.',
  toolbox:'THE CHEST OF '+title+' STANDS OPEN ON LANDING DAY — COUNT THE PARTS BEFORE YOU BUILD.',
  cutaway:'SLICE THE HOUSE OF '+title+' CLEAN THROUGH AND EVERY FLOOR CONFESSES WHAT IT KEEPS.',
  switchyard:'IN THE YARD OF '+title+' EVERY REQUEST TAKES THE TRACK THROWN FOR IT — AND ONLY THAT TRACK.',
  tollroad:'THE ROAD THROUGH '+title+' PASSES EVERY GATE IN ORDER — PAY EACH TOLL OR TURN BACK.',
  tribunal:'BEFORE THE BENCH OF '+title+' EVERY REQUEST PLEADS ITS CASE — ALLOW LEFT, DENY RIGHT.',
  funnelworks:'POUR THE WHOLE RIVER IN: THE FUNNEL OF '+title+' LETS FALL ONLY WHAT WAS ASKED FOR.',
  marshalling:'IN THE YARD OF '+title+' NOTHING IS MERELY PILED — EVERYTHING IS RANKED, PLATFORM BY PLATFORM.',
  magnetwell:'LOWER THE MAGNET OF '+title+' AND THE WELL GIVES UP WHAT IS LINKED — CHAIN AND ALL.',
  chains:'TWO MONUMENTS, ONE CHAIN: '+title+' FORGED THE MIDDLE LINK AND IT DOES NOT BREAK.',
  flags:'EVERY FLAG IN THE PLAZA OF '+title+' SAYS THE SAME TRUE THING — EACH IN ITS OWN TONGUE.',
  semaphore:'READ THE ARMS OF '+title+' FROM ANY DECK IN THE HARBOR — THE MAST NEVER RUMORS.',
  cylinders:'ALL THE CITY KNOWS IS KEPT IN THE SILOS OF '+title+' — PIPED, VALVED AND ACCOUNTED.',
  weathervanes:'THE ROOFTOP VANES OF '+title+' READ EVERY WIND BY NAME — SET THEM BEFORE THE STORM.',
  scriptorium:'IN THE SCRIPTORIUM OF '+title+' EVERY COPY IS TRUE — DRAFT OR PUBLISHED, IN EVERY TONGUE.',
  monolith:'IN THE EMPTY QUARTER STANDS THE MONOLITH — AND IT ANSWERS ONLY TO '+title+'. TYPE, TRAVELER.',
  helm:'ONE WHEEL STEERS THE WHOLE SHIP, AND THE WHEEL IS '+title+' — MIND YOUR HEADING.',
  atelier:'IN THE ATELIER OF '+title+' THE PANEL ITSELF SITS FOR ITS PORTRAIT — PAINT IT YOURS.',
  bluedesk:'BEFORE ANYTHING ROSE, THERE WAS THE DRAWING — AND THE DRAWING WAS '+title+'.',
  kitchen:'EVERY CARD ON THE RAIL OF '+title+' IS A DISH THAT HAS BEEN COOKED AND EATEN — FOLLOW ONE.',
  bazaar:'STALL BY STALL THE BAZAAR OF '+title+' CRIES ITS WARES — TAKE ONE HOME AND PLUG IT IN.',
  plugbay:'THE SOCKET OF '+title+' WAITS IN THE WALL — CARRY THE PLUG TRUE AND THE WHOLE WING LIGHTS.',
  automaton:'WIND THE KEY AND '+title+' ACTS IN ORDER — REGISTER, RISE, AND AT THE LAST, BOW OUT.',
  gauntlet:'NOTHING LEAVES THE GROUNDS OF '+title+' UNTRIED — THE DUMMY RIDES SO YOUR USERS NEEDN\'T.',
  safetynet:'THE WALK ABOVE '+title+' MAY FAIL — THAT IS WHY THE NET IS RIGGED, KNOTTED AND NAMED.',
  moulds:'ONE POUR FROM THE LADLE OF '+title+' AND A WHOLE TOWN COOLS INTO THE SAME GOOD SHAPE.',
  roundtable:'THE TABLE OF '+title+' IS ROUND FOR A REASON — ONE SHEET, MANY HANDS, NO HEAD SEAT.',
  kiosk:'ASK AT THE WINDOW OF '+title+' — THE CLERK HAS HEARD IT BEFORE AND THE ANSWER IS PINNED.',
  codex:'THE CODEX OF '+title+' IS CHAINED TO ITS LECTERN — NOT TO KEEP IT IN, TO KEEP IT TRUE.',
  gearworks:'MESH BY MESH THE WORKS OF '+title+' TAKE UP THE LOAD — ONE DIAL PER TRUTH, ONE LEVER PER CHOICE.',
  spanner:'EVERY SHOP IN THE CITY BORROWS THE SPANNER OF '+title+' — RETURN IT CLEAN.',
  skyharbor:'ABOVE THE WEATHER RIDES THE PLATFORM OF '+title+' — THE AIRSHIPS DOCK, THE CITY SHIPS.',
  ticker:'ALL NIGHT THE BAND OF '+title+' PRINTS WHAT THE HOUSE IS DOING — READ THE TAPE, KNOW THE TRUTH.',
  lighthouse:'THE BEAM OF '+title+' SWEEPS THE WHOLE ROADSTEAD — NO SHIP STRAYS UNSEEN.',
  gantry:'THE COUNT RUNS AT THE GANTRY OF '+title+' — BOLTS AWAY, STEAM UP, AND THE SHIP STANDS READY.',
  monogram:'IN THE OLD QUARTER STANDS THE LETTER OF '+title+', AND ITS HEADINGS STAND AROUND IT LIKE STONES.',
  };
  /* the crowded cycles never open twice on the same breath: each of the
     big families keeps a rack of openings, the page's genome deals one,
     and the page's OWN first word is worked into the line — two pages of
     one family can no longer read the same sentence */
  const tokT=(pfWords(title)[0]||'').toUpperCase();
  const mat=((d&&d.labels3&&d.labels3[0])||(d&&d.labels&&d.labels[0])||tokT||'THE FIRST PAGE');
  const matQ='"'+mat+'"', tokQ='"'+(tokT||mat)+'"';
  const V={
  edict:[L.edict,
    'NEW LAW IN THE QUARTER: '+title+'. WHAT STOOD YESTERDAY STANDS NO MORE.',
    'READ IT AND RE-RIG — '+title+'. THE OLD WAY IS STRUCK FROM THE BOOKS.',
    'BY ORDER OF VERSION FIVE: '+title+'. THE CLERKS COPY '+tokQ+' TWICE AND BURN THE OLD SHEET.',
    'THE CRIER STOPS AT EVERY CORNER: '+title+'. THE WORD '+tokQ+' WILL NOT BE SPOKEN THE OLD WAY.',
    'POSTED AT DAWN — '+title+'. THE QUARTER RE-RIGS AROUND '+tokQ+' BY DUSK.',
    'THE OLD PLAQUE COMES DOWN AND '+title+' GOES UP — '+tokQ+' IS THE FIRST WORD RECUT.',
    'ONE NAIL, ONE LAW: '+title+'. READ '+tokQ+' TWICE BEFORE YOU BUILD AGAIN.'],
  embassy:[L.embassy,
    title+' KEEPS ITS OWN HOUSE ON OUR STREET — SHOW YOUR PAPERS AND THE DOOR OPENS.',
    'THE FLAG OVER THE GATE IS FOREIGN, THE LEDGER INSIDE IS OURS: '+title+'.',
    'THE '+(tokT||'FOREIGN')+' HOUSE HOLDS ITS OWN COURT ON OUR STREET — '+title+' SEALS THE PAPERS.',
    'STAMP BY STAMP THE CLERKS OF '+title+' TRADE OUR NAMES FOR THEIRS — AND THE GATE HONORS BOTH.'],
  bridge:[L.bridge,
    'OLD BANK TO NEW BANK, ONE SPAN: '+title+' CARRIES EVERYTHING THAT CAN WALK.',
    'THE TOLL IS PAID IN CODEMODS — '+title+' CROSSES BEFORE NIGHTFALL.',
    'THE SPAN HOLDS. '+title+' WALKS FIRST, AND THE FIRST STATION PAST THE WATER IS '+matQ+'.',
    'NO ONE WINTERS ON THE OLD BANK — '+title+' CALLS THE COLUMN AND '+matQ+' ANSWERS FIRST.',
    'PLANK BY PLANK '+title+' PAYS THE CROSSING — THE FAR TOLLHOUSE ALREADY LETTERS '+matQ+'.'],
  plugbay:[L.plugbay,
    'THE WING IS DARK UNTIL THE PLUG SEATS TRUE — '+title+' KNOWS THE SOCKET.',
    'EVERY PIN IN ITS SLOT, EVERY WIRE ACCOUNTED: '+title+' GOES LIVE TONIGHT.',
    'THE FITTERS OF '+title+' WALK THE CONDUIT WITH '+matQ+' CHALKED ON THE FIRST JUNCTION.',
    'CARRY THE CABLE LOW AND THE NAME HIGH — '+title+' WIRES '+matQ+' BEFORE THE BELL.'],
  bluedesk:[L.bluedesk,
    'THE PLAN OF '+title+' IS PINNED AND LIT — WHAT RISES TOMORROW IS DRAWN TONIGHT.',
    'WHITE LINES ON BLUE: '+title+' MEASURED TWICE BEFORE ANY STONE MOVES.',
    'THE DRAUGHTSMEN OF '+title+' RULE THE FIRST BAY '+matQ+' BEFORE THE LAMPS GO OUT.'],
  gearworks:[L.gearworks,
    'EVERY DIAL IN THE WORKS OF '+title+' HAS A NAME — SET THEM AND THE HOUSE RUNS.',
    'THE WORKS OF '+title+' TAKE THE LOAD TOOTH BY TOOTH — NOTHING SLIPS.',
    'THE FIRST WHEEL OF '+title+' IS BORED FOR '+matQ+' — MESH IT AND THE REST FOLLOW.'],
  temple:[L.temple,
    'THE FOUR VERBS KEEP THE PORCH OF '+title+' — SPEAK THE RIGHT ONE AND ENTER.',
    'PILGRIMS QUEUE AT '+title+' WITH REQUESTS IN HAND — THE ANSWER IS CARVED IN JSON.',
    'THE FIRST STELE ON THE PORCH OF '+title+' IS CUT '+matQ+' — READ IT AND ASK RIGHT.'],
  atelier:[L.atelier,
    'THE PANEL SITS FOR ITS OWN PORTRAIT IN '+title+' — BRUSHES OUT, HOUSE LIGHTS UP.',
    'IN '+title+' THE CANVAS IS THE PRODUCT — PAINT IT TO THE HOUSE\'S TASTE.',
    'THE EASEL OF '+title+' TURNS TO THE LIGHT — '+matQ+' IS SKETCHED IN FIRST.'],
  magnetwell:[L.magnetwell,
    'DROP THE LINE INTO '+title+' AND EVERYTHING CHAINED COMES UP WITH IT.',
    'THE WELL OF '+title+' GIVES NOTHING UNASKED — NAME THE LINK AND HAUL.',
    'THE FIRST HAUL OUT OF '+title+' COMES UP TAGGED '+matQ+' — CHAIN AND ALL.'],
  gantry:[L.gantry,
    'STEAM UP AT '+title+' — THE BOLTS FALL AWAY AND THE SHIP STANDS ON FIRE.',
    'THE COUNT AT '+title+' RUNS BACKWARD TO ZERO — EVERYTHING AFTER IS SKY.',
    'THE CHECKLIST AT '+title+' OPENS ON '+matQ+' — TICK IT AND THE COUNT RUNS.'],
  constellation:[L.constellation,
    'THE NIGHT OVER '+title+' IS A LEDGER — ASK SHAPED, AND ONLY YOUR STARS ANSWER.',
    'ONE QUESTION, ONE CONSTELLATION: '+title+' LIGHTS NO STAR YOU DID NOT NAME.',
    'THE FIRST STAR NAMED OVER '+title+' IS '+matQ+' — THE REST WAIT TO BE ASKED.'],
  oracle:[L.oracle,
    'FEED THE SLOT OF '+title+' A QUESTION — THE RIBBON COMES BACK TRUE.',
    'THE ENGINE OF '+title+' ANSWERS IN INK — ASK PLAINLY AND READ THE TAPE.',
    'THE FIRST RIBBON OUT OF '+title+' READS '+matQ+' — THE MACHINE DOES NOT GUESS.'],
  skyharbor:[L.skyharbor,
    'THE PLATFORM OF '+title+' RIDES ABOVE THE WEATHER — DOCK, LOAD, SHIP.',
    'NO ROAD REACHES '+title+' — ONLY MOORING LINES AND THE MORNING PACKET.',
    'THE MORNING PACKET AT '+title+' IS STAMPED '+matQ+' — CAST OFF ON THE BELL.'],
  flags:[L.flags,
    'EVERY TONGUE IN THE PLAZA OF '+title+' TELLS THE SAME TRUTH IN ITS OWN CLOTH.',
    'HOIST ONE MEANING IN MANY COLOURS — THE PLAZA OF '+title+' READS THEM ALL.',
    'THE FIRST MAST IN THE PLAZA OF '+title+' FLIES '+matQ+' — THE REST ANSWER IN KIND.'],
  barge:[L.barge,
    'LOADED TO THE WATERLINE, '+title+' CROSSES WITH EVERY CRATE ACCOUNTED.',
    'THE MANIFEST OF '+title+' IS THE CARGO — NOTHING SHIPS UNLISTED.',
    'THE FIRST CRATE ABOARD '+title+' IS STENCILLED '+matQ+' — STOW IT LOW AND TRUE.'],
  tollroad:[L.tollroad,
    'GATE BY GATE THE ROAD OF '+title+' TAKES ITS DUE — PAY EACH OR TURN BACK.',
    'NO REQUEST RIDES PAST '+title+' UNSTAMPED — THE GATES KEEP THE ORDER.',
    'THE FIRST GATE ON THE ROAD OF '+title+' IS POSTED '+matQ+' — PAY IT AND RIDE.'],
  };
  const arr=V[sub];
  let line=arr?arr[((d&&d.gh)?(d.gh>>>16):0)%arr.length]:(L[sub]||L.monogram);
  /* THE UNIQUENESS LAW: every opening must carry material of ITS page
     beyond the title. If the dealt line has none left once the title is
     read out, a page-cut tail is added — so no two pages of a family can
     ever read the same sentence */
  const resid=line.split(title).join(' ');
  const hasOwn=(mat&&resid.indexOf(mat)>=0)||(tokT&&resid.indexOf(tokT)>=0);
  if(!hasOwn){
    /* the tail letters the page's SECOND word where it keeps one — two
       sibling pages that share a first heading still part ways here */
    const tm=((d&&d.labels3&&d.labels3[1])||(d&&d.labels&&d.labels[1])||mat);
    const tmQ='"'+tm+'"';
    const tw9=(tokT&&tokT!==mat&&('"'+tokT+'"'))||tmQ;
    const TAILS=[' FIRST ON THE BOARD: '+matQ+'.',
      ' THE FIRST SIGN IS LETTERED '+tmQ+'.',
      ' IT OPENS AT '+matQ+' AND CLOSES AT '+tmQ+'.',
      ' '+tw9+' HEADS THE ORDER OF THE DAY.',
      ' THE LETTERING BEGINS WITH '+tw9+'.',
      ' AND '+tmQ+' IS SERVED FIRST.'];
    line+=TAILS[hash32('opentail'+((d&&d.slug)||''))%TAILS.length];
  }
  return line;
}
/* ---- caption shelves: solved against THIS plate's own masses ---- */
function pfCapSlots(d,nCaps){
  /* sixteen berths, and the page's own genome decides which register the
     opening line prefers — the shelves stop living in the same three spots */
  const CAND=[
    [{top:'12px',left:'12px'},0.02,0.01,0.5,0.11],
    [{top:'12px',right:'12px'},0.48,0.01,0.5,0.11],
    [{top:'12px',left:'25%'},0.25,0.01,0.5,0.11],
    [{top:'13.5%',left:'12px'},0.02,0.135,0.46,0.10],
    [{top:'13.5%',right:'12px'},0.52,0.135,0.46,0.10],
    [{top:'26%',left:'12px'},0.02,0.26,0.46,0.10],
    [{top:'26%',right:'12px'},0.52,0.26,0.46,0.10],
    [{top:'40%',left:'12px'},0.02,0.40,0.44,0.10],
    [{top:'40%',right:'12px'},0.54,0.40,0.44,0.10],
    [{bottom:'36%',left:'12px'},0.02,0.54,0.44,0.10],
    [{bottom:'36%',right:'12px'},0.54,0.54,0.44,0.10],
    [{bottom:'24%',left:'12px'},0.02,0.66,0.46,0.10],
    [{bottom:'24%',right:'12px'},0.52,0.66,0.46,0.10],
    [{bottom:'12px',left:'12px'},0.02,0.87,0.5,0.11],
    [{bottom:'12px',right:'12px'},0.48,0.87,0.5,0.11],
    [{bottom:'12px',left:'25%'},0.25,0.87,0.5,0.11],
  ];
  const masses=[];
  const comp=d.comp||'vista';
  if(comp==='closeup'){
    masses.push([0.14,0.18,0.72,0.70]);           /* the giant subject */
  } else if(comp==='iris'){
    const rx=d.iris.r, ry=d.iris.r*0.78;
    masses.push([d.iris.cx-rx-0.02,d.iris.cy-ry-0.02,rx*2+0.04,ry*2+0.04]);
  } else if(comp==='panel'){
    if(d.panel.top) masses.push([0,0,1,1-d.panel.frac+0.02]);
    else masses.push([0,d.panel.frac-0.02,1,1-d.panel.frac+0.02]);
    masses.push([d.prime.x,d.panel.top?(1-d.panel.frac)+0.1:0.14,d.prime.w,d.panel.frac*0.7]);
  } else {
    masses.push(d.interior?[d.prime.x,0.24,d.prime.w,0.68]
              :[d.prime.x,d.hz+0.02,d.prime.w,0.90-d.hz]);
    if(d.interior) masses.push([d.fx<0.5?0.76:0.05,0.14,0.17,0.22]); /* the window */
    d.stations.forEach((st,i)=>{
      if(d.interior){ const L9=pfIntStations(d)[i];
        if(L9) masses.push(L9.anchor==='sign'?[L9.bx-0.13,L9.by-0.11,0.26,0.13]
                                             :[L9.bx-0.13,L9.by-0.015,0.26,0.10]); }
      else masses.push([st.fx-0.13,st.fy-0.11,0.26,0.13]);
    });
    /* painters that post their OWN signage: the solver must know their berths */
    const rig9=(d.rig||d.sub);
    if(rig9==='wires'&&!d.interior){
      const rcx=d.prime.x+d.prime.w/2, rw=d.prime.w;
      const sy9=d.hz+(1-d.hz)*0.36;
      [-0.44,0.02,0.46].forEach((dx9,i)=>{
        if(d.labels[i]) masses.push([rcx+dx9*rw-0.11,sy9-0.10,0.22,0.12]); });
    }
    if(rig9==='gearworks'){
      const GL9=pfGearLayout(d);
      for(const dl of GL9.dials) masses.push([dl.x-0.10,dl.y-0.035,0.20,0.095]);
      for(const g9 of GL9.gears) masses.push([g9.x-g9.r,g9.y-g9.r*0.72,g9.r*2,g9.r*1.44]);
    }
  }
  if(d.ribbon){ const c9=(d.gh>>>15)%4;
    masses.push([(c9%2)?0.72:0,(c9<2)?0:0.72,0.28,0.28]); }
  for(const f of d.figs) masses.push(f.box);
  const ov=(a,b)=>{ const w=Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0]);
    const h=Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1]);
    return (w>0&&h>0)?w*h:0; };
  const capw=Math.min(0.66,(d.capW||56)/100+0.04);
  const scored=CAND.map((c,i)=>{
    const r=[c[1],c[2],Math.max(c[3],capw),c[4]+0.02];
    let p=0; for(const m of masses) p+=ov(r,m)*26;
    /* the deterministic tiebreak walks with the page, not with the wall */
    p+=(((i*7+(d.capRot||0)*3))%CAND.length)*0.0009;
    return {i,c,p};
  });
  const used=new Set(), out=[];
  const rowOf=(c)=>Math.round(c[2]*8);
  const pickFrom=(pref)=>{
    let best=null;
    for(const s2 of scored){
      if(used.has(s2.i)) continue;
      const ry=s2.c[2];
      const bias=pref==='top'?(ry<0.2?-0.055:0)
               :pref==='mid'?(ry>=0.2&&ry<0.6?-0.055:0)
               :pref==='bottom'?(ry>=0.6?-0.055:0):0;
      const rowUsed=[...used].some(u=>rowOf(CAND[u])===rowOf(s2.c))?0.08:0;
      const score=s2.p+bias+rowUsed;
      if(!best||score<best.score) best={score,s2};
    }
    used.add(best.s2.i);
    /* the chosen shelf becomes a mass: no later caption may sit on it */
    const br=[best.s2.c[1]-0.02,best.s2.c[2]-0.02,Math.max(best.s2.c[3],capw)+0.04,best.s2.c[4]+0.06];
    masses.push(br);
    for(const s3 of scored){ if(used.has(s3.i)) continue;
      const r3=[s3.c[1],s3.c[2],Math.max(s3.c[3],capw),s3.c[4]+0.02];
      s3.p+=ov(r3,br)*80; }
    return best.s2.c[0];
  };
  /* the opener's register rotates with the genome; the rest follow round */
  const ORDERS=[['top','mid','bottom','any'],['mid','bottom','top','any'],
    ['bottom','top','mid','any']];
  const order=ORDERS[(d.capRot||0)%3];
  for(let i=0;i<Math.min(4,Math.max(1,nCaps));i++) out.push(pickFrom(order[i]));
  return out;
}
/* ---- the plate painter: passes stacked like lithography stones ---- */
function drawPlate(x,sc,W,H){
  const d=sc.plate.design; if(!d) return;
  const comp=d.comp||'vista';
  const painterId=(d.rig&&MOTIF_PAINT[d.rig])?d.rig:d.sub;
  const paintRig=(x2,R2,W2,H2)=>{
    try{ (MOTIF_PAINT[painterId]||MOTIF_PAINT.monogram)(x2,d,R2,W2,H2); }
    catch(e){ console.error('motif '+painterId,e); MOTIF_PAINT.monogram(x2,d,R2,W2,H2); }
    if(d.edict&&d.rig) pfVerdictPass(x2,d,R2,W2,H2);
  };
  const stage=(x2,W2,H2)=>{
    if(d.interior){ pfInteriorPass(x2,d,W2,H2); }
    else { pfSkyPass(x2,d,W2,H2); pfFarPass(x2,d,W2,H2); pfGroundPass(x2,d,W2,H2); }
  };
  let R={cx:(d.prime.x+d.prime.w/2)*W, w:d.prime.w*W};
  if(comp==='closeup'){
    /* the subject itself, drawn giant against the page's own field */
    pfFieldPass(x,d,W,H,true);
    R={cx:W*(0.40+((d.gh>>>25)%16)/100), w:W*0.52};
    const k=d.rigK, px=R.cx, py=H*0.78;
    x.save(); x.translate(px,py); x.scale(k,k); x.translate(-px,-py);
    paintRig(x,R,W,H);
    x.restore();
    pfTagsPass(x,d,W,H);
  } else if(comp==='iris'){
    /* the flat field, then the subject burning inside the lens */
    pfFieldPass(x,d,W,H,false);
    const icx=d.iris.cx*W, icy=d.iris.cy*H, ir=d.iris.r*Math.min(W,H);
    const cyRig=d.interior?H*0.60:(d.hz+(1-d.hz)*0.38)*H;
    const k=d.rigK;
    x.save();
    x.beginPath(); x.arc(icx,icy,ir,0,7); x.clip();
    x.translate(icx-R.cx*k, icy-cyRig*k); x.scale(k,k);
    stage(x,W,H);
    paintRig(x,R,W,H);
    x.restore();
    pfIrisRing(x,d,W,H);
  } else if(comp==='panel'){
    /* the main register and its predella of the page's own sections */
    const frac=d.panel.frac, top=d.panel.top;
    const mH=H*frac, oy=top?H*(1-frac):0;
    x.save(); x.beginPath(); x.rect(0,oy,W,mH); x.clip(); x.translate(0,oy);
    stage(x,W,mH);
    paintRig(x,{cx:R.cx,w:R.w},W,mH);
    x.restore();
    pfPredellaPass(x,d,W,H);
  } else {
    /* vista, worm, interior: the walked world */
    stage(x,W,H);
    pfStationsPass(x,d,W,H);
    const k=d.rigK||1;
    if(k>1.01){
      const px=R.cx, py=comp==='worm'?H*0.90:H*0.86;
      x.save(); x.translate(px,py); x.scale(k,k); x.translate(-px,-py);
      paintRig(x,R,W,H);
      x.restore();
    } else paintRig(x,R,W,H);
  }
  if(d.ribbon) pfEdictRibbon(x,d,W,H);
  if(d.terrain==='water'&&(comp==='vista'||comp==='worm')) for(const f of d.figs){
    const jx=(f.box[0]-0.03)*W, jw=(f.box[2]+0.06)*W, jy=(f.box[1]+f.box[3])*H+2;
    x.fillStyle='#6b4a2e'; x.fillRect(jx,jy,jw,7);
    x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(jx,jy,jw,7);
    x.fillRect(jx+4,jy+7,5,16); x.fillRect(jx+jw-9,jy+7,5,16);
    x.strokeStyle='rgba(246,239,221,.6)'; x.lineWidth=1.2;
    x.beginPath(); x.moveTo(jx-8,jy+18); x.quadraticCurveTo(jx+jw/2,jy+22,jx+jw+8,jy+17); x.stroke();
  }
  for(const f of d.figs){
    /* the ground shadow is dealt too: girth, squash and set-off walk with
       the page so no two heroes stand on the same dark puddle */
    const shk=(d.gh>>>6)%4;
    x.fillStyle=d.fieldDark?'rgba(12,10,6,.4)':'rgba(35,28,18,.28)';
    x.beginPath(); x.ellipse((f.box[0]+f.box[2]*0.5+(shk-1.5)*0.008)*W,(f.box[1]+f.box[3])*H+3,
      f.box[2]*W*(0.40+shk*0.07),f.box[3]*H*(0.034+(shk%2)*0.013),0,0,7); x.fill();
  }
  if(d.crowdN>2&&!d.interior&&(comp==='vista'||comp==='worm'))
    plateCrowd(x,clamp(d.hz+0.3,0,0.92)*H,W*0.05,W*0.26,d.seed^0xc0,Math.min(6,d.crowdN-2),1.2,true);
  /* the near dark and the painter's last pass wait for the figures */
  sc.plate.after=(x2)=>{
    pfFgPass(x2,d,W,H);
    if(d.vigStr>0){
      x2.save(); x2.globalAlpha=Math.min(1,d.vigStr);
      plateVignette(x2,W,H,d.fx,d.interior?0.48:Math.min(0.62,d.hz+0.12));
      x2.restore();
    }
  };
}
/* one page, one picture: the plate node, its captions on solved shelves */
function plateScene(series, slug, meta){
  meta=meta||{};
  const seed=hash32('plate'+slug);
  const cast=castFor(series);
  const rawTitle=String(meta.title||'THIS TALE').toUpperCase();
  /* a title that OPENS with a preposition cannot serve as the subject of
     a sentence — name it as a tale */
  const title=/^(WITH|USING|VIA|FROM|FOR|TO|IN|ON|BY|THROUGH|WITHOUT|INSIDE|OVER|UNDER)\s/.test(rawTitle)
    ? 'THE TALE CALLED "'+rawTitle+'"' : rawTitle;
  const d=pfDesign(slug, meta, series);
  const n=el('div','plate-art plate-f-'+d.sub);
  n.dataset.viz=1;
  /* THE ANNALS CAPTION IS DEAD (owner order): no ledger box, no citation
     count — a plate carries at most the opening myth line and, only where
     it earns its shelf, the one quoted teaser. The freed wall belongs to
     the art. */
  const caps=[pfOpenLine(d.sub,title,d)];
  const teaser=firstSentence(String(meta.teaser||''),150);
  if(teaser){
    /* the teaser earns its place only when it brings words the title and
       the opener did not already say — and only on a plate whose picture
       does not already speak plainly (dense lettered signage, or the
       page's own deal says the art keeps the whole wall) */
    const said=new Set(pfWords(title+' '+caps[0]).filter(w=>w.length>3));
    const fresh=pfWords(teaser).filter(w=>w.length>3&&!said.has(w));
    const lettered=(d.labels||[]).length+(d.labels3||[]).length+((d.pred||[]).length);
    const plainSpoken=lettered>=6||(hash32('capdeal'+slug)%3===0);
    if(fresh.length>=2&&!plainSpoken)
      caps.push('"'+bangify(teaser).toUpperCase()+'" — SO THE TALE ITSELF DECLARES.');
  }
  const slots=pfCapSlots(d,Math.min(2,caps.length));
  caps.slice(0,2).forEach((txt2,i)=>{
    const cb=el('div','platecap',esc(txt2));
    const s2=slots[i]||slots[slots.length-1];
    for(const k in s2) cb.style[k]=s2[k];
    cb.style.maxWidth=(d.capW||56)+'%';
    if(d.capDark){ cb.style.background='#241f16'; cb.style.color='#f2e7c9';
      cb.style.boxShadow='3px 3px 0 rgba(0,0,0,.5)'; }
    n.appendChild(cb);
  });
  n._sc={ seed, series, plate:{design:d, letter:cast.hero.letter},
    figures:d.figs, balloons:[] };
  return n;
}

/* ============ 9. covers — eight compositions, jittered per issue ============ */
function coverComp(slug,arch,danger,series){
  const d16=series?castFor(series).hero.design:null;
  const h=hash32('comp'+slug+(d16?('|'+d16.head):''));
  let comp;
  if(arch==='cosmic') comp=['cosmicburst','charge','motif','facecrop','duo','gallery'][h%6];
  else if(arch==='romance') comp=['facecrop','quiet','duo','gallery'][h%4];
  else if(arch==='tech') comp=['motif','gallery','charge'][h%3];
  else comp= danger? ['menace','duo','charge','motif'][h%4]
                   : ['charge','motif','facecrop','duo','gallery'][h%5];
  const bg={charge:'action',menace:'action',motif:'tech',cosmicburst:'cosmic',
    gallery:'tech',facecrop:'romance',duo:'action',quiet:'romance'}[comp];
  return {comp,bg,jit:h};
}
function starringSticker(x,R,u,name,low){
  const nm='STARRING '+name;
  x.font=`600 ${u*3.3}px Oswald,'Arial Narrow',sans-serif`;
  const tw=x.measureText(nm).width+u*4;
  x.save(); x.translate(R.x+u*2,R.y+R.h-u*(low?7.6:7.6)); x.rotate(-0.015);
  x.fillStyle='#f6efdd'; x.fillRect(0,0,tw,u*5.2);
  x.strokeStyle=INKC; x.lineWidth=u*0.4; x.strokeRect(0,0,tw,u*5.2);
  x.fillStyle=INKC; x.textAlign='left'; x.fillText(nm,u*2,u*3.8);
  x.restore();
}
function dangerVignette(x,R,u,slug,danger){
  const v=villainFor('caution',danger);
  const vw=R.w*0.36, vh=R.h*0.34;
  const vx0=R.x+R.w-vw-u*2, vy0=R.y+u*2;
  x.save();
  x.fillStyle='#efe3c2'; x.fillRect(vx0,vy0,vw,vh);
  x.beginPath(); x.rect(vx0,vy0,vw,vh); x.clip();
  const p=new Path2D(); p.rect(vx0,vy0,vw,vh);
  fillScreened(x,p,[[v.trim[0][0],.25]],null,2);
  drawVillain(x, v, {x:vx0+vw*0.06, y:vy0+vh*0.10, w:vw*0.9, h:vh*1.7},{seed:hash32(slug)});
  x.restore();
  x.strokeStyle=INKC; x.lineWidth=u*0.7; x.strokeRect(vx0,vy0,vw,vh);
  let nm=v.name+'!';
  x.font=`600 ${u*3.1}px Oswald,'Arial Narrow',sans-serif`;
  let tw=x.measureText(nm).width;
  if(tw>vw*1.06){ x.font=`600 ${u*2.6}px Oswald,'Arial Narrow',sans-serif`; tw=x.measureText(nm).width; }
  x.save(); x.translate(vx0+vw/2, vy0+vh-u*0.6); x.rotate(0.02);
  x.fillStyle='#c22a1c'; x.fillRect(-tw/2-u*1.6,-u*2.6,tw+u*3.2,u*5);
  x.strokeStyle=INKC; x.lineWidth=u*0.4; x.strokeRect(-tw/2-u*1.6,-u*2.6,tw+u*3.2,u*5);
  x.fillStyle='#fff'; x.textAlign='center'; x.fillText(nm,0,u*1.2); x.textAlign='left';
  x.restore();
}
/* every other title's hero, ready for a team-up cameo */
function heroesPool(exceptIdx){
  const out=[];
  for(const t of (S.M&&S.M.series)||[]){
    if(t.idx===exceptIdx) continue;
    const c=castFor(t);
    if(c.hero.design&&!c.hero.design.teambook) out.push({t,hero:c.hero});
  }
  return out;
}
/* UPGRADES, the TEAM BOOK: the great migration needs everyone — ensembles
   of the other titles' heroes, staged like the classic team-up covers */
function teamCover(x,series,R,rng,slug,danger,jit){
  const u=R.w/100;
  const pool=heroesPool(series.idx);
  if(!pool.length) return;
  const step=1+((jit>>>3)%3);
  const picks=[]; const used=new Set();
  let k=jit%pool.length;
  while(picks.length<Math.min(5,pool.length)){
    while(used.has(k%pool.length)) k++;
    used.add(k%pool.length); picks.push(pool[k%pool.length]); k+=step;
  }
  const mode=jit%3;
  if(mode===0){ /* the flying wedge */
    [picks[3],picks[4]].filter(Boolean).forEach((p,i)=>{
      const fh=R.h*0.42;
      drawFigure(x,p.hero,i?'raise':'stand',
        {x:R.x+R.w*(i?0.66:0.08),y:R.y+R.h*0.05,w:R.w*0.28,h:fh},
        {seed:jit^(i+40),noFx:true,shadow:false,flip:!!i});
    });
    [picks[1],picks[2]].forEach((p,i)=>{
      const fh=R.h*0.58;
      drawFigure(x,p.hero,i?'run':'point',
        {x:R.x+R.w*(i?0.55:0.01),y:R.y+R.h-fh-u*2,w:R.w*0.44,h:fh},
        {seed:jit^(i+7),flip:!!i});
    });
    const fh=R.h*0.72;
    drawFigure(x,picks[0].hero,(jit&8)?'leap':'fly',
      {x:R.x+R.w*0.21,y:R.y+R.h*0.09,w:R.w*0.58,h:fh},
      {seed:jit^3,withProp:true});
  } else if(mode===1){ /* the charging line, staggered */
    const poses=['run','leap','punch','point'];
    picks.slice(0,4).forEach((p,i)=>{
      const fh=R.h*(0.48+((jit>>>(i+2))%3)*0.07);
      drawFigure(x,p.hero,poses[(jit+i)%poses.length],
        {x:R.x+R.w*(0.60-i*0.185),y:R.y+R.h-fh-u*(2+i*3.4),w:R.w*0.40,h:fh},
        {seed:jit^(i*13),withProp:i===0});
    });
  } else { /* rally round the standard-bearer */
    const corners=[[0.02,0.06,'point',false],[0.70,0.05,'brace',true],
      [0.00,0.52,'run',false],[0.70,0.50,'warn',true]];
    picks.slice(1,5).forEach((p,i)=>{
      const c2=corners[i];
      const fh=R.h*0.44;
      drawFigure(x,p.hero,c2[2],
        {x:R.x+R.w*c2[0],y:R.y+R.h*c2[1],w:R.w*0.30,h:fh},
        {seed:jit^(i*29),noFx:true,flip:c2[3],shadow:i>1});
    });
    const fh=R.h*0.70;
    drawFigure(x,picks[0].hero,'herald',
      {x:R.x+R.w*0.27,y:R.y+R.h-fh-u*2,w:R.w*0.46,h:fh},
      {seed:jit^61,withProp:true});
  }
  if(danger) dangerVignette(x,R,u,slug,danger);
}
/* GETTING STARTED: the young recruit strides out front, the veterans
   watch from their cameo medallions and one walks the road beside her */
function recruitCover(x,series,R,rng,slug,danger,jit){
  const u=R.w/100;
  const cast=castFor(series);
  const pool=heroesPool(series.idx).filter(p=>!(p.hero.design&&p.hero.design.recruit));
  if(!pool.length) return;
  const vets=[]; const used=new Set();
  let k=(jit>>>2)%pool.length;
  while(vets.length<Math.min(3,pool.length)){
    while(used.has(k%pool.length)) k++;
    used.add(k%pool.length); vets.push(pool[k%pool.length]); k+=1+((jit>>>5)%2);
  }
  /* one veteran walks with the recruit, pointing the way forward */
  const vf=vets[2]||vets[0];
  const vh=R.h*0.52;
  drawFigure(x,vf.hero,'point',
    {x:R.x+R.w*0.52,y:R.y+R.h-vh-u*2.4,w:R.w*0.42,h:vh},
    {seed:jit^19,flip:true,noFx:true});
  /* the recruit, front and center */
  const fh=R.h*0.72;
  drawFigure(x,cast.hero,['point','run','leap'][jit%3],
    {x:R.x+R.w*0.05,y:R.y+R.h-fh-u*2,w:R.w*0.52,h:fh},
    {seed:jit^5});
  /* the cameo medallions ride the top of the art, classic fashion */
  vets.slice(0,2).forEach((p,i)=>{
    const mr=R.w*0.112;
    const mx=danger? R.x+u*2.4+mr : R.x+R.w-u*2.4-mr;
    const my=R.y+u*2.4+mr+i*(mr*2+u*2.6);
    x.fillStyle='#f6efdd';
    x.beginPath(); x.arc(mx,my,mr,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=u*0.8; x.stroke();
    x.save(); x.beginPath(); x.arc(mx,my,mr*0.95,0,7); x.clip();
    x.translate(mx-mr,my-mr*1.58);
    drawPortrait(x,'hero',p.t,mr*2,mr*2.5);
    x.restore();
  });
  if(danger) dangerVignette(x,R,u,slug,danger);
}
function coverFigures(x, series, R, arch, rng, drift, slug, danger, cc){
  const cast=castFor(series);
  const u=R.w/100;
  const comp=(cc&&cc.comp)||'charge';
  const jit=(cc&&cc.jit)||hash32(slug);
  const suitC=(cast.hero.design&&cast.hero.design.suitC)||comboRGB(cast.hero.suit);
  /* THE TWO MELTING-POT BOOKS (owner order): UPGRADES is the TEAM BOOK —
     its covers stage ensembles of the other heroes, classic team-up
     fashion; GETTING STARTED puts the young recruit under the veterans'
     cameos. Both keep per-issue variety through jit. */
  if(cast.hero.design&&cast.hero.design.teambook){
    teamCover(x,series,R,rng,slug,danger,jit);
    starringSticker(x,R,u,'THE WHOLE LINE-UP — ALL HANDS!');
    return;
  }
  if(cast.hero.design&&cast.hero.design.recruit){
    recruitCover(x,series,R,rng,slug,danger,jit);
    starringSticker(x,R,u,cast.hero.name+' AND THE VETERANS');
    return;
  }
  if(comp==='charge'){
    if(danger) dangerVignette(x,R,u,slug,danger);
    const pose=['run','leap','punch'][jit%3];
    const fh=R.h*0.80;
    drawFigure(x,cast.hero,pose,
      {x:R.x+R.w*(danger?0.02:0.10+((jit>>>3)%3)*0.04),y:R.y+R.h-fh-u*3,w:R.w*0.62,h:fh},
      {seed:hash32('cf'+slug),flip:!!(jit&64)&&!danger,withProp:pose!=='leap'});
  }
  else if(comp==='menace'){
    /* the villain looms across the whole sky; the hero runs at us */
    const v=villainFor('caution',danger||'');
    x.save();
    x.beginPath(); x.rect(R.x,R.y,R.w,R.h); x.clip();
    x.globalAlpha=0.92;
    drawVillain(x,v,{x:R.x+R.w*0.22,y:R.y-R.h*0.06,w:R.w*0.86,h:R.h*0.9},
      {seed:jit,flip:!!(jit&16)});
    x.globalAlpha=1;
    x.restore();
    /* name the menace in the sky */
    x.font=`600 ${u*3.4}px Oswald,'Arial Narrow',sans-serif`; x.textAlign='center';
    x.fillStyle='#f6efdd'; x.strokeStyle=INKC; x.lineWidth=u*0.9;
    x.strokeText(v.name+'!',R.x+R.w*0.62,R.y+u*6);
    x.fillText(v.name+'!',R.x+R.w*0.62,R.y+u*6); x.textAlign='left';
    const fh=R.h*0.56;
    drawFigure(x,cast.hero,'run',
      {x:R.x+R.w*0.04,y:R.y+R.h-fh-u*2,w:R.w*0.5,h:fh},{seed:jit^5});
  }
  else if(comp==='motif'){
    /* the terminal blown diagonally across the cover, hero vaulting it */
    x.save();
    x.beginPath(); x.rect(R.x,R.y,R.w,R.h); x.clip();
    x.translate(R.x+R.w*0.44,R.y+R.h*0.52); x.rotate(-0.17);
    const tw=R.w*0.92, th=R.h*0.5;
    x.fillStyle='rgba(35,28,18,.9)'; x.fillRect(-tw/2+u*1.6,-th/2+u*2,tw,th);
    x.fillStyle='#2e2a22'; x.fillRect(-tw/2,-th/2,tw,th);
    x.strokeStyle=INKC; x.lineWidth=u*0.9; x.strokeRect(-tw/2,-th/2,tw,th);
    x.fillStyle='#d9c8a2'; x.fillRect(-tw/2,-th/2,tw,u*4.4);
    x.strokeRect(-tw/2,-th/2,tw,u*4.4);
    for(let i=0;i<3;i++){ x.beginPath(); x.arc(-tw/2+u*(3+i*3.4),-th/2+u*2.2,u*1,0,7);
      x.fillStyle=['#c22a1c','#e9c81f','#5fae57'][i]; x.fill(); x.strokeStyle=INKC; x.lineWidth=u*0.3; x.stroke(); }
    x.font=`700 ${u*4.4}px "Courier Prime",monospace`; x.fillStyle='#9fe08a'; x.textAlign='left';
    x.fillText('> '+slug.slice(0,22), -tw/2+u*3, -th/2+u*10);
    x.fillStyle='#6cae5e';
    x.fillRect(-tw/2+u*3,-th/2+u*13,tw*0.5,u*1.4);
    x.fillRect(-tw/2+u*3,-th/2+u*17,tw*0.34,u*1.4);
    x.fillRect(-tw/2+u*3,-th/2+u*21,tw*0.44,u*1.4);
    x.fillRect(-tw/2+u*3,-th/2+u*25,tw*0.26,u*1.4);
    x.fillStyle='#9fe08a';
    x.fillText('> OK — 200 IN 12 MS', -tw/2+u*3, -th/2+u*31);
    x.fillStyle='#6cae5e';
    x.fillRect(-tw/2+u*3,-th/2+u*34,tw*0.38,u*1.4);
    /* blinking block cursor, mid-command */
    x.fillStyle='#9fe08a'; x.fillRect(-tw/2+u*3+tw*0.38+u*1.2,-th/2+u*33,u*2.2,u*2.6);
    x.restore();
    const fh=R.h*0.62;
    drawFigure(x,cast.hero,'leap',
      {x:R.x+R.w*0.24,y:R.y+u*2,w:R.w*0.60,h:fh},{seed:jit^9});
    /* the menace inset panel rides ON TOP — never swallowed by the motif */
    if(danger) dangerVignette(x,R,u,slug,danger);
  }
  else if(comp==='cosmicburst'){
    /* the hero explodes out of a paper burst PACKED with matter:
       radial beams, crackle bubbles, debris — never an empty void */
    const fh=R.h*0.80;
    const fx0=R.x+R.w*(0.03+((jit>>>4)%3)*0.03), fy0=R.y+R.h*0.10;
    const rng2=mulberry(jit^77);
    const bcx=fx0+R.w*0.46, bcy=fy0+fh*0.48;
    const bp=burstPath(bcx,bcy,R.w*0.44,fh*0.55,13,rng2,0.22);
    x.fillStyle='#f2e7c9'; x.fill(bp);
    x.strokeStyle=INKC; x.lineWidth=u*0.6; x.stroke(bp);
    x.save(); x.clip(bp);
    /* radial beams inside the paper */
    x.strokeStyle='rgba(35,28,18,.32)'; x.lineWidth=u*0.5;
    for(let i=0;i<18;i++){ const a=Math.PI*2*i/18+0.09;
      x.beginPath(); x.moveTo(bcx+Math.cos(a)*R.w*0.13,bcy+Math.sin(a)*R.w*0.10);
      x.lineTo(bcx+Math.cos(a)*R.w*0.58,bcy+Math.sin(a)*R.w*0.52); x.stroke(); }
    /* crackle bubbles drifting in along the rim */
    x.fillStyle=INKC;
    for(let i=0;i<16;i++){ const a=rng2()*Math.PI*2, rr2=R.w*(0.30+rng2()*0.14);
      x.beginPath(); x.arc(bcx+Math.cos(a)*rr2,bcy+Math.sin(a)*rr2*0.9,u*(0.7+rng2()*1.3),0,7); x.fill(); }
    x.restore();
    /* the star, big enough to press the burst edges */
    drawFigure(x,cast.hero,'fly',
      {x:fx0,y:fy0,w:R.w*0.94,h:fh},
      {seed:jit,flip:!!(jit&32)});
    /* debris chunks thrown past the rim */
    x.fillStyle=INKC;
    for(let i=0;i<7;i++){ const a=rng2()*Math.PI*2, rr2=R.w*(0.46+rng2()*0.1);
      x.save(); x.translate(bcx+Math.cos(a)*rr2,bcy+Math.sin(a)*rr2*0.85); x.rotate(rng2()*3);
      x.fillRect(-u*1.6,-u*0.8,u*3.2,u*1.6); x.restore(); }
  }
  else if(comp==='gallery'){
    /* anniversary-style: portrait medallion + two teaser insets */
    const mx=R.x+R.w*0.26, my2=R.y+R.h*0.30;
    x.beginPath(); x.arc(mx,my2,R.w*0.19,0,7);
    x.fillStyle='#f6efdd'; x.fill();
    x.strokeStyle=INKC; x.lineWidth=u*1; x.stroke();
    x.save(); x.beginPath(); x.arc(mx,my2,R.w*0.185,0,7); x.clip();
    x.translate(mx-R.w*0.20, my2-R.w*0.315);
    drawPortrait(x,'hero',series,R.w*0.40,R.w*0.50);
    x.restore();
    const P2=['terminal','key','db','gear','rocket','field'];
    [[R.x+R.w*0.52,R.y+u*4],[R.x+R.w*0.52,R.y+R.h*0.52]].forEach((pos,i)=>{
      const pw=R.w*0.42, ph=R.h*0.42;
      x.fillStyle='#efe3c2'; x.fillRect(pos[0],pos[1],pw,ph);
      x.strokeStyle=INKC; x.lineWidth=u*0.8; x.strokeRect(pos[0],pos[1],pw,ph);
      drawProp(x,P2[(jit+i*3)%P2.length],pos[0]+pw/2,pos[1]+ph/2,Math.min(pw,ph)*0.62,comboRGB(series.combo));
    });
    const fh=R.h*0.46;
    drawFigure(x,cast.hero,'point',
      {x:R.x+u*2,y:R.y+R.h-fh-u*2,w:R.w*0.44,h:fh},{seed:jit});
  }
  else if(comp==='facecrop'){
    /* the giant face, caught mid-emotion */
    const expr=danger?'grit':(['resolve','alarm','shout','scheme'][jit%4]);
    const styleMap={sentinel:'cowl',speedster:'speedster',cosmic:'cosmic',
      mystic:'mystic',gadgeteer:'gadget',titan:'mask'};
    const D=cast.hero.design;
    const hcx=R.x+R.w*0.40, hcy=R.y+R.h*0.375, hr=R.w*0.255;
    /* bust first: neck and shoulders so the giant head sits on a body */
    x.fillStyle=suitC;
    x.beginPath();
    x.moveTo(hcx-hr*1.7, R.y+R.h);
    x.quadraticCurveTo(hcx-hr*1.35, hcy+hr*1.05, hcx-hr*0.62, hcy+hr*1.00);
    x.lineTo(hcx+hr*0.66, hcy+hr*1.02);
    x.quadraticCurveTo(hcx+hr*1.45, hcy+hr*1.12, hcx+hr*1.8, R.y+R.h);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=u*0.8; x.stroke();
    /* spot black anchoring the shadow side of the bust */
    x.fillStyle=INKC;
    x.beginPath();
    x.moveTo(hcx+hr*0.66, hcy+hr*1.02);
    x.quadraticCurveTo(hcx+hr*1.45, hcy+hr*1.12, hcx+hr*1.8, R.y+R.h);
    x.lineTo(hcx+hr*1.02, R.y+R.h);
    x.quadraticCurveTo(hcx+hr*0.92, hcy+hr*1.32, hcx+hr*0.48, hcy+hr*1.05);
    x.closePath(); x.fill();
    drawHeadC(x,{cx:hcx,cy:hcy,r:hr,
      dir:jit%2?0.75:-0.62,tilt:(jit%5-2)*0.04,
      expr,style:D?D.head:(styleMap[cast.hero.arch]||'cowl'),
      suitC:(D&&D.helmC)||suitC,trimC:comboRGB(cast.hero.trim),lw:u*0.8,
      ident:cast.hero.ident,skin:cast.hero.ident&&cast.hero.ident.skin,
      hairC:D&&D.hairC,fem:!!(D&&D.fem),eyeC:D&&D.eyeC});
    /* the small figure racing along the bottom edge */
    const fh=R.h*0.34;
    x.save();
    x.fillStyle='#f6efdd';
    x.fillRect(R.x+R.w*0.60,R.y+R.h-fh-u*4,R.w*0.36,fh+u*2);
    x.strokeStyle=INKC; x.lineWidth=u*0.7;
    x.strokeRect(R.x+R.w*0.60,R.y+R.h-fh-u*4,R.w*0.36,fh+u*2);
    x.beginPath(); x.rect(R.x+R.w*0.60,R.y+R.h-fh-u*4,R.w*0.36,fh+u*2); x.clip();
    drawFigure(x,cast.hero,'run',{x:R.x+R.w*0.60,y:R.y+R.h-fh-u*3,w:R.w*0.36,h:fh},{seed:jit});
    x.restore();
  }
  else if(comp==='duo'){
    if(danger){
      const v=villainFor('caution',danger);
      drawVillain(x,v,{x:R.x+R.w*0.52,y:R.y+R.h*0.12,w:R.w*0.46,h:R.h*0.82},
        {seed:jit,flip:true});
      const fh=R.h*0.72;
      drawFigure(x,cast.hero,jit%2?'point':'brace',
        {x:R.x+u*2,y:R.y+R.h-fh-u*3,w:R.w*0.5,h:fh},{seed:jit});
    } else {
      const fh=R.h*0.76;
      drawFigure(x,cast.hero,jit%2?'point':'stand',
        {x:R.x+u*2,y:R.y+R.h-fh-u*3,w:R.w*0.54,h:fh},{seed:jit,withProp:true});
      /* every third duo is a GUEST-STAR issue: another title's hero drops
         by, team-up fashion — the rest keep PAGE the copy kid */
      const pool=(jit%3===2)?heroesPool(series.idx):null;
      if(pool&&pool.length){
        const guest=pool[(jit>>>4)%pool.length];
        const gh=R.h*0.62;
        drawFigure(x,guest.hero,jit%2?'stand':'point',
          {x:R.x+R.w*0.56,y:R.y+R.h-gh-u*3,w:R.w*0.42,h:gh},
          {seed:jit^33,flip:true,noFx:true});
      } else {
        drawSidekick(x,{x:R.x+R.w*0.60,y:R.y+R.h*0.40,w:R.w*0.34,h:R.h*0.56},
          jit%2?'point':'stand',{flip:true});
      }
    }
  }
  else { /* quiet */
    const pose=jit%2?'think':'stand';
    const fh=R.h*0.68;
    drawFigure(x,cast.hero,pose,
      {x:R.x+R.w*(0.16+((jit>>>5)%3)*0.08),y:R.y+R.h-fh-u*4,w:R.w*0.6,h:fh},
      {seed:jit,flip:!!(jit&8),withProp:pose==='stand'});
  }
  starringSticker(x,R,u,cast.hero.name);
}

/* ============ 10. the house ads — portals to the sibling projects ============ */
const SIBLINGS=[
  { dir:'../herbarium/', sig:'garden',
    cry:'AMAZING! GROW YOUR OWN', title:'DOCUMENTATION GARDEN', bang:'IT LIVES!',
    copy:'Just add water and WATCH IN WONDER as a whole documentation BLOOMS before your eyes — every leaf a real page, pressed and labelled by hand! So eager to grow they can even bear FRUIT!',
    coupon:'RUSH ME MY GARDEN KIT — I ENCLOSE NO MONEY, ONLY CURIOSITY',
    foot:'HERBARIUM SUPPLY CO. · GREENHOUSE STATION' },
  { dir:'../firstlight/', sig:'telescope',
    cry:'SEE THE STARS!', title:'100-POWER TELESCOPE', bang:'WOW!',
    copy:'The night sky of documentation — every page a star, every citation a constellation! Precision-ground optics show you nebulae of knowledge NO NAKED EYE has ever seen!',
    coupon:'SEND MY TELESCOPE TODAY — SATISFACTION ABSOLUTELY GUARANTEED',
    foot:'FIRST LIGHT OPTICAL · OBSERVATORY LANE' },
  { dir:'../pixelcity/', sig:'city',
    cry:'VISIT FABULOUS', title:'PIXEL CITY', bang:'FUN!',
    copy:'THE WORLD\'S FAIR OF DOCS! Ride the elevated line past 290 glittering towers! Thrills for the whole family — admission FREE, open ALL NIGHT, every window lit by a real page!',
    coupon:'MAIL ME THE OFFICIAL FAIR MAP AND SOUVENIR PENNANT',
    foot:'PIXEL CITY CHAMBER OF COMMERCE' },
  { dir:'../cartastrapiana/', sig:'ship',
    cry:'BOOK PASSAGE TODAY ON THE', title:'CARTA STRAPIANA', bang:'AHOY!',
    copy:'Sail uncharted documentation seas with a crew that knows every current! First-class cabins, engraved charts, and a porthole view of every page along the route!',
    coupon:'RESERVE MY BERTH — DEPARTURES DAILY FROM THIS VERY PAGE',
    foot:'STRAPIANA LINES TRAVEL AGENCY · PIER 4' },
  { dir:'../bythedeep/', sig:'matinee',
    cry:'SATURDAY MATINEE — NOW SHOWING', title:'BY THE DEEP', bang:'GASP!',
    copy:'The picture the whole town is talking about! DESCEND fathom by fathom into the documentation abyss — what waits at the bottom will AMAZE you! In glorious four-color!',
    coupon:'ADMIT ONE — CLIP THIS TICKET AND COME ON DOWN',
    foot:'THE DEEP PICTURE PALACE · TWO SHOWS SATURDAY' },
  { dir:'../longway/', sig:'trail',
    cry:'JOIN THE HIKING CLUB — TAKE', title:'THE LONG WAY THROUGH', bang:'ONWARD!',
    copy:'Lace your boots for the grandest walking tour in documentation! Marked trails, mountain views, a campfire tale at every waypoint — no page left unvisited!',
    coupon:'ENROLL ME — SEND BADGE, MAP AND MARCHING SONGBOOK',
    foot:'THE LONG WAY RAMBLERS ASSOCIATION' },
];
function adArt(x, sig, W, H, seed){
  const rng=mulberry(seed);
  const drift={C:[.8,-.6],M:[-.7,.8],Y:[.4,.3],K:[0,0]};
  const P2=(f)=>{const p=new Path2D(); f(p); return p;};
  x.strokeStyle=INKC;
  if(sig==='garden'){
    fillScreened(x,P2(p=>p.rect(0,H*0.62,W,H*0.38)),[['Y',.5],['C',.25]],drift,2);
    x.fillStyle='#c96f2a';
    x.beginPath(); x.moveTo(W*0.36,H*0.62); x.lineTo(W*0.64,H*0.62); x.lineTo(W*0.60,H*0.88); x.lineTo(W*0.40,H*0.88);
    x.closePath(); x.fill(); x.lineWidth=3; x.stroke();
    x.fillRect(W*0.34,H*0.58,W*0.32,H*0.05); x.strokeRect(W*0.34,H*0.58,W*0.32,H*0.05);
    for(let i=0;i<5;i++){
      const bx0=W*(0.42+i*0.045), sway=(i-2)*0.22;
      x.strokeStyle='#2c6e33'; x.lineWidth=4;
      x.beginPath(); x.moveTo(bx0,H*0.60);
      const ly=H*(0.16+rng()*0.12), lx=bx0+sway*60;
      x.quadraticCurveTo(bx0+sway*40, H*0.42, lx, ly); x.stroke();
      x.save(); x.translate(lx,ly); x.rotate(sway*0.4);
      x.fillStyle='#fdf8ea'; x.strokeStyle=INKC; x.lineWidth=2;
      x.fillRect(-16,-22,32,42); x.strokeRect(-16,-22,32,42);
      x.strokeStyle='#8d7c52'; x.lineWidth=1.4;
      for(let k=0;k<5;k++){ x.beginPath(); x.moveTo(-11,-14+k*8); x.lineTo(11,-14+k*8); x.stroke(); }
      x.restore();
    }
    for(let i=0;i<6;i++) starAt(x,W*(0.15+rng()*0.7),H*(0.1+rng()*0.4),5+rng()*5,'#e9c81f');
  }
  else if(sig==='telescope'){
    fillScreened(x,P2(p=>p.rect(0,0,W,H)),[['C',1],['K',.5]],drift,2);
    x.fillStyle='#f2e7c9';
    for(let i=0;i<70;i++){ const s=.8+rng()*2; x.fillRect(rng()*W,rng()*H*0.7,s,s); }
    for(let i=0;i<3;i++) starAt(x,W*(0.2+rng()*0.6),H*(0.08+rng()*0.3),6+rng()*6,'#f2e7c9');
    x.fillStyle=INKC; x.beginPath(); x.moveTo(0,H); x.lineTo(0,H*0.82);
    x.quadraticCurveTo(W*0.5,H*0.72,W,H*0.84); x.lineTo(W,H); x.closePath(); x.fill();
    const beam=P2(p=>{ p.moveTo(W*0.62,H*0.66); p.lineTo(W*0.90,H*0.06); p.lineTo(W*0.97,H*0.16); p.lineTo(W*0.67,H*0.71); p.closePath(); });
    fillScreened(x,beam,[['Y',.5]],drift,2);
    x.save(); x.translate(W*0.6,H*0.78); x.rotate(-0.62);
    x.fillStyle=INKC; x.fillRect(-9,-66,19,72);
    x.fillStyle='#f2e7c9'; x.fillRect(-9,-66,4,72);
    x.restore();
    x.strokeStyle=INKC; x.lineWidth=5;
    x.beginPath(); x.moveTo(W*0.6,H*0.82); x.lineTo(W*0.52,H*0.97); x.moveTo(W*0.6,H*0.82); x.lineTo(W*0.68,H*0.97); x.stroke();
    x.fillStyle=INKC;
    x.beginPath(); x.arc(W*0.47,H*0.74,9,0,7); x.fill();
    x.fillRect(W*0.44,H*0.76,18,24);
  }
  else if(sig==='city'){
    fillScreened(x,P2(p=>p.rect(0,0,W,H)),[['M',.5],['Y',.5]],drift,2);
    x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1.6;
    for(let i=0;i<12;i++){ const a=Math.PI+i*Math.PI/11;
      x.beginPath(); x.moveTo(W*0.5,H*0.86); x.lineTo(W*0.5+Math.cos(a)*W,H*0.86+Math.sin(a)*W); x.stroke(); }
    let bx0=4;
    while(bx0<W-30){
      const bw=18+rng()*34, bh=H*(0.2+rng()*0.45);
      const p=P2(pp=>pp.rect(bx0,H*0.86-bh,bw,bh));
      fillScreened(x,p,rng()<0.5?[['C',1],['M',.5]]:[['C',.5],['M',.25]],drift,2);
      x.strokeStyle=INKC; x.lineWidth=2.4; x.stroke(p);
      x.fillStyle='#e9c81f';
      for(let wy=H*0.86-bh+6; wy<H*0.83; wy+=9)
        for(let wx=bx0+4; wx<bx0+bw-4; wx+=8) if(rng()<0.6) x.fillRect(wx,wy,3.6,4.6);
      bx0+=bw+6;
    }
    x.strokeStyle=INKC; x.lineWidth=3;
    x.beginPath(); x.arc(W*0.82,H*0.5,H*0.22,0,7); x.stroke();
    x.lineWidth=1.6;
    for(let i=0;i<8;i++){ const a=i*Math.PI/4+0.3;
      const gx=W*0.82+Math.cos(a)*H*0.22, gy=H*0.5+Math.sin(a)*H*0.22;
      x.beginPath(); x.moveTo(W*0.82,H*0.5); x.lineTo(gx,gy); x.stroke();
      x.fillStyle=['#c22a1c','#e9c81f','#0e9ad6'][i%3];
      x.fillRect(gx-4,gy-3,8,7); x.strokeRect(gx-4,gy-3,8,7);
    }
    x.fillStyle=INKC; x.fillRect(0,H*0.86,W,3);
  }
  else if(sig==='ship'){
    fillScreened(x,P2(p=>p.rect(0,0,W,H*0.6)),[['C',.5]],drift,2);
    const sea=P2(p=>{ p.moveTo(0,H*0.6);
      for(let i=0;i<8;i++) p.quadraticCurveTo(W*(i+0.5)/8,H*(0.56+(i%2?0.05:0)),W*(i+1)/8,H*0.6);
      p.lineTo(W,H); p.lineTo(0,H); p.closePath(); });
    fillScreened(x,sea,[['C',1],['Y',.25]],drift,2);
    x.strokeStyle='#f2e7c9'; x.lineWidth=2;
    for(let i=0;i<5;i++){ x.beginPath();
      x.arc(W*(0.1+rng()*0.8),H*(0.66+rng()*0.24),8+rng()*10,Math.PI*1.1,Math.PI*1.9); x.stroke(); }
    x.save(); x.translate(W*0.5,H*0.56); x.rotate(-0.03);
    x.fillStyle='#8a5323'; x.strokeStyle=INKC; x.lineWidth=2.6;
    x.beginPath(); x.moveTo(-70,0); x.lineTo(70,0); x.lineTo(50,26); x.lineTo(-56,26); x.closePath();
    x.fill(); x.stroke();
    x.fillRect(-4,-58,5,58); x.strokeRect(-4,-58,5,58);
    x.fillRect(-46,-42,4,42); x.strokeRect(-46,-42,4,42);
    x.fillRect(40,-42,4,42); x.strokeRect(40,-42,4,42);
    for(const [mx,my,mw,mh] of [[-2,-56,44,20],[-44,-40,30,16],[42,-40,26,16]]){
      x.fillStyle='#fdf8ea';
      x.beginPath(); x.moveTo(mx,my); x.quadraticCurveTo(mx+mw*0.6,my+mh*0.5,mx,my+mh);
      x.lineTo(mx+mw,my+mh*0.82); x.quadraticCurveTo(mx+mw*0.5,my+mh*0.4,mx+mw,my+mh*0.12);
      x.closePath(); x.fill(); x.stroke();
    }
    x.fillStyle='#c22a1c';
    x.beginPath(); x.moveTo(1,-58); x.lineTo(20,-52); x.lineTo(1,-46); x.closePath(); x.fill(); x.stroke();
    x.restore();
    x.save(); x.translate(W*0.13,H*0.2);
    x.fillStyle='#f2e7c9'; x.beginPath(); x.arc(0,0,26,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
    for(let i=0;i<8;i++){ const a=i*Math.PI/4;
      x.beginPath(); x.moveTo(Math.cos(a)*24,Math.sin(a)*24);
      x.lineTo(Math.cos(a+0.35)*7,Math.sin(a+0.35)*7); x.lineTo(Math.cos(a-0.35)*7,Math.sin(a-0.35)*7);
      x.closePath(); x.fillStyle=i%2?INKC:'#c22a1c'; x.fill(); }
    x.restore();
  }
  else if(sig==='matinee'){
    fillScreened(x,P2(p=>p.rect(0,0,W,H)),[['C',1],['M',1]],drift,2);
    const beam=P2(p=>{ p.moveTo(W*0.5,0); p.lineTo(W*0.2,H); p.lineTo(W*0.8,H); p.closePath(); });
    fillScreened(x,beam,[['C',.5]],drift,2);
    x.fillStyle=INKC;
    x.beginPath(); x.moveTo(W*0.12,H*0.8);
    for(let i=0;i<4;i++){ x.quadraticCurveTo(W*(0.2+i*0.2),H*(i%2?0.62:0.9),W*(0.3+i*0.18),H*0.78); }
    x.lineTo(W*0.86,H*0.9); x.lineTo(W*0.1,H*0.92); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(W*0.72,H*0.78);
    x.quadraticCurveTo(W*0.86,H*0.6,W*0.78,H*0.4);
    x.quadraticCurveTo(W*0.74,H*0.3,W*0.82,H*0.26);
    x.quadraticCurveTo(W*0.9,H*0.36,W*0.88,H*0.52);
    x.quadraticCurveTo(W*0.86,H*0.72,W*0.8,H*0.84); x.closePath(); x.fill();
    x.fillStyle='#f2e7c9'; x.beginPath(); x.arc(W*0.81,H*0.32,2.6,0,7); x.fill();
    x.strokeStyle='rgba(242,231,201,.8)'; x.lineWidth=1.6;
    for(let i=0;i<8;i++){ x.beginPath(); x.arc(W*(0.3+rng()*0.4),H*rng()*0.5,2+rng()*4,0,7); x.stroke(); }
    x.fillStyle='#e9c81f';
    for(let i=0;i<Math.floor(W/18);i++){ x.beginPath(); x.arc(9+i*18,8,3,0,7); x.fill();
      x.beginPath(); x.arc(9+i*18,H-8,3,0,7); x.fill(); }
  }
  else if(sig==='trail'){
    fillScreened(x,P2(p=>p.rect(0,0,W,H*0.7)),[['C',.25],['Y',.25]],drift,2);
    const peaks=P2(p=>{ p.moveTo(0,H*0.62); p.lineTo(W*0.22,H*0.18); p.lineTo(W*0.4,H*0.52);
      p.lineTo(W*0.6,H*0.10); p.lineTo(W*0.82,H*0.5); p.lineTo(W,H*0.3); p.lineTo(W,H*0.7); p.lineTo(0,H*0.7); p.closePath(); });
    fillScreened(x,peaks,[['C',.5],['M',.25]],drift,2);
    x.strokeStyle=INKC; x.lineWidth=2.6; x.stroke(peaks);
    x.fillStyle='#fdf8ea';
    x.beginPath(); x.moveTo(W*0.6,H*0.10); x.lineTo(W*0.66,H*0.22); x.lineTo(W*0.54,H*0.22); x.closePath(); x.fill();
    fillScreened(x,P2(p=>p.rect(0,H*0.7,W,H*0.3)),[['Y',.5],['C',.5]],drift,2);
    x.strokeStyle='#fdf8ea'; x.lineWidth=8; x.lineCap='round';
    x.beginPath(); x.moveTo(W*0.1,H); x.quadraticCurveTo(W*0.5,H*0.78,W*0.4,H*0.72);
    x.quadraticCurveTo(W*0.34,H*0.66,W*0.6,H*0.56); x.stroke();
    x.strokeStyle=INKC; x.lineWidth=1.4; x.setLineDash([4,5]);
    x.beginPath(); x.moveTo(W*0.1,H); x.quadraticCurveTo(W*0.5,H*0.78,W*0.4,H*0.72);
    x.quadraticCurveTo(W*0.34,H*0.66,W*0.6,H*0.56); x.stroke(); x.setLineDash([]);
    x.fillStyle=INKC;
    x.beginPath(); x.arc(W*0.28,H*0.79,6,0,7); x.fill();
    x.fillRect(W*0.265,H*0.80,7,16);
    x.strokeStyle=INKC; x.lineWidth=3.4;
    x.beginPath(); x.moveTo(W*0.27,H*0.90); x.lineTo(W*0.245,H*0.97); x.moveTo(W*0.285,H*0.90); x.lineTo(W*0.31,H*0.965); x.stroke();
    x.lineWidth=2.2; x.beginPath(); x.moveTo(W*0.30,H*0.83); x.lineTo(W*0.335,H*0.97); x.stroke();
  }
  x.strokeStyle=INKC; x.lineWidth=3; x.strokeRect(1.5,1.5,W-3,H-3);
}
function starAt(x,cx,cy,r,color){
  x.save(); x.fillStyle=color||'#e9c81f';
  x.beginPath();
  x.moveTo(cx,cy-r); x.quadraticCurveTo(cx,cy,cx+r,cy); x.quadraticCurveTo(cx,cy,cx,cy+r);
  x.quadraticCurveTo(cx,cy,cx-r,cy); x.quadraticCurveTo(cx,cy,cx,cy-r); x.fill(); x.restore();
}
function sibAdPage(idx, dims){
  const ad=SIBLINGS[((idx%SIBLINGS.length)+SIBLINGS.length)%SIBLINGS.length];
  const page=el('div','cpage adpage clickable');
  const artW=dims.W-56, artH=Math.round(dims.H*0.42);
  page.appendChild(el('div','ad-cry', esc(ad.cry)));
  const tC=cvs(artW,74);
  { const x=tC.getContext('2d');
    drawLettering(x, ad.title, {x:artW/2,y:52,w:artW*0.96,size:44,color:'#c22a1c',
      style:'saladino',seed:hash32(ad.dir),arc:0.10,telescope:3}); }
  page.appendChild(tC);
  const art=cvs(artW,artH);
  { const x=art.getContext('2d');
    adArt(x, ad.sig, artW, artH, hash32('art'+ad.dir));
    const rng=mulberry(hash32('bang'+ad.dir));
    const bx=artW*0.84, by=artH*0.14;
    const p=burstPath(bx,by,42,27,10,rng,0.34);
    x.fillStyle='#e9c81f'; x.fill(p); x.strokeStyle=INKC; x.lineWidth=2.4; x.stroke(p);
    x.fillStyle=INKC; x.font='700 15px Oswald,sans-serif'; x.textAlign='center';
    x.fillText(ad.bang,bx,by+5); x.textAlign='left';
  }
  page.appendChild(art);
  page.appendChild(el('div','ad-copy', esc(ad.copy)));
  const coupon=el('div','ad-coupon');
  coupon.appendChild(el('div','ad-coupon-head','✂ CLIP THIS COUPON ✂'));
  coupon.appendChild(el('div','ad-coupon-line', esc(ad.coupon)));
  coupon.appendChild(el('div','ad-coupon-foot', esc(ad.foot)+' · THIS AD REALLY TRAVELS — CLICK ANYWHERE ON IT'));
  page.appendChild(coupon);
  page.appendChild(el('div','sp-indicia adfine',
    'Paid announcement. One of six crossings out of this newsstand; the others rotate through the back pages of every issue on the stand.'));
  page.addEventListener('click',e=>{ e.stopPropagation(); portalConfirm(ad); });
  return page;
}

/* the editor's box that guards every crossing: a portal is a portal */
function portalConfirm(ad){
  if(document.querySelector('.portal-confirm')) return;
  const prev=document.activeElement;
  const ov=el('div','portal-confirm');
  const box=el('div','pc-box');
  box.appendChild(el('div','pc-scissors','✂ — — — — — — — — — — — — — — ✂'));
  box.appendChild(el('div','pc-head','HOLD ON THERE, PILGRIM!'));
  box.appendChild(el('div','pc-copy',
    'An editor\u2019s note before you clip: this coupon is a genuine <b>PORTAL</b>. '+
    'Redeem it and you leave this newsstand entirely \u2014 next stop, '+
    '<b>'+esc(ad.title)+'</b>, a whole other world. '+
    'Are you certain you want to step through?'));
  const row=el('div','pc-row');
  const yes=el('button','pc-btn pc-yes','YES \u2014 SEND ME THROUGH!');
  const no=el('button','pc-btn pc-no','NO \u2014 I\u2019LL STAY ON THE STAND');
  row.appendChild(yes); row.appendChild(no);
  box.appendChild(row);
  box.appendChild(el('div','pc-fine','press Y to go \u00b7 N or ESC to stay \u00b7 offer void where prohibited by deadline'));
  ov.appendChild(box);
  const close=()=>{ ov.remove(); if(prev&&prev.focus) try{prev.focus();}catch(e){} };
  const go=()=>{ location.href=ad.dir; };
  yes.addEventListener('click',e=>{ e.stopPropagation(); go(); });
  no.addEventListener('click',e=>{ e.stopPropagation(); close(); });
  ov.addEventListener('click',e=>{ e.stopPropagation(); if(e.target===ov) close(); });
  ov.addEventListener('keydown',e=>{
    e.stopPropagation();
    const k=e.key.toLowerCase();
    if(k==='y'){ e.preventDefault(); go(); }
    else if(k==='n'||k==='escape'){ e.preventDefault(); close(); }
    else if(k==='tab'){ /* keep the two controls in the loop */
      e.preventDefault();
      (document.activeElement===yes?no:yes).focus();
    }
  });
  document.body.appendChild(ov);
  yes.focus();
}

/* ============ 10b. studio furniture for the back pages ============ */
function studioRow(x, W, H, nDesks, night, seed){
  const rng=mulberry(seed||44);
  /* the room */
  x.strokeStyle=INKC; x.lineWidth=1.6;
  x.beginPath(); x.moveTo(4,H-14); x.lineTo(W-4,H-14); x.stroke();
  /* the window, with the moon when this issue knew the night shift */
  if(night){
    x.strokeStyle=INKC; x.lineWidth=2;
    x.strokeRect(W-86,10,66,52);
    x.fillStyle='#2c2a3c'; x.fillRect(W-84,12,62,48);
    x.fillStyle='#f2e7c9';
    x.beginPath(); x.arc(W-58,32,10,0,7); x.fill();
    x.fillStyle='#2c2a3c';
    x.beginPath(); x.arc(W-54,29,8.6,0,7); x.fill();
    x.fillStyle='#f2e7c9';
    for(let i=0;i<8;i++){ const s=.8+rng()*1.2; x.fillRect(W-82+rng()*58,14+rng()*44,s,s); }
    x.strokeStyle=INKC; x.lineWidth=1.2;
    x.beginPath(); x.moveTo(W-53,12); x.lineTo(W-53,60); x.stroke();
  }
  const n=clamp(nDesks,1,6);
  const dw=Math.min(92,(W-30)/n);
  for(let i=0;i<n;i++){
    const dx0=14+i*dw+rng()*4, base=H-14;
    x.save(); x.translate(dx0,base);
    /* drawing table */
    x.strokeStyle=INKC; x.lineWidth=2.4; x.lineCap='round';
    x.beginPath(); x.moveTo(10,0); x.lineTo(16,-30); x.moveTo(52,0); x.lineTo(46,-34); x.stroke();
    x.beginPath(); x.moveTo(8,-30); x.lineTo(54,-38); x.stroke();
    x.fillStyle='#fdf8ea'; x.strokeStyle=INKC; x.lineWidth=1.5;
    x.save(); x.translate(30,-36); x.rotate(-0.14); x.fillRect(-12,-3,26,16); x.strokeRect(-12,-3,26,16); x.restore();
    /* the hunched hand at work, in silhouette */
    x.fillStyle=INKC;
    x.beginPath(); x.arc(-2,-44,7.2,0,7); x.fill();                    /* head */
    x.beginPath(); x.moveTo(-10,-14);
    x.quadraticCurveTo(-14,-40,-4,-38);
    x.quadraticCurveTo(10,-34,14,-28);
    x.lineTo(10,-12); x.closePath(); x.fill();                          /* back */
    x.strokeStyle=INKC; x.lineWidth=3.4;
    x.beginPath(); x.moveTo(8,-28); x.lineTo(20,-34); x.stroke();       /* arm to board */
    /* the lamp */
    x.strokeStyle=INKC; x.lineWidth=2;
    x.beginPath(); x.moveTo(58,-2); x.lineTo(58,-46); x.lineTo(44,-52); x.stroke();
    x.fillStyle=night?'#e9c81f':'#d9c8a2';
    x.beginPath(); x.moveTo(44,-52); x.lineTo(36,-42); x.lineTo(50,-44); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.4; x.stroke();
    x.restore();
  }
}
function mailStack(x, W, H, seed){
  const rng=mulberry(seed||9);
  for(let i=0;i<4;i++){
    const ex=14+i*((W-120)/4)+rng()*10, ey=H-30-i*10-rng()*6, ew=74, eh=26;
    x.save(); x.translate(ex,ey); x.rotate((rng()*2-1)*0.12);
    x.fillStyle='#fdf8ea'; x.strokeStyle=INKC; x.lineWidth=1.6;
    x.fillRect(0,0,ew,eh); x.strokeRect(0,0,ew,eh);
    x.beginPath(); x.moveTo(0,0); x.lineTo(ew/2,eh*0.55); x.lineTo(ew,0); x.stroke();
    x.restore();
  }
  /* the featured letter with its stamp and postmark */
  x.save(); x.translate(W-118,H-64); x.rotate(0.05);
  x.fillStyle='#fdf8ea'; x.strokeStyle=INKC; x.lineWidth=2;
  x.fillRect(0,0,104,52); x.strokeRect(0,0,104,52);
  x.strokeStyle='#8d7c52'; x.lineWidth=1.2;
  for(let i=0;i<3;i++){ x.beginPath(); x.moveTo(10,18+i*10); x.lineTo(62,18+i*10); x.stroke(); }
  x.fillStyle='#c22a1c'; x.strokeStyle=INKC; x.lineWidth=1.3;
  x.fillRect(76,6,20,16); x.strokeRect(76,6,20,16);
  x.strokeStyle='rgba(35,28,18,.6)'; x.lineWidth=1.2;
  x.beginPath(); x.arc(86,14,13,0,7); x.stroke();
  x.beginPath(); x.arc(86,14,17,0,7); x.stroke();
  x.restore();
}

/* ============ 11. deferred painting (no long tasks) ============ */
function paintScenes(root){
  if(!root) return;
  for(const n of root.querySelectorAll('.scene,.spot,.sp-scene,.plate-art')){
    if(n._sc && !n.dataset.painted && n.clientWidth){
      n.dataset.painted=1;
      try{ paintScene(n); }catch(e){ console.error('scene paint',e); }
    }
  }
  for(const k of root.querySelectorAll('.step')){
    if(k._paint && !k.dataset.painted && k.clientWidth){
      k.dataset.painted=1;
      try{ k._paint(); }catch(e){ console.error('step paint',e); }
    }
  }
}

return { castFor, villainFor, VILLAINS, drawFigure, drawSidekick, drawVillain,
  drawPortrait, drawProp, propFor, sceneNode, villainNode, stepSeq, spotNode,
  splashScene, plateScene, coverFigures, coverComp, SIBLINGS, sibAdPage, paintScenes, estBalloonH,
  studioRow, mailStack, drawHeadC, mouthAnchor, drawBackdrop, POSES, portalConfirm };
};
