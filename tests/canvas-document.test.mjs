import test from 'node:test';
import assert from 'node:assert/strict';
import { validateObject } from '../js/canvas-instance-document.js';
const record=()=>({type:'text',layout:{left:40,top:40,width:120,height:30,fontSize:18},text:'<img src=x onerror=alert(1)>',state:{x:0,y:0,scale:1,angle:0,width:'120px',content:'<img src=x onerror=alert(1)>'}});
test('board records whitelist plain data and isolate returned values',()=>{
  const source=record();source.html='<script>unsafe()</script>';source.layout.background='url(https://example.com)';
  const validated=validateObject(source);assert.equal(validated.text,source.text);assert.equal(validated.locked,false);source.locked=true;assert.equal(validateObject(source).locked,true);assert.equal(validated.html,undefined);assert.equal(validated.layout.background,undefined);
  validated.layout.width=12;assert.equal(source.layout.width,120);
});
test('board records reject malformed geometry, text, colors and drawing resources',()=>{
  for(const mutate of [r=>r.type='iframe',r=>r.group=0,r=>r.group=51,r=>r.group=1.5,r=>r.group=null,r=>r.group='1',r=>r.layer=-1,r=>r.layer=50,r=>r.layer=1.5,r=>r.layer=null,r=>r.locked='true',r=>r.state.scale=Infinity,r=>r.layout.width=-1,r=>r.state.width='url(x)',r=>r.text='different',r=>{r.type='sticky';r.state.paperColor='orange';},r=>{r.type='drawing';r.points=Array(2049).fill({x:1,y:1});r.strokeWidth=4;r.ink='blue';}]){const value=record();mutate(value);assert.throws(()=>validateObject(value));}
  const oversized=record();oversized.unknown='x'.repeat(65536);assert.throws(()=>validateObject(oversized),RangeError);
  const drawing={...record(),type:'drawing',points:[{x:2,y:3}],strokeWidth:8,ink:'red'};const validated=validateObject(drawing);assert.equal(validated.state.content,null);assert.equal(validated.text,undefined);assert.deepEqual(validated.points,[{x:2,y:3}]);validated.points[0].x=4;assert.equal(drawing.points[0].x,2);
});

test('board layer metadata is optional bounded integer data',()=>{const source=record();assert.equal(validateObject(source).layer,undefined);source.layer=49;assert.equal(validateObject(source).layer,49);});

test('board group metadata is optional bounded integer data',()=>{const source=record();assert.equal(validateObject(source).group,undefined);source.group=50;assert.equal(validateObject(source).group,50);});
