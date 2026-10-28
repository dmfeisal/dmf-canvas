import {validateObject} from './canvas-instance-document.js';
import {validatePortable} from './canvas-portable-data.js';
const finite=(n,min=-100000,max=100000)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
export function importExcalidraw(input){
 const raw=typeof input==='string'?input:JSON.stringify(input);
 if(!raw||new TextEncoder().encode(raw).byteLength>1048576)throw new RangeError('Excalidraw input exceeds 1 MiB.');
 const value=JSON.parse(raw);
 if(value?.type!=='excalidraw'||value.version!==2||!Array.isArray(value.elements)||value.elements.length>50)throw new TypeError('Choose an Excalidraw version-2 scene with at most 50 elements.');
 const ids=new Set(),nodes=[],report=[];
 for(const element of value.elements){
  if(typeof element?.id!=='string'||! /^[A-Za-z0-9_-]{1,100}$/.test(element.id)||ids.has(element.id))throw new TypeError('Excalidraw IDs must be unique bounded identifiers.');
  ids.add(element.id);
  const row={sourceId:element.id,sourceType:typeof element.type==='string'?element.type.slice(0,64):'unknown',status:'Unsupported',destinationIds:[],reasons:[]};
  report.push(row);
  if(element.isDeleted){row.reasons.push('Deleted source element excluded.');continue;}
  if(!['text','freedraw'].includes(element.type)){row.reasons.push('No editable Canvas owner for this source type.');continue;}
  try{
   if(!finite(element.x)||!finite(element.y)||!finite(element.angle??0,-1000,1000)||element.locked!==undefined&&typeof element.locked!=='boolean')throw new TypeError('Invalid source geometry or lock.');
   const state={x:0,y:0,scale:1,angle:(element.angle??0)*180/Math.PI,width:'',content:null};
   let data;
   if(element.type==='text'){
    if(typeof element.text!=='string'||!finite(element.width,1,100000)||!finite(element.height,1,100000)||!finite(element.fontSize,8,320))throw new TypeError('Invalid source Text dimensions or content.');
    state.width=element.width+'px';state.content=element.text;state.typography={font:element.fontFamily===3?'mono':'sans',size:element.fontSize,weight:400,align:['left','center','right'].includes(element.textAlign)?element.textAlign:'left',wrap:'fixed'};
    data={type:'text',text:element.text,layout:{left:element.x,top:element.y,width:element.width,height:element.height,fontSize:element.fontSize},state};
    row.reasons.push('Text remains editable; source fonts, ink and text metrics convert to system typography and Canvas theme.');
   }else{
    if(!Array.isArray(element.points)||element.points.length<1||element.points.length>2048||element.points.some(p=>!Array.isArray(p)||p.length!==2||!p.every(n=>finite(n))))throw new TypeError('Invalid freehand points.');
    const xs=element.points.map(p=>p[0]),ys=element.points.map(p=>p[1]),left=Math.min(...xs),top=Math.min(...ys),width=Math.max(1,Math.max(...xs)-left),height=Math.max(1,Math.max(...ys)-top);
    if(!finite(element.strokeWidth??1,.01,100))throw new TypeError('Invalid stroke width.');
    state.width=width+'px';
    const strokeWidth=[2,4,8].reduce((best,n)=>Math.abs(n-(element.strokeWidth??1))<Math.abs(best-(element.strokeWidth??1))?n:best,2);
    data={type:'drawing',layout:{left:element.x+left,top:element.y+top,width,height,fontSize:16},state,points:element.points.map(([x,y])=>({x:x-left,y:y-top})),strokeWidth,ink:element.strokeColor==='#1971c2'?'blue':element.strokeColor==='#e03131'?'red':'primary'};
    row.reasons.push('Freehand becomes an editable Drawing with uniform stroke width and the Canvas ink palette; pressure/roughness are not retained.');
   }
   data.locked=element.locked??false;data.layer=nodes.length;
   const node={id:'excalidraw:'+element.id,source:{format:'excalidraw',id:element.id},data:validateObject(data)};
   row.reasons.push('Placement may be contained by the destination surface. Groups, bindings, links, opacity and custom metadata are not imported.');
   nodes.push(node);row.status='Converted';row.destinationIds.push(node.id);
  }catch(error){row.reasons.push(error.message);}
 }
 return {adapter:'excalidraw',adapterVersion:1,document:validatePortable({format:'dmf-canvas-portable',version:1,nodes},validateObject),report};
}
