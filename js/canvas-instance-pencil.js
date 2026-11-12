import {createDrawing} from './canvas-instance-drawing.js';
import {svgNode,makePath,pathFor,validStroke} from './canvas-instance-stroke.js';
const native='input,textarea,select,button,a,[contenteditable]:not([contenteditable="false"]),dialog,[popover]';
export function createPencil(canvas,host,onChange=()=>{}) {
  // One controller arms at most one drawing tool (Pencil, Highlighter or stroke Eraser); stroke tools keep their own width and ink.
  let root=host,instance=canvas,active=false,tool='pencil',stroke=null,erasing=null,frame=null,disposed=false;
  const tools=['pencil','highlighter','eraser'];
  const settings={pencil:{width:4,color:'primary'},highlighter:{width:20,color:'yellow'}};
  const view=host.ownerDocument.defaultView;
  const getState=()=>Object.freeze({active,tool,width:settings[tool]?.width??null,color:settings[tool]?.color??null,drawing:!!stroke||!!erasing});
  const notify=()=>{if(!disposed)onChange(getState());};
  const cleanup=()=>{
    if(frame!==null){view.cancelAnimationFrame(frame);frame=null;}
    if(!stroke)return;const old=stroke;stroke=null;old.svg.remove();
    if(root?.hasPointerCapture(old.id))root.releasePointerCapture(old.id);notify();
  };
  // Eraser: touched strokes fade until release; cancellation restores them untouched.
  const clearErase=()=>{if(!erasing)return;const old=erasing;erasing=null;for(const element of old.marked)element.removeAttribute('data-canvas-instance-erasing');if(root?.hasPointerCapture(old.id))root.releasePointerCapture(old.id);notify();};
  const cancel=()=>{if(stroke)stroke.reservation.cancel();clearErase();};
  const ring=[[0,0],...Array.from({length:8},(_,i)=>[Math.round(6*Math.cos(i*Math.PI/4)),Math.round(6*Math.sin(i*Math.PI/4))])];
  const hitAt=(x,y)=>{for(const [dx,dy]of ring)for(const element of root.ownerDocument.elementsFromPoint(x+dx,y+dy)){if(element.localName!=='path')continue;const drawing=element.closest('.canvas-instance-drawing');if(drawing?.parentElement===root&&!drawing.hasAttribute('data-canvas-instance-locked')&&!erasing.marked.has(drawing)){erasing.marked.add(drawing);drawing.setAttribute('data-canvas-instance-erasing','');}}};
  const eraseTo=event=>{const last=erasing.last,steps=Math.min(24,Math.max(1,Math.ceil(Math.hypot(event.clientX-last.x,event.clientY-last.y)/6)));for(let i=1;i<=steps;i++)hitAt(last.x+(event.clientX-last.x)*i/steps,last.y+(event.clientY-last.y)*i/steps);erasing.last={x:event.clientX,y:event.clientY};};
  const setActive=value=>{
    if(disposed)return false;
    const current=instance.getState();
    if(value&&(!current.mounted||current.settings.readOnly||!current.settings.tools.pencil||tool==='eraser'&&!current.settings.tools.delete||current.editing))return false;
    cancel();if(value){instance.execute('cancel');instance.setMultiple(false);if(tool!=='eraser'&&!instance.getState().canCreate)return false;}active=!!value;root.toggleAttribute('data-instance-pencil-active',active);if(active)root.dataset.instancePencilTool=tool;else delete root.dataset.instancePencilTool;notify();return true;
  };
  const addPoint=event=>{
    const s=stroke,point={x:Math.max(20,Math.min(s.width-20,event.clientX-s.left)),y:Math.max(20,Math.min(s.height-44,event.clientY-s.top))},last=s.points.at(-1);
    if(s.points.length<2048&&(!last||Math.hypot(point.x-last.x,point.y-last.y)>=.5))s.points.push(point);
  };
  const down=event=>{
    if(stroke||erasing){if(event.pointerId!==(stroke??erasing).id)cancel();return;}
    if(active&&tool==='eraser'){
      if(event.button!==0||!event.isPrimary||event.pointerType==='touch'||event.target.closest(native))return;
      erasing={id:event.pointerId,marked:new Set(),last:{x:event.clientX,y:event.clientY}};
      try{root.setPointerCapture(event.pointerId);}catch{erasing=null;return;}
      root.focus({preventScroll:true});hitAt(event.clientX,event.clientY);event.preventDefault();event.stopImmediatePropagation();notify();return;
    }
    if(!active||event.button!==0||!event.isPrimary||event.pointerType==='touch'||event.target.closest(native)||!instance.getState().canCreate)return;
    if(root.clientWidth<80||root.clientHeight<100)return;
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
    if(!stroke||stroke.id!==event.pointerId)return;
    for(const sample of event.getCoalescedEvents?.()||[])addPoint(sample);addPoint(event);
    if(frame===null)frame=view.requestAnimationFrame(()=>{frame=null;if(stroke)stroke.path.setAttribute('d',pathFor(stroke.points));});
    event.preventDefault();event.stopImmediatePropagation();
  };
  const end=event=>{
    if(erasing&&erasing.id===event.pointerId){
      event.preventDefault();event.stopImmediatePropagation();
      if(event.type!=='pointerup'){clearErase();return;}
      eraseTo(event);const targets=[...erasing.marked];clearErase();
      // One history action for the whole gesture; the Eraser stays armed for the next stroke.
      if(targets.length)instance.execute('erase',targets);return;
    }
    if(!stroke||stroke.id!==event.pointerId)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(event.type!=='pointerup'){cancel();return;}
    // A resize/scroll may precede its host event; never commit stale coordinates.
    const rect=root.getBoundingClientRect();
    if(root.clientWidth!==stroke.width||root.clientHeight!==stroke.height||Math.abs(rect.left+root.clientLeft-stroke.left)>.5||Math.abs(rect.top+root.clientTop-stroke.top)>.5){cancel();return;}
    addPoint(event);const completed=stroke;cleanup();let drawing;
    try{
      drawing=createDrawing(root,completed.points,{width:completed.weight,color:completed.ink,tool:completed.tool});
      if(!completed.reservation.commit(drawing.element,drawing.owner)){drawing.owner.dispose();return;}
      instance.select(drawing.element);drawing.element.focus({preventScroll:true});
    }catch(error){drawing?.owner.dispose();completed.reservation.cancel();throw error;}
    // Return to Select so the finished drawing can be manipulated immediately.
    setActive(false);
  };
  const key=event=>{
    if(event.defaultPrevented||event.isComposing||event.keyCode===229||event.target.closest(native))return;
    const name=event.key==='Escape'?event.key:event.key.toLowerCase();
    if(!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.repeat&&(name==='p'||!event.shiftKey&&['v','e','Escape'].includes(name))){
      if(event.key==='Escape'&&!active&&!stroke&&!erasing)return;
      event.preventDefault();event.stopImmediatePropagation();
      if(name==='v'||name==='Escape'){setActive(false);return;}
      const next=name==='e'?'eraser':event.shiftKey?'highlighter':'pencil';if(active&&tool===next)setActive(false);else if(setTool(next))setActive(true);return;
    }
    if(stroke||erasing){if(event.key==='Tab')cancel();else event.preventDefault();event.stopImmediatePropagation();}
  };
  const context=()=>cancel();
  const listeners={pointerdown:down,pointermove:move,pointerup:end,pointercancel:end,lostpointercapture:end,keydown:key,contextmenu:context};
  for(const [type,listener]of Object.entries(listeners))root.addEventListener(type,listener,true);
  const unsubscribe=instance.subscribe(state=>{if(!state.mounted)dispose();else if((state.editing||state.settings.readOnly||!state.settings.tools.pencil||tool==='eraser'&&!state.settings.tools.delete)&&active)setActive(false);});
  function dispose(){
    if(disposed)return;cancel();disposed=true;active=false;
    for(const [type,listener]of Object.entries(listeners))root.removeEventListener(type,listener,true);
    root.removeAttribute('data-instance-pencil-active');delete root.dataset.instancePencilTool;unsubscribe();root=instance=null;
  }
  function setTool(value){if(disposed||stroke||erasing||!tools.includes(value))return false;if(tool!==value){tool=value;if(active)root.dataset.instancePencilTool=tool;notify();}return true;}
  return Object.freeze({getState,setActive,setTool,cancel,
    setWidth(value){if(disposed||stroke||tool==='eraser'||!validStroke(tool,value,settings[tool].color))return false;settings[tool].width=value;notify();return true;},
    setColor(value){if(disposed||stroke||tool==='eraser'||!validStroke(tool,settings[tool].width,value))return false;settings[tool].color=value;notify();return true;},dispose,
  });
}
