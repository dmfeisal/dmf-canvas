// Full screen for a canvas's chrome (docs/prd/NAVIGATION.md step 5). Lives in the toolbar entry point, not core,
// because it needs the chrome container and a document-level fullscreenchange listener. The whole container goes
// full screen, so toolbars, menus, the inspector and help stay visible and contained.
const native='input,textarea,select,button,a,[contenteditable]:not([contenteditable="false"]),dialog,[popover]';
const mounted=new WeakSet();
export function createCanvasFullscreen(target,{canvas=null,onChange=()=>{}}={}){
  const doc=target?.ownerDocument,view=doc?.defaultView;
  if(!view||!(target instanceof view.HTMLElement)||['HTML','BODY'].includes(target.tagName)||!target.isConnected||mounted.has(target))throw new TypeError('Full screen needs a connected, independent chrome container.');
  if(typeof onChange!=='function'||canvas!==null&&typeof canvas?.getState!=='function')throw new TypeError('Full screen needs an onChange function and an optional canvas.');
  // Hosts hide the action when this is false: no Fullscreen API, or an iframe without permission.
  const supported=!!doc.fullscreenEnabled&&typeof target.requestFullscreen==='function';
  let alive=true,pending=false;
  const active=()=>doc.fullscreenElement===target;
  const getState=()=>Object.freeze({supported,active:active(),pending});
  const notify=()=>{if(alive)try{onChange(getState());}catch(error){view.reportError(error);}};
  async function enter(){
    if(!alive||!supported||active()||pending)return false;
    pending=true;notify();
    try{
      await target.requestFullscreen();
      // Disposed while the request was in flight: undo it, since no controller is left to exit.
      if(!alive){if(active())await doc.exitFullscreen().catch(()=>{});return false;}
      return true;
    }catch{return false;}finally{pending=false;notify();}
  }
  async function exit(){
    if(!alive||!active())return false;
    try{await doc.exitFullscreen();return true;}catch{return false;}
  }
  const toggle=()=>active()?exit():enter();
  // F toggles from a focused canvas, never while typing, editing or inside a native control or menu.
  const onKey=event=>{
    if(event.defaultPrevented||event.isComposing||event.repeat||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey||event.key.toLowerCase()!=='f')return;
    if(event.target.closest?.(native)||event.target.isContentEditable)return;
    const state=canvas?.getState();if(canvas&&(!state?.mounted||state.editing||state.creating))return;
    event.preventDefault();toggle();
  };
  const onChangeEvent=()=>notify();
  doc.addEventListener('fullscreenchange',onChangeEvent);doc.addEventListener('fullscreenerror',onChangeEvent);
  target.addEventListener('keydown',onKey);mounted.add(target);
  return Object.freeze({getState,enter,exit,toggle,
    dispose(){
      if(!alive)return;alive=false;mounted.delete(target);
      doc.removeEventListener('fullscreenchange',onChangeEvent);doc.removeEventListener('fullscreenerror',onChangeEvent);target.removeEventListener('keydown',onKey);
      if(active())doc.exitFullscreen().catch(()=>{});
    },
  });
}
