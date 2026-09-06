kitchen(x,d,R,W,H){
  /* the cookbook kitchen: recipes on the rail, pots at the boil */
  const by=H*0.78;
  /* the great range */
  x.fillStyle='#44403a'; x.fillRect(R.cx-R.w*0.36,by-H*0.2,R.w*0.72,H*0.2);
  x.strokeStyle=INKC; x.lineWidth=2.6; x.strokeRect(R.cx-R.w*0.36,by-H*0.2,R.w*0.72,H*0.2);
  /* oven doors + dials */
  x.strokeStyle=INKC; x.lineWidth=1.8;
  x.strokeRect(R.cx-R.w*0.28,by-H*0.14,R.w*0.22,H*0.11);
  x.strokeRect(R.cx+R.w*0.05,by-H*0.14,R.w*0.22,H*0.11);
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
  const cries=(d.labels.length?d.labels:['SEO','SLUGIFY','SITEMAP']);
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
  /* the extension bay: the great socket waits, the plug is carried in */
  const wy=H*0.5;
  /* the wall socket, monumental */
  const sw=R.w*0.34;
  x.fillStyle='#d9c8a2'; x.fillRect(R.cx+R.w*0.1,wy-sw*0.6,sw,sw*1.2);
  x.strokeStyle=INKC; x.lineWidth=2.8; x.strokeRect(R.cx+R.w*0.1,wy-sw*0.6,sw,sw*1.2);
  x.fillStyle='#3a352b';
  x.fillRect(R.cx+R.w*0.1+sw*0.28,wy-sw*0.3,sw*0.14,sw*0.3);
  x.fillRect(R.cx+R.w*0.1+sw*0.58,wy-sw*0.3,sw*0.14,sw*0.3);
  x.strokeStyle=INKC; x.lineWidth=1.8;
  x.strokeRect(R.cx+R.w*0.1+sw*0.28,wy-sw*0.3,sw*0.14,sw*0.3);
  x.strokeRect(R.cx+R.w*0.1+sw*0.58,wy-sw*0.3,sw*0.14,sw*0.3);
  for(const [bx2,by2] of [[sw*0.14,-sw*0.48],[sw*0.86,-sw*0.48],[sw*0.14,sw*0.48],[sw*0.86,sw*0.48]]){
    x.beginPath(); x.arc(R.cx+R.w*0.1+bx2,wy+by2,3.4,0,7);
    x.fillStyle='#8d8266'; x.fill(); x.strokeStyle=INKC; x.lineWidth=1.2; x.stroke(); }
  /* the plug, twice a man's height, mid-carry on its cable */
  const px2=R.cx-R.w*0.2;
  x.fillStyle='#57553f'; x.fillRect(px2-sw*0.24,wy-sw*0.34,sw*0.48,sw*0.68);
  x.strokeStyle=INKC; x.lineWidth=2.6; x.strokeRect(px2-sw*0.24,wy-sw*0.34,sw*0.48,sw*0.68);
  x.fillStyle='#8d8266';
  x.fillRect(px2+sw*0.24,wy-sw*0.2,sw*0.2,sw*0.09);
  x.fillRect(px2+sw*0.24,wy+sw*0.11,sw*0.2,sw*0.09);
  x.strokeStyle=INKC; x.lineWidth=1.8;
  x.strokeRect(px2+sw*0.24,wy-sw*0.2,sw*0.2,sw*0.09);
  x.strokeRect(px2+sw*0.24,wy+sw*0.11,sw*0.2,sw*0.09);
  /* the cable runs off-frame in loops */
  x.strokeStyle=INKC; x.lineWidth=5;
  x.beginPath(); x.moveTo(px2-sw*0.24,wy);
  x.bezierCurveTo(px2-sw*0.7,wy+20,px2-sw*0.5,wy+70,px2-sw*0.9,wy+80);
  x.bezierCurveTo(px2-sw*1.3,wy+92,px2-sw*1.1,wy+40,-30,H*0.8); x.stroke();
  /* the port labels: what this plugin may touch, in the page's words */
  const ports=(d.labels.length?d.labels:['ROUTES','CONTROLLERS']);
  for(let i=0;i<Math.min(3,ports.length);i++)
    pfBanner(x,R.cx+R.w*0.1+sw/2,wy-sw*0.6-22-i*0,pfShort(ports[0],16),{tone:'#31647e',s:0.86,maxW:sw,h:17});
  for(let i=1;i<Math.min(3,ports.length);i++)
    pfSign(x,R.cx+R.w*0.1+sw*(i-0.5),wy+sw*0.78,pfShort(ports[i],14),{s:0.8,post:8,maxW:104});
  /* voltage spark waiting in the gap */
  x.strokeStyle='#e9c81f'; x.lineWidth=2.2;
  x.beginPath(); x.moveTo(px2+sw*0.46,wy-4);
  x.lineTo(px2+sw*0.52,wy+2); x.lineTo(px2+sw*0.48,wy+2); x.lineTo(px2+sw*0.56,wy+9); x.stroke();
},
automaton(x,d,R,W,H){
  /* the lifecycle automaton: wound at the back, it acts on schedule */
  const by=H*0.78;
  /* the stand */
  x.fillStyle='#6b4a2e'; x.fillRect(R.cx-R.w*0.16,by-8,R.w*0.32,10);
  x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(R.cx-R.w*0.16,by-8,R.w*0.32,10);
  /* the figure: brass body, open gear chest */
  const ay=by-14;
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
  /* the template foundry: one pour, a whole town the same good shape */
  const by=H*0.76;
  /* the bench of house-moulds */
  x.fillStyle='#6b4a2e'; x.fillRect(R.cx-R.w*0.46,by,R.w*0.92,10);
  x.strokeStyle=INKC; x.lineWidth=2.2; x.strokeRect(R.cx-R.w*0.46,by,R.w*0.92,10);
  for(let i=0;i<3;i++){
    const mx=R.cx-R.w*0.32+i*R.w*0.24;
    /* open two-part mould with a house-shaped cavity */
    x.fillStyle='#8d8266'; x.fillRect(mx-24,by-34,48,34);
    x.strokeStyle=INKC; x.lineWidth=2; x.strokeRect(mx-24,by-34,48,34);
    x.fillStyle='#3a352b';
    x.beginPath(); x.moveTo(mx-12,by-6); x.lineTo(mx-12,by-18); x.lineTo(mx,by-27);
    x.lineTo(mx+12,by-18); x.lineTo(mx+12,by-6); x.closePath(); x.fill();
    if(i===1){ /* the glowing pour */
      x.fillStyle='#e8842c';
      x.beginPath(); x.moveTo(mx-12,by-6); x.lineTo(mx-12,by-14); x.lineTo(mx+12,by-14);
      x.lineTo(mx+12,by-6); x.closePath(); x.fill();
      const g2=x.createRadialGradient(mx,by-12,3,mx,by-12,34);
      g2.addColorStop(0,'rgba(232,132,44,.45)'); g2.addColorStop(1,'rgba(232,132,44,0)');
      x.fillStyle=g2; x.beginPath(); x.arc(mx,by-12,34,0,7); x.fill();
    }
  }
  /* the ladle tipping into the middle mould */
  x.save(); x.translate(R.cx-R.w*0.02,by-70); x.rotate(0.5);
  x.strokeStyle=INKC; x.lineWidth=3;
  x.beginPath(); x.moveTo(0,0); x.lineTo(44,-10) ; x.stroke();
  x.fillStyle='#57553f'; x.beginPath(); x.arc(-6,4,12,-0.4,Math.PI+0.4); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
  x.restore();
  x.strokeStyle='#e8842c'; x.lineWidth=3.4;
  x.beginPath(); x.moveTo(R.cx-R.w*0.09,by-64); x.lineTo(R.cx-R.w*0.08,by-30); x.stroke();
  /* the finished casts, cooling in a row — identical little houses */
  for(let i=0;i<4;i++){
    const hx2=R.cx+R.w*(0.2+i*0.09), hy=by-2-i*1;
    x.fillStyle='#d9c8a2';
    x.beginPath(); x.moveTo(hx2-9,hy); x.lineTo(hx2-9,hy-10); x.lineTo(hx2,hy-17);
    x.lineTo(hx2+9,hy-10); x.lineTo(hx2+9,hy); x.closePath(); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.4; x.stroke();
    pfSmokeCurl(x,hx2,hy-19,0.5,'rgba(120,120,120,.5)');
  }
  /* mould labels: the page's own template names */
  const kinds=(d.labels.length?d.labels:['BLOG','ECOMMERCE','CORPORATE']);
  for(let i=0;i<3;i++)
    pfSign(x,R.cx-R.w*0.32+i*R.w*0.24,by+26,pfShort(kinds[i%kinds.length],12),{s:0.78,post:6,maxW:96});
},
roundtable(x,d,R,W,H){
  /* the round table: the work is one sheet and every chair is taken */
  const cy=H*0.62;
  /* the table, seen a little from above */
  x.fillStyle='#8a5a2e'; x.beginPath(); x.ellipse(R.cx,cy,R.w*0.4,R.w*0.16,0,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2.6; x.stroke();
  x.fillStyle='#6b4a2e'; x.beginPath(); x.ellipse(R.cx,cy+8,R.w*0.4,R.w*0.16,0,0,Math.PI); x.fill();
  /* the one shared sheet in the middle, corners held by paperweights */
  x.save(); x.translate(R.cx,cy-4); x.rotate(-0.04);
  x.fillStyle='#fdf8ea'; x.fillRect(-42,-22,84,44);
  x.strokeStyle=INKC; x.lineWidth=1.8; x.strokeRect(-42,-22,84,44);
  x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1;
  for(let i=0;i<3;i++){ x.beginPath(); x.moveTo(-32,-12+i*11); x.lineTo(32,-12+i*11); x.stroke(); }
  x.restore();
  for(const [px2,py] of [[-38,-20],[38,-16],[-34,16],[36,18]]){
    x.fillStyle='#57553f'; x.beginPath(); x.arc(R.cx+px2,cy-4+py,4,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=1.2; x.stroke(); }
  /* the council: silhouettes around the far rim, each with a quill or cup */
  const seats=5;
  for(let i=0;i<seats;i++){
    const a2=Math.PI*(1.1+i*0.2), sx=R.cx+Math.cos(a2)*R.w*0.44, sy=cy+Math.sin(a2)*R.w*0.19-14;
    x.fillStyle=INKC;
    x.beginPath(); x.arc(sx,sy-14,6,0,7); x.fill();
    x.beginPath(); x.moveTo(sx-8,sy+8); x.quadraticCurveTo(sx,sy-10,sx+8,sy+8); x.closePath(); x.fill();
    if(i%2){ x.strokeStyle=INKC; x.lineWidth=1.6;
      x.beginPath(); x.moveTo(sx+8,sy-4); x.lineTo(sx+15,sy-12); x.stroke(); }
  }
  /* the shared inkpot and the passing of one quill */
  x.fillStyle=INKC; x.beginPath(); x.ellipse(R.cx+R.w*0.2,cy+2,7,4,0,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.8;
  x.beginPath(); x.moveTo(R.cx+R.w*0.2,cy); x.quadraticCurveTo(R.cx+R.w*0.26,cy-16,R.cx+R.w*0.24,cy-24); x.stroke();
  /* role cards at the near rim: the page's own seats */
  const roles=(d.labels.length?d.labels:['OWNER','DEVELOPER']);
  for(let i=0;i<Math.min(3,roles.length);i++)
    pfSign(x,R.cx-R.w*0.24+i*R.w*0.24,cy+R.w*0.2+22,pfShort(roles[i],12),{s:0.8,post:6,maxW:90});
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
  /* the settings wall: gears mesh, dials answer, one lever is a hand's */
  const cy=H*0.44;
  /* three meshed gears of different bore */
  pfGearBig(x,R.cx-R.w*0.2,cy,R.w*0.15,9,0.12,'#d9c8a2');
  pfGearBig(x,R.cx+R.w*0.03,cy+R.w*0.115,R.w*0.105,7,-0.14,'#c9a86a');
  pfGearBig(x,R.cx+R.w*0.2,cy-R.w*0.02,R.w*0.13,8,0.3,'#b9ab84');
  /* the drive belt to the small governor */
  x.strokeStyle=INKC; x.lineWidth=2;
  x.beginPath(); x.moveTo(R.cx+R.w*0.31,cy-R.w*0.06);
  x.quadraticCurveTo(R.cx+R.w*0.44,cy-R.w*0.14,R.cx+R.w*0.44,cy-R.w*0.22); x.stroke();
  x.beginPath(); x.arc(R.cx+R.w*0.44,cy-R.w*0.26,R.w*0.04,0,7); x.stroke();
  /* dial gauges named with the page's own settings */
  const dials=(d.labels.length?d.labels:['HOST','PORT','POOL']);
  for(let i=0;i<Math.min(3,dials.length);i++){
    const gx=R.cx-R.w*0.34+i*R.w*0.34, gy2=H*0.20;
    x.fillStyle='#f6efdd'; x.beginPath(); x.arc(gx,gy2,17,0,7); x.fill();
    x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
    x.lineWidth=1.2;
    for(let t3=0;t3<7;t3++){ const a2=Math.PI*0.75+t3*Math.PI*1.5/6;
      x.beginPath(); x.moveTo(gx+Math.cos(a2)*13,gy2+Math.sin(a2)*13);
      x.lineTo(gx+Math.cos(a2)*16,gy2+Math.sin(a2)*16); x.stroke(); }
    const na=Math.PI*(0.75+((d.seed>>>(i*4))%100)/100*1.5);
    x.lineWidth=2.2; x.beginPath(); x.moveTo(gx,gy2);
    x.lineTo(gx+Math.cos(na)*11,gy2+Math.sin(na)*11); x.stroke();
    pfBanner(x,gx,gy2+20,pfShort(dials[i],12),{tone:i%2?'#31647e':'#57553f',s:0.7,maxW:90,h:13,rod:false});
  }
  /* the one long lever, thrown */
  x.strokeStyle=INKC; x.lineWidth=5; x.lineCap='round';
  x.beginPath(); x.moveTo(R.cx-R.w*0.42,H*0.62); x.lineTo(R.cx-R.w*0.34,H*0.42); x.stroke();
  x.fillStyle='#c22a1c'; x.beginPath(); x.arc(R.cx-R.w*0.34,H*0.41,7,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=1.8; x.stroke();
  x.fillStyle='#57553f'; x.fillRect(R.cx-R.w*0.46,H*0.62,R.w*0.1,10);
  x.strokeRect(R.cx-R.w*0.46,H*0.62,R.w*0.1,10);
  /* steam where the work happens */
  pfSmokeCurl(x,R.cx+R.w*0.03,cy+R.w*0.01,1.3,'rgba(150,150,150,.5)');
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
  /* the mooring mast and the airship coming in */
  const mx=R.cx+R.w*0.36;
  x.strokeStyle=INKC; x.lineWidth=3;
  x.beginPath(); x.moveTo(mx,py); x.lineTo(mx,py-H*0.18); x.stroke();
  x.lineWidth=1.4;
  x.beginPath(); x.moveTo(mx,py-H*0.18); x.lineTo(mx-30,py-H*0.155); x.stroke();
  const ax=mx-58, ay=py-H*0.16;
  x.fillStyle='#d9c8a2'; x.beginPath(); x.ellipse(ax,ay,34,13,-0.06,0,7); x.fill();
  x.strokeStyle=INKC; x.lineWidth=2; x.stroke();
  x.strokeStyle='rgba(35,28,18,.5)'; x.lineWidth=1.2;
  x.beginPath(); x.ellipse(ax,ay,34,13,-0.06,0.5,2.6); x.stroke();
  x.fillStyle='#57553f'; x.fillRect(ax-10,ay+11,20,7);
  x.strokeStyle=INKC; x.lineWidth=1.4; x.strokeRect(ax-10,ay+11,20,7);
  /* the lit gangway from the dock into the town */
  x.fillStyle='rgba(233,200,31,.35)';
  x.beginPath(); x.moveTo(mx-4,py); x.lineTo(mx+4,py);
  x.lineTo(mx+16,py-H*0.02); x.lineTo(mx-16,py-H*0.02); x.closePath(); x.fill();
  /* the harbor board carries the page's own berths */
  const berths=(d.labels.length?d.labels:['DEPLOYS','SETTINGS']);
  pfSign(x,R.cx-R.w*0.5,py+H*0.1,pfShort(berths[0],14),{s:0.9,post:18,maxW:110});
  if(berths[1]) pfSign(x,R.cx-R.w*0.1,py+H*0.13,pfShort(berths[1],14),{s:0.82,post:14,maxW:104});
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
  /* launch morning: the ship stands bolted to the tower, the count runs */
  const hzY=d.hz*H, by=hzY+(H-hzY)*0.55;
  /* the pad */
  x.fillStyle='#8d8266'; x.fillRect(R.cx-R.w*0.4,by,R.w*0.8,10);
  x.strokeStyle=INKC; x.lineWidth=2.2; x.strokeRect(R.cx-R.w*0.4,by,R.w*0.8,10);
  /* the rocket */
  const rx=R.cx+R.w*0.08, rh=H*0.34, rw=R.w*0.14;
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
  /* the tower and its arms */
  const gx=rx-rw*1.9;
  x.strokeStyle=INKC; x.lineWidth=3.4;
  x.beginPath(); x.moveTo(gx,by+8); x.lineTo(gx,by-rh-14); x.stroke();
  x.lineWidth=1.8;
  for(let i=0;i<6;i++){ const yy=by-6-i*(rh/6);
    x.beginPath(); x.moveTo(gx-8,yy); x.lineTo(gx+8,yy-10); x.stroke();
    x.beginPath(); x.moveTo(gx+8,yy); x.lineTo(gx-8,yy-10); x.stroke(); }
  x.lineWidth=2.6;
  x.beginPath(); x.moveTo(gx,by-rh*0.8); x.lineTo(rx-rw/2,by-rh*0.8); x.stroke();
  x.beginPath(); x.moveTo(gx,by-rh*0.4); x.lineTo(rx-rw/2,by-rh*0.4); x.stroke();
  /* umbilical dropping away: the deploy is GO */
  x.strokeStyle='rgba(35,28,18,.7)'; x.lineWidth=2;
  x.beginPath(); x.moveTo(rx-rw/2,by-rh*0.55);
  x.quadraticCurveTo(gx+14,by-rh*0.3,gx+8,by-6); x.stroke();
  /* first steam under the nozzles */
  for(const dx2 of [-8,4,12]) pfSmokeCurl(x,rx+dx2,by+6,1.4,'rgba(200,200,200,.7)');
  /* the countdown board: the page's own steps, last one lit */
  const steps=(d.labels.length?d.labels:['BUILD','PUSH','RELEASE']);
  x.fillStyle='#2e2a22'; x.fillRect(R.cx-R.w*0.46,H*0.24,R.w*0.24,H*0.19);
  x.strokeStyle=INKC; x.lineWidth=2.2; x.strokeRect(R.cx-R.w*0.46,H*0.24,R.w*0.24,H*0.19);
  for(let i=0;i<Math.min(3,steps.length);i++){
    x.fillStyle=i===Math.min(3,steps.length)-1?'#9fe08a':'#8d8266';
    x.font='700 9px "Courier Prime",monospace';
    x.fillText(pfShort(steps[i],13),R.cx-R.w*0.44,H*0.24+20+i*17);
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
