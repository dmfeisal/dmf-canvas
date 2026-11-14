import { createTextOwner } from './canvas-instance-text.js';
import {makePath,validStroke} from './canvas-instance-stroke.js';
export function createDrawing(host,points,{width=4,color='primary',layout=null,tool='pencil'}={}) {
  // A camera world (docs/prd/NAVIGATION.md) is unbounded, so its points are world coordinates in any direction.
  const world=!!host?.hasAttribute?.('data-canvas-instance-world');
  if(!host?.isConnected||host.clientWidth<80||host.clientHeight<100||!validStroke(tool,width,color)||!Array.isArray(points)||!points.length||points.length>2048||points.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)||(layout?p.x<0||p.x>100000:world?Math.abs(p.x)>100000:p.x<0||p.x>host.clientWidth)||(layout?p.y<0||p.y>100000:world?Math.abs(p.y)>100000:p.y<0||p.y>host.clientHeight)))throw new TypeError('Invalid bounded Drawing.');
  const pad=width/2+2,xs=points.map(p=>p.x),ys=points.map(p=>p.y),minX=Math.min(...xs),minY=Math.min(...ys);
  const w=Math.max(24,Math.max(...xs)-minX+2*pad),h=Math.max(24,Math.max(...ys)-minY+2*pad);
  const left=minX-pad-(w-(Math.max(...xs)-minX+2*pad))/2,top=minY-pad-(h-(Math.max(...ys)-minY+2*pad))/2;
  let root=host,node=host.ownerDocument.createElement('div');node.className='canvas-instance-drawing';const name=tool==='highlighter'?'Highlight':'Drawing';node.dataset.canvasInstanceDrawing='';if(tool==='highlighter')node.dataset.canvasInstanceHighlight='';node.setAttribute('aria-label',name);
  if(host.getAttribute('aria-describedby'))node.setAttribute('aria-describedby',host.getAttribute('aria-describedby'));
  Object.assign(node.style,{width:(layout?.width??w)+'px',height:(layout?.height??h)+'px',left:(layout?.left??left)+'px',top:(layout?.top??top)+'px'});root.append(node);
  let base;try{base=createTextOwner(node,root,{name,widthHandles:false,editable:false});}catch(error){node.remove();throw error;}
  const svg=host.ownerDocument.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',`0 0 ${layout?.width??w} ${layout?.height??h}`);svg.setAttribute('aria-hidden','true');svg.append(makePath(host.ownerDocument,layout?points:points.map(p=>({x:p.x-left,y:p.y-top})),width,color,tool));node.prepend(svg);
  // Drawings expose geometry only; no text or paper-color capability.
  const {beginEdit,...geometry}=base;
  base.restore(base.capture());
  const owner=Object.freeze({...geometry,
    serialize:()=>({type:'drawing',layout:{left:node.offsetLeft,top:node.offsetTop,width:layout?.width??w,height:layout?.height??h,fontSize:18},points:layout?points.map(p=>({...p})):points.map(p=>({x:p.x-left,y:p.y-top})),strokeWidth:width,ink:color,...(tool==='highlighter'?{tool}:{}),state:base.capture()}),
    setPresent(present){if(!node)return;if(present){root.append(node);base.restore(base.capture());}else node.remove();},
    dispose(){if(!node)return;base.dispose();node.remove();node=root=null;},
  });
  return Object.freeze({element:node,owner});
}
