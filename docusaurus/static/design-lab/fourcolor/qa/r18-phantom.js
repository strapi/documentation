/* r18: (a) phantom advance killed: doubt-timer cleared across teardown/enter;
   (b) houseAd tap inside guided FOLLOWS THE AD (owner, 2026-09-07: clickable
       things must stay clickable in guided view), while plain art advances;
   (c) ENTER on a houseAd beat opens the advertised issue. HEADLESS. */
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
async function ensureGuided(pg){
  /* 'g' TOGGLES guided view. Pressing it a second time turned it back off,
     which is why a re-opened issue found no house ad to tap. */
  const on = await pg.evaluate(()=>!!(window.__fc && window.__fc.api.guided && window.__fc.api.guided.active));
  if(!on){ await pg.keyboard.press('g'); await pg.waitForTimeout(900); }
}
(async()=>{
  const b=await chromium.launch();
  const pg=await b.newPage({viewport:{width:1440,height:900}, deviceScaleFactor:2});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('http://127.0.0.1:8547/',{waitUntil:'load'});
  await pg.waitForFunction('window.__fc && window.__fc.ready',null,{timeout:20000});
  await pg.evaluate(()=>window.__fc.api.openIssue('/cms/migration/v4-to-v5/additional-resources/helper-plugin'));
  await pg.waitForTimeout(400);
  const slug0=await pg.evaluate(()=>window.__fc.api.S.book.slug);
  await pg.keyboard.press('g');
  await pg.waitForTimeout(1000);
  /* walk forward until the active beat is a houseAd (or give up) */
  const found=await pg.evaluate(async()=>{
    const g=window.__fc.api.guided;
    for(let i=0;i<160;i++){
      const bs=g.beatsFor(g.p), bt=bs[g.bi];
      if(bt&&bt.kind==='panel'&&bt.node.classList.contains('houseAd')) return {p:g.p,bi:g.bi,ad:bt.node.dataset.ad||null};
      g.next(); await new Promise(r=>setTimeout(r,30));
    }
    return null;
  });
  if(!found){ console.log('NO HOUSEAD FOUND in walk'); await b.close(); return; }
  console.log('housead beat at p'+found.p+' bi'+found.bi+' ad='+found.ad);
  await pg.waitForTimeout(800);
  /* (c) ENTER on the ad beat opens the advertised issue. Tested FIRST and from
     a clean state: it used to run after the tap below, which by then had
     carried the reading into another issue, so it measured a different ad and
     failed for a reason that had nothing to do with ENTER. */
  await pg.keyboard.press('Enter');
  await pg.waitForTimeout(1300);
  const opened=await pg.evaluate(()=>({slug:window.__fc.api.S.book.slug,active:window.__fc.api.guided.active}));
  console.log('ENTER ON AD:', JSON.stringify(opened), (opened.slug===found.ad&&opened.active)?'OPENED ADVERTISED ISSUE (PASS)':'FAIL');

  /* (b) A TAP ON AN AD NAVIGATES. This reverses the r18 law on the owner's
     instruction of 2026-09-07: "en guided view, les elements cliquables ne le
     sont plus... on ne peut plus cliquer sur la cover d'un autre volume de
     comics". An advertisement you cannot press is not an advertisement. Plain
     art still advances the reading, which is checked straight after, because
     that is the thing the pass-through could have broken. */
  await pg.evaluate(()=>window.__fc.api.openIssue('/cms/migration/v4-to-v5/additional-resources/helper-plugin'));
  await pg.waitForTimeout(400);
  await ensureGuided(pg);
  const found2=await pg.evaluate(async()=>{
    const g=window.__fc.api.guided;
    g.go(0,0,true); await new Promise(r=>setTimeout(r,120));
    for(let i=0;i<160;i++){
      const bs=g.beatsFor(g.p), bt=bs[g.bi];
      if(bt&&bt.kind==='panel'&&bt.node.classList.contains('houseAd')){
        await new Promise(r=>setTimeout(r,700));          /* let the beat settle in frame */
        const r2=bt.node.getBoundingClientRect();
        return {p:g.p,bi:g.bi,ad:bt.node.dataset.ad||null,
                cx:Math.round(r2.left+r2.width/2), cy:Math.round(r2.top+r2.height/2),
                w:Math.round(r2.width), h:Math.round(r2.height)};
      }
      g.next(); await new Promise(r=>setTimeout(r,30));
    }
    return null;
  });
  if(found2){
    const before=await pg.evaluate(()=>({slug:window.__fc.api.S.book.slug}));
    /* the ad's own centre, not a fixed point: guided view frames each beat
       differently, so a hardcoded 720,450 can miss the panel entirely */
    await pg.mouse.click(found2.cx, found2.cy);
    await pg.waitForTimeout(1300);
    const after=await pg.evaluate(()=>({slug:window.__fc.api.S.book.slug,active:window.__fc.api.guided.active}));
    console.log('TAP ON AD:', JSON.stringify({before,after,advertised:found2.ad}),
      (after.slug===found2.ad)?'FOLLOWED THE AD (PASS)':'FAIL');
  } else { console.log('TAP ON AD: no second housead found SKIP'); }

  /* (b2) and a tap on ordinary art still turns the beat, not the issue */
  await pg.evaluate(()=>window.__fc.api.openIssue('/cms/migration/v4-to-v5/additional-resources/helper-plugin'));
  await pg.waitForTimeout(400);
  await ensureGuided(pg);
  const plain=await pg.evaluate(async()=>{
    const g=window.__fc.api.guided;
    g.go(0,0,true); await new Promise(r=>setTimeout(r,120));
    for(let i=0;i<160;i++){
      const bs=g.beatsFor(g.p), bt=bs[g.bi];
      if(bt&&bt.kind==='panel'&&!bt.node.classList.contains('houseAd')&&!bt.node.classList.contains('photo')&&!bt.node.querySelector('a'))
        return {p:g.p,bi:g.bi,slug:window.__fc.api.S.book.slug};
      g.next(); await new Promise(r=>setTimeout(r,30));
    }
    return null;
  });
  if(plain){
    await pg.mouse.click(720,450);
    await pg.waitForTimeout(1200);
    const a2=await pg.evaluate(()=>({slug:window.__fc.api.S.book.slug,p:window.__fc.api.guided.p,bi:window.__fc.api.guided.bi}));
    const moved=(a2.slug===plain.slug)&&(a2.p>plain.p||(a2.p===plain.p&&a2.bi>plain.bi));
    console.log('TAP ON PLAIN ART:', JSON.stringify({from:plain,to:a2}), moved?'ADVANCED (PASS)':'FAIL');
  } else { console.log('TAP ON PLAIN ART: no plain panel found SKIP'); }
  /* (a) phantom: fresh session must sit at 0/0 well past +270ms with no input.
     Reopened here on purpose: the checks above walk the reading, and this one
     is only meaningful from a session nobody has touched. */
  await pg.evaluate(()=>window.__fc.api.openIssue('/cms/migration/v4-to-v5/additional-resources/helper-plugin'));
  await pg.waitForTimeout(400);
  await ensureGuided(pg);
  const rest=await pg.evaluate(()=>({p:window.__fc.api.guided.p,bi:window.__fc.api.guided.bi}));
  console.log('FRESH SESSION AT REST:', JSON.stringify(rest), (rest.p===0&&rest.bi===0)?'NO PHANTOM (PASS)':'FAIL');
  /* (a2) harder: start a doubt-timer with a real click then openIssue via API inside the 270ms window */
  await pg.evaluate(()=>window.__fc.api.openIssue('/cms/migration/v4-to-v5/additional-resources/helper-plugin'));
  await pg.waitForTimeout(900);
  await pg.mouse.click(720,450);
  await pg.waitForTimeout(60);
  await pg.evaluate((s)=>window.__fc.api.openIssue(s), slug0==='/cms/migration/v4-to-v5/additional-resources/helper-plugin'?'/cms/api/graphql':slug0);
  await pg.waitForTimeout(700);
  const rest2=await pg.evaluate(()=>({p:window.__fc.api.guided.p,bi:window.__fc.api.guided.bi,active:window.__fc.api.guided.active}));
  console.log('MID-DOUBT CROSSOVER:', JSON.stringify(rest2), (rest2.p===0&&rest2.bi===0)?'NO PHANTOM (PASS)':'FAIL');
  console.log('ERRORS:',errs.length?errs.join('|'):'none');
  await b.close();
})().catch(e=>{console.error(e);process.exit(1);});
