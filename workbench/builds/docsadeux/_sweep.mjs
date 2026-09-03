import { chromium } from '/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import fs from 'fs';
const BASE='http://localhost:8949/';
const content=JSON.parse(fs.readFileSync(new URL('./content.json',import.meta.url)));
const ALL=process.argv.includes('--all');
let slugs;
if(ALL){slugs=content.order;}
else{
  // >=60 slugs across all sections: take up to 4 per nav section + extremes
  slugs=[];const bySec={};
  for(const s of content.order){const sec=content.pages[s].section+'|'+content.pages[s].product;(bySec[sec]=bySec[sec]||[]).push(s);}
  for(const k of Object.keys(bySec))slugs.push(...bySec[k].slice(0,4));
  slugs=[...new Set(slugs)];
}
console.log('sweeping',slugs.length,'slugs');
async function launch(){
  const browser=await chromium.launch();
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  await page.addInitScript(()=>{
    window.__errs=[];
    window.addEventListener('error',e=>window.__errs.push('err: '+e.message));
    window.addEventListener('unhandledrejection',e=>window.__errs.push('rej: '+(e.reason&&e.reason.message||e.reason)));
    const ce=console.error.bind(console);
    console.error=(...a)=>{window.__errs.push('console.error: '+a.map(String).join(' '));ce(...a);};
  });
  page.on('console',m=>{if(m.type()==='error')pageConsole.push(m.text());});
  await page.goto(BASE,{waitUntil:'networkidle'});
  await page.waitForSelector('#view .readgrid, #view .deckwrap',{timeout:15000});
  return {browser,page};
}
let pageConsole=[];
let {browser,page}=await launch();
const problems=[];
let done=0;
for(const slug of slugs){
  try{
    await page.evaluate(s=>{location.hash='#'+s;},slug);
    await page.waitForFunction(()=>document.querySelector('#view .readgrid article.doc'),null,{timeout:10000});
    // let images/render settle a touch
    const r=await page.evaluate((s)=>{
      const art=document.querySelector('#view .readgrid');
      const textLen=art?art.innerText.length:0;
      const overflow=document.documentElement.scrollWidth-document.documentElement.clientWidth;
      return {textLen,overflow,errs:window.__errs.splice(0),title:document.title};
    },slug);
    if(r.textLen<400)problems.push(slug+' TEXT '+r.textLen);
    if(r.overflow>1)problems.push(slug+' OVERFLOW '+r.overflow);
    if(r.errs.length)problems.push(slug+' ERRS '+JSON.stringify(r.errs.slice(0,3)));
    if(!r.title.includes('Docs à Deux'))problems.push(slug+' TITLE '+r.title);
    if(pageConsole.length){problems.push(slug+' CONSOLE '+JSON.stringify(pageConsole.slice(0,3)));pageConsole=[];}
    done++;
  }catch(e){
    problems.push(slug+' CRASH '+String(e.message).slice(0,120));
    try{await browser.close();}catch(_){}
    ({browser,page}=await launch());
  }
}
// also drive the app tabs
for(const tab of ['deck','matches','singles','browse']){
  try{
    await page.evaluate(t=>{location.hash='#'+t;},tab);
    await page.waitForTimeout(400);
    const r=await page.evaluate(()=>({errs:window.__errs.splice(0),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,len:document.body.innerText.length}));
    if(r.errs.length)problems.push(tab+' ERRS '+JSON.stringify(r.errs.slice(0,3)));
    if(r.overflow>1)problems.push(tab+' OVERFLOW '+r.overflow);
    if(pageConsole.length){problems.push(tab+' CONSOLE '+JSON.stringify(pageConsole.slice(0,3)));pageConsole=[];}
  }catch(e){problems.push(tab+' CRASH '+e.message);}
}
console.log('done:',done,'of',slugs.length);
console.log('problems:',problems.length);
for(const p of problems.slice(0,40))console.log('  ',p);
await browser.close();
process.exit(problems.length?1:0);
