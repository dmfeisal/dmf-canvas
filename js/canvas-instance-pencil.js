import {createDrawing} from './canvas-instance-drawing.js';
import {svgNode,makePath,pathFor} from './canvas-instance-stroke.js';
const widths=[2,4,8],inks={primary:1,blue:1,red:1};
const native='input,textarea,select,button,a,[contenteditable]:not([contenteditable="false"]),dialog,[popover]';
export function createPencil(canvas,host,onChange=()=>{}) {
  let root=host,instance=canvas,active=false,width=4,color='primary',stroke=null,frame=null,disposed=false;
  const view=host.ownerDocument.defaultView;
  const getState=()=>Object.freeze({active,width,color,drawing:!!stroke});
  const notify=()=>{if(!disposed)onChange(getState());};
  const cleanup=()=>{
    if(frame!==null){view.cancelAnimationFrame(frame);frame=null;}
    if(!stroke)return;const old=stroke;stroke=null;old.svg.remove();
    if(root?.hasPointerCapture(old.id))root.releasePointerCapture(old.id);notify();
  };
  const cancel=()=>{if(stroke)stroke.reservation.cancel();};
  const setActive=value=>{
    if(disposed)return false;
    if(value&&(!instance.getState().mounted||instance.getState().settings.readOnly||!instance.getState().settings.tools.pencil||instance.getState().editing))return false;
    cancel();if(value){instance.execute('cancel');instance.setMultiple(false);if(!instance.getState().canCreate)return false;}active=!!value;root.toggleAttribute('data-instance-pencil-active',active);notify();return true;
  };
  const addPoint=event=>{
    const s=stroke,point={x:Math.max(20,Math.min(s.width-20,event.clientX-s.left)),y:Math.max(20,Math.min(s.height-44,event.clientY-s.top))},last=s.points.at(-1);
    if(s.points.length<2048&&(!last||Math.hypot(point.x-last.x,point.y-last.y)>=.5))s.points.push(point);
  };
  const down=event=>{
    if(stroke){if(event.pointerId!==stroke.id)cancel();return;}
    if(!active||event.button!==0||!event.isPrimary||event.pointerType==='touch'||event.target.closest(native)||!instance.getState().canCreate)return;
    if(root.clientWidth<80||root.clientHeight<100)return;
    const reservation=instance.beginCreation(cleanup,'pencil');if(!reservation)return;
    const rect=root.getBoundingClientRect(),svg=svgNode(root.ownerDocument,'svg'),path=makePath(root.ownerDocument,[],width,color);
    svg.dataset.canvasInstancePreview='';svg.setAttribute('aria-hidden','true');svg.append(path);root.append(svg);
    stroke={id:event.pointerId,reservation,svg,path,points:[],left:rect.left+root.clientLeft,top:rect.top+root.clientTop,width:root.clientWidth,height:root.clientHeight,ink:color,weight:width};
    root.focus({preventScroll:true});addPoint(event);path.setAttribute('d',pathFor(stroke.points));
    try{root.setPointerCapture(event.pointerId);}catch{reservation.cancel();return;}
    event.preventDefault();event.stopImmediatePropagation();notify();
  };
  const move=event=>{
    if(!stroke||stroke.id!==event.pointerId)return;
    for(const sample of event.getCoalescedEvents?.()||[])addPoint(sample);addPoint(event);
    if(frame===null)frame=view.requestAnimationFrame(()=>{frame=null;if(stroke)stroke.path.setAttribute('d',pathFor(stroke.points));});
    event.preventDefault();event.stopImmediatePropagation();
  };
  const end=event=>{
    if(!stroke||stroke.id!==event.pointerId)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(event.type!=='pointerup'){cancel();return;}
    // A resize/scroll may precede its host event; never commit stale coordinates.
    const rect=root.getBoundingClientRect();
    if(root.clientWidth!==stroke.width||root.clientHeight!==stroke.height||Math.abs(rect.left+root.clientLeft-stroke.left)>.5||Math.abs(rect.top+root.clientTop-stroke.top)>.5){cancel();return;}
    addPoint(event);const completed=stroke;cleanup();let drawing;
    try{
      drawing=createDrawing(root,completed.points,{width:completed.weight,color:completed.ink});
      if(!completed.reservation.commit(drawing.element,drawing.owner)){drawing.owner.dispose();return;}
      instance.select(drawing.element);drawing.element.focus({preventScroll:true});
    }catch(error){drawing?.owner.dispose();completed.reservation.cancel();throw error;}
    // Return to Select so the finished drawing can be manipulated immediately.
    setActive(false);
  };
  const key=event=>{
    if(event.defaultPrevented||event.isComposing||event.keyCode===229||event.target.closest(native))return;
    if(!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.shiftKey&&!event.repeat&&['p','v','Escape'].includes(event.key==='Escape'?event.key:event.key.toLowerCase())){
      if(event.key==='Escape'&&!active&&!stroke)return;
      event.preventDefault();event.stopImmediatePropagation();setActive(event.key.toLowerCase()==='p'?!active:false);return;
    }
    if(stroke){if(event.key==='Tab')cancel();else event.preventDefault();event.stopImmediatePropagation();}
  };
  const context=()=>cancel();
  const listeners={pointerdown:down,pointermove:move,pointerup:end,pointercancel:end,lostpointercapture:end,keydown:key,contextmenu:context};
  for(const [type,listener]of Object.entries(listeners))root.addEventListener(type,listener,true);
  const unsubscribe=instance.subscribe(state=>{if(!state.mounted)dispose();else if((state.editing||state.settings.readOnly||!state.settings.tools.pencil)&&active)setActive(false);});
  function dispose(){
    if(disposed)return;cancel();disposed=true;active=false;
    for(const [type,listener]of Object.entries(listeners))root.removeEventListener(type,listener,true);
    root.removeAttribute('data-instance-pencil-active');unsubscribe();root=instance=null;
  }
  return Object.freeze({getState,setActive,cancel,
    setWidth(value){if(disposed||stroke||!widths.includes(value))return false;width=value;notify();return true;},
    setColor(value){if(disposed||stroke||!Object.hasOwn(inks,value))return false;color=value;notify();return true;},dispose,
  });
}
