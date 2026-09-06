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
  return L[sub]||L.monogram;
}
/* ---- caption shelves: solved against THIS plate's own masses ---- */
function pfCapSlots(d,nCaps){
  const CAND=[
    [{top:'12px',left:'12px'},0.02,0.01,0.5,0.11],
    [{top:'12px',right:'12px'},0.48,0.01,0.5,0.11],
    [{top:'26%',left:'12px'},0.02,0.26,0.46,0.10],
    [{top:'26%',right:'12px'},0.52,0.26,0.46,0.10],
    [{bottom:'24%',left:'12px'},0.02,0.66,0.46,0.10],
    [{bottom:'24%',right:'12px'},0.52,0.66,0.46,0.10],
    [{bottom:'12px',left:'12px'},0.02,0.87,0.5,0.11],
    [{bottom:'12px',right:'12px'},0.48,0.87,0.5,0.11],
  ];
  const masses=[];
  masses.push([d.prime.x, d.interior?0.18:Math.max(0.10,d.hz-0.30), d.prime.w, d.interior?0.66:0.62]);
  for(const st of d.stations) masses.push([st.fx-0.13,st.fy-0.09,0.26,0.11]);
  for(const f of d.figs) masses.push(f.box);
  const ov=(a,b)=>{ const w=Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0]);
    const h=Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1]);
    return (w>0&&h>0)?w*h:0; };
  const scored=CAND.map((c,i)=>{
    const r=[c[1],c[2],c[3],c[4]];
    let p=0; for(const m of masses) p+=ov(r,m);
    /* the opening line likes the top, the annal likes the foot */
    return {i,c,p};
  });
  const used=new Set(), out=[];
  const pickFrom=(pref)=>{
    let best=null;
    for(const s2 of scored){
      if(used.has(s2.i)) continue;
      const bias=pref==='top'?(s2.i<2?-0.02:0):pref==='bottom'?(s2.i>5?-0.02:0):0;
      const rowUsed=[...used].some(u=>Math.floor(u/2)===Math.floor(s2.i/2))?0.015:0;
      const score=s2.p+bias+rowUsed;
      if(!best||score<best.score) best={score,s2};
    }
    used.add(best.s2.i); return best.s2.c[0];
  };
  out.push(pickFrom('top'));
  if(nCaps>1) out.push(pickFrom('mid'));
  if(nCaps>2) out.push(pickFrom('bottom'));
  if(nCaps>3) out.push(pickFrom('any'));
  return out;
}
/* ---- the plate painter: passes stacked like lithography stones ---- */
function drawPlate(x,sc,W,H){
  const d=sc.plate.design; if(!d) return;
  if(d.interior){ pfInteriorPass(x,d,W,H); }
  else { pfSkyPass(x,d,W,H); pfFarPass(x,d,W,H); pfGroundPass(x,d,W,H); }
  pfStationsPass(x,d,W,H);
  const R={cx:(d.prime.x+d.prime.w/2)*W, w:d.prime.w*W};
  try{ (MOTIF_PAINT[d.sub]||MOTIF_PAINT.monogram)(x,d,R,W,H); }
  catch(e){ console.error('motif '+d.sub,e); MOTIF_PAINT.monogram(x,d,R,W,H); }
  if(d.crowdN>2&&!d.interior)
    plateCrowd(x,clamp(d.hz+0.3,0,0.92)*H,W*0.05,W*0.26,d.seed^0xc0,Math.min(6,d.crowdN-2),1.2,true);
  /* the near dark and the painter's last pass wait for the figures */
  sc.plate.after=(x2)=>{
    pfFgPass(x2,d,W,H);
    plateVignette(x2,W,H,d.fx,d.interior?0.48:Math.min(0.62,d.hz+0.12));
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
  const caps=[pfOpenLine(d.sub,title,d)];
  const teaser=firstSentence(String(meta.teaser||''),150);
  if(teaser) caps.push('"'+bangify(teaser).toUpperCase()+'" — SO THE TALE ITSELF DECLARES.');
  const annal='FROM THE ANNALS OF '+(series.product==='cloud'?'STRAPI CLOUD':'STRAPI CMS')+
    ' — THE '+String(series.section||series.noun).toUpperCase()+' CYCLE'+
    (meta.inb>0?(', CITED BY '+meta.inb+' OTHER TALE'+(meta.inb>1?'S':'')+'.')
               :'. NO OTHER TALE HAS YET DARED CITE IT.');
  caps.push(annal);
  if(meta.inb>=10) caps.push('A COSMIC EVENT — AND STILL ONLY ONE PAGE OF ITS LEGEND.');
  const slots=pfCapSlots(d,Math.min(4,caps.length));
  caps.slice(0,4).forEach((txt2,i)=>{
    const cb=el('div','platecap',esc(txt2));
    const s2=slots[i]||slots[slots.length-1];
    for(const k in s2) cb.style[k]=s2[k];
    n.appendChild(cb);
  });
  n._sc={ seed, series, plate:{design:d, letter:cast.hero.letter},
    figures:d.figs, balloons:[] };
  return n;
}
