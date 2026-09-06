/* ---- the lexicon: the page's concepts choose the drawn subject ----
   Ordered rules, most specific first. Each returns a subject id plus the
   parameters the painter needs, pulled from the page's OWN words. */
const PF_RULES=[
  ['edict',      t=>/\/breaking-changes\//.test(t.slug)],
  ['embassy',    t=>/-providers\/(?!.*new-provider)/.test(t.slug)&&!/media-library|email/.test(t.slug)],
  ['embassy',    t=>/media-library-providers\/|email-custom|email-nodemailer/.test(t.slug)],
  ['forgeshield',t=>/new-provider-guide/.test(t.slug)],
  ['masonry',    t=>/content-type-builder|server-content-types/.test(t.txt)],
  ['doors',      t=>/\brbac\b|role-based|admin permissions/.test(t.txt)],
  ['counter',    t=>/users?[ -]?(&|and)?[ -]?permissions(?!.*provider)/.test(t.txt)],
  ['vault',      t=>/api tokens?|admin tokens?/.test(t.txt)],
  ['ledger',     t=>/audit logs?|usage information/.test(t.txt)],
  ['meters',     t=>/billing|usage & billing/.test(t.txt)],
  ['gatebanners',t=>/single sign-on|\bsso\b/.test(t.txt)],
  ['gallery',    t=>/media library/.test(t.txt)],
  ['quay',       t=>/docker/.test(t.txt)],
  ['wires',      t=>/webhook/.test(t.txt)],
  ['bellpost',   t=>/email/.test(t.txt)],
  ['belfry',     t=>/notification/.test(t.txt)],
  ['clockworks', t=>/\bcron\b|schedule/.test(t.txt)],
  ['constellation',t=>/graphql/.test(t.txt)],
  ['organ',      t=>/interactive query builder/.test(t.txt)],
  ['oracle',     t=>/\bai\b|mcp server|ai for/.test(t.txt)],
  ['temple',     t=>/rest api|openapi|\/api\/rest$|endpoints?/.test(t.txt)],
  ['aqueduct',   t=>/content apis? introduction|\/api\/content-api/.test(t.txt)],
  ['barge',      t=>/data (import|export|management|transfer)|transfer locally|\bimport\b|\bexport\b/.test(t.txt)],
  ['canallocks', t=>/database migrations/.test(t.txt)],
  ['bridge',     t=>/migration|upgrade|codemod|v4.*v5|step-by-step/.test(t.txt)],
  ['gantry',     t=>/deploy/.test(t.txt)],
  ['lighthouse', t=>/observability|monitor|sentry/.test(t.txt)],
  ['ticker',     t=>/\blogs?\b/.test(t.txt)],
  ['press',      t=>/draft (&|and) publish|draft-and-publish/.test(t.txt)],
  ['pressgate',  t=>/publication[ -]filter/.test(t.txt)],
  ['corridor',   t=>/content history/.test(t.txt)],
  ['editions',   t=>/releases?\b|release notes|what's new|changelog/.test(t.txt)],
  ['spyglass',   t=>/preview/.test(t.txt)],
  ['relay',      t=>/review workflows?/.test(t.txt)],
  ['stairflag',  t=>/quick start|getting started|setting up|first steps/.test(t.txt)],
  ['toolbox',    t=>/installation\b|\/cms\/installation/.test(t.txt)],
  ['cutaway',    t=>/project structure|plugin structure/.test(t.txt)],
  ['switchyard', t=>/\broutes?\b|routing/.test(t.txt)],
  ['tollroad',   t=>/middleware/.test(t.txt)],
  ['tribunal',   t=>/polic(y|ies)|validation|sanitiz/.test(t.txt)],
  ['funnelworks',t=>/filter/.test(t.txt)],
  ['marshalling',t=>/sort|order|pagination/.test(t.txt)],
  ['magnetwell', t=>/populat/.test(t.txt)],
  ['chains',     t=>/relations?\b/.test(t.txt)],
  ['flags',      t=>/internationalization|locale|localization|translation|i18n/.test(t.txt)],
  ['semaphore',  t=>/\bstatus\b/.test(t.txt)],
  ['cylinders',  t=>/database|transactions?\b/.test(t.txt)],
  ['weathervanes',t=>/environment|env variables|variables/.test(t.txt)],
  ['monolith',   t=>/\bcli\b|command line|commands/.test(t.txt)],
  ['helm',       t=>/admin panel$|the admin panel|features\/admin-panel/.test(t.txt)],
  ['atelier',    t=>/admin-panel-customization|wysiwyg|favicon|logos|theme|homepage customization|bundlers/.test(t.txt)],
  ['bluedesk',   t=>/typescript|models\b|customization$|back-?end customization/.test(t.txt)],
  ['kitchen',    t=>/examples|cookbook/.test(t.txt)],
  ['bazaar',     t=>/marketplace/.test(t.txt)],
  ['plugbay',    t=>/plugin/.test(t.txt)],
  ['automaton',  t=>/lifecycle|functions\b|hooks?\b/.test(t.txt)],
  ['gauntlet',   t=>/testing/.test(t.txt)],
  ['safetynet',  t=>/error handling|errors\b/.test(t.txt)],
  ['moulds',     t=>/templates?\b/.test(t.txt)],
  ['roundtable', t=>/collaboration|community/.test(t.txt)],
  ['kiosk',      t=>/\bfaq\b|support/.test(t.txt)],
  ['codex',      t=>/documentation plugin|docs\b/.test(t.txt)],
  ['gearworks',  t=>/configuration|configurations|settings|server\b|features$|options/.test(t.txt)],
  ['spanner',    t=>/strapi-utils|utils|upgrade tool|tooling|client\b|sdk/.test(t.txt)],
  ['magnetwell', t=>/fields?\b|select/.test(t.txt)],
  ['bluedesk',   t=>/develop|custom/.test(t.txt)],
  ['temple',     t=>/\bapi\b|crud|operations|query engine|document service|entity service|requests/.test(t.txt)],
  ['skyharbor',  t=>/cloud/.test(t.txt)],
];
/* the provider row: each foreign gate carries its OWN drawn emblem */
const PF_EMBLEMS=['discord','github','google','microsoft','keycloak','okta','auth-zero',
  'aws-cognito','facebook','instagram','linkedin','patreon','reddit','twitch','twitter',
  'vk','cas','amazon-s3','cloudinary','local-upload','nodemailer','mailgun'];
function pfProviderOf(slug){
  const last=slug.split('/').pop();
  for(const e of PF_EMBLEMS) if(last.indexOf(e)>=0) return e;
  if(/email-custom/.test(slug)) return 'nodemailer';
  return last;
}
function pfSubjectFor(slug, meta, series){
  const txt=(String(meta.title||'')+' '+String(meta.fullTitle||'')+' '+slug).toLowerCase();
  const t={slug, txt};
  for(const [id,test] of PF_RULES){ if(test(t)) return id; }
  return 'monogram';
}
/* the edict family reads its verdict from the page's own verb */
function pfEdictMode(title){
  const s=String(title||'').toLowerCase();
  if(/instead of|replaced by|replaces|uses? | use /.test(s)) return 'handover';
  if(/removed|removes\b/.test(s)) return 'toppled';
  if(/deprecated/.test(s)) return 'roped';
  if(/unsupported|no longer|no .*support|not the default|\bno\b/.test(s)) return 'boarded';
  if(/refactored|rewritten|updated|modified|shortened|moved/.test(s)) return 'scaffold';
  return 'newflag';
}
/* the figure takes the pose the title's verb demands */
function pfPoseFor(txt,h){
  const s=txt.toLowerCase();
  if(/deploy|publish|launch|release|ship/.test(s)) return ['leap','fly'][h%2];
  if(/delete|remov|unsupported|breaking|deprecat|error/.test(s)) return 'warn';
  if(/migrat|upgrad|transfer|step|import|export|install/.test(s)) return ['run','lift'][h%2];
  if(/token|permission|secur|role|sso|auth|protect/.test(s)) return ['brace','stand'][h%2];
  if(/creat|add|new|build|setup|custom/.test(s)) return ['lift','point'][h%2];
  if(/config|setting|option|variable|cli|command/.test(s)) return ['console','point'][h%2];
  if(/understand|intro|concept|overview|structure|faq/.test(s)) return ['think','monologue'][h%2];
  return ['stand','point','raise','think'][h%4];
}

/* ---- the design solver: page structure chooses the composition ---- */
const PF_TERRAIN={doors:'interior',vault:'interior',ledger:'interior',meters:'interior',
  counter:'interior',gallery:'interior',press:'interior',tribunal:'interior',
  funnelworks:'interior',bluedesk:'interior',kitchen:'interior',plugbay:'interior',
  automaton:'interior',roundtable:'interior',atelier:'interior',oracle:'interior',
  organ:'interior',moulds:'interior',codex:'interior',corridor:'interior',
  forgeshield:'interior',spanner:'interior',
  quay:'water',barge:'water',canallocks:'water',lighthouse:'water',helm:'water',
  semaphore:'water',
  monolith:'desert',
  wires:'hills',temple:'hills',aqueduct:'hills',bridge:'hills',tollroad:'hills',
  chains:'hills',stairflag:'hills',sentrybox:'hills',
  constellation:'field',gantry:'field',signpost:'field',switchyard:'field',
  marshalling:'field',magnetwell:'field',cylinders:'field',gauntlet:'field',
  toolbox:'field',
  skyharbor:'sky',
  masonry:'city',gatebanners:'city',bellpost:'city',belfry:'city',clockworks:'city',
  edict:'city',editions:'city',spyglass:'city',cutaway:'city',flags:'city',
  weathervanes:'city',bazaar:'city',safetynet:'city',kiosk:'city',embassy:'city',
  ticker:'city',relay:'city',pressgate:'interior',gearworks:'interior'};
const PF_NIGHTY={constellation:1,lighthouse:1,ticker:0.8,spyglass:0.6,belfry:0.5,
  clockworks:0.5,sentrybox:0.7,editions:0.3,wires:0.6};
function pfDesign(slug, meta, series){
  const seed=hash32('plate'+slug);
  const h=hash32('forge'+slug);
  const m=meta||{}; const st=m.stats||{words:300,code:0,img:0,table:0,admon:0,steps:0,paras:6,tabs:0};
  const heads=(m.heads||[]).filter(x=>x.l===2);
  const heads3=(m.heads||[]).filter(x=>x.l===3);
  const sub=pfSubjectFor(slug,m,series);
  const terrain=PF_TERRAIN[sub]||['city','hills','field'][h%3];
  /* the hour: seeded, bent by what the subject wants of the sky */
  let tod=((h>>>3)%97)/97;                        /* 0 dawn → .5 dusk → 1 night */
  const nightBias=PF_NIGHTY[sub]||0;
  tod=clamp(tod*(1-nightBias)+nightBias*(0.8+((h>>>5)%20)/100),0,1);
  const night=tod>0.72, dusk=tod>0.45&&!night, dawn=tod<0.18;
  /* structure → skeleton: the body's own bulk digs the foreground */
  const wordsN=clamp((st.words||0)/1500,0,1);
  const hz=terrain==='sky'?0.62:clamp(0.36+wordsN*0.30+(((h>>>7)%13)-6)*0.008,0.30,0.72);
  /* the focal side swings with the page's own heading arithmetic */
  const sideRoll=((heads.length*3+heads3.length+String(m.title||'').length)+(h>>>9))%5;
  const fx=[0.26,0.38,0.5,0.62,0.72][sideRoll];
  const primeW=clamp(0.30+((h>>>11)%17)*0.012+st.img*0.008,0.30,0.56);
  const prime={x:clamp(fx-primeW/2,0.02,0.96-primeW), y:0, w:primeW, h:0};
  /* stations: one per real h2, marching along the page's own path */
  const k=Math.min(heads.length, terrain==='interior'?3:4);
  const stations=[];
  for(let i=0;i<k;i++){
    const t2=(k===1)?0.5:i/(k-1);
    let sx=0.10+0.80*t2;
    if(Math.abs(sx-fx)<primeW*0.55) sx=sx<fx?clamp(prime.x-0.07,0.06,1):clamp(prime.x+primeW+0.07,0,0.94);
    const curve=clamp((heads3.length/Math.max(1,heads.length))*0.05,0,0.09);
    const sy=hz+0.05+curve*Math.sin(Math.PI*t2)+((hash32('st'+slug+i)%9)-4)*0.006;
    stations.push({fx:sx, fy:clamp(sy,hz+0.02,0.9), text:pfShort(heads[i].t,20).toUpperCase(),
      prop:propFor(heads[i].t)});
  }
  /* the hero walks in at the scale the vantage allows */
  const interior=terrain==='interior';
  const figH=interior?0.30+((h>>>13)%7)*0.01:0.20+((h>>>13)%9)*0.01;
  const figX=fx<0.5?clamp(fx+primeW/2+0.06,0.05,0.78):clamp(fx-primeW/2-0.26,0.03,0.78);
  const pose=pfPoseFor(String(m.title||'')+' '+slug,(h>>>15));
  const groundY=interior?0.94:clamp(hz+0.24,hz+0.16,0.97);
  const light= night?{mode:'rim',dir:[fx<0.5?-0.8:0.8,-0.3],tint:'rgba(210,220,255,.45)'}
            : dusk?{mode:'screen',at:[tod>0.58?0.12:0.88,0.2],tint:'rgba(255,196,84,.4)'}
            : dawn?{mode:'screen',at:[0.85,0.15],tint:'rgba(255,224,150,.4)'}:null;
  const figs=[{kind:'hero',pose,box:[figX,groundY-figH,figH*0.62,figH],
    flip:figX>fx, noFx:true, light}];
  /* weather and crowd from the body's own counts */
  const weather={clouds:clamp(Math.round((st.paras||0)/8),0,3),
    streaks:clamp(st.admon||0,1,6), birds:clamp(st.img||0,0,4)};
  const crowdN=clamp(m.inb||0,0,12);
  return { seed, slug, m, series, sub, terrain, tod, night, dusk, dawn, hz,
    fx, prime, stations, figs, weather, crowdN, h,
    labels:heads.map(x=>pfShort(x.t,20).toUpperCase()),
    labels3:heads3.map(x=>pfShort(x.t,18).toUpperCase()),
    toks:pfWords(m.title||slug).slice(0,4),
    interior, edict: sub==='edict'?pfEdictMode(m.title):null,
    provider: sub==='embassy'?pfProviderOf(slug):null,
    venue: /sso/.test(slug)?'THE SSO GATE':/users-and-permissions/.test(slug)?'U&P CUSTOMS'
          :/media-library/.test(slug)?'MEDIA FREIGHT':/email/.test(slug)?'THE MAIL ROAD'
          :String(m.section||'').toUpperCase() };
}
