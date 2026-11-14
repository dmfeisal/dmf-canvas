import test from 'node:test';
import assert from 'node:assert/strict';
import {validateObject} from '../js/canvas-instance-document.js';
import {validateTransfer} from '../js/canvas-instance-clipboard.js';
import {parseLocalDraft} from '../js/canvas-instance-drafts.js';
import {migrateLegacyDocument,validatePortableDocument} from '../documents.js';
import {shapeKinds,shapeFills,shapeCorners,validShape} from '../js/canvas-instance-shape.js';

const base={layout:{left:10,top:10,width:120,height:80,fontSize:18},state:{x:0,y:0,scale:1,angle:0,width:'120px'}};
const shape=extra=>({type:'shape',...base,shape:'rectangle',ink:'blue',strokeWidth:4,...extra});
const line=extra=>shape({shape:'line',points:[{x:0,y:0},{x:120,y:80}],...extra});

test('shape records keep semantic kind, ink, width, fill and corners',()=>{
  assert.deepEqual([...shapeKinds],['rectangle','ellipse','diamond','line','arrow']);
  assert.deepEqual([...shapeFills],['none','tint']);assert.deepEqual([...shapeCorners],['sharp','round']);
  const rect=validateObject(shape({fill:'tint',corners:'round',locked:true,layer:2,group:3}));
  assert.deepEqual({shape:rect.shape,ink:rect.ink,strokeWidth:rect.strokeWidth,fill:rect.fill,corners:rect.corners,locked:rect.locked,layer:rect.layer,group:rect.group},{shape:'rectangle',ink:'blue',strokeWidth:4,fill:'tint',corners:'round',locked:true,layer:2,group:3});
  const plain=validateObject(shape());assert.equal(plain.fill,'none','Fill defaults to none');assert.equal(plain.corners,'sharp','Rectangle corners default to sharp');
  for(const kind of ['ellipse','diamond']){const value=validateObject(shape({shape:kind,fill:'tint'}));assert.equal(value.corners,undefined);assert.equal(value.points,undefined);}
  const arrow=validateObject(line({shape:'arrow'}));assert.deepEqual(arrow.points,[{x:0,y:0},{x:120,y:80}]);assert.equal(arrow.fill,'none');
  assert.equal(validateObject(shape({text:'ignored'})).text,undefined,'Shapes never carry text');
});

test('shape validation rejects resolved values, mismatched options and bad points',()=>{
  const bad=[
    shape({shape:'star'}),shape({ink:'#1677ff'}),shape({ink:'yellow'}),shape({strokeWidth:3}),shape({strokeWidth:20}),shape({fill:'solid'}),shape({fill:'#fff'}),
    shape({corners:'pill'}),shape({shape:'ellipse',corners:'round'}),line({corners:'sharp'}),line({fill:'tint'}),
    shape({points:[{x:0,y:0},{x:1,y:1}]}),line({points:undefined}),line({points:[{x:0,y:0}]}),line({points:[{x:0,y:0},{x:1,y:1},{x:2,y:2}]}),
    line({points:[{x:0,y:0},{x:121,y:80}]}),line({points:[{x:-1,y:0},{x:10,y:10}]}),line({points:[{x:5,y:5},{x:5,y:5}]}),line({points:[{x:0,y:0},{x:Infinity,y:1}]}),
    shape({layout:{...base.layout,width:0}}),
  ];
  for(const value of bad)assert.throws(()=>validateObject(value),TypeError,JSON.stringify(value).slice(0,120));
  assert.throws(()=>validShape({shape:'rectangle',ink:'blue'},base.layout),TypeError,'Width is required');
});

test('only schema 4 boards, transfers, drafts and migrations carry shapes',()=>{
  const transfer=version=>({format:'dmf-canvas-clipboard',version,objects:[{data:shape(),bounds:{left:10,top:10,width:120,height:80}}]});
  assert.equal(validateTransfer(transfer(4)).version,4);
  for(const version of [1,2,3,6])assert.throws(()=>validateTransfer(transfer(version)),TypeError);
  const board=version=>({format:'dmf-canvas',version,originals:[],objects:[shape(),line({shape:'arrow'})]});
  const migrated=migrateLegacyDocument(board(4));assert.equal(migrated.version,3);assert.deepEqual(migrated.nodes.map(node=>node.data.shape),['rectangle','arrow']);
  for(const version of [1,2,3,5])assert.throws(()=>migrateLegacyDocument(board(version)),TypeError);
  const draft=JSON.stringify({format:'dmf-canvas-draft',version:1,savedAt:100,document:board(4)});
  assert.equal(parseLocalDraft(draft).document.version,4);
  const portable=version=>({format:'dmf-canvas-portable',version,nodes:[{id:'s1',data:shape()}]});
  assert.equal(validatePortableDocument(portable(3)).version,3);
  for(const version of [1,2,4])assert.throws(()=>validatePortableDocument(portable(version)),TypeError);
});

test('shape-free content keeps its existing versions',()=>{
  const text={type:'text',...base,text:'Hi',state:{...base.state,content:'Hi'}};
  assert.equal(validatePortableDocument({format:'dmf-canvas-portable',version:3,nodes:[{id:'t1',data:text}]}).version,1);
  assert.equal(migrateLegacyDocument({format:'dmf-canvas',version:4,originals:[],objects:[text]}).version,1);
  assert.equal(validateTransfer({format:'dmf-canvas-clipboard',version:1,objects:[{data:text,bounds:{left:10,top:10,width:120,height:80}}]}).version,1);
});

test('only shapes keep a box height in their saved state',()=>{
  assert.equal(validateObject(shape({state:{...base.state,height:'96.5px'}})).state.height,'96.5px');
  assert.equal(validateObject(shape()).state.height,undefined,'Height is optional');
  for(const height of ['96',96,'1e3px','-4px','96.5em'])assert.throws(()=>validateObject(shape({state:{...base.state,height}})),TypeError);
  const text={type:'text',...base,text:'Hi',state:{...base.state,content:'Hi',height:'40px'}};
  assert.throws(()=>validateObject(text),TypeError,'Text never stores a height');
});

test('the shapes tool permission exists, defaults on and is independent of pencil',async()=>{
  const {resolveSettings,canvasToolNames}=await import('../js/canvas-instance-settings.js');
  assert(canvasToolNames.includes('shapes'));
  const defaults=resolveSettings();assert.equal(defaults.tools.shapes,true);
  const next=resolveSettings({tools:{pencil:false}},defaults);assert.equal(next.tools.shapes,true,'Turning Pencil off keeps Shapes');
  assert.equal(resolveSettings({tools:{shapes:false}},defaults).tools.pencil,true,'Turning Shapes off keeps Pencil');
});

test('shape records mirror their style in state.style so Open can restore it',()=>{
  const rect=validateObject(shape({fill:'tint',corners:'round'}));
  assert.deepEqual(rect.state.style,{ink:'blue',strokeWidth:4,fill:'tint',corners:'round'},'Validation always fills in state.style');
  assert.deepEqual(validateObject(line()).state.style,{ink:'blue',strokeWidth:4,fill:'none'},'Lines carry no corners');
  const reordered={corners:'round',fill:'tint',strokeWidth:4,ink:'blue'};
  assert.deepEqual(validateObject(shape({fill:'tint',corners:'round',state:{...base.state,style:reordered}})).state.style,rect.state.style,'Key order does not matter');
  for(const style of [{ink:'red',strokeWidth:4,fill:'tint',corners:'round'},{ink:'blue',strokeWidth:4,fill:'tint'},{ink:'blue',strokeWidth:4,fill:'tint',corners:'round',extra:1},null,['blue']])
    assert.throws(()=>validateObject(shape({fill:'tint',corners:'round',state:{...base.state,style}})),TypeError,JSON.stringify(style));
  assert.equal(validateObject({type:'text',...base,text:'Hi',state:{...base.state,content:'Hi',style:{ink:'blue'}}}).state.style,undefined,'Text drops a shape style, like any unknown state key');
});
