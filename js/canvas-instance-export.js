// PNG export (docs/prd/STYLING-EXPORT.md). The package has no runtime dependencies, so the host supplies the renderer.
// The package chooses what to export, keeps the output within its limits and handles cancellation, timeouts and
// one-at-a-time exports. The host turns the returned Blob into a download; nothing here touches the document or storage.
export const exportLimits=Object.freeze({maxScale:2,maxSide:4096,maxPixels:12e6,maxElements:1200,maxImages:64,timeoutMs:25000});

// Pure planning: the scale that keeps width, height and pixel count within limits. Reduces the scale rather than failing.
export function planExport({width,height,scale=1,maxScale=exportLimits.maxScale,maxSide=exportLimits.maxSide,maxPixels=exportLimits.maxPixels}={}){
  if(![width,height,scale].every(Number.isFinite)||width<=0||height<=0||scale<=0)throw new RangeError('Export needs a positive size and scale.');
  let next=Math.min(scale,maxScale);
  next=Math.min(next,maxSide/Math.max(width,height));
  next=Math.min(next,Math.sqrt(maxPixels/(width*height)));
  const w=Math.max(1,Math.round(width*next)),h=Math.max(1,Math.round(height*next));
  return Object.freeze({scale:next,width:w,height:h,reduced:next<scale});
}

export function createCanvasExport(canvas,{host,render,timeoutMs=exportLimits.timeoutMs}={}){
  const view=host?.ownerDocument?.defaultView;
  if(!view||!(host instanceof view.HTMLElement)||['HTML','BODY'].includes(host.tagName))throw new TypeError('Export needs the canvas host.');
  if(typeof render!=='function')throw new TypeError('Export needs a render function from the host.');
  if(!canvas?.getState||!canvas?.getLayers)throw new TypeError('Export needs a canvas.');
  let busy=null,alive=true;
  // Bounds of the selection or the whole visible host, in host pixels (screen pixels; camera zoom is not included).
  function boundsFor(scope){
    const area=host.getBoundingClientRect(),originX=area.left+host.clientLeft,originY=area.top+host.clientTop;
    if(scope==='visible')return {left:0,top:0,width:host.clientWidth,height:host.clientHeight,elements:[...host.querySelectorAll('[data-canvas-instance-selected],[data-canvas-instance-note],[data-canvas-instance-shape],[data-canvas-instance-drawing],[data-canvas-instance-image],[data-original]')]};
    const items=canvas.getLayers().filter(item=>item.selected);
    if(!items.length)throw new RangeError('Select objects to export, or export the visible canvas.');
    const rects=items.map(item=>item.element.getBoundingClientRect()).filter(r=>r.width>0&&r.height>0);
    if(!rects.length)throw new RangeError('The selection has no visible size to export.');
    const left=Math.min(...rects.map(r=>r.left)),top=Math.min(...rects.map(r=>r.top)),right=Math.max(...rects.map(r=>r.right)),bottom=Math.max(...rects.map(r=>r.bottom));
    return {left:left-originX,top:top-originY,width:right-left,height:bottom-top,elements:items.map(item=>item.element)};
  }
  async function exportPng({scope='selection',scale=1,signal}={}){
    if(!alive)throw new Error('Export is unavailable: the canvas was destroyed.');
    if(busy)throw new Error('An export is already running.');
    if(scope!=='selection'&&scope!=='visible')throw new TypeError('Export scope must be selection or visible.');
    const state=canvas.getState();
    if(!state.mounted)throw new Error('Export needs a mounted canvas.');
    const bounds=boundsFor(scope);
    if(bounds.elements.length>exportLimits.maxElements)throw new RangeError('The export has too many objects.');
    if(bounds.elements.filter(element=>element.matches?.('[data-canvas-instance-image]')||element.querySelector?.('img')).length>exportLimits.maxImages)throw new RangeError('The export has too many images.');
    const plan=planExport({width:bounds.width,height:bounds.height,scale});
    const controller=new AbortController(),outer=signal;
    const abort=()=>controller.abort();outer?.addEventListener?.('abort',abort,{once:true});
    const timer=view.setTimeout(()=>controller.abort(),timeoutMs);
    const job={controller};busy=job;
    try{
      const result=await Promise.race([
        Promise.resolve(render({elements:bounds.elements,bounds:{left:bounds.left,top:bounds.top,width:bounds.width,height:bounds.height},width:plan.width,height:plan.height,scale:plan.scale,signal:controller.signal})),
        new Promise((_,reject)=>controller.signal.addEventListener('abort',()=>reject(new DOMException('Export was cancelled or timed out.','AbortError')),{once:true})),
      ]);
      if(!(result instanceof view.Blob)||result.type!=='image/png')throw new TypeError('The renderer must return a PNG Blob.');
      return Object.freeze({blob:result,width:plan.width,height:plan.height,scale:plan.scale,reduced:plan.reduced});
    }finally{
      view.clearTimeout(timer);outer?.removeEventListener?.('abort',abort);
      if(busy===job)busy=null;
    }
  }
  return Object.freeze({exportPng,isBusy:()=>busy!==null,dispose(){if(!alive)return;alive=false;busy?.controller.abort();}});
}
