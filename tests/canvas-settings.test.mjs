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

test('snapping defaults to Align on and Grid off, merges partially and rejects unknown keys',()=>{
 const defaults=resolveSettings();assert.deepEqual({...defaults.snapping},{align:true,grid:false});assert.ok(Object.isFrozen(defaults.snapping));
 const grid=resolveSettings({snapping:{grid:true}},defaults);assert.deepEqual({...grid.snapping},{align:true,grid:true});
 const off=resolveSettings({snapping:{align:false}},grid);assert.deepEqual({...off.snapping},{align:false,grid:true},'Patches keep the other key');
 assert.deepEqual({...resolveSettings({tools:{files:false}},off).snapping},{align:false,grid:true},'Tool patches keep snapping');
 for(const snapping of [null,[],true,{magnet:true},{align:'yes'},{grid:1}])assert.throws(()=>resolveSettings({snapping}),TypeError,JSON.stringify(snapping));
});

test('selection labels default on, persist across other patches and must be boolean',()=>{
 const defaults=resolveSettings();assert.equal(defaults.labels,true);
 const off=resolveSettings({labels:false},defaults);assert.equal(off.labels,false);
 assert.equal(resolveSettings({snapping:{grid:true}},off).labels,false,'Other patches keep labels');
 for(const labels of ['no',0,null])assert.throws(()=>resolveSettings({labels}),TypeError,String(labels));
});

test('camera defaults off, takes bounded zoom limits that include 100% and keeps them across other patches',()=>{
 const defaults=resolveSettings();assert.equal(defaults.camera,false);
 const on=resolveSettings({camera:{}},defaults);assert.deepEqual({...on.camera},{minScale:.2,maxScale:4});assert.ok(Object.isFrozen(on.camera));
 const tight=resolveSettings({camera:{maxScale:2}},on);assert.deepEqual({...tight.camera},{minScale:.2,maxScale:2},'Patches keep the other limit');
 assert.deepEqual({...resolveSettings({labels:false},tight).camera},{minScale:.2,maxScale:2},'Other patches keep the camera');
 assert.equal(resolveSettings({camera:false},tight).camera,false);
 for(const camera of [null,[],true,{world:1},{minScale:0},{minScale:1.5},{maxScale:.5},{maxScale:9},{minScale:'.2'}])assert.throws(()=>resolveSettings({camera}),TypeError,JSON.stringify(camera));
});
