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
  /* the filtering works: everything pours in, only the asked-for falls out */
  const cy=H*0.34;
  /* the feed chute */
  x.fillStyle='#8d8266';
  x.beginPath(); x.moveTo(R.cx-R.w*0.5,H*0.14); x.lineTo(R.cx-R.w*0.1,cy-30);
  x.lineTo(R.cx-R.w*0.1,cy-18); x.lineTo(R.cx-R.w*0.5,H*0.19); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
  /* tokens tumbling in */
  const GLY=['{a}','{b}','#12','TXT','[0]','{x}'];
  for(let i=0;i<6;i++){
    const t2=i/5, tx=R.cx-R.w*(0.44-t2*0.3), ty2=H*(0.13+t2*0.1)+((d.seed>>>i)%8);
    x.fillStyle=['#e9c81f','#7f95b0','#d9c8a2'][i%3];
    x.fillRect(tx-9,ty2-7,18,14);
    x.strokeStyle=INKC; x.lineWidth=1.3; x.strokeRect(tx-9,ty2-7,18,14);
    x.fillStyle=INKC; x.font='700 7px "Courier Prime",monospace'; x.textAlign='center';
    x.fillText(GLY[i],tx,ty2+2.6); x.textAlign='left';
  }
  /* THE FUNNEL, riveted */
  x.fillStyle='#7d7357';
  x.beginPath(); x.moveTo(R.cx-R.w*0.24,cy-20); x.lineTo(R.cx+R.w*0.24,cy-20);
  x.lineTo(R.cx+R.w*0.05,cy+H*0.14); x.lineTo(R.cx-R.w*0.05,cy+H*0.14); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2.6; x.stroke();
  x.fillStyle=INKC;
  for(let i=0;i<5;i++){ x.beginPath(); x.arc(R.cx-R.w*0.18+i*R.w*0.09,cy-12,1.6,0,7); x.fill(); }
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
    x.save(); x.translate(R.cx+R.w*0.26+i*10,cy+H*0.3+((d.seed>>>i)%10)); x.rotate(0.4*((i%3)-1));
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
  x.beginPath(); x.moveTo(R.cx-R.w*0.36-16,gy); x.lineTo(R.cx-R.w*0.36-10,gy-H*0.3);
  x.lineTo(R.cx-R.w*0.36+10,gy-H*0.3); x.lineTo(R.cx-R.w*0.36+16,gy); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
  x.fillStyle='#b9ab84';
  x.beginPath(); x.moveTo(R.cx-R.w*0.36-10,gy-H*0.3); x.lineTo(R.cx-R.w*0.36,gy-H*0.345);
  x.lineTo(R.cx-R.w*0.36+10,gy-H*0.3); x.closePath(); x.fill(); x.stroke();
  pfColumn(x,R.cx+R.w*0.36,gy,26,H*0.28,'#d9c8a2');
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
    x.strokeStyle=INKC; x.lineWidth=4.4;
    x.beginPath(); x.ellipse(0,0,10,6,0,0,7); x.stroke();
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
  const locs=(d.labels3.filter(l2=>l2.length<=8).length?d.labels3.filter(l2=>l2.length<=8):['EN','FR','DE','JA','PT']);
  const n=clamp(locs.length,4,6);
  for(let i=0;i<n;i++){
    const t2=i/(n-1), fx2=R.cx-R.w*0.44+t2*R.w*0.88;
    const fy2=gy+((i%2)?H*0.06:H*0.02);
    pfFlag(x,fx2,fy2,H*(0.16+(i%2)*0.03),pfShort(locs[i%locs.length],7),
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
  x.beginPath(); x.moveTo(0,H); x.lineTo(0,hzY+H*0.10);
  x.quadraticCurveTo(R.cx-R.w*0.1,hzY+H*0.02,R.cx+R.w*0.24,hzY+H*0.12);
  x.lineTo(R.cx+R.w*0.3,H); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
  /* the mast */
  const mx=R.cx-R.w*0.06, my=hzY+H*0.06;
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
  const cw2=Math.min(R.w*0.8/n*0.8,86);
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
  const ry=H*0.62;
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
  const vars=(d.labels3.filter(l2=>/[A-Z]_|URL|HOST|PORT|KEY|ENV/.test(l2)).length?
    d.labels3.filter(l2=>/[A-Z]_|URL|HOST|PORT|KEY|ENV/.test(l2)):
    (d.labels.length?d.labels:['HOST','PORT','APP_KEYS']));
  const masts=[[R.cx-R.w*0.1,ry,3],[R.cx+R.w*0.14,ry+8,2],[R.cx-R.w*0.38,ry+26,1]];
  masts.forEach(([mx,my,kind],i)=>{
    x.strokeStyle=INKC; x.lineWidth=2.6;
    x.beginPath(); x.moveTo(mx,my); x.lineTo(mx,my-44-i*6); x.stroke();
    x.lineWidth=1.6;
    x.beginPath(); x.moveTo(mx-10,my-30-i*6); x.lineTo(mx+10,my-30-i*6); x.stroke();
    x.save(); x.translate(mx,my-44-i*6); x.rotate(((d.seed>>>(i*4))%7-3)*0.16);
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
    pfBanner(x,mx,my-24-i*6,pfShort(vars[i%vars.length],14),{tone:i%2?'#31647e':'#57553f',s:0.72,maxW:96,h:14,rod:false});
  });
  /* the wind made visible, one direction for all */
  x.strokeStyle='rgba(246,239,221,.7)'; x.lineWidth=1.8;
  for(let i=0;i<3;i++){ x.beginPath(); x.moveTo(R.cx-R.w*0.5+i*24,H*0.30+i*14);
    x.quadraticCurveTo(R.cx-R.w*0.2+i*24,H*0.27+i*14,R.cx+R.w*0.1+i*24,H*0.30+i*14); x.stroke(); }
},
monolith(x,d,R,W,H){
  /* the desert terminal: carved with this page's own commands */
  const hzY=d.hz*H, by=hzY+(H-hzY)*0.55;
  const mw=R.w*0.34, mh=H*0.42;
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
  /* the customization atelier: the panel itself is on the easel */
  const by=H*0.82;
  /* the big easel with the admin screen as canvas */
  const ex=R.cx-R.w*0.08, ew=R.w*0.44, eh=H*0.3;
  x.strokeStyle=INKC; x.lineWidth=3.4;
  x.beginPath(); x.moveTo(ex-ew*0.5,by); x.lineTo(ex,by-eh-30); x.lineTo(ex+ew*0.5,by); x.stroke();
  x.beginPath(); x.moveTo(ex,by-eh-30); x.lineTo(ex,by-8); x.stroke();
  x.fillStyle='#fdf8ea'; x.fillRect(ex-ew/2,by-eh-14,ew,eh);
  x.strokeStyle=INKC; x.lineWidth=2.4; x.strokeRect(ex-ew/2,by-eh-14,ew,eh);
  /* the painted UI: header bar, side nav, content — half still pencil */
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
  /* the sub-craft on the side table: this page's own department */
  const t2=(d.m.title||'').toLowerCase();
  const tx=R.cx+R.w*0.34, ty2=by-24;
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
  /* the drafting room: this page's plan pinned white-on-blue */
  const by=H*0.8;
  /* the tilted drafting table */
  x.save(); x.translate(R.cx-R.w*0.05,by-H*0.16); x.rotate(-0.13);
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
  /* dimension arrows */
  x.beginPath(); x.moveTo(-R.w*0.24,H*0.06); x.lineTo(-R.w*0.14,H*0.06); x.stroke();
  x.beginPath(); x.moveTo(-R.w*0.24,H*0.06); x.lineTo(-R.w*0.22,H*0.052); x.moveTo(-R.w*0.24,H*0.06); x.lineTo(-R.w*0.22,H*0.068); x.stroke();
  x.restore();
  /* table legs */
  x.strokeStyle=INKC; x.lineWidth=4;
  x.beginPath(); x.moveTo(R.cx-R.w*0.3,by); x.lineTo(R.cx-R.w*0.26,by-H*0.2); x.stroke();
  x.beginPath(); x.moveTo(R.cx+R.w*0.24,by); x.lineTo(R.cx+R.w*0.2,by-H*0.26); x.stroke();
  /* T-square hung on the wall + the pinned notes with REAL headings */
  x.strokeStyle=INKC; x.lineWidth=3;
  x.beginPath(); x.moveTo(R.cx+R.w*0.36,H*0.2); x.lineTo(R.cx+R.w*0.36,H*0.38); x.stroke();
  x.lineWidth=5;
  x.beginPath(); x.moveTo(R.cx+R.w*0.3,H*0.2); x.lineTo(R.cx+R.w*0.42,H*0.2); x.stroke();
  for(let i=0;i<Math.min(3,d.labels.length);i++){
    const nx=R.cx-R.w*(0.42-i*0.13), ny=H*(0.22+(i%2)*0.05);
    x.save(); x.translate(nx,ny); x.rotate(((d.seed>>>i)%7-3)*0.03);
    x.fillStyle='#fdf8ea'; x.fillRect(-26,0,52,30);
    x.strokeStyle=INKC; x.lineWidth=1.3; x.strokeRect(-26,0,52,30);
    x.fillStyle=INKC; x.beginPath(); x.arc(0,3,1.8,0,7); x.fill();
    x.textAlign='center';
    pfFitFont(x,pfShort(d.labels[i],14),46,6.6,'600 %px Oswald,sans-serif');
    x.fillText(pfShort(d.labels[i],14),0,16); x.textAlign='left'; x.restore();
  }
  /* the model rising on the side: the plan made real, in blocks */
  const mx=R.cx+R.w*0.34;
  for(let i=0;i<3;i++){
    x.fillStyle=['#d9c8a2','#c9a86a','#b9ab84'][i];
    x.fillRect(mx-16+i*2,by-16-i*14,32-i*4,14);
    x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(mx-16+i*2,by-16-i*14,32-i*4,14);
  }
  /* the architect's lamp throwing its cone on the plan */
  x.strokeStyle=INKC; x.lineWidth=2.6;
  x.beginPath(); x.moveTo(R.cx-R.w*0.36,by-H*0.3); x.lineTo(R.cx-R.w*0.28,by-H*0.36); x.stroke();
  x.fillStyle='#57553f';
  x.beginPath(); x.moveTo(R.cx-R.w*0.28,by-H*0.37); x.lineTo(R.cx-R.w*0.22,by-H*0.33);
  x.lineTo(R.cx-R.w*0.27,by-H*0.30); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.6; x.stroke();
  x.fillStyle='rgba(255,244,200,.18)';
  x.beginPath(); x.moveTo(R.cx-R.w*0.26,by-H*0.33);
  x.lineTo(R.cx+R.w*0.1,by-H*0.1); x.lineTo(R.cx-R.w*0.2,by-H*0.04); x.closePath(); x.fill();
},
