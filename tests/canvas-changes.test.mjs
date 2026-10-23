import test from 'node:test';
import assert from 'node:assert/strict';
import {createChangeTracker} from '../js/canvas-instance-changes.js';
const flush=()=>new Promise(resolve=>queueMicrotask(resolve));
test('change revisions preserve saved checkpoints through Undo Redo and branches',async()=>{
 const c=createChangeTracker(error=>{throw error;}),events=[];c.subscribe(e=>events.push(e));
 assert.deepEqual(c.state(),{revision:0,dirty:false});const a=c.commit('move');assert.equal(c.markSaved(1),true);const b=c.commit('text');assert.equal(c.markSaved(1),false);
 c.restore('undo',b.beforeToken);assert.deepEqual(c.state(),{revision:3,dirty:false});c.restore('redo',b.afterToken);assert.equal(c.state().dirty,true);
 c.restore('undo',b.beforeToken);const branch=c.commit('create');assert.notEqual(branch.afterToken,b.afterToken);c.restore('undo',a.beforeToken);assert.equal(c.state().dirty,true);c.open();assert.deepEqual(c.state(),{revision:8,dirty:false});
 assert.equal(events.length,0);await flush();assert.deepEqual(events.map(e=>e.source),['move','text','undo','redo','undo','create','undo','open']);assert.deepEqual(events.map(e=>e.revision),[1,2,3,4,5,6,7,8]);assert.ok(events.every(Object.isFrozen));
});
test('change subscriptions isolate errors order reentry unsubscription and pending teardown',async()=>{
 const errors=[],c=createChangeTracker(e=>errors.push(e)),events=[];c.commit('before-subscription');
 const stop=c.subscribe(e=>{events.push(e.revision);if(e.revision===2)c.commit('text');});const bad=c.subscribe(()=>{throw new Error('Host failure');});
 c.commit('move');await flush();await flush();assert.deepEqual(events,[2,3]);assert.equal(errors.length,2);bad();stop();
 const late=[];c.commit('unobserved');c.subscribe(e=>late.push(e));await flush();assert.equal(late.length,0);
 c.commit('pending');c.destroy();await flush();assert.equal(late.length,0);assert.equal(c.markSaved(),false);assert.throws(()=>c.subscribe(()=>{}));
});
test('change tracker bounds subscribers and releases repeated subscriptions',async()=>{
 const c=createChangeTracker(()=>{}),off=Array.from({length:50},()=>c.subscribe(()=>{}));assert.throws(()=>c.subscribe(()=>{}));off.forEach(fn=>fn());
 for(let i=0;i<1000;i++){const stop=c.subscribe(()=>{});c.commit('move');stop();}await flush();c.destroy();
});
