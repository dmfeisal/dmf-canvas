import { createImageObject } from './canvas-instance-image.js';
import { validateImage } from './canvas-instance-image-data.js';
import { createTextOwner } from './canvas-instance-text.js';
import { createStickyNote } from './canvas-instance-sticky.js';
import { createDrawing } from './canvas-instance-drawing.js';

const finite=(value,min,max)=>typeof value==='number'&&Number.isFinite(value)&&value>=min&&value<=max;
// Whitelist data only. Files never contain HTML, SVG markup, remote URLs or CSS rules. Images use bounded raster data.
export function validateObject(input) {
  if(!input||!['text','sticky','drawing','image'].includes(input.type))throw new TypeError('Unsupported object type.');
  if(new TextEncoder().encode(JSON.stringify(input)).byteLength>65536)throw new RangeError('Object data exceeds 64 KiB.');
  if(input.locked!==undefined&&typeof input.locked!=='boolean')throw new TypeError('Invalid object lock state.');
  const locked=input.locked??false;
  if(input.layer!==undefined&&(!Number.isInteger(input.layer)||input.layer<0||input.layer>49))throw new TypeError('Invalid object layer.');
  const layer=input.layer;
  if(input.group!==undefined&&(!Number.isInteger(input.group)||input.group<1||input.group>50))throw new TypeError('Invalid object group.');
  const group=input.group;
  const {type,layout:l,state:s}=input;
  if(!l||!s||!finite(l.left,-100000,100000)||!finite(l.top,-100000,100000)||!finite(l.width,1,100000)||!finite(l.height,1,100000)||!finite(l.fontSize,1,200)||!finite(s.x,-100000,100000)||!finite(s.y,-100000,100000)||!finite(s.scale,.000001,100)||!finite(s.angle,-100000,100000)||typeof s.width!=='string'||!['','fit-content'].includes(s.width)&&!/^\d{1,6}(?:\.\d{1,6})?px$/.test(s.width))throw new TypeError('Invalid object geometry.');
  const lineHeight=l.lineHeight??'normal',fontWeight=l.fontWeight??400;
  if(lineHeight!=='normal'&&!finite(lineHeight,1,1000)||!finite(fontWeight,1,1000))throw new TypeError('Invalid text typography.');
  const layout={left:l.left,top:l.top,width:l.width,height:l.height,fontSize:l.fontSize,lineHeight,fontWeight};
  const state={x:s.x,y:s.y,scale:s.scale,angle:s.angle,width:s.width,content:null};
  if(type==='image'){
    const image=validateImage(input.image);if(s.alt!==undefined&&s.alt!==image.alt)throw new TypeError('Image description mismatch.');state.alt=image.alt;
    return {type,layout,state,locked,...(layer===undefined?{}:{layer}),...(group===undefined?{}:{group}),image};
  }
  if(type==='drawing'){
    if(![2,4,8].includes(input.strokeWidth)||!['primary','blue','red'].includes(input.ink)||!Array.isArray(input.points)||!input.points.length||input.points.length>2048||input.points.some(p=>!finite(p?.x,0,100000)||!finite(p?.y,0,100000)))throw new TypeError('Invalid drawing artwork.');
    return {type,layout,state,locked,...(layer===undefined?{}:{layer}),...(group===undefined?{}:{group}),strokeWidth:input.strokeWidth,ink:input.ink,points:input.points.map(({x,y})=>({x,y}))};
  }
  if(typeof input.text!=='string'||input.text.length>10000||input.text.includes('\0')||typeof s.content!=='string'||s.content!==input.text)throw new TypeError('Invalid object text.');
  state.content=input.text;
  if(type==='sticky'){
    if(input.text.length>240||!['yellow','blue','pink'].includes(s.paperColor))throw new TypeError('Invalid sticky note.');
    state.paperColor=s.paperColor;
  }
  return {type,layout,state,locked,...(layer===undefined?{}:{layer}),...(group===undefined?{}:{group}),text:input.text};
}
function createObject(host,input) {
  const data=validateObject(input);let item;
  try{
    if(data.type==='image')item=createImageObject(host,data.image,data.layout);
    else if(data.type==='sticky')item=createStickyNote(host);
    else if(data.type==='drawing')item=createDrawing(host,data.points,{width:data.strokeWidth,color:data.ink,layout:data.layout});
    else {
      const element=host.ownerDocument.createElement('p');element.className='canvas-instance-local-text';element.textContent=data.text;element.setAttribute('aria-label','Text');host.append(element);
      if(host.getAttribute('aria-describedby'))element.setAttribute('aria-describedby',host.getAttribute('aria-describedby'));
      Object.assign(element.style,{position:'absolute',left:data.layout.left+'px',top:data.layout.top+'px',width:data.layout.width+'px',fontSize:data.layout.fontSize+'px',lineHeight:data.layout.lineHeight==='normal'?'normal':data.layout.lineHeight+'px',fontWeight:String(data.layout.fontWeight),margin:'0'});
      let base;try{base=createTextOwner(element,host);}catch(error){element.remove();throw error;}
      item={element,owner:{...base,setPresent(present){if(present){host.append(element);base.restore(base.capture());}else element.remove();},dispose(){base.dispose();element.remove();}}};
    }
    const {element,owner}=item;
    Object.assign(element.style,{left:data.layout.left+'px',top:data.layout.top+'px',fontSize:data.layout.fontSize+'px'});
    if(data.type!=='drawing')Object.assign(element.style,{lineHeight:data.layout.lineHeight==='normal'?'normal':data.layout.lineHeight+'px',fontWeight:String(data.layout.fontWeight)});
    if(data.type!=='text')Object.assign(element.style,{width:data.layout.width+'px',height:data.layout.height+'px'});
    // Factories start with pixel widths; equivalent auto widths are materialized.
    owner.restore({...data.state,width:['','fit-content'].includes(data.state.width)?data.layout.width+'px':data.state.width});
    return item;
  }catch(error){item?.owner.dispose();throw error;}
}
export const canvasDocuments=Object.freeze({validate:validateObject,create:createObject});
