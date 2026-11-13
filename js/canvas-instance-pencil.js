import {createDrawing} from './canvas-instance-drawing.js';
import {svgNode,makePath,pathFor,validStroke} from './canvas-instance-stroke.js';
import {createShape,drawShape,shapeKinds,shapeFills,shapeCorners} from './canvas-instance-shape.js';
const native='input,textarea,select,button,a,[contenteditable]:not([contenteditable="false"]),dialog,[popover]';
// Shapes tool shortcuts (docs/prd/SHAPES.md): R rectangle, O ellipse, D diamond, L line, A arrow.
const shapeKeys=Object.freeze({r:'rectangle',o:'ellipse',d:'diamond',l:'line',a:'arrow'});
const defaultBox={width:120,height:80};
export function createPencil(canvas,host,onChange=()=>{}) {
  // One controller arms at most one input tool (Pencil, Highlighter, stroke Eraser or Shapes); each tool keeps its own settings.
  let root=host,instance=canvas,active=false,tool='pencil',stroke=null,erasing=null,shaping=null,frame=null,disposed=false;
  const tools=['pencil','highlighter','eraser','shape'];
  const settings={pencil:{width:4,color:'primary'},highlighter:{width:20,color:'yellow'},shape:{width:4,color:'primary',shape:'rectangle',fill:'none',corners:'sharp'}};
  const view=host.ownerDocument.defaultView;
  const getState=()=>{const s=settings[tool];return Object.freeze({active,tool,width:s?.width??null,color:s?.color??null,shape:tool==='shape'?s.shape:null,fill:tool==='shape'?s.fill:null,corners:tool==='shape'?s.corners:null,drawing:!!stroke||!!erasing||!!shaping});};
  const notify=()=>{if(!disposed)onChange(getState());};
  // Pencil, Highlighter and Eraser follow the `pencil` permission (the Eraser also needs `delete`); Shapes follow `shapes`.
  const permitted=(state,name=tool)=>name==='shape'?state.settings.tools.shapes:state.settings.tools.pencil&&(name!=='eraser'||state.settings.tools.delete);
  const busy=()=>!!stroke||!!erasing||!!shaping;
  const cleanup=()=>{
    if(frame!==null){view.cancelAnimationFrame(frame);frame=null;}
    if(stroke){const old=stroke;stroke=null;old.svg.remove();if(root?.hasPointerCapture(old.id))root.releasePointerCapture(old.id);notify();}
    if(shaping){const old=shaping;shaping=null;old.preview?.remove();if(old.id!==null&&root?.hasPointerCapture(old.id))root.releasePointerCapture(old.id);notify();}
  };
  // Eraser: touched strokes fade until release; cancellation restores them untouched.
  const clearErase=()=>{if(!erasing)return;const old=erasing;erasing=null;for(const element of old.marked)element.removeAttribute('data-canvas-instance-erasing');if(root?.hasPointerCapture(old.id))root.releasePointerCapture(old.id);notify();};
  const cancel=()=>{if(stroke)stroke.reservation.cancel();if(shaping)shaping.reservation.cancel();clearErase();};
  const ring=[[0,0],...Array.from({length:8},(_,i)=>[Math.round(6*Math.cos(i*Math.PI/4)),Math.round(6*Math.sin(i*Math.PI/4))])];
  const hitAt=(x,y)=>{for(const [dx,dy]of ring)for(const element of root.ownerDocument.elementsFromPoint(x+dx,y+dy)){if(element.localName!=='path')continue;const drawing=element.closest('.canvas-instance-drawing');if(drawing?.parentElement===root&&!drawing.hasAttribute('data-canvas-instance-locked')&&!erasing.marked.has(drawing)){erasing.marked.add(drawing);drawing.setAttribute('data-canvas-instance-erasing','');}}};
  const eraseTo=event=>{const last=erasing.last,steps=Math.min(24,Math.max(1,Math.ceil(Math.hypot(event.clientX-last.x,event.clientY-last.y)/6)));for(let i=1;i<=steps;i++)hitAt(last.x+(event.clientX-last.x)*i/steps,last.y+(event.clientY-last.y)*i/steps);erasing.last={x:event.clientX,y:event.clientY};};
  const setActive=value=>{
    if(disposed)return false;
    const current=instance.getState();
    if(value&&(!current.mounted||current.settings.readOnly||!permitted(current)||current.editing))return false;
    cancel();if(value){instance.execute('cancel');instance.setMultiple(false);if(tool!=='eraser'&&!instance.getState().canCreate)return false;}active=!!value;root.toggleAttribute('data-instance-pencil-active',active);if(active)root.dataset.instancePencilTool=tool;else delete root.dataset.instancePencilTool;notify();return true;
  };
  const addPoint=event=>{
    const s=stroke,point={x:Math.max(20,Math.min(s.width-20,event.clientX-s.left)),y:Math.max(20,Math.min(s.height-44,event.clientY-s.top))},last=s.points.at(-1);
    if(s.points.length<2048&&(!last||Math.hypot(point.x-last.x,point.y-last.y)>=.5))s.points.push(point);
  };
  // Shapes: the box between the press and the pointer, inside the host's containment area (8px inset, 32px reserved below).
  const area=()=>({left:8,top:8,right:root.clientWidth-8,bottom:root.clientHeight-32});
  const clampPoint=(p,a=area())=>({x:Math.max(a.left,Math.min(a.right,p.x)),y:Math.max(a.top,Math.min(a.bottom,p.y))});
  const shapeLayout=(start,end,constrain)=>{
    const {shape,width}=settings.shape,open=shape==='line'||shape==='arrow';let dx=end.x-start.x,dy=end.y-start.y;
    if(constrain&&open){const length=Math.hypot(dx,dy),angle=Math.round(Math.atan2(dy,dx)/(Math.PI/4))*Math.PI/4;dx=length*Math.cos(angle);dy=length*Math.sin(angle);}
    else if(constrain){const size=Math.max(Math.abs(dx),Math.abs(dy));dx=Math.sign(dx||1)*size;dy=Math.sign(dy||1)*size;}
    if(!open){const left=Math.min(start.x,start.x+dx),top=Math.min(start.y,start.y+dy);return {layout:{left,top,width:Math.max(16,Math.abs(dx)),height:Math.max(16,Math.abs(dy))}};}
    // Lines and arrows: pad the box so round caps and the arrowhead stay inside it.
    const pad=Math.max(12,width*3),left=Math.min(start.x,start.x+dx)-pad,top=Math.min(start.y,start.y+dy)-pad;
    const round=v=>Math.round(v*100)/100;
    return {layout:{left,top,width:Math.abs(dx)+2*pad,height:Math.abs(dy)+2*pad},points:[{x:round(start.x-left),y:round(start.y-top)},{x:round(start.x+dx-left),y:round(start.y+dy-top)}]};
  };
  const defaultShape=center=>{
    const {shape}=settings.shape;
    if(shape==='line'||shape==='arrow')return shapeLayout({x:center.x-defaultBox.width/2,y:center.y},{x:center.x+defaultBox.width/2,y:center.y},false);
    return {layout:{left:center.x-defaultBox.width/2,top:center.y-defaultBox.height/2,...defaultBox}};
  };
  const shapeStyle=points=>{const {shape,width,color,fill,corners}=settings.shape;return {shape,ink:color,strokeWidth:width,...(points?{points}:{fill,...(shape==='rectangle'?{corners}:{})})};};
  const previewShape=()=>{
    const s=shaping;if(!s)return;const next=s.moved?shapeLayout(s.start,s.end,s.constrain):null;
    s.preview?.remove();s.preview=null;if(!next)return;
    const svg=drawShape(root.ownerDocument,shapeStyle(next.points),next.layout.width,next.layout.height);
    svg.dataset.canvasInstancePreview='';Object.assign(svg.style,{position:'absolute',left:next.layout.left+'px',top:next.layout.top+'px',width:next.layout.width+'px',height:next.layout.height+'px',overflow:'visible',pointerEvents:'none'});
    root.append(svg);s.preview=svg;
  };
  const commitShape=(reservation,{layout,points})=>{
    // Keep the box inside the containment area; the owner contains anything still too large.
    const a=area();layout={...layout,left:Math.max(a.left,Math.min(a.right-layout.width,layout.left)),top:Math.max(a.top,Math.min(a.bottom-layout.height,layout.top))};
    let item;
    try{
      item=createShape(root,shapeStyle(points),layout);
      if(!reservation.commit(item.element,item.owner)){item.owner.dispose();return false;}
      instance.select(item.element);item.element.focus({preventScroll:true});
    }catch(error){item?.owner.dispose();reservation.cancel();throw error;}
    // Return to Select so the new shape can be manipulated immediately, like Pencil.
    setActive(false);return true;
  };
  const local=event=>{const rect=root.getBoundingClientRect();return {x:event.clientX-rect.left-root.clientLeft,y:event.clientY-rect.top-root.clientTop};};
  const down=event=>{
    if(busy()){if(event.pointerId!==(stroke??erasing??shaping).id)cancel();return;}
    if(active&&tool==='eraser'){
      if(event.button!==0||!event.isPrimary||event.pointerType==='touch'||event.target.closest(native))return;
      erasing={id:event.pointerId,marked:new Set(),last:{x:event.clientX,y:event.clientY}};
      try{root.setPointerCapture(event.pointerId);}catch{erasing=null;return;}
      root.focus({preventScroll:true});hitAt(event.clientX,event.clientY);event.preventDefault();event.stopImmediatePropagation();notify();return;
    }
    if(!active||event.button!==0||!event.isPrimary||event.pointerType==='touch'||event.target.closest(native)||!instance.getState().canCreate)return;
    if(root.clientWidth<80||root.clientHeight<100)return;
    if(tool==='shape'){
      const reservation=instance.beginCreation(cleanup,'shapes');if(!reservation)return;
      const rect=root.getBoundingClientRect(),start=clampPoint(local(event));
      shaping={id:event.pointerId,reservation,preview:null,start,end:start,moved:false,constrain:event.shiftKey,left:rect.left+root.clientLeft,top:rect.top+root.clientTop,width:root.clientWidth,height:root.clientHeight};
      root.focus({preventScroll:true});
      try{root.setPointerCapture(event.pointerId);}catch{reservation.cancel();return;}
      event.preventDefault();event.stopImmediatePropagation();notify();return;
    }
    const reservation=instance.beginCreation(cleanup,'pencil');if(!reservation)return;
    const {width,color}=settings[tool],rect=root.getBoundingClientRect(),svg=svgNode(root.ownerDocument,'svg'),path=makePath(root.ownerDocument,[],width,color,tool);
    svg.dataset.canvasInstancePreview='';svg.setAttribute('aria-hidden','true');svg.append(path);root.append(svg);
    stroke={id:event.pointerId,reservation,svg,path,points:[],left:rect.left+root.clientLeft,top:rect.top+root.clientTop,width:root.clientWidth,height:root.clientHeight,ink:color,weight:width,tool};
    root.focus({preventScroll:true});addPoint(event);path.setAttribute('d',pathFor(stroke.points));
    try{root.setPointerCapture(event.pointerId);}catch{reservation.cancel();return;}
    event.preventDefault();event.stopImmediatePropagation();notify();
  };
  const move=event=>{
    if(erasing&&erasing.id===event.pointerId){eraseTo(event);event.preventDefault();event.stopImmediatePropagation();return;}
    if(shaping&&shaping.id===event.pointerId){
      const end=clampPoint(local(event));shaping.end=end;shaping.constrain=event.shiftKey;
      if(!shaping.moved&&Math.hypot(end.x-shaping.start.x,end.y-shaping.start.y)>=4)shaping.moved=true;
      if(frame===null)frame=view.requestAnimationFrame(()=>{frame=null;previewShape();});
      event.preventDefault();event.stopImmediatePropagation();return;
    }
    if(!stroke||stroke.id!==event.pointerId)return;
    for(const sample of event.getCoalescedEvents?.()||[])addPoint(sample);addPoint(event);
    if(frame===null)frame=view.requestAnimationFrame(()=>{frame=null;if(stroke)stroke.path.setAttribute('d',pathFor(stroke.points));});
    event.preventDefault();event.stopImmediatePropagation();
  };
  // A resize/scroll may precede its host event; never commit stale coordinates.
  const stale=gesture=>{const rect=root.getBoundingClientRect();return root.clientWidth!==gesture.width||root.clientHeight!==gesture.height||Math.abs(rect.left+root.clientLeft-gesture.left)>.5||Math.abs(rect.top+root.clientTop-gesture.top)>.5;};
  const end=event=>{
    if(erasing&&erasing.id===event.pointerId){
      event.preventDefault();event.stopImmediatePropagation();
      if(event.type!=='pointerup'){clearErase();return;}
      eraseTo(event);const targets=[...erasing.marked];clearErase();
      // One history action for the whole gesture; the Eraser stays armed for the next stroke.
      if(targets.length)instance.execute('erase',targets);return;
    }
    if(shaping&&shaping.id===event.pointerId){
      event.preventDefault();event.stopImmediatePropagation();
      if(event.type!=='pointerup'||stale(shaping)){cancel();return;}
      const s=shaping,endPoint=clampPoint(local(event)),moved=s.moved||Math.hypot(endPoint.x-s.start.x,endPoint.y-s.start.y)>=4;
      // A click without a drag places the default size centred on the press.
      const next=moved?shapeLayout(s.start,endPoint,event.shiftKey):defaultShape(s.start);
      const reservation=s.reservation;cleanup();commitShape(reservation,next);return;
    }
    if(!stroke||stroke.id!==event.pointerId)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(event.type!=='pointerup'||stale(stroke)){cancel();return;}
    addPoint(event);const completed=stroke;cleanup();let drawing;
    try{
      drawing=createDrawing(root,completed.points,{width:completed.weight,color:completed.ink,tool:completed.tool});
      if(!completed.reservation.commit(drawing.element,drawing.owner)){drawing.owner.dispose();return;}
      instance.select(drawing.element);drawing.element.focus({preventScroll:true});
    }catch(error){drawing?.owner.dispose();completed.reservation.cancel();throw error;}
    // Return to Select so the finished drawing can be manipulated immediately.
    setActive(false);
  };
  // Keyboard placement: Enter with the Shapes tool armed places the default shape at the centre of the visible surface.
  const placeAtCenter=()=>{
    if(!instance.getState().canCreate||root.clientWidth<80||root.clientHeight<100)return false;
    const reservation=instance.beginCreation(()=>{},'shapes');if(!reservation)return false;
    const rect=root.getBoundingClientRect(),left=Math.max(rect.left,0),right=Math.min(rect.right,view.innerWidth),top=Math.max(rect.top,0),bottom=Math.min(rect.bottom,view.innerHeight);
    const center=clampPoint({x:(left+right)/2-rect.left-root.clientLeft,y:(top+bottom)/2-rect.top-root.clientTop});
    return commitShape(reservation,defaultShape(center));
  };
  const key=event=>{
    if(event.defaultPrevented||event.isComposing||event.keyCode===229||event.target.closest(native))return;
    const name=event.key==='Escape'?event.key:event.key.toLowerCase(),plain=!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.repeat;
    if(plain&&(name==='p'||!event.shiftKey&&(['v','e','Escape'].includes(name)||Object.hasOwn(shapeKeys,name)))){
      if(event.key==='Escape'&&!active&&!busy())return;
      if(Object.hasOwn(shapeKeys,name)&&!permitted(instance.getState(),'shape'))return;
      event.preventDefault();event.stopImmediatePropagation();
      if(name==='v'||name==='Escape'){setActive(false);return;}
      if(Object.hasOwn(shapeKeys,name)){
        const kind=shapeKeys[name];if(active&&tool==='shape'&&settings.shape.shape===kind){setActive(false);return;}
        if(setTool('shape')){settings.shape.shape=kind;if(!setActive(true))notify();}return;
      }
      const next=name==='e'?'eraser':event.shiftKey?'highlighter':'pencil';if(active&&tool===next)setActive(false);else if(setTool(next))setActive(true);return;
    }
    if(plain&&event.key==='Enter'&&active&&tool==='shape'&&!busy()&&!event.shiftKey){event.preventDefault();event.stopImmediatePropagation();placeAtCenter();return;}
    if(busy()){if(event.key==='Tab')cancel();else event.preventDefault();event.stopImmediatePropagation();}
  };
  const context=()=>cancel();
  const listeners={pointerdown:down,pointermove:move,pointerup:end,pointercancel:end,lostpointercapture:end,keydown:key,contextmenu:context};
  for(const [type,listener]of Object.entries(listeners))root.addEventListener(type,listener,true);
  const unsubscribe=instance.subscribe(state=>{if(!state.mounted)dispose();else if((state.editing||state.settings.readOnly||!permitted(state))&&active)setActive(false);});
  function dispose(){
    if(disposed)return;cancel();disposed=true;active=false;
    for(const [type,listener]of Object.entries(listeners))root.removeEventListener(type,listener,true);
    root.removeAttribute('data-instance-pencil-active');delete root.dataset.instancePencilTool;unsubscribe();root=instance=null;
  }
  function setTool(value){if(disposed||busy()||!tools.includes(value))return false;if(tool!==value){tool=value;if(active)root.dataset.instancePencilTool=tool;notify();}return true;}
  const strokeTool=()=>tool==='shape'?'pencil':tool;
  const setShapeOption=(key,value,valid)=>{if(disposed||busy()||tool!=='shape'||!valid)return false;settings.shape[key]=value;notify();return true;};
  return Object.freeze({getState,setActive,setTool,cancel,
    setWidth(value){if(disposed||busy()||tool==='eraser'||!validStroke(strokeTool(),value,settings[tool].color))return false;settings[tool].width=value;notify();return true;},
    setColor(value){if(disposed||busy()||tool==='eraser'||!validStroke(strokeTool(),settings[tool].width,value))return false;settings[tool].color=value;notify();return true;},
    setShape:value=>setShapeOption('shape',value,shapeKinds.includes(value)),
    setFill:value=>setShapeOption('fill',value,shapeFills.includes(value)),
    setCorners:value=>setShapeOption('corners',value,shapeCorners.includes(value)),
    dispose,
  });
}
