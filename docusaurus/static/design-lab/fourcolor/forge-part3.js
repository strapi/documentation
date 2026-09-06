/* ---- the weathered stage: sky, far plane, ground — all from the design ---- */
function pfP2(f){ const p=new Path2D(); f(p); return p; }
function pfSkyPass(x,d,W,H){
  const hzY=d.hz*H, seed=d.seed;
  /* banded sky by the page's hour */
  if(d.night){
    fillScreened(x,pfP2(p=>p.rect(0,0,W,hzY)),[['C',.5],['K',.5]],null,2);
    x.fillStyle='rgba(20,18,34,.42)'; x.fillRect(0,0,W,hzY);
    plateStars(x,W,H,seed,20+((seed>>>6)%14),hzY*0.85);
    const mx=W*(0.14+((d.h>>>4)%60)/100), my=hzY*(0.16+((d.h>>>8)%22)/100);
    x.fillStyle='#f6efdd'; x.beginPath(); x.arc(mx,my,20+((d.h>>>5)%10),0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
    if((d.h>>>10)%2){ x.fillStyle='rgba(22,20,36,.94)';
      x.beginPath(); x.arc(mx+10,my-4,19+((d.h>>>5)%10),0,7); x.fill(); }
  } else if(d.dusk){
    fillScreened(x,pfP2(p=>p.rect(0,0,W,hzY*0.5)),[['C',.5],['M',.5]],null,2);
    fillScreened(x,pfP2(p=>p.rect(0,hzY*0.44,W,hzY*0.34)),[['M',.5]],null,2);
    fillScreened(x,pfP2(p=>p.rect(0,hzY*0.74,W,hzY*0.30)),[['Y',.5],['M',.25]],null,2);
    const sx=W*(0.2+((d.h>>>4)%60)/100);
    x.fillStyle='#e9c81f'; x.beginPath(); x.arc(sx,hzY*0.92,26,Math.PI,0,false); x.fill();
    x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
    x.fillStyle='rgba(233,160,60,.16)'; x.fillRect(0,0,W,hzY);
  } else if(d.dawn){
    fillScreened(x,pfP2(p=>p.rect(0,0,W,hzY*0.55)),[['C',.25],['M',.25]],null,2);
    fillScreened(x,pfP2(p=>p.rect(0,hzY*0.5,W,hzY*0.55)),[['Y',.25],['M',.25]],null,2);
    const sx=W*(0.6+((d.h>>>4)%30)/100);
    x.fillStyle='#f2d789'; x.beginPath(); x.arc(sx,hzY*0.85,20,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
    x.strokeStyle='rgba(242,215,137,.6)'; x.lineWidth=1.4;
    for(let i=0;i<5;i++){ x.beginPath(); x.moveTo(sx-46+i*20,hzY*0.85-30-(i%2)*8);
      x.lineTo(sx-38+i*20,hzY*0.85-42-(i%2)*8); x.stroke(); }
  } else {
    fillScreened(x,pfP2(p=>p.rect(0,0,W,hzY*0.6)),[['C',.5]],null,2);
    fillScreened(x,pfP2(p=>p.rect(0,hzY*0.55,W,hzY*0.5)),[['C',.25]],null,2);
    const sx=W*(0.15+((d.h>>>4)%70)/100);
    x.fillStyle='#e9c81f'; x.beginPath(); x.arc(sx,hzY*0.3,19,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
    x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1.4;
    for(let i=0;i<10;i++){ const a=i*Math.PI/5;
      x.beginPath(); x.moveTo(sx+Math.cos(a)*25,hzY*0.3+Math.sin(a)*25);
      x.lineTo(sx+Math.cos(a)*(32+(i%2)*6),hzY*0.3+Math.sin(a)*(32+(i%2)*6)); x.stroke(); }
  }
  /* the page's own weather: clouds by its bulk, streaks by its cautions */
  const banks=[];
  for(let i=0;i<d.weather.clouds;i++)
    banks.push([W*(0.12+((hash32('cl'+d.slug+i))%70)/100), hzY*(0.2+((hash32('cy'+d.slug+i))%40)/100),
      0.8+((hash32('cs'+d.slug+i))%50)/100, d.night||d.dusk?((i%2)===1):false]);
  if(banks.length) plateClouds(x,W,seed,banks);
  plateSkyTex(x,W,hzY*0.1,hzY*0.7,seed,
    d.night?'rgba(120,130,190,.30)':d.dusk?'rgba(255,214,140,.4)':'rgba(253,248,234,.5)',
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
    plateCity(x,W,hzY+2,H*0.20,seed^3,
      {fill:d.night?'#241f16':'#4a4436', win:d.night?'#e9c81f':'rgba(35,28,18,.5)',
       winDensity:d.night?0.55:0.4});
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
  const mix=d.terrain==='desert'?[['Y',.5],['M',.25]]
          :d.terrain==='field'?[['Y',.5]]
          :d.terrain==='hills'?[['Y',.25],['C',.25]]
          :[[ (d.series&&d.series.combo&&d.series.combo[0][0])||'C',.25]];
  fillScreened(x,pfP2(p=>p.rect(0,hzY+2,W,H-hzY)),mix,null,2);
  if(d.night){ x.fillStyle='rgba(22,20,34,.30)'; x.fillRect(0,hzY+2,W,H-hzY); }
  plateGroundTex(x,W,hzY+H*0.05,H*0.9,d.seed,
    d.terrain==='city'?'cobble':d.terrain==='field'?'tuft':d.terrain==='desert'?'crack':'tuft');
}
function pfInteriorPass(x,d,W,H){
  /* a period room: papered wall, moulding, one window keeping the hour */
  const seed=d.seed, flY=H*0.76;
  const wallMix=[[ (d.series&&d.series.combo&&d.series.combo[0][0])||'M',.25]];
  fillScreened(x,pfP2(p=>p.rect(0,0,W,flY)),wallMix,null,2);
  if(d.night){ x.fillStyle='rgba(30,26,40,.22)'; x.fillRect(0,0,W,flY); }
  /* wainscot + picture rail */
  x.strokeStyle='rgba(35,28,18,.6)'; x.lineWidth=2;
  x.beginPath(); x.moveTo(0,flY-H*0.16); x.lineTo(W,flY-H*0.16); x.stroke();
  x.lineWidth=1.2; x.beginPath(); x.moveTo(0,H*0.14); x.lineTo(W,H*0.14); x.stroke();
  fillScreened(x,pfP2(p=>p.rect(0,flY-H*0.155,W,H*0.155)),[['K',.25]],null,2);
  /* the window sits away from the prime mass and shows the sky's hour */
  const winX=d.fx<0.5?W*0.82:W*0.14, winW=W*0.15, winH=H*0.2, winY=H*0.2;
  x.save();
  x.fillStyle=d.night?'#1d2038':d.dusk?'#d98e4a':d.dawn?'#e8c98f':'#bcd6e2';
  x.fillRect(winX-winW/2,winY,winW,winH);
  x.beginPath(); x.rect(winX-winW/2,winY,winW,winH); x.clip();
  if(d.night){ plateStars(x,W,H,seed^9,6,winY+winH,winX-winW/2,winX+winW/2);
    x.fillStyle='#f6efdd'; x.beginPath(); x.arc(winX+winW*0.2,winY+winH*0.3,7,0,7); x.fill(); }
  else { x.fillStyle=d.dusk?'#e9c81f':'#f6efdd';
    x.beginPath(); x.arc(winX-winW*0.15,winY+winH*(d.dusk?0.72:0.3),8,0,7); x.fill(); }
  x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1.2;
  x.beginPath(); x.moveTo(winX-winW/2,winY+winH*0.8); x.lineTo(winX+winW/2,winY+winH*0.75); x.stroke();
  x.restore();
  x.strokeStyle=INKC; x.lineWidth=2.6; x.strokeRect(winX-winW/2,winY,winW,winH);
  x.lineWidth=1.4;
  x.beginPath(); x.moveTo(winX,winY); x.lineTo(winX,winY+winH);
  x.moveTo(winX-winW/2,winY+winH/2); x.lineTo(winX+winW/2,winY+winH/2); x.stroke();
  /* light falls into the room from the window */
  const lg=x.createLinearGradient(winX,winY,winX+(d.fx<0.5?-1:1)*W*0.3,flY);
  lg.addColorStop(0,d.night?'rgba(210,220,255,.12)':'rgba(255,244,200,.20)');
  lg.addColorStop(1,'rgba(255,244,200,0)');
  x.fillStyle=lg;
  x.beginPath(); x.moveTo(winX-winW/2,winY); x.lineTo(winX+winW/2,winY);
  x.lineTo(winX+(d.fx<0.5?-1:1)*W*0.34+winW,flY); x.lineTo(winX+(d.fx<0.5?-1:1)*W*0.34-winW,flY);
  x.closePath(); x.fill();
  /* floorboards */
  fillScreened(x,pfP2(p=>p.rect(0,flY,W,H-flY)),[['Y',.25],['M',.25]],null,2);
  x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1.2;
  for(let i=0;i<6;i++){ const fy2=flY+4+i*(H-flY)/6;
    x.beginPath(); x.moveTo(0,fy2); x.lineTo(W,fy2); x.stroke(); }
  for(let i=0;i<8;i++){ const fx2=W*((seed>>>(i&13))%100)/100;
    x.beginPath(); x.moveTo(fx2,flY+4+(i%5)*(H-flY)/6); x.lineTo(fx2,flY+4+((i%5)+1)*(H-flY)/6); x.stroke(); }
  if(d.night) pfLamp(x,d.fx<0.5?W*0.68:W*0.30,flY,1.1,true);
}
function pfStationsPass(x,d,W,H){
  /* the page's REAL h2 headings step into the picture as lettered furniture */
  let i=0;
  for(const st of d.stations){
    const sx=st.fx*W, sy=st.fy*H;
    if(d.interior){
      /* wall plaques under the picture rail */
      pfBanner(x,sx,H*0.155,st.text,{tone:i%2?'#31647e':'#8a3b2a',s:0.92,maxW:W*0.24});
    } else {
      pfSign(x,sx,sy,st.text,{s:0.94,ang:((hash32('sa'+d.slug+i)%9)-4)*0.012,
        tone:i%2?'#e8d9ac':'#d9c8a2',maxW:W*0.26,post:20+(i%3)*7});
    }
    i++;
  }
}
function pfFgPass(x,d,W,H){
  /* the near dark: a spot-black threshold the reader stands behind */
  const seed=d.seed;
  x.fillStyle=INKC;
  const kind=d.interior?'floor':
    d.terrain==='water'?'reeds':d.terrain==='desert'?'dune':
    d.terrain==='sky'?'sill':d.terrain==='field'?'grass':'parapet';
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
