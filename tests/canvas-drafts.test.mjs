import test from 'node:test';
import assert from 'node:assert/strict';
import {createLocalDraft,parseLocalDraft} from '../js/canvas-instance-drafts.js';
const doc=value=>({format:'dmf-canvas',version:1,originals:[],objects:[],testValue:value});
const record=value=>JSON.stringify({format:'dmf-canvas-draft',version:1,savedAt:100,document:doc(value)});
const key='dmf:canvas-draft:v1:test:A';
function fixture(initial) {
 const data=new Map(initial===undefined?[]:[[key,initial]]),timers=new Map(),changes=new Set(),states=new Set();let serial=0,revision=0,value=0,mounted=true,idle=true,writes=0,failRead=false,failWrite=false,loads=0;
 const storage={getItem:k=>{if(failRead)throw new Error('Denied');return data.get(k)??null;},setItem(k,v){if(failWrite)throw Object.assign(new Error('Full'),{name:'QuotaExceededError'});writes++;data.set(k,v);},removeItem:k=>data.delete(k)};
 const canvas={getState:()=>({revision,canSave:mounted&&idle,mounted}),saveDocument:()=>doc(value),loadDocument(input){if(!idle)return {ok:false};value=input.testValue;revision++;loads++;for(const fn of changes)fn({revision,source:'open'});return {ok:true};},subscribeChanges(fn){changes.add(fn);return ()=>changes.delete(fn);},subscribe(fn){states.add(fn);return ()=>states.delete(fn);}};
 const options={key:'test:A',storage,delay:600,now:()=>200,setTimer:fn=>{timers.set(++serial,fn);return serial;},clearTimer:id=>timers.delete(id)};
 return {canvas,options,data,timers,changes,states,get writes(){return writes;},get value(){return value;},get loads(){return loads;},readFails(v){failRead=v;},writeFails(v){failWrite=v;},change(v,notify=true){value=v;revision++;if(notify)for(const fn of changes)fn({revision,source:'text'});},idle(v){idle=v;for(const fn of states)fn(canvas.getState());},fire(){const callbacks=[...timers.values()];timers.clear();callbacks.forEach(fn=>fn());},destroy(){mounted=false;for(const fn of [...states])fn(canvas.getState());}};
}
test('local draft opt-in adapter debounces completed edits and resumes after busy work',()=>{
 const f=fixture(),draft=createLocalDraft(f.canvas,f.options);assert.equal(f.writes,0);assert.equal(draft.getState().phase,'ready');f.change(1);f.change(2);assert.equal(f.timers.size,1);f.fire();assert.equal(f.writes,1);assert.equal(parseLocalDraft(f.data.get(key)).document.testValue,2);assert.equal(draft.getState().phase,'saved');
 f.idle(false);f.change(3);assert.equal(f.timers.size,0);assert.equal(draft.flush(),false);f.idle(true);assert.equal(f.timers.size,1);f.fire();assert.equal(f.writes,2);assert.equal(parseLocalDraft(f.data.get(key)).document.testValue,3);draft.dispose();assert.equal(f.changes.size+f.states.size+f.timers.size,0);
});
test('existing drafts require Restore or Discard and preserve other keys and current work',()=>{
 const f=fixture(record(7));f.data.set('other-key','preserve');const draft=createLocalDraft(f.canvas,f.options);assert.equal(draft.getState().hasDraft,true);f.change(3);f.fire();assert.equal(f.writes,0);assert.equal(f.value,3);f.idle(false);assert.equal(draft.restore(),false);assert.equal(f.loads,0);f.idle(true);assert.equal(draft.restore(),true);assert.equal(f.value,7);assert.equal(f.loads,1);assert.equal(draft.getState().hasDraft,false);assert.equal(f.writes,0);
 f.change(8);f.fire();assert.equal(f.writes,1);assert.equal(draft.discard(),true);assert.equal(f.data.has(key),false);assert.equal(draft.flush(),true);assert.equal(f.data.has(key),false);assert.equal(f.value,8);assert.equal(f.data.get('other-key'),'preserve');draft.dispose();
});
test('quota and denied storage failures preserve data and Retry saves latest revision',()=>{
 const f=fixture();f.readFails(true);const draft=createLocalDraft(f.canvas,f.options);assert.equal(draft.getState().phase,'error');f.change(5);f.fire();assert.equal(f.writes,0);f.readFails(false);assert.equal(draft.retry(),true);f.writeFails(true);f.fire();assert.equal(draft.getState().phase,'error');assert.equal(f.data.has(key),false);assert.equal(f.timers.size,0);f.writeFails(false);draft.retry();f.fire();assert.equal(parseLocalDraft(f.data.get(key)).document.testValue,5);assert.equal(draft.getState().phase,'saved');draft.dispose();
});
test('changed or corrupt stored drafts are never silently overwritten or removed',()=>{
 const f=fixture(),draft=createLocalDraft(f.canvas,f.options);f.change(2);f.data.set(key,record(99));f.fire();assert.equal(draft.getState().phase,'conflict');assert.equal(f.writes,0);assert.equal(f.value,2);f.data.set(key,record(100));assert.equal(draft.discard(),false);assert.equal(parseLocalDraft(f.data.get(key)).document.testValue,100);assert.equal(draft.discard(),true);draft.dispose();
 const bad=fixture('{broken'),recovery=createLocalDraft(bad.canvas,bad.options);assert.equal(recovery.getState().phase,'error');assert.equal(recovery.getState().hasDraft,true);bad.change(10);bad.fire();assert.equal(bad.writes,0);assert.equal(recovery.restore(),false);assert.equal(bad.value,10);assert.equal(recovery.discard(),true);recovery.dispose();
});
test('flush handles queued commits and dispose cancels all timers and subscriptions',()=>{
 const f=fixture(),draft=createLocalDraft(f.canvas,f.options);f.change(1,false);assert.equal(draft.flush(),true);assert.equal(f.writes,1);f.change(2);draft.dispose();f.fire();assert.equal(f.writes,1);assert.equal(draft.retry(),false);assert.equal(draft.restore(),false);assert.equal(draft.discard(),false);assert.equal(f.changes.size+f.states.size,0);
 for(let i=0;i<100;i++){const item=fixture(),adapter=createLocalDraft(item.canvas,item.options);item.change(3);item.destroy();item.fire();assert.equal(item.writes,0);assert.equal(item.changes.size+item.states.size+item.timers.size,0);adapter.dispose();}
});
test('draft record envelope versions timestamps keys and resource limits reject safely',()=>{
 const f=fixture();for(const key of ['',null,'x'.repeat(121),'spaces not allowed'])assert.throws(()=>createLocalDraft(f.canvas,{...f.options,key}));for(const raw of ['{}',record(1).replace('"version":1','"version":2'),record(1).replace('"savedAt":100','"savedAt":-1'),'x'.repeat(1049601),null])assert.throws(()=>parseLocalDraft(raw));assert.equal(parseLocalDraft(record(1)).document.testValue,1);
});

test('enabling local drafts on dirty content schedules the existing completed state',()=>{
 const f=fixture();f.change(9,false);const get=f.canvas.getState;f.canvas.getState=()=>({...get(),dirty:true});const draft=createLocalDraft(f.canvas,f.options);assert.equal(f.timers.size,1);f.fire();assert.equal(parseLocalDraft(f.data.get(key)).document.testValue,9);assert.equal(draft.getState().hasStored,true);draft.discard();assert.equal(draft.getState().hasStored,false);draft.dispose();
});

test('adapter construction releases change subscription if state subscription is unavailable',()=>{
 const f=fixture();f.canvas.subscribe=()=>{throw new Error('Subscription limit');};assert.throws(()=>createLocalDraft(f.canvas,f.options));assert.equal(f.changes.size,0);assert.equal(f.timers.size,0);
});
