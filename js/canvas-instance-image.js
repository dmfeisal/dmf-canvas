import { createTextOwner } from './canvas-instance-text.js';
import { validateImage,validateDescription } from './canvas-instance-image-data.js';
export function createImageObject(host,input,layout=null){
  const data=validateImage(input);
  if(!host?.isConnected||host.clientWidth<80||host.clientHeight<100)throw new TypeError('Image needs a visible sized canvas.');
  let root=host,node=host.ownerDocument.createElement('div');node.className='canvas-instance-image';node.dataset.canvasInstanceImage='';node.setAttribute('aria-label',data.alt||'Image');
  const ratio=Math.min(1,(host.clientWidth-64)/data.width,(host.clientHeight-80)/data.height),width=Math.max(1,layout?.width??data.width*ratio),height=Math.max(1,layout?.height??data.height*ratio);
  Object.assign(node.style,{width:width+'px',height:height+'px',left:(layout?.left??(host.clientWidth-width)/2)+'px',top:(layout?.top??(host.clientHeight-height)/2)+'px'});root.append(node);
  let base;try{base=createTextOwner(node,root,{name:'Image',widthHandles:false,editable:false});}catch(error){node.remove();throw error;}
  const img=host.ownerDocument.createElement('img');img.alt=data.alt;img.src=data.src;img.draggable=false;img.width=data.width;img.height=data.height;node.prepend(img);base.restore(base.capture());
  const {beginEdit,...geometry}=base;let alt=data.alt;
  const setDescription=value=>{if(!validateDescription(value))return false;alt=value;img.alt=value;node.setAttribute('aria-label',value||'Image');return true;};
  return Object.freeze({element:node,owner:Object.freeze({...geometry,
    description:Object.freeze({read:()=>alt,set:setDescription}),imageSize:Object.freeze({width:data.width,height:data.height}),
    capture:()=>({...base.capture(),alt}),
    restore(value){if(!validateDescription(value.alt??data.alt))throw new TypeError('Invalid image description.');base.restore(value);setDescription(value.alt??data.alt);},
    serialize:()=>({type:'image',image:{...data,alt},layout:{left:node.offsetLeft,top:node.offsetTop,width,height,fontSize:18},state:{...base.capture(),alt}}),
    setPresent(present){if(!node)return;if(present){root.append(node);base.restore(base.capture());}else node.remove();},
    dispose(){if(!node)return;base.dispose();img.removeAttribute('src');node.remove();node=root=null;}
  })});
}
