import test from 'node:test';
import assert from 'node:assert/strict';
import {validateObject} from '../js/canvas-instance-document.js';
import {validateTransfer} from '../js/canvas-instance-clipboard.js';
import {parseLocalDraft} from '../js/canvas-instance-drafts.js';
import {migrateLegacyDocument,validatePortableDocument} from '../documents.js';
import {validStroke,highlightInks,highlightWidths,highlightOpacity} from '../js/canvas-instance-stroke.js';

const drawing=extra=>({type:'drawing',layout:{left:10,top:10,width:60,height:40,fontSize:18},state:{x:0,y:0,scale:1,angle:0,width:'60px'},points:[{x:2,y:2},{x:30,y:20}],strokeWidth:4,ink:'primary',...extra});
const highlight=extra=>drawing({tool:'highlighter',strokeWidth:20,ink:'yellow',...extra});

test('highlight records keep semantic tool, ink and width and reject pencil-only values',()=>{
  assert.deepEqual(Object.keys(highlightInks),['yellow','pink','blue']);assert.deepEqual(highlightWidths,[12,20,32]);assert.equal(highlightOpacity,.32);
  const value=validateObject(highlight());assert.equal(value.tool,'highlighter');assert.equal(value.ink,'yellow');assert.equal(value.strokeWidth,20);
  assert.equal(validateObject(drawing()).tool,undefined,'Pencil records stay unchanged');
  assert.equal(validateObject(drawing({tool:'pencil'})).tool,undefined,'Explicit pencil normalizes to the default');
  for(const bad of [highlight({ink:'primary'}),highlight({ink:'#ffd84d'}),highlight({strokeWidth:4}),drawing({ink:'yellow'}),drawing({strokeWidth:20}),drawing({tool:'marker'}),drawing({tool:''})])assert.throws(()=>validateObject(bad),TypeError);
  assert.equal(validStroke('highlighter',32,'blue'),true);assert.equal(validStroke('pencil',32,'blue'),false);
});

test('only schema 3 boards, transfers, drafts and migrations carry highlights',()=>{
  const transfer=version=>({format:'dmf-canvas-clipboard',version,objects:[{data:highlight(),bounds:{left:10,top:10,width:60,height:40}}]});
  assert.equal(validateTransfer(transfer(3)).version,3);
  for(const version of [1,2,4])assert.throws(()=>validateTransfer(transfer(version)),TypeError);
  const board=version=>({format:'dmf-canvas',version,originals:[],objects:[highlight()]});
  assert.equal(migrateLegacyDocument(board(3)).nodes[0].data.tool,'highlighter');
  for(const version of [1,2])assert.throws(()=>migrateLegacyDocument(board(version)),TypeError);
  const draft=JSON.stringify({format:'dmf-canvas-draft',version:1,savedAt:100,document:board(3)});
  assert.equal(parseLocalDraft(draft).document.version,3);
  const portable=version=>({format:'dmf-canvas-portable',version,nodes:[{id:'h1',data:highlight()}]});
  assert.equal(validatePortableDocument(portable(2)).version,2);assert.throws(()=>validatePortableDocument(portable(1)),TypeError);assert.throws(()=>validatePortableDocument(portable(3)),TypeError);
  assert.equal(validatePortableDocument({format:'dmf-canvas-portable',version:2,nodes:[{id:'d1',data:drawing()}]}).version,1,'Highlight-free documents normalize to version 1');
});

test('drawing palettes expose frozen semantic inks and widths for host swatches',async()=>{
  const {drawingPalettes}=await import('../pencil.js');
  assert.deepEqual(Object.keys(drawingPalettes.pencil.inks),['primary','blue','red']);assert.deepEqual([...drawingPalettes.pencil.widths],[2,4,8]);
  assert.deepEqual(drawingPalettes.highlighter.inks,{yellow:'#ffd84d',pink:'#ff79b0',blue:'#70c9ff'});assert.deepEqual([...drawingPalettes.highlighter.widths],[12,20,32]);assert.equal(drawingPalettes.highlighter.opacity,.32);
  assert(Object.isFrozen(drawingPalettes)&&Object.isFrozen(drawingPalettes.highlighter.inks)&&Object.isFrozen(drawingPalettes.pencil.widths));
  assert.throws(()=>{'use strict';drawingPalettes.highlighter.inks.yellow='red';});
});
