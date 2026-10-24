import {createCanvas,resolveSettings,type CanvasOwner} from 'dmf-canvas';
import {createTextOwner,createStickyNote,createImageObject,createDrawing,canvasDocuments,validateObject} from 'dmf-canvas/owners';
import {createPencil} from 'dmf-canvas/pencil';
import {createCanvasToolbar} from 'dmf-canvas/toolbar';
import {createCanvasTheme,resolveTheme} from 'dmf-canvas/theme';
import {createLocalDraft,parseLocalDraft} from 'dmf-canvas/drafts';
import {createObjectClipboard,validateTransfer} from 'dmf-canvas/clipboard';
declare const host:HTMLElement;declare const element:HTMLElement;declare const storage:Storage;
const canvas=createCanvas(host,{documents:canvasDocuments,clipboard:createObjectClipboard(),tools:{pencil:true}});
const owner:CanvasOwner=createTextOwner(element,host);const registration=canvas.register(element,owner);
canvas.register(createStickyNote(host).element,owner,{created:true});
createImageObject(host,{src:'data:image/png;base64,...',alt:'Image',width:40,height:40});
createDrawing(host,[{x:10,y:20}],{width:4,color:'blue'});validateObject(canvas.saveDocument().objects[0]);
canvas.execute('move',{dx:1,dy:2});canvas.execute('image-description','Diagram');canvas.execute('lock',true);canvas.execute('undo');
canvas.subscribe(s=>{const count:number=s.selectionCount;void count;});
canvas.subscribeChanges(change=>canvas.markSaved(change.revision));canvas.configure(resolveSettings({readOnly:true}));
const pencil=createPencil(canvas,host,s=>{const active:boolean=s.active;void active;});pencil.setWidth(8);pencil.setColor('primary');pencil.cancel();pencil.dispose();
const toolbar=createCanvasToolbar(host,{actions:[{id:'undo',label:'Undo',icon:'undo-2',run:()=>{canvas.execute('undo');}}]});toolbar.update('undo',{disabled:true});toolbar.dispose();
const theme=createCanvasTheme(host,resolveTheme({mode:'dark',colors:{selection:'#123456'}}));theme.configure({mode:'inherit'});theme.dispose();
const draft=createLocalDraft(canvas,{key:'test',storage,onStatus:s=>{const pending:boolean=s.pending;void pending;}});draft.restore();draft.dispose();parseLocalDraft('{}');validateTransfer({});
// @ts-expect-error move requires a vector
canvas.execute('move');
// @ts-expect-error command does not accept a color value
canvas.execute('undo','blue');
// @ts-expect-error unsupported tool
canvas.configure({tools:{highlighter:true}});
// @ts-expect-error unsupported pencil width
pencil.setWidth(12);
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
