import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function load(file, modules, globals = {}) {
 const code = ts.transpileModule(readFileSync(new URL('../' + file, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
 const context = { exports: {}, require: name => { if (!(name in modules)) throw Error('Unmocked dependency: ' + name); return modules[name]; }, console, process: { env: {} }, URL, Date, ...globals };
 vm.runInNewContext(code, context); return context.exports;
}
test('signup converts only new durable records, excluding duplicates, bots and failures', async () => {
 let existed=false, fail=false, saved, notifications=0;
 class ApiError extends Error { constructor(status,message){ super(message); this.status=status; } }
 const route=load('app/api/waitlist/route.ts',{
 '@/lib/threefig/records-server':{ApiError,boundedBody:async r=>r,checkWrite(){},json:(data,status)=>Response.json(data,{status}),failure:e=>Response.json({error:e.message},{status:e.status||500})},
 '@/lib/threefig/firestore-waitlist':{getFirestoreInstance:()=>null,saveWaitlistSignup:async(...args)=>{if(fail)throw Error('storage unavailable');saved=args;return{alreadyExisted:existed};}},
 '@/lib/threefig/welcome-outbox':{dispatchWelcome(){throw Error('must not send');},welcomeId(){}},
 '@/lib/threefig/geolocation':{resolveGeoLocation:async()=>null},
 '@/lib/threefig/slack-notification':{sendSlackWaitlistNotification:async()=>{notifications++;}},
 '@/lib/threefig/attribution':{sanitizeAttribution:v=>v},
 });
 const request=body=>new Request('http://localhost/api/waitlist',{method:'POST',body:JSON.stringify(body)});
 let response=await route.POST(request({email:'test@example.com',attribution:{campaign:'test'}}));
 assert.equal(response.status,201);assert.equal((await response.json()).created,true);assert.equal(saved[4].campaign,'test');assert.equal(notifications,1);
 existed=true;response=await route.POST(request({email:'test@example.com'}));assert.equal((await response.json()).created,false);assert.equal(notifications,1);
 response=await route.POST(request({email:'test@example.com',company:'bot'}));assert.equal((await response.json()).created,false);
 fail=true;response=await route.POST(request({email:'test@example.com'}));assert.equal(response.status,500);assert.equal((await response.json()).created,undefined);
});
test('GA config is once-only and strips personal URL data; events exclude prototype and local hosts',()=>{
 const callbacks=[];const win={location:{hostname:'3fig.io',pathname:'/',href:'https://3fig.io/?utm_source=instagram&email=private@example.com'}};
 const analytics=load('components/threefig/analytics.tsx',{
 react:{useEffect:fn=>callbacks.push(fn),useState:()=>[false,()=>{}]},'react/jsx-runtime':{},'next/script':{},
 '@/lib/threefig/attribution':{CAMPAIGN_KEYS:['utm_source']},
 '@/lib/threefig/meta-pixel':load('lib/threefig/meta-pixel.ts',{}, {window:win}),
 '@/lib/threefig/openai-pixel':load('lib/threefig/openai-pixel.ts',{}, {window:win}),
 },{window:win,document:{referrer:'https://instagram.com/path?private=value'}});
 analytics.Analytics();callbacks[0]();callbacks[0]();
 const config=win.dataLayer.filter(r=>r[0]==='config');assert.equal(config.length,1);assert.equal(config[0][2].page_location,'https://3fig.io/?utm_source=instagram');assert.equal(config[0][2].page_referrer,'https://instagram.com/');
 analytics.trackEvent('generate_lead');assert.equal(win.dataLayer.at(-1)[1],'generate_lead');const n=win.dataLayer.length;
 win.location.pathname='/app';analytics.trackEvent('generate_lead');assert.equal(win.dataLayer.length,n);
 win.location.pathname='/';win.location.hostname='localhost';analytics.trackEvent('generate_lead');assert.equal(win.dataLayer.length,n);
});

test('Meta buffers first-visit conversion until SDK loads, initializes once, and sends no form data',()=>{
 const win={location:{hostname:'3fig.io',pathname:'/'}};
 const pixel=load('lib/threefig/meta-pixel.ts',{}, {window:win});
 pixel.trackMetaWaitlistLead();pixel.initializeMetaPixel();pixel.initializeMetaPixel();
 const calls=JSON.parse(JSON.stringify(win.fbq.queue));
 assert.deepEqual(calls,[
  ['set','autoConfig',false,'2935955493422843'],
  ['init','2935955493422843'],
  ['trackSingle','2935955493422843','PageView'],
  ['trackSingle','2935955493422843','Lead',{content_name:'3FIG waitlist'}],
 ]);
 assert.equal(win._fbq,win.fbq);
});
test('Meta never initializes on local, teaser, or health-prototype pages',()=>{
 for(const location of [{hostname:'localhost',pathname:'/'},{hostname:'127.0.0.1',pathname:'/'},{hostname:'3fig.io',pathname:'/app/skin'},{hostname:'3fig.io',pathname:'/teaser2'},{hostname:'42sai.io',pathname:'/'}]){
  const win={location};const pixel=load('lib/threefig/meta-pixel.ts',{}, {window:win});
  pixel.initializeMetaPixel();pixel.trackMetaWaitlistLead();assert.equal(win.fbq,undefined);
 }
 const pixel=load('lib/threefig/meta-pixel.ts',{});assert.doesNotThrow(()=>pixel.initializeMetaPixel());
});
test('a throwing Meta SDK cannot fail a saved waitlist registration',()=>{
 const win={location:{hostname:'3fig.io',pathname:'/'},fbq(){throw Error('blocked SDK');}};
 const pixel=load('lib/threefig/meta-pixel.ts',{}, {window:win});assert.doesNotThrow(()=>pixel.trackMetaWaitlistLead());
});

test('Slack notification and waitlist record designate source as utm_campaign from Instagram ad', async () => {
  let slackParams = null;
  let savedArgs = null;
  class ApiError extends Error { constructor(status,message){ super(message); this.status=status; } }
  const route = load('app/api/waitlist/route.ts', {
    '@/lib/threefig/records-server': {
      ApiError,
      boundedBody: async r => r,
      checkWrite() {},
      json: (data, status) => Response.json(data, { status }),
      failure: e => Response.json({ error: e.message }, { status: e.status || 500 }),
    },
    '@/lib/threefig/firestore-waitlist': {
      getFirestoreInstance: () => null,
      saveWaitlistSignup: async (...args) => {
        savedArgs = args;
        return { alreadyExisted: false };
      },
    },
    '@/lib/threefig/welcome-outbox': {
      dispatchWelcome() {},
      welcomeId() {},
    },
    '@/lib/threefig/geolocation': {
      resolveGeoLocation: async () => null,
    },
    '@/lib/threefig/slack-notification': {
      sendSlackWaitlistNotification: async (p) => {
        slackParams = p;
      },
    },
    '@/lib/threefig/attribution': {
      sanitizeAttribution: v => v,
    },
  });

  const request = body => new Request('http://localhost/api/waitlist', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  // Test case matching exact user Instagram UTM parameters
  const igAttribution = {
    first_touch: {
      captured_at: new Date().toISOString(),
      landing_path: '/',
      referrer_host: 'instagram.com',
      utm_source: 'instagram',
      utm_medium: 'paid_social',
      utm_campaign: '3fig_usa_video_20260924',
      utm_content: 'video_skin_balance_v1',
      utm_term: 'us4_age22_55w_ig',
    },
    last_touch: {
      captured_at: new Date().toISOString(),
      landing_path: '/',
      referrer_host: 'instagram.com',
      utm_source: 'instagram',
      utm_medium: 'paid_social',
      utm_campaign: '3fig_usa_video_20260924',
      utm_content: 'video_skin_balance_v1',
      utm_term: 'us4_age22_55w_ig',
    },
  };

  const response = await route.POST(request({
    email: 'insta-lead@example.com',
    attribution: igAttribution,
  }));

  assert.equal(response.status, 201);
  assert.equal(slackParams.source, '3fig_usa_video_20260924');
  assert.equal(savedArgs[1], '3fig_usa_video_20260924');

  // Verify survey submission also retains utm_campaign as source
  let surveySlackParams = null;
  const surveyRoute = load('app/api/waitlist/route.ts', {
    '@/lib/threefig/records-server': {
      ApiError,
      boundedBody: async r => r,
      checkWrite() {},
      json: (data, status) => Response.json(data, { status }),
      failure: e => Response.json({ error: e.message }, { status: e.status || 500 }),
    },
    '@/lib/threefig/firestore-waitlist': {
      getFirestoreInstance: () => null,
      saveWaitlistSignup: async () => ({ alreadyExisted: true }),
    },
    '@/lib/threefig/welcome-outbox': { dispatchWelcome() {}, welcomeId() {} },
    '@/lib/threefig/geolocation': { resolveGeoLocation: async () => null },
    '@/lib/threefig/slack-notification': {
      sendSlackWaitlistNotification: async (p) => {
        surveySlackParams = p;
      },
    },
    '@/lib/threefig/attribution': { sanitizeAttribution: v => v },
  });

  await surveyRoute.POST(request({
    email: 'insta-lead@example.com',
    attribution: igAttribution,
    survey: { gender: 'female', age: '25-34' },
  }));

  assert.equal(surveySlackParams.source, '3fig_usa_video_20260924');
  assert.equal(surveySlackParams.survey.gender, 'female');
});


test('OpenAI queues init before lead, once-only init, and excludes non-production routes', () => {
 const win={location:{hostname:'3fig.io',pathname:'/'}};
 const pixel=load('lib/threefig/openai-pixel.ts',{}, {window:win});
 pixel.trackOpenAIWaitlistLead();pixel.initializeOpenAIPixel();
 assert.deepEqual(JSON.parse(JSON.stringify(win.oaiq.q)),[
  ['init',{pixelId:'R4AXx2xC3cKDDpCqHMqkE8'}],
  ['measure','lead_created',{type:'customer_action'}],
 ]);
 for (const location of [{hostname:'localhost',pathname:'/'},{hostname:'3fig.io',pathname:'/app/skin'},{hostname:'3fig.io',pathname:'/teaser3'}]) {
  const other={location};load('lib/threefig/openai-pixel.ts',{}, {window:other}).trackOpenAIWaitlistLead();assert.equal(other.oaiq,undefined);
 }
 assert.doesNotThrow(()=>load('lib/threefig/openai-pixel.ts',{}).trackOpenAIWaitlistLead());
});

test('real signup handler sends OpenAI only after new success; SDK failure preserves success and GA/Meta', async () => {
 for (const scenario of ['new','duplicate','failure','network','invalid','sdk-failure']) {
  const win={location:{hostname:'3fig.io',pathname:'/'}};
  if(scenario==='sdk-failure') win.oaiq=()=>{throw Error('blocked');};
  let meta=0,success=0,requests=0;
  const hooks={useEffect(){},useState:v=>[v,()=>{}],useRef:v=>({current:v})};
  const jsx=(type,props)=>({type,props});
  const analytics=load('components/threefig/analytics.tsx',{
   react:hooks,'react/jsx-runtime':{jsx,jsxs:jsx},'next/script':{},
   '@/lib/threefig/attribution':{CAMPAIGN_KEYS:[]},
   '@/lib/threefig/meta-pixel':{initializeMetaPixel(){},trackMetaWaitlistLead(){meta++;}},
   '@/lib/threefig/openai-pixel':load('lib/threefig/openai-pixel.ts',{}, {window:win}),
  },{window:win});
  analytics.trackEvent('cta_click');analytics.trackEvent('signup_start');assert.equal(win.oaiq?.q,undefined);
  const dialog=load('components/threefig/teaser3-waitlist-dialog.tsx',{
   react:hooks,'react/jsx-runtime':{jsx,jsxs:jsx},'@radix-ui/react-dialog':{},'lucide-react':{},
   './analytics':analytics,'@/lib/threefig/attribution':{captureBrowserAttribution:()=>({})},
  },{window:win,fetch:async()=>{requests++;if(scenario==='network')throw Error('network');return {ok:scenario!=='failure',json:async()=>({created:scenario==='new'||scenario==='sdk-failure',error:'failed'})};}});
  const tree=dialog.Teaser3WaitlistDialog({open:true,onOpenChange(){},emailDraft:scenario==='invalid'?'bad':'test@example.com',onSuccess(){success++;}});
  function find(node){if(!node||typeof node!=='object')return;if(node.type==='form')return node;for(const child of [node.props?.children].flat(Infinity)){const found=find(child);if(found)return found;}}
  await find(tree).props.onSubmit({preventDefault(){}});
  const converted=scenario==='new'||scenario==='sdk-failure';
  assert.equal(success,Number(converted),scenario);assert.equal(meta,Number(converted),scenario);
  assert.equal(win.dataLayer.filter(c=>c[1]==='generate_lead').length,Number(converted),scenario);
  const events=win.oaiq?.q?.filter(c=>c[0]==='measure')||[];
  assert.equal(events.length,Number(scenario==='new'),scenario);
  assert.equal(requests,Number(scenario!=='invalid'),scenario);
 }
});
