const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
let saved=null;
const sandbox={localStorage:{getItem:()=>saved,setItem:(k,v)=>saved=v}};
sandbox.window=sandbox;
vm.createContext(sandbox);
for(const file of ['scenarios','decisions','simulation']){
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',file+'.js'),'utf8'),sandbox);
 if(file==='scenarios')sandbox.SSD=sandbox.window.SSD;
}
const S=sandbox.SSD,counts={};let paths=0;
for(const student of ['accept','challenge'])for(const response of ['pause','warn','continue'])for(const support of ['human','audit','statement'])for(const prevention of ['review','explain','monitor'])for(const aftercare of ['fund','patch']){
 S.state={...S.fresh(),student,case:{number:'TEST-042',status:'investigating',feedback:'Fictional test complaint'},decisions:{response,support,prevention},aftercare};
 const e=S.ending(S.state);counts[e.name]=(counts[e.name]||0)+1;paths++;
 for(const value of S.metrics(S.state))assert.ok(Number.isFinite(value)&&value>=0&&value<=100);
 for(const view of Object.values(S.views))assert.equal(typeof view(),'string');
 const before=JSON.stringify(S.metrics(S.state));S.state.decisions.response=response;assert.equal(JSON.stringify(S.metrics(S.state)),before,'Repeated choice cannot farm indicators');
 assert.ok(S.report().includes('THE MORAL BOUNDARY'));
}
assert.equal(paths,108);assert.ok(counts['Responsible Recovery']&&counts['Fragile Trust']&&counts['Systemic Failure']);
assert.equal(S.ending(S.fresh()).name,'Unfinished case');
S.state=S.fresh();assert.equal(S.designReady(),false);S.state.priorities=['review','support','sources'];S.state.kkc={kill:[S.kkc.kill[0]],keep:[S.kkc.keep[0]],change:[S.kkc.change[0]]};assert.equal(S.designReady(),true);
S.state.case={number:'SSD-2048-0042',type:'Other',status:'submitted',feedback:'<img src=x onerror=alert(1)>'};assert.ok(!S.views.complaint().includes('<img src=x'));assert.ok(S.views.complaint().includes('&lt;img'));
S.save();assert.equal(S.load().case.status,'submitted');saved='{broken';assert.equal(S.load().chapter,0);
saved=JSON.stringify({version:1,chapter:999,dashTab:'bad',priorities:['fake','review','review'],kkc:{kill:['bad']}});const recovered=S.load();assert.equal(recovered.chapter,6);assert.equal(recovered.dashTab,'overview');assert.equal(recovered.priorities.length,1);assert.equal(recovered.kkc.kill.length,0);
console.log('PASS: 108 decision paths; 3 endings; indicator bounds; all chapter renders; no click farming; report gate; escaped complaint; persistence and corrupt-state recovery.',counts);
