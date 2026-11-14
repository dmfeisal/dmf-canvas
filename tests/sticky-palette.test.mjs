import test from 'node:test';
import assert from 'node:assert/strict';
import {stickyColors,legacyStickyColors} from '../js/canvas-instance-sticky.js';
import {validateObject} from '../js/canvas-instance-document.js';

// The sixteen paper colours of docs/prd/STYLING-EXPORT.md. Hex values are dmf-web's digital approximations.
const hex={red:'#f05366',orange:'#ffae5f',yellow:'#ffcf34',green:'#63c787',blue:'#68d4f8',iris:'#c29bd4',pink:'#ffbbd4',blush:'#f2d4e0',lilac:'#e5dcef',denim:'#9cc7fc',mint:'#b5e2df',gray:'#bfb6b7',aqua:'#6bd9e6',lime:'#e4ee59',guava:'#ff8b98',magenta:'#f9a6ea'};
const luminance=value=>{const channels=[0,2,4].map(i=>parseInt(value.slice(1+i,3+i),16)/255).map(c=>c<=.03928?c/12.92:((c+.055)/1.055)**2.4);return .2126*channels[0]+.7152*channels[1]+.0722*channels[2];};
const contrast=(a,b)=>{const [hi,lo]=[luminance(a),luminance(b)].sort((x,y)=>y-x);return (hi+.05)/(lo+.05);};

test('sixteen paper colours keep the original three and reach WCAG AA with the dark note ink',()=>{
  assert.equal(stickyColors.length,16);
  assert.deepEqual([...stickyColors].sort(),Object.keys(hex).sort());
  assert.deepEqual([...legacyStickyColors],['yellow','blue','pink']);
  for(const key of stickyColors)assert.ok(contrast('#1c1c1c',hex[key])>=4.5,`${key} fails 4.5:1 with dark ink`);
});

test('boards accept every paper key and refuse unknown ones',()=>{
  const record=key=>({type:'sticky',layout:{left:20,top:20,width:240,height:240,fontSize:18},state:{x:0,y:0,scale:1,angle:0,width:'240px',content:'Note',paperColor:key},text:'Note'});
  for(const key of stickyColors)assert.equal(validateObject(record(key)).state.paperColor,key);
  assert.throws(()=>validateObject(record('purple')),TypeError);
});
