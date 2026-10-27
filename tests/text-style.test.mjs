import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultTextStyle,validateTextStyle,resolveTextStyle,hasTextStyle} from '../js/canvas-instance-text-style.js';
import {validateObject} from '../js/canvas-instance-document.js';
import {validateTransfer} from '../js/canvas-instance-clipboard.js';
import {parseLocalDraft} from '../js/canvas-instance-drafts.js';
test('formatting accepts only bounded plain typography without CSS injection',()=>{
 const style=resolveTextStyle(defaultTextStyle,'font','serif');assert.equal(style.font,'serif');assert.equal(defaultTextStyle.font,'original');assert(Object.isFrozen(style));
 for(const [field,value]of [['font','url(unsafe)'],['size','40'],['size',NaN],['size',7],['size',321],['weight',800],['weight','400'],['align','start'],['wrap','nowrap'],['unknown',1]])assert.throws(()=>resolveTextStyle(defaultTextStyle,field,value));
 assert.throws(()=>validateTextStyle({...defaultTextStyle,color:'red'}));assert.throws(()=>validateTextStyle({font:'sans'}));assert(!hasTextStyle({...defaultTextStyle}));assert.equal(resolveTextStyle(style,'reset'),defaultTextStyle);
});
test('styled text records preserve plain whitelisted data and reject non-Text formatting',()=>{
 const record={type:'text',text:'Text',layout:{left:20,top:20,width:200,height:40,fontSize:32},state:{x:0,y:0,scale:1,angle:0,width:'200px',content:'Text',typography:{...defaultTextStyle,size:32,align:'right'}}};
 assert.deepEqual(validateObject(record).state.typography,record.state.typography);
 assert.throws(()=>validateObject({...record,type:'sticky',state:{...record.state,paperColor:'pink'}}));
 assert.throws(()=>validateObject({...record,state:{...record.state,typography:{...record.state.typography,font:'https://example.com/font.woff'}}}));
 const transfer={format:'dmf-canvas-clipboard',version:2,objects:[{data:record,bounds:{left:20,top:20,width:200,height:40}}]};assert.equal(validateTransfer(transfer).version,2);assert.throws(()=>validateTransfer({...transfer,version:1}));
 const draft={format:'dmf-canvas-draft',version:1,savedAt:1,document:{format:'dmf-canvas',version:2,originals:[],objects:[record]}};assert.equal(parseLocalDraft(JSON.stringify(draft)).document.version,2);
});
