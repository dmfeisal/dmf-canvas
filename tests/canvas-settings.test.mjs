import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveSettings,canvasToolNames} from '../js/canvas-instance-settings.js';
test('embed settings default to all tools and merge immutable host patches',()=>{
 const defaults=resolveSettings(),patch={readOnly:true,tools:{pencil:false}},next=resolveSettings(patch,defaults);
 assert.equal(defaults.readOnly,false);assert.ok(canvasToolNames.every(name=>defaults.tools[name]));
 patch.tools.pencil=true;assert.equal(next.tools.pencil,false);assert.ok(Object.isFrozen(next)&&Object.isFrozen(next.tools));
 const merged=resolveSettings({tools:{files:false}},next);assert.equal(merged.readOnly,true);assert.equal(merged.tools.pencil,false);assert.equal(merged.tools.files,false);assert.equal(next.tools.files,true);
});
test('embed settings reject invalid patches atomically',()=>{
 const before=resolveSettings({tools:{sticky:false}}),snapshot=JSON.stringify(before);
 for(const patch of [null,[],true,{unknown:true},{readOnly:'yes'},{tools:null},{tools:[]},{tools:{unknown:false}},{tools:{pencil:0}},{readOnly:true,tools:{files:'false'}}])assert.throws(()=>resolveSettings(patch,before),TypeError);
 assert.equal(JSON.stringify(before),snapshot);
});
