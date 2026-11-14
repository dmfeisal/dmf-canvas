import test from 'node:test';
import assert from 'node:assert/strict';
import {planExport,exportLimits} from '../export.js';

test('exports keep within 2x, 4096px per side and 12 megapixels, reducing scale rather than failing',()=>{
  assert.deepEqual({...planExport({width:100,height:50,scale:2})},{scale:2,width:200,height:100,reduced:false});
  const wide=planExport({width:3000,height:2000,scale:2});
  assert.ok(Math.max(wide.width,wide.height)<=exportLimits.maxSide,'Side over 4096');
  assert.ok(wide.width*wide.height<=exportLimits.maxPixels,'Over 12 megapixels');
  assert.equal(wide.reduced,true);
  assert.ok(wide.scale<2);
  const tall=planExport({width:10000,height:10,scale:1});
  assert.equal(tall.width,4096);
  assert.equal(planExport({width:800,height:600,scale:9}).scale,2,'Scale above 2x is capped');
  assert.throws(()=>planExport({width:0,height:10}),RangeError);
  assert.throws(()=>planExport({width:10,height:10,scale:0}),RangeError);
});
