import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveTheme } from '../js/canvas-instance-theme.js';
test('theme patches merge immutable host colors and remove individual overrides',()=>{
 const first=resolveTheme({mode:'dark',colors:{surface:'#AbCdEf',selection:'#123456'}});
 const next=resolveTheme({mode:'system',colors:{surface:null,grid:'#654321'}},first);
 assert.deepEqual(next,{mode:'system',colors:{selection:'#123456',grid:'#654321'}});
 assert.equal(first.colors.surface,'#abcdef');assert(Object.isFrozen(next)&&Object.isFrozen(next.colors));
});
test('theme validation rejects unsafe colors unknown slots and invalid modes atomically',()=>{
 const before=resolveTheme({mode:'light',colors:{surface:'#ffffff'}});
 for(const patch of [null,[],{mode:'yellow'},{unknown:true},{colors:null},{colors:{unknown:'#ffffff'}},{colors:{surface:'red'}},{colors:{surface:'url(https://invalid.test)'}},{colors:{surface:'#123'}},{colors:{surface:4}},{colors:{surface:'#000000',grid:'bad'}}])assert.throws(()=>resolveTheme(patch,before),TypeError);
 assert.deepEqual(before,{mode:'light',colors:{surface:'#ffffff'}});assert.deepEqual(resolveTheme(),{mode:'inherit',colors:{}});
});
