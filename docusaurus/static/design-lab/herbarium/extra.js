const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const DIR='/private/tmp/claude-501/-Users-piwi-code-documentation/0d8629c6-231f-4fec-94af-6fe3669d37b8/scratchpad/bold5/s7/';
(async()=>{
 const b=await chromium.launch();
 const out={};

 // --- reduced motion, fully navigable ---
 let c=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 let p=await c.newPage(); const e1=[]; p.on('pageerror',x=>e1.push(x.message)); p.on('console',m=>{if(m.type()==='error')e1.push(m.text())});
 await p.goto('http://127.0.0.1:8977/#/cms/features/draft-and-publish',{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>window.__HERB_READY__===true,{timeout:20000});
 await p.waitForTimeout(600);
 out.reducedMotion = await p.evaluate(()=>({
   chars:document.querySelector('.notes').innerText.trim().length,
   bootGone:!document.querySelector('#boot'),
   ow:document.documentElement.scrollWidth, cw:document.documentElement.clientWidth
 }));
 // navigate under reduced motion
 await p.evaluate(()=>{location.hash='#~night'}); await p.waitForTimeout(800);
 out.rmNight = await p.evaluate(()=>document.querySelectorAll('.card').length);
 await p.evaluate(()=>{document.querySelectorAll('.card')[0].click()}); await p.waitForTimeout(700);
 out.rmClick = await p.evaluate(()=>({h:location.hash,chars:document.querySelector('.notes')?document.querySelector('.notes').innerText.length:0}));
 out.rmErrs=e1;
 await p.screenshot({path:DIR+'p-reduced.jpg',type:'jpeg',quality:72});
 await c.close();

 // --- narrow ---
 for (const w of [380, 768, 1024]) {
   c=await b.newContext({viewport:{width:w,height:900}});
   p=await c.newPage(); const e2=[]; p.on('pageerror',x=>e2.push(x.message));
   await p.goto('http://127.0.0.1:8977/#/cms/api/rest',{waitUntil:'domcontentloaded'});
   await p.waitForFunction(()=>window.__HERB_READY__===true,{timeout:20000});
   await p.waitForTimeout(700);
   const r1=await p.evaluate(()=>({ow:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
   await p.evaluate(()=>{location.hash='#~all'}); await p.waitForTimeout(900);
   const r2=await p.evaluate(()=>({ow:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
   await p.evaluate(()=>{location.hash='#~s/cms/api/rest'}); await p.waitForTimeout(900);
   const r3=await p.evaluate(()=>({ow:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
   out['w'+w]={read:r1,tray:r2,recto:r3,errs:e2};
   if(w===380) await p.screenshot({path:DIR+'p-narrow.jpg',type:'jpeg',quality:72});
   await c.close();
 }

 // --- key card + magnifier + tabs + search ---
 c=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});
 p=await c.newPage(); const e3=[]; p.on('pageerror',x=>e3.push(x.message)); p.on('console',m=>{if(m.type()==='error')e3.push(m.text())});
 await p.goto('http://127.0.0.1:8977/#/cms/api/document-service',{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>window.__HERB_READY__===true,{timeout:20000});
 await p.waitForTimeout(600);
 await p.evaluate(()=>{const k=document.querySelector('#keycard'); if(k.hidden){document.querySelector('#btnKey').click();}}); await p.waitForTimeout(500);
 out.key = await p.evaluate(()=>{const k=document.querySelector('#keycard');return {hidden:k.hidden,svgs:k.querySelectorAll('svg').length,chars:k.innerText.length}});
 await p.screenshot({path:DIR+'p-key.jpg',type:'jpeg',quality:75});
 await p.click('#keyClose'); await p.waitForTimeout(300);
 // tabs
 const tabRes = await p.evaluate(()=>{
   const t=document.querySelectorAll('.tabs')[0]; if(!t) return 'no tabs';
   const btns=t.querySelectorAll('.bar button'); if(btns.length<2) return 'one tab';
   btns[1].click();
   return {sel:t.querySelector('.bar button[aria-selected="true"]').textContent, paneHidden:[...t.querySelectorAll('.pane')].map(x=>x.hidden)};
 });
 out.tabs=tabRes;
 // search
 await p.fill('#q','night'); await p.waitForTimeout(500);
 out.search = await p.evaluate(()=>({h:location.hash,n:document.querySelectorAll('.card').length}));
 await p.fill('#q','Marco'); await p.waitForTimeout(500);
 out.searchAuthor = await p.evaluate(()=>({n:document.querySelectorAll('.card').length}));
 // magnifier on the recto
 await p.evaluate(()=>{location.hash='#~s/cms/api/document-service'}); await p.waitForTimeout(1100);
 const bboxr = await p.evaluate(()=>{const e=document.querySelector('#recto');const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}});
 out.rectoBox = bboxr;
 await p.mouse.move(bboxr.x+bboxr.w*0.45, bboxr.y+bboxr.h*0.34); await p.waitForTimeout(250);
 await p.mouse.move(bboxr.x+bboxr.w*0.47, bboxr.y+bboxr.h*0.36); await p.waitForTimeout(500);
 out.lens = await p.evaluate(()=>{const l=document.querySelector('#lens');return{hidden:l.hidden,inner:l.innerHTML.length}});
 await p.screenshot({path:DIR+'p-lens.jpg',type:'jpeg',quality:75});
 out.errs3=e3;
 await b.close();
 console.log(JSON.stringify(out,null,1));
})();
