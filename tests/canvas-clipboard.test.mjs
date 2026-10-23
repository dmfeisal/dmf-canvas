import test from 'node:test';
import assert from 'node:assert/strict';
import {createObjectClipboard,validateTransfer} from '../js/canvas-instance-clipboard.js';
const transfer=()=>({format:'dmf-canvas-clipboard',version:1,objects:[{data:{type:'text'},bounds:{left:40,top:40,width:100,height:30}}]});
test('page object clipboard isolates data subscribers and clears on last teardown',()=>{
 const clipboard=createObjectClipboard();let calls=0;const off=clipboard.subscribe(()=>calls++),other=clipboard.subscribe(()=>calls++);const source=transfer();clipboard.write(source);source.objects[0].bounds.left=1;assert.equal(clipboard.read().objects[0].bounds.left,40);const read=clipboard.read();read.objects[0].bounds.left=2;assert.equal(clipboard.read().objects[0].bounds.left,40);assert.equal(calls,2);off();assert.equal(clipboard.count,1);other();assert.equal(clipboard.count,0);clipboard.clear();assert.equal(calls,2);
});
test('object transfer limits reject invalid envelopes before replacing clipboard',()=>{
 const clipboard=createObjectClipboard(),source=transfer();clipboard.write(source);
 for(const mutate of [p=>p.version=2,p=>p.objects=[],p=>p.objects=Array(51).fill(p.objects[0]),p=>p.objects[0].bounds.width=0,p=>p.objects[0].bounds.top=Infinity,p=>p.objects[0].bounds.left='4',p=>p.objects[0].data.padding='x'.repeat(131072)]){const bad=transfer();mutate(bad);assert.throws(()=>clipboard.write(bad));assert.deepEqual(clipboard.read(),source);}
 assert.throws(()=>validateTransfer(null));const listeners=Array.from({length:50},()=>clipboard.subscribe(()=>{}));assert.throws(()=>clipboard.subscribe(()=>{}));listeners.forEach(off=>off());assert.equal(clipboard.count,0);
});
