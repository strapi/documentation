/* ---- the subjects: each painter draws THIS page's own thing ---- */
function pfLab(d,i,fb){ return (d.labels3[i]||d.labels[i]||fb||'').toUpperCase(); }
function pfTok(d,i,fb){ return (d.toks[i]||fb||'').toUpperCase(); }
const MOTIF_PAINT={
doors(x,d,R,W,H){
  /* a wall of named doors — every key hangs in sight, each fits one only */
  const n=clamp(Math.max(d.labels3.length,3),3,5);
  const dw=Math.min(64,R.w/n*0.8), dh=dw*2.1, wy=H*0.60;
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
    const lb=pfLab(d,i,'ROLE '+(i+1));
    pfBanner(x,dx,wy-dh-16,lb,{tone:'#31647e',s:0.86,maxW:dw*1.5,h:18});
    pfKeyBig(x,dx,wy-dh*0.5-dh*0.62,0.9,Math.PI/2+((d.h>>>i)%7-3)*0.06);
  }
  /* the one great key on the floor before the wall — reach it who can */
  pfKeyBig(x,R.cx-R.w*0.24,H*0.845,2.2,-0.18);
  x.fillStyle='rgba(35,28,18,.25)';
  x.beginPath(); x.ellipse(R.cx-R.w*0.24,H*0.86,34,7,0,0,7); x.fill();
},
vault(x,d,R,W,H){
  /* the strongroom door: tokens live behind a wheel no stranger turns */
  const cy=H*0.46, r=Math.min(R.w*0.34,H*0.2);
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
  const n=3, mw=Math.min(76,R.w*0.3);
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
  const n=3, cw=Math.min(84,R.w*0.32), wy=H*0.62;
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
  const bw=Math.min(46,R.w*0.2), by=H*0.83;
  const rows=clamp(d.labels.length+2,4,6);
  const blocks=(d.labels3.length?d.labels3:['TEXT','NUMBER','MEDIA','RELATION','JSON','UID']);
  for(let r2=0;r2<rows;r2++){
    const nr=r2<2?3:(r2<4?2:1);
    for(let c2=0;c2<nr;c2++){
      const bx2=R.cx-((nr-1)/2)*(bw*1.06)+c2*(bw*1.06), by2=by-r2*(bw*0.62);
      x.fillStyle=['#d9c8a2','#c9a86a','#b9ab84'][(r2+c2)%3];
      x.fillRect(bx2-bw/2,by2-bw*0.56,bw,bw*0.56);
      x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(bx2-bw/2,by2-bw*0.56,bw,bw*0.56);
      const lb=blocks[(r2*3+c2)%blocks.length];
      x.save(); x.fillStyle='rgba(35,28,18,.8)'; x.textAlign='center';
      pfFitFont(x,lb,bw-6,7.5,'600 %px Oswald,sans-serif');
      x.fillText(lb,bx2,by2-bw*0.2); x.textAlign='left'; x.restore();
    }
  }
  /* scaffold round the work */
  x.strokeStyle=INKC; x.lineWidth=3;
  for(const sx of [R.cx-bw*2.1,R.cx+bw*2.1]){
    x.beginPath(); x.moveTo(sx,by+6); x.lineTo(sx,by-rows*bw*0.62-24); x.stroke(); }
  x.lineWidth=1.8;
  for(let r2=1;r2<=2;r2++){ const py=by-r2*rows*bw*0.31;
    x.beginPath(); x.moveTo(R.cx-bw*2.1,py); x.lineTo(R.cx+bw*2.1,py); x.stroke();
    x.fillStyle='#8d8266'; x.fillRect(R.cx-bw*2.1,py-3,bw*4.2,3.4); }
  pfLadder(x,R.cx+bw*1.6,by+4,rows*bw*0.5,0.06);
  /* the crane hook swings the next stone in */
  x.strokeStyle=INKC; x.lineWidth=2.6;
  x.beginPath(); x.moveTo(R.cx-bw*2.1,by-rows*bw*0.62-24); x.lineTo(R.cx-bw*0.2,by-rows*bw*0.62-44); x.stroke();
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
  const cells=[[0.10,0.26,0.22,0.19],[0.38,0.22,0.3,0.25],[0.74,0.27,0.2,0.16],
               [0.08,0.5,0.28,0.2],[0.42,0.52,0.22,0.17],[0.7,0.48,0.24,0.22]];
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
  /* the stacks: containers lettered with the page's own words */
  const cw2=Math.min(70,R.w*0.3), ch=cw2*0.44;
  const names=[pfTok(d,0,'IMAGE'),pfLab(d,0,'BUILD'),pfLab(d,1,'RUN'),pfTok(d,1,'VOLUME'),pfLab(d,2,'ENV')];
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
      const lb=names[(col*2+r2)%names.length];
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
  /* each station posts the page's own events */
  poles.forEach(([px2,pt],i)=>{
    if(d.labels[i]) pfSign(x,px2,hzY+(H-hzY)*0.36,d.labels[i],{s:0.9,post:18,maxW:110});
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
    if(((d.seed>>>(c2*4+r2))&3)===0){
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
  const hzY=d.hz*H, tw=Math.min(R.w*0.34,90), ty=hzY+(H-hzY)*0.22;
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
  const hzY=d.hz*H, tw=Math.min(R.w*0.4,110), ty=H*0.82;
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
  const pts=[];
  for(let i=0;i<n;i++)
    pts.push([R.cx-R.w*0.5+R.w*((i+0.5)/n)+((rng()*2-1)*R.w*0.08),
      H*0.16+rng()*H*0.34]);
  /* the ruled query lines */
  x.strokeStyle='rgba(246,239,221,.65)'; x.lineWidth=1.4; x.setLineDash([6,4]);
  for(let i=0;i<n-1;i++){ x.beginPath(); x.moveTo(pts[i][0],pts[i][1]);
    x.lineTo(pts[i+1][0],pts[i+1][1]); x.stroke(); }
  x.beginPath(); x.moveTo(pts[0][0],pts[0][1]); x.lineTo(pts[Math.floor(n/2)][0],pts[Math.floor(n/2)][1]); x.stroke();
  x.setLineDash([]);
  /* the stars themselves, one haloed — the field you asked for */
  pts.forEach((p2,i)=>{
    const r2=i===1?7:4+((d.seed>>>i)%3);
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
  pts.forEach((p2,i)=>{ if(names[i]) pfCarve(x,p2[0],p2[1]-14,names[i],{maxW:90,size:9,ink:'rgba(246,239,221,.8)'}); });
  /* the astronomer's telescope waits on its tripod */
  const tx=R.cx+R.w*0.34, ty2=H*0.78;
  x.strokeStyle=INKC; x.lineWidth=3;
  x.beginPath(); x.moveTo(tx-14,ty2); x.lineTo(tx,ty2-24); x.lineTo(tx+14,ty2); x.stroke();
  x.beginPath(); x.moveTo(tx,ty2-24); x.lineTo(tx,ty2-8); x.stroke();
  x.save(); x.translate(tx,ty2-30); x.rotate(-0.62);
  x.fillStyle='#8a5a2e'; x.fillRect(-6,-7,44,14);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(-6,-7,44,14);
  x.fillStyle='#e9c81f'; x.fillRect(38,-5,8,10); x.strokeRect(38,-5,8,10);
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
  /* the answering engine: a question in the slot, a ribbon out the horn */
  const mw=Math.min(R.w*0.6,170), my=H*0.76;
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
temple(x,d,R,W,H){
  /* the API temple: carved verbs hold the roof up */
  const hzY=d.hz*H, by=hzY+(H-hzY)*0.42;
  const tw=R.w*0.94, n=4, colW=Math.min(20,tw*0.09);
  /* steps */
  for(let s2=0;s2<3;s2++){
    x.fillStyle=['#d9c8a2','#c9bd96','#b9ab84'][s2];
    x.fillRect(R.cx-tw/2-10+s2*8,by+s2*9,tw+20-s2*16,9);
    x.strokeStyle=INKC; x.lineWidth=1.6; x.strokeRect(R.cx-tw/2-10+s2*8,by+s2*9,tw+20-s2*16,9);
  }
  const colH=H*0.24;
  for(let i=0;i<n;i++)
    pfColumn(x,R.cx-tw*0.36+i*tw*0.24,by,colW,colH,'#e0d2a8');
  /* architrave carved with the page's own verbs */
  x.fillStyle='#d9c8a2'; x.fillRect(R.cx-tw/2,by-colH-26,tw,22);
  x.strokeStyle=INKC; x.lineWidth=2.2; x.strokeRect(R.cx-tw/2,by-colH-26,tw,22);
  const verbs=(d.m.stats&&d.m.stats.endp>0)?['GET','POST','PUT','DELETE']
    :(d.labels.length?d.labels.slice(0,4):['GET','POST','PUT','DELETE']);
  verbs.slice(0,4).forEach((v2,i)=>pfCarve(x,R.cx-tw*0.36+i*tw*0.24,by-colH-11,v2,{maxW:tw*0.2,size:10,mono:true,ink:'rgba(35,28,18,.7)'}));
  /* pediment */
  x.fillStyle='#e0d2a8';
  x.beginPath(); x.moveTo(R.cx-tw/2-8,by-colH-26); x.lineTo(R.cx,by-colH-26-tw*0.16);
  x.lineTo(R.cx+tw/2+8,by-colH-26); x.closePath(); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2.2; x.stroke();
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
  /* the crossing: everything the old bank held walks the span */
  const hzY=d.hz*H, gy=hzY+(H-hzY)*0.24;
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
  x.quadraticCurveTo(R.cx,gy+R.w*0.2,R.cx+R.w*0.42,gy+2); x.stroke();
  x.lineWidth=1.6;
  for(let i=1;i<6;i++){ const bx2=R.cx-R.w*0.42+i*R.w*0.84/6;
    const sag=Math.sin(Math.PI*i/6)*R.w*0.1;
    x.beginPath(); x.moveTo(bx2,gy+2); x.lineTo(bx2,gy+2+sag); x.stroke(); }
  /* rails */
  x.lineWidth=1.8;
  x.beginPath(); x.moveTo(R.cx-R.w*0.42,gy-20); x.lineTo(R.cx+R.w*0.42,gy-20); x.stroke();
  for(let i=0;i<9;i++){ const bx2=R.cx-R.w*0.42+i*R.w*0.84/8;
    x.beginPath(); x.moveTo(bx2,gy-20); x.lineTo(bx2,gy-8); x.stroke(); }
  /* the procession, laden */
  plateCrowd(x,gy-8,R.cx-R.w*0.36,R.cx+R.w*0.36,d.seed,8,1.4);
  /* bank obelisks carry the versions' names */
  for(const [ox,lb] of [[R.cx-R.w*0.5,'V4'],[R.cx+R.w*0.5,'V5']]){
    x.fillStyle='#b9ab84';
    x.beginPath(); x.moveTo(ox-11,gy+2); x.lineTo(ox-7,gy-52); x.lineTo(ox+7,gy-52); x.lineTo(ox+11,gy+2);
    x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
    pfCarve(x,ox,gy-28,lb,{maxW:20,size:12});
  }
  /* behind the old bank, the low burning of what is left */
  plateFlame(x,R.cx-R.w*0.56,gy+4,1.8,d.seed);
  pfSmokeCurl(x,R.cx-R.w*0.56,gy-12,1.6);
},
edict(x,d,R,W,H){
  /* the breaking-change plaza: the page's own verdict is staged */
  const hzY=d.hz*H, py=hzY+(H-hzY)*0.42;
  const oldTok=pfShort(pfToken(d.m.title)||pfTok(d,0,'THE OLD WAY'),16);
  const mode=d.edict||'newflag';
  /* the town crier's edict board stands in every plaza */
  x.fillStyle='#6b4a2e'; x.fillRect(R.cx+R.w*0.3,py-70,8,80);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(R.cx+R.w*0.3,py-70,8,80);
  x.fillStyle='#fdf6e2'; x.fillRect(R.cx+R.w*0.3-28,py-66,64,44);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(R.cx+R.w*0.3-28,py-66,64,44);
  x.fillStyle='#c22a1c'; x.font='700 9px Oswald,sans-serif'; x.textAlign='center';
  x.fillText('BREAKING',R.cx+R.w*0.3+4,py-52);
  x.fillStyle=INKC; x.font='600 8px Oswald,sans-serif';
  x.fillText('CHANGE',R.cx+R.w*0.3+4,py-42);
  x.font='700 7px "Courier Prime",monospace';
  x.fillText(pfShort(oldTok,13),R.cx+R.w*0.3+4,py-30); x.textAlign='left';
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
