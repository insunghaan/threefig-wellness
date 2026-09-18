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
 },{window:win,document:{referrer:'https://instagram.com/path?private=value'}});
 analytics.Analytics();callbacks[0]();callbacks[0]();
 const config=win.dataLayer.filter(r=>r[0]==='config');assert.equal(config.length,1);assert.equal(config[0][2].page_location,'https://3fig.io/?utm_source=instagram');assert.equal(config[0][2].page_referrer,'https://instagram.com/');
 analytics.trackEvent('generate_lead');assert.equal(win.dataLayer.at(-1)[1],'generate_lead');const n=win.dataLayer.length;
 win.location.pathname='/app';analytics.trackEvent('generate_lead');assert.equal(win.dataLayer.length,n);
 win.location.pathname='/';win.location.hostname='localhost';analytics.trackEvent('generate_lead');assert.equal(win.dataLayer.length,n);
});
