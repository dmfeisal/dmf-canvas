import {createCanvas,resolveSettings,type CanvasOwner} from 'dmf-canvas';
import {createTextOwner,createStickyNote,createImageObject,createDrawing,createShape,shapeKinds,canvasDocuments,validateObject} from 'dmf-canvas/owners';
import type {ShapeKind} from 'dmf-canvas/owners';
import {createPencil} from 'dmf-canvas/pencil';
import {createCanvasToolbar,createCanvasFullscreen} from 'dmf-canvas/toolbar';
import {createCanvasTheme,resolveTheme} from 'dmf-canvas/theme';
import {createLocalDraft,parseLocalDraft} from 'dmf-canvas/drafts';
import {createObjectClipboard,validateTransfer} from 'dmf-canvas/clipboard';
declare const host:HTMLElement;declare const element:HTMLElement;declare const storage:Storage;
const canvas=createCanvas(host,{documents:canvasDocuments,clipboard:createObjectClipboard(),tools:{pencil:true}});
const owner:CanvasOwner=createTextOwner(element,host);const registration=canvas.register(element,owner);
canvas.register(createStickyNote(host).element,owner,{created:true});
createImageObject(host,{src:'data:image/png;base64,...',alt:'Image',width:40,height:40});
createDrawing(host,[{x:10,y:20}],{width:4,color:'blue'});validateObject(canvas.saveDocument().objects[0]);
{const box={left:10,top:10,width:120,height:80};createShape(host,{shape:'rectangle',ink:'blue',strokeWidth:4,fill:'tint',corners:'round'},box);createShape(host,{shape:'arrow',ink:'red',strokeWidth:2,points:[{x:0,y:0},{x:120,y:80}]},box);
 // @ts-expect-error lines and arrows need two points
 createShape(host,{shape:'line',ink:'red',strokeWidth:2},box);
 // @ts-expect-error only rectangles have corners
 createShape(host,{shape:'ellipse',ink:'red',strokeWidth:2,corners:'round'},box);
 const handle:import('dmf-canvas').TransformHandle='n';void handle;createTextOwner(host.firstElementChild as HTMLElement,host,{freeResize:true,onBox:(width,height)=>void (width+height)});
 const kind:ShapeKind=shapeKinds[0];const version:1|2|3|4=canvas.saveDocument().version;const portable:1|2|3=canvas.savePortableDocument().version;void kind;void version;void portable;}
canvas.execute('move',{dx:1,dy:2});canvas.execute('image-description','Diagram');canvas.execute('lock',true);canvas.execute('undo');
canvas.subscribe(s=>{const count:number=s.selectionCount;void count;});
canvas.subscribeChanges(change=>canvas.markSaved(change.revision));canvas.configure(resolveSettings({readOnly:true}));
const pencil=createPencil(canvas,host,s=>{const active:boolean=s.active;void active;});pencil.setWidth(8);pencil.setColor('primary');pencil.cancel();pencil.dispose();
const toolbar=createCanvasToolbar(host,{actions:[{id:'undo',label:'Undo',icon:'undo-2',run:()=>{canvas.execute('undo');}}]});toolbar.update('undo',{disabled:true});toolbar.dispose();
const rail=createCanvasToolbar(host,{orientation:'vertical',label:'Tools',actions:[{id:'select',label:'Select',icon:'mouse-pointer-2',shortcut:'V',run:()=>{}}]});rail.dispose();
const selection=createCanvasToolbar(host,{moreLabel:'More actions',actions:[{id:'duplicate',label:'Duplicate',icon:'copy-plus',run:()=>{}},{id:'paste',label:'Paste',icon:'clipboard-paste',menu:true,group:'Clipboard',run:()=>{}}]});selection.update('paste',{disabled:true,pressed:false});selection.dispose();
// @ts-expect-error orientation is horizontal or vertical
createCanvasToolbar(host,{orientation:'diagonal'});
const theme=createCanvasTheme(host,resolveTheme({mode:'dark',colors:{selection:'#123456'}}));theme.configure({mode:'inherit'});theme.dispose();
const draft=createLocalDraft(canvas,{key:'test',storage,onStatus:s=>{const pending:boolean=s.pending;void pending;}});draft.restore();draft.dispose();parseLocalDraft('{}');validateTransfer({});
// @ts-expect-error move requires a vector
canvas.execute('move');
// @ts-expect-error command does not accept a color value
canvas.execute('undo','blue');
// @ts-expect-error unsupported tool
canvas.configure({tools:{highlighter:true}});
canvas.configure({snapping:{grid:true}});canvas.configure({labels:false});{const shown:boolean=canvas.getState().settings.labels;void shown;}{const snap:boolean=canvas.getState().settings.snapping.align;void snap;}
// @ts-expect-error snapping keys are align and grid
canvas.configure({snapping:{magnet:true}});
const camera=createCanvas(host,{camera:{world:element,maxScale:2}});
camera.execute('zoom',{by:1.2,around:{x:10,y:20}});camera.execute('zoom',{to:1});camera.execute('fit');camera.execute('zoom-to-selection');camera.execute('camera',{x:0,y:0});camera.configure({camera:{minScale:.5}});camera.execute('hand',true);{const hand:'tool'|'space'|null=camera.getState().hand;void hand;}
{const view=camera.getState().camera;if(view){const zoom:number=view.scale;void zoom;}const limits=camera.getState().settings.camera;if(limits){const max:number=limits.maxScale;void max;}}
// @ts-expect-error zoom takes by or to, not both
camera.execute('zoom',{by:2,to:1});
// @ts-expect-error the camera needs a world element
createCanvas(host,{camera:{maxScale:2}});
// @ts-expect-error unsupported drawing width (neither Pencil nor Highlighter)
pencil.setWidth(6);
// @ts-expect-error owner capture must be finite JSON-compatible data
const invalid:CanvasOwner={capture:()=>element,restore(){},dispose(){}};
// @ts-expect-error image description is a string
canvas.execute('image-description',4);
registration.dispose();canvas.destroy();void invalid;

import {encodeImage,validateImage,imageDimensions} from 'dmf-canvas/images';
declare const image:HTMLImageElement;declare const doc:Document;
encodeImage(image,doc,{active:()=>true,onProgress:dimensions=>{const width:number=dimensions.width;void width;}}).then(value=>validateImage({...value,alt:'Image'}));
imageDimensions(new Uint8Array(),'image/png');
// @ts-expect-error encoder requires a decoded image
encodeImage('image.png',doc);

import {createCanvasInspector} from 'dmf-canvas/toolbar';
declare const trigger:HTMLButtonElement;
const inspector=createCanvasInspector(element,{canvas,trigger});
const geometry=canvas.getInspector();if(geometry){const width:number=geometry.width;void width;}
canvas.execute('inspect',{field:'width',value:200});
// @ts-expect-error inspector fields are explicit
canvas.execute('inspect',{field:'scale',value:2});
// @ts-expect-error numeric values are not coerced
canvas.execute('inspect',{field:'x',value:'20'});
inspector.dispose();

const textStyle=canvas.getTextStyle();if(textStyle){const font:string|null=textStyle.font;void font;}
canvas.execute('text-style',{field:'font',value:'serif'});
canvas.execute('text-style',{field:'size',value:32});
canvas.execute('text-style',{field:'weight',value:600});
canvas.execute('text-style',{field:'reset'});
// @ts-expect-error arbitrary CSS fonts are not accepted
canvas.execute('text-style',{field:'font',value:'url(unsafe)'});
// @ts-expect-error numeric style values are not coerced
canvas.execute('text-style',{field:'size',value:'32'});

import {validatePortableDocument,migrateLegacyDocument,importExcalidraw} from 'dmf-canvas/documents';
const portable=canvas.savePortableDocument();canvas.loadPortableDocument(validatePortableDocument(portable));
const imported=importExcalidraw('{}');const reason:string=imported.report[0].reasons[0];void reason;
migrateLegacyDocument(canvas.saveDocument());
// @ts-expect-error portable version is explicit (1, 2 with Highlighter strokes, 3 with shapes)
portable.version=4;

// Highlighter: one controller, per-tool settings and typed drawing options.
{const pen=createPencil(canvas,host);pen.setTool('highlighter');pen.setColor('yellow');pen.setWidth(32);const tool:'pencil'|'highlighter'|'eraser'|'shape'=pen.getState().tool;void tool;pen.setTool('shape');pen.setShape('diamond');pen.setFill('tint');pen.setCorners('round');const kind:import('dmf-canvas/owners').ShapeKind|null=pen.getState().shape;void kind;
 // @ts-expect-error unknown shape kinds are rejected
 pen.setShape('star');
 canvas.configure({tools:{shapes:false}});pen.setTool('eraser');const width:number|null=pen.getState().width;void width;canvas.execute('erase',[host]);
// @ts-expect-error unsupported drawing tool
pen.setTool('marker');}
// @ts-expect-error erase needs drawing elements
canvas.execute('erase','all');
{const full=createCanvasFullscreen(host,{canvas,onChange:state=>{const on:boolean=state.active&&state.supported;void on;}});void full.toggle().then((changed:boolean)=>changed);full.dispose();}
// @ts-expect-error onChange must be a function
createCanvasFullscreen(host,{onChange:true});
