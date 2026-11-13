import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validatePortableDocument,migrateLegacyDocument,importExcalidraw} from '../documents.js';
const data=()=>({type:'text',layout:{left:40,top:40,width:180,height:30,fontSize:20},text:'Hello',state:{x:0,y:0,scale:1,angle:0,width:'180px',content:'Hello'}});
const portable=()=>({format:'dmf-canvas-portable',version:1,nodes:[{id:'node:1',data:data()}]});
test('portable validation isolates bounded records and rejects ambiguous identities graphs and future versions',()=>{
 const input=portable(),out=validatePortableDocument(input);input.nodes[0].data.text='changed';assert.equal(out.nodes[0].data.text,'Hello');
 for(const mutate of [d=>d.version=4,d=>d.nodes.push(d.nodes[0]),d=>d.nodes[0].id='<script>',d=>d.nodes[0].data.group=1,d=>d.nodes[0].data.layer=1,d=>d.nodes[0].source={format:'html',id:'x'},d=>d.nodes=Array(51).fill(d.nodes[0])]){const d=portable();mutate(d);assert.throws(()=>validatePortableDocument(d));}
 assert.throws(()=>validatePortableDocument({...portable(),unknown:'x'.repeat(1048576)}),RangeError);
});
test('schema 1 and 2 migrations preserve originals independently and deterministically',()=>{
 for(const version of [1,2]){const source={format:'dmf-canvas',version,originals:[{id:7,data:data()}],objects:[data()]};const result=migrateLegacyDocument(source);assert.deepEqual(result.nodes.map(n=>n.id),['legacy-original:7','legacy-object:0']);assert.deepEqual(migrateLegacyDocument(source),result);assert.equal(source.originals[0].id,7);}
 const invalid={format:'dmf-canvas',version:1,originals:[],objects:[{...data(),state:{...data().state,typography:{font:'sans',size:20,weight:400,align:'left',wrap:'fixed'}}}]};assert.throws(()=>migrateLegacyDocument(invalid));
 assert.throws(()=>migrateLegacyDocument({format:'dmf-canvas',version:2,originals:[{id:1,data:data()},{id:1,data:data()}],objects:[]}));
});
test('Excalidraw conversion preserves source identity and explicitly accounts for every object',async()=>{
 const source=await readFile(new URL('./fixtures/portable-excalidraw.excalidraw',import.meta.url),'utf8');const result=importExcalidraw(source);
 assert.deepEqual(result,importExcalidraw(source));assert.equal(result.document.nodes.length,3);assert.equal(result.report.length,4);assert.deepEqual(result.report.map(r=>r.status),['Converted','Converted','Converted','Unsupported']);assert.equal(result.adapterVersion,2);assert.equal(result.document.version,3,'Shapes need portable version 3');assert.equal(result.document.nodes[2].data.shape,'rectangle');assert.equal(result.document.nodes[0].id,'excalidraw:title');assert.equal(result.document.nodes[1].data.type,'drawing');assert(result.report.every(row=>row.reasons.length));assert.equal(result.document.nodes[0].source.id,'title');
 const reordered=JSON.parse(source);reordered.elements.reverse();assert.equal(importExcalidraw(reordered).document.nodes.find(n=>n.source.id==='title').id,'excalidraw:title');
});
test('Excalidraw rejects bad envelopes and reports malformed supported elements without producing executable data',()=>{
 assert.throws(()=>importExcalidraw({type:'excalidraw',version:99,elements:[]}));assert.throws(()=>importExcalidraw('{bad'));assert.throws(()=>importExcalidraw({type:'excalidraw',version:2,elements:[{id:'a'},{id:'a'}]}));
 const result=importExcalidraw({type:'excalidraw',version:2,elements:[{id:'x',type:'text',x:0,y:0,width:10,height:10,fontSize:Infinity,text:'unsafe'},{id:'remote',type:'image',fileId:'https://example.com'}]});assert.equal(result.document.nodes.length,0);assert(result.report.every(r=>r.status==='Unsupported'));
});

test('frozen legacy file fixtures retain content and schema-2 typography on migration',async()=>{
 for(const version of [1,2]){const input=JSON.parse(await readFile(new URL('./fixtures/legacy-board-v'+version+'.json',import.meta.url),'utf8'));const doc=migrateLegacyDocument(input);assert.equal(doc.nodes[0].id,'legacy-original:7');assert.equal(doc.nodes[0].data.text,'Legacy fixture');assert.equal(doc.nodes[0].data.state.typography?.weight,version===2?600:undefined);}
});

test('Excalidraw shapes, lines and arrows convert with reported losses; bound and multi-point paths stay unsupported',async()=>{
 const source=await readFile(new URL('./fixtures/excalidraw-shapes.excalidraw',import.meta.url),'utf8'),result=importExcalidraw(source);
 assert.deepEqual(result,importExcalidraw(source),'Deterministic');
 const status=Object.fromEntries(result.report.map(row=>[row.sourceId,row.status]));
 assert.deepEqual(status,{card:'Converted',label:'Converted',oval:'Converted',gem:'Converted',rule:'Converted',pointer:'Converted',back:'Converted',both:'Converted',linked:'Unsupported',zigzag:'Unsupported'});
 const node=id=>result.document.nodes.find(item=>item.source.id===id).data,reasons=id=>result.report.find(row=>row.sourceId===id).reasons.join(' ');
 assert.deepEqual([node('card').shape,node('card').ink,node('card').strokeWidth,node('card').fill,node('card').corners],['rectangle','blue',2,'tint','round']);
 assert.match(reasons('card'),/hachure/);assert.match(reasons('card'),/Bound text/);assert.match(reasons('label'),/container relationship/);
 assert.deepEqual([node('oval').shape,node('oval').fill,Math.round(node('oval').state.angle)],['ellipse','none',29]);
 assert.deepEqual([node('gem').shape,node('gem').ink,node('gem').strokeWidth,node('gem').fill],['diamond','red',4,'tint']);
 assert.deepEqual(node('rule').points,[{x:12,y:12},{x:212,y:12}]);assert.equal(node('rule').shape,'line');
 for(const loss of [/nearest Canvas ink/,/Dashed/,/Opacity/])assert.match(reasons('rule'),loss);
 assert.equal(node('pointer').shape,'arrow');
 assert.deepEqual(node('back').points,[{x:92,y:12},{x:12,y:12}],'A start-only arrowhead swaps the endpoints');assert.match(reasons('back'),/plain arrowhead/);
 assert.match(reasons('both'),/Only the end arrowhead/);
 assert.match(reasons('linked'),/bound to other elements/);assert.match(reasons('zigzag'),/more than two points/);
 assert.equal(result.document.version,3);
 assert.equal(validatePortableDocument(result.document).nodes.length,8,'The converted document validates as portable version 3');
});

test('Excalidraw shape conversion rejects malformed geometry instead of guessing',()=>{
 const result=importExcalidraw({type:'excalidraw',version:2,elements:[
  {id:'flat',type:'rectangle',x:0,y:0,width:0,height:10},{id:'huge',type:'ellipse',x:0,y:0,width:1e9,height:10},
  {id:'dot',type:'line',x:0,y:0,points:[[5,5],[5,5]]},{id:'nan',type:'arrow',x:0,y:0,points:[[0,0],['1',2]]},{id:'thick',type:'diamond',x:0,y:0,width:20,height:20,strokeWidth:1000}]});
 assert.equal(result.document.nodes.length,0);assert(result.report.every(row=>row.status==='Unsupported'&&row.reasons.length));assert.equal(result.document.version,1,'Shape-free imports stay portable version 1');
});
