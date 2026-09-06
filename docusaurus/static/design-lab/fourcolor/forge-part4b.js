embassy(x,d,R,W,H){
  /* the foreign gate: each provider keeps an embassy, each flies its sign */
  const hzY=d.hz*H, by=hzY+(H-hzY)*0.5;
  const bw=R.w*0.72, bh=H*0.34;
  const style=hash32('emb'+d.provider)%5;
  /* the house */
  x.fillStyle=d.night?'#33291f':'#a08a5f';
  x.fillRect(R.cx-bw/2,by-bh,bw,bh);
  x.strokeStyle=INKC; x.lineWidth=2.6; x.strokeRect(R.cx-bw/2,by-bh,bw,bh);
  if(style===0){ /* dome */
    x.fillStyle='#7f95b0'; x.beginPath(); x.arc(R.cx,by-bh,bw*0.26,Math.PI,0); x.fill();
    x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
    x.lineWidth=2; x.beginPath(); x.moveTo(R.cx,by-bh-bw*0.26); x.lineTo(R.cx,by-bh-bw*0.26-12); x.stroke();
  } else if(style===1){ /* spire */
    x.fillStyle='#8a3b2a';
    x.beginPath(); x.moveTo(R.cx-bw*0.2,by-bh); x.lineTo(R.cx,by-bh-bw*0.4);
    x.lineTo(R.cx+bw*0.2,by-bh); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
  } else if(style===2){ /* stepped gable */
    x.fillStyle='#a08a5f';
    for(let s2=0;s2<4;s2++){ const sw=bw*(0.66-s2*0.16);
      x.fillRect(R.cx-sw/2,by-bh-(s2+1)*10,sw,10);
      x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(R.cx-sw/2,by-bh-(s2+1)*10,sw,10); }
  } else if(style===3){ /* pagoda eave */
    x.fillStyle='#57553f';
    x.beginPath(); x.moveTo(R.cx-bw*0.42,by-bh);
    x.quadraticCurveTo(R.cx,by-bh-bw*0.24,R.cx+bw*0.42,by-bh);
    x.quadraticCurveTo(R.cx+bw*0.3,by-bh+6,R.cx-bw*0.3,by-bh+6);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
  } else { /* parapet flags */
    x.strokeStyle=INKC; x.lineWidth=2;
    for(let i=0;i<4;i++){ const fx2=R.cx-bw*0.3+i*bw*0.2;
      x.beginPath(); x.moveTo(fx2,by-bh); x.lineTo(fx2,by-bh-14); x.stroke();
      x.fillStyle=['#c22a1c','#e9c81f','#31647e','#5fae57'][i];
      x.beginPath(); x.moveTo(fx2,by-bh-14); x.lineTo(fx2+10,by-bh-11); x.lineTo(fx2,by-bh-8);
      x.closePath(); x.fill(); }
  }
  /* door + windows */
  x.fillStyle='#3a352b';
  x.beginPath(); x.moveTo(R.cx-bw*0.09,by); x.lineTo(R.cx-bw*0.09,by-bh*0.3);
  x.arc(R.cx,by-bh*0.3,bw*0.09,Math.PI,0); x.lineTo(R.cx+bw*0.09,by); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
  pfWindowGlow(x,R.cx-bw*0.3,by-bh*0.62,bw*0.13,bh*0.2,d.night);
  pfWindowGlow(x,R.cx+bw*0.3,by-bh*0.62,bw*0.13,bh*0.2,d.night);
  /* THE EMBLEM — the provider's own drawn mark, large on the facade */
  pfEmblem(x,d.provider,R.cx,by-bh*0.66,bw*0.17);
  /* the name banner and the venue sign */
  pfBanner(x,R.cx,by-bh-26,String(d.provider).replace(/-/g,' ').toUpperCase(),
    {tone:'#8a3b2a',s:1,maxW:bw*0.9,h:22});
  pfSign(x,R.cx-bw*0.72,by+6,d.venue||'THE GATE',{s:0.95,post:24,maxW:120});
  /* the customs rope where papers are shown */
  x.strokeStyle=INKC; x.lineWidth=2.2;
  x.beginPath(); x.moveTo(R.cx+bw*0.62,by+8); x.lineTo(R.cx+bw*0.62,by-22); x.stroke();
  x.strokeStyle='#8a3b2a'; x.lineWidth=2.2;
  x.beginPath(); x.moveTo(R.cx+bw*0.62,by-20);
  x.quadraticCurveTo(R.cx+bw*0.4,by-10,R.cx+bw*0.18,by-16); x.stroke();
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
  x.fillStyle='#44403a'; x.fillRect(R.cx-pw*0.36,by-H*0.34,pw*0.72,H*0.34);
  x.strokeStyle=INKC; x.lineWidth=2.8; x.strokeRect(R.cx-pw*0.36,by-H*0.34,pw*0.72,H*0.34);
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
