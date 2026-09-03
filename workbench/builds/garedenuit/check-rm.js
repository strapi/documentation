const path=require("path"),http=require("http"),fs=require("fs");
const {chromium}=require("/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core");
const DIR=__dirname,PORT=8676;
const MIME={".html":"text/html",".css":"text/css",".js":"text/javascript",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".gif":"image/gif",".webp":"image/webp"};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split("?")[0]);if(p==="/")p="/index.html";
fs.readFile(path.join(DIR,p),(e,d)=>{if(e){res.writeHead(404);res.end();return;}res.writeHead(200,{"Content-Type":MIME[path.extname(p).toLowerCase()]||"application/octet-stream"});res.end(d);});});
(async()=>{await new Promise(r=>server.listen(PORT,r));
const b=await chromium.launch();const errs=[];const bad=[];
const p=await b.newPage({viewport:{width:1280,height:800},reducedMotion:"reduce"});
p.on("console",m=>{if(m.type()==="error")errs.push(m.text())});
p.on("pageerror",e=>errs.push(String(e)));
const base="http://localhost:"+PORT+"/index.html";
// reduced motion board: text must be fully present without animation
await p.goto(base+"#/gare",{waitUntil:"domcontentloaded"});
await p.waitForSelector(".brow");
const txt=await p.evaluate(()=>document.querySelector('.brow .g-dest').textContent.trim());
if(!/QUICK START GUIDE/.test(txt)) bad.push("reduced-motion board text missing: "+txt);
// tabs interaction + groupId sync
await p.goto(base+"#/cloud/advanced/email",{waitUntil:"domcontentloaded"});
await p.waitForSelector(".tabs");
const before=await p.evaluate(()=>document.querySelectorAll('.tab-panel:not([hidden])').length);
await p.click('.tabs .tab-btn[data-value="ts"]');
const after=await p.evaluate(()=>{
  const sel=[...document.querySelectorAll('.tabs[data-group="js-ts"]')].map(t=>{
    const b=t.querySelector('.tab-btn[aria-selected="true"]');return b?b.dataset.value:"?";});
  return sel;});
if(!after.every(v=>v==="ts")) bad.push("groupId sync failed: "+JSON.stringify(after));
// details + admonition + endpoint presence on rich pages
for(const [slug,sel] of [["/cms/api/rest",".endpoint.ep-http"],["/cms/api/graphql",".endpoint.ep-call"],["/cms/api/document-service",".endpoint.ep-js"],["/cms/quick-start",".adm-prerequisites"],["/cms/quick-start",".adm-strapi"]]){
  await p.evaluate(h=>{location.hash="#"+h;},slug);
  try{await p.waitForSelector(sel,{timeout:6000});}catch(e){bad.push("missing "+sel+" on "+slug);}
}
// an image page renders a real img
await p.evaluate(()=>{location.hash="#/cloud/account/account-billing";});
await p.waitForSelector(".fig img");
const imgOk=await p.evaluate(async()=>{const im=document.querySelector(".fig img");await new Promise(r=>{if(im.complete)r();else{im.onload=r;im.onerror=r;}});return im.naturalWidth>0;});
if(!imgOk) bad.push("image failed to load on account-billing");
await b.close();server.close();
console.log("errors:",errs.length,"bad:",bad.length);errs.concat(bad).forEach(x=>console.log(" ",x));
process.exit(errs.length||bad.length?1:0);
})().catch(e=>{console.error(e);process.exit(2)});
