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
function pfShort(s,n){
  s=String(s||'').replace(/\s+/g,' ').trim();
  if(s.length<=n) return s;
  const cut=s.slice(0,n);
  const sp=cut.lastIndexOf(' ');
  return (sp>n*0.5?cut.slice(0,sp):cut).replace(/[,;:]$/,'');
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
