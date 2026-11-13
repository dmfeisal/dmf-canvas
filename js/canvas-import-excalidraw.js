import {validateObject} from './canvas-instance-document.js';
import {validatePortable} from './canvas-portable-data.js';
const finite=(n,min=-100000,max=100000)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
// Excalidraw ink and stroke conversions shared by freehand and shapes: the nearest Canvas width and the Pencil palette.
const nearestWidth=width=>[2,4,8].reduce((best,n)=>Math.abs(n-width)<Math.abs(best-width)?n:best,2);
const inkFor=color=>color==='#1971c2'?'blue':color==='#e03131'?'red':'primary';
const closedKinds=['rectangle','ellipse','diamond'];
// Losses every converted shape may carry; each applicable one becomes a report reason.
function styleLosses(element){
 const reasons=[];
 if(!['#1e1e1e','#000000','#1971c2','#e03131',undefined].includes(element.strokeColor))reasons.push('Stroke colour becomes the nearest Canvas ink (primary, blue or red).');
 if((element.roughness??1)>0)reasons.push('Sketchy (rough) strokes become smooth.');
 if(element.strokeStyle&&element.strokeStyle!=='solid')reasons.push('Dashed and dotted strokes become solid.');
 if(finite(element.opacity,0,100)&&element.opacity<100)reasons.push('Opacity is not imported; the shape is fully opaque.');
 if(Array.isArray(element.boundElements)&&element.boundElements.some(item=>item?.type==='text'))reasons.push('Bound text is imported as a separate Text object; the container relationship is not kept.');
 return reasons;
}
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
  if(!['text','freedraw',...closedKinds,'line','arrow'].includes(element.type)){row.reasons.push('No editable Canvas owner for this source type.');continue;}
  try{
   if(!finite(element.x)||!finite(element.y)||!finite(element.angle??0,-1000,1000)||element.locked!==undefined&&typeof element.locked!=='boolean')throw new TypeError('Invalid source geometry or lock.');
   const state={x:0,y:0,scale:1,angle:(element.angle??0)*180/Math.PI,width:'',content:null};
   let data;
   if(element.type==='text'){
    if(typeof element.text!=='string'||!finite(element.width,1,100000)||!finite(element.height,1,100000)||!finite(element.fontSize,8,320))throw new TypeError('Invalid source Text dimensions or content.');
    state.width=element.width+'px';state.content=element.text;state.typography={font:element.fontFamily===3?'mono':'sans',size:element.fontSize,weight:400,align:['left','center','right'].includes(element.textAlign)?element.textAlign:'left',wrap:'fixed'};
    data={type:'text',text:element.text,layout:{left:element.x,top:element.y,width:element.width,height:element.height,fontSize:element.fontSize},state};
    row.reasons.push('Text remains editable; source fonts, ink and text metrics convert to system typography and Canvas theme.');
    if(typeof element.containerId==='string')row.reasons.push('Text bound to a shape is imported on its own; the container relationship is not kept.');
   }else if(closedKinds.includes(element.type)){
    if(!finite(element.width,1,100000)||!finite(element.height,1,100000)||!finite(element.strokeWidth??2,.01,100))throw new TypeError('Invalid shape dimensions or stroke width.');
    const filled=typeof element.backgroundColor==='string'&&element.backgroundColor!=='transparent';
    state.width=element.width+'px';state.height=element.height+'px';
    data={type:'shape',shape:element.type,ink:inkFor(element.strokeColor),strokeWidth:nearestWidth(element.strokeWidth??2),fill:filled?'tint':'none',...(element.type==='rectangle'?{corners:element.roundness?'round':'sharp'}:{}),layout:{left:element.x,top:element.y,width:element.width,height:element.height,fontSize:18},state};
    row.reasons.push('Shape becomes an editable Canvas shape with the nearest ink and Thin, Medium or Bold width.',...styleLosses(element));
    if(filled)row.reasons.push(`Background ${element.fillStyle&&element.fillStyle!=='solid'?`(${element.fillStyle}) `:''}becomes a light tint of the stroke ink.`);
   }else if(element.type==='line'||element.type==='arrow'){
    // Only straight, unbound two-point lines and arrows have a Canvas equivalent until connectors exist.
    if(!Array.isArray(element.points)||element.points.some(p=>!Array.isArray(p)||p.length!==2||!p.every(n=>finite(n))))throw new TypeError('Invalid line points.');
    if(element.points.length!==2)throw new TypeError('Lines and arrows with more than two points need connectors, which Canvas does not support yet.');
    if(element.startBinding||element.endBinding)throw new TypeError('Arrows bound to other elements need connectors, which Canvas does not support yet.');
    if(!finite(element.strokeWidth??2,.01,100))throw new TypeError('Invalid stroke width.');
    let [[ax,ay],[bx,by]]=element.points;if(ax===bx&&ay===by)throw new TypeError('Line endpoints must differ.');
    const start=element.startArrowhead??null,end=element.type==='arrow'?element.endArrowhead===undefined?'arrow':element.endArrowhead:null;
    const kind=start||end?'arrow':'line';
    // Canvas draws one arrowhead, at the end: a start-only head swaps the endpoints.
    if(start&&!end)[[ax,ay],[bx,by]]=[[bx,by],[ax,ay]];
    const strokeWidth=nearestWidth(element.strokeWidth??2),pad=Math.max(12,strokeWidth*3),minX=Math.min(ax,bx),minY=Math.min(ay,by);
    const width=Math.abs(bx-ax)+2*pad,height=Math.abs(by-ay)+2*pad;
    state.width=width+'px';state.height=height+'px';
    data={type:'shape',shape:kind,ink:inkFor(element.strokeColor),strokeWidth,fill:'none',points:[{x:ax-minX+pad,y:ay-minY+pad},{x:bx-minX+pad,y:by-minY+pad}],layout:{left:element.x+minX-pad,top:element.y+minY-pad,width,height,fontSize:18},state};
    row.reasons.push(`${element.type==='arrow'?'Arrow':'Line'} becomes an editable Canvas ${kind} with the nearest ink and Thin, Medium or Bold width.`,...styleLosses(element));
    if(start&&end)row.reasons.push('Only the end arrowhead is kept.');
    if([start,end].some(head=>head&&head!=='arrow'))row.reasons.push('Arrowhead styles (triangle, bar, dot) become a plain arrowhead.');
   }else{
    if(!Array.isArray(element.points)||element.points.length<1||element.points.length>2048||element.points.some(p=>!Array.isArray(p)||p.length!==2||!p.every(n=>finite(n))))throw new TypeError('Invalid freehand points.');
    const xs=element.points.map(p=>p[0]),ys=element.points.map(p=>p[1]),left=Math.min(...xs),top=Math.min(...ys),width=Math.max(1,Math.max(...xs)-left),height=Math.max(1,Math.max(...ys)-top);
    if(!finite(element.strokeWidth??1,.01,100))throw new TypeError('Invalid stroke width.');
    state.width=width+'px';
    const strokeWidth=nearestWidth(element.strokeWidth??1);
    data={type:'drawing',layout:{left:element.x+left,top:element.y+top,width,height,fontSize:16},state,points:element.points.map(([x,y])=>({x:x-left,y:y-top})),strokeWidth,ink:inkFor(element.strokeColor)};
    row.reasons.push('Freehand becomes an editable Drawing with uniform stroke width and the Canvas ink palette; pressure/roughness are not retained.');
   }
   data.locked=element.locked??false;data.layer=nodes.length;
   const node={id:'excalidraw:'+element.id,source:{format:'excalidraw',id:element.id},data:validateObject(data)};
   row.reasons.push('Placement may be contained by the destination surface. Groups, bindings, links, opacity and custom metadata are not imported.');
   nodes.push(node);row.status='Converted';row.destinationIds.push(node.id);
  }catch(error){row.reasons.push(error.message);}
 }
 // Adapter version 2 converts shapes, lines and arrows; documents carrying shapes are portable version 3.
 return {adapter:'excalidraw',adapterVersion:2,document:validatePortable({format:'dmf-canvas-portable',version:nodes.some(node=>node.data.type==='shape')?3:1,nodes},validateObject),report};
}
