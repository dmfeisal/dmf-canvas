// Context menu (docs/prd/ORGANISATION.md step 4). Right-click on a canvas, or Shift+F10 / the Context Menu key on a
// focused object, opens the toolbar's own actions for the current state. It adds no commands: it reads the toolbar's
// entries (labels, shortcuts and availability) and dispatches through toolbar.activate(), the same path a click takes.
// One native auto popover, positioned at the pointer or the object, with arrow, Home and End navigation.
let serial=0;const mounted=new WeakSet();
export function createCanvasContextMenu(host,{canvas,toolbar}){
  const doc=host?.ownerDocument,view=doc?.defaultView;
  if(!view||!(host instanceof view.HTMLElement)||['HTML','BODY'].includes(host.tagName)||!canvas?.getState||!toolbar?.entries||!toolbar?.activate||mounted.has(host))throw new TypeError('A context menu needs a canvas, its toolbar and an independent host.');
  mounted.add(host);
  const id='canvas-context-'+(++serial);
  const menu=doc.createElement('div');menu.id=id;menu.className='canvas-embed-context';menu.popover='auto';
  menu.setAttribute('role','menu');menu.setAttribute('aria-label','Canvas actions');
  doc.body.append(menu);
  let alive=true;
  const isOpen=()=>menu.matches(':popover-open');
  const items=()=>[...menu.querySelectorAll('[role=menuitem]:not(:disabled)')];
  function render(){
    const entries=toolbar.entries();
    menu.replaceChildren(...entries.map(entry=>{
      const button=doc.createElement('button');button.type='button';button.setAttribute('role','menuitem');button.dataset.contextAction=entry.id;
      button.append(entry.label);button.disabled=!entry.enabled;
      if(entry.key){const key=doc.createElement('kbd');key.textContent=entry.key;button.append(' ',key);}
      button.addEventListener('click',()=>{close(false);toolbar.activate(entry.id);});
      return button;
    }));
    if(!menu.children.length){const none=doc.createElement('p');none.textContent='No actions here.';menu.append(none);}
  }
  function place(x,y){
    menu.style.position='fixed';menu.style.left='0px';menu.style.top='0px';
    const box=menu.getBoundingClientRect(),vw=view.innerWidth,vh=view.innerHeight;
    menu.style.left=Math.max(8,Math.min(vw-box.width-8,x))+'px';menu.style.top=Math.max(8,Math.min(vh-box.height-8,y))+'px';
  }
  function open(x,y){
    if(!alive||!canvas.getState().mounted||isOpen())return;
    render();menu.showPopover();place(x,y);
    items()[0]?.focus({preventScroll:true});
  }
  function close(focus){
    if(!isOpen())return;
    menu.hidePopover();if(focus)host.focus({preventScroll:true});
  }
  // Right-click opens the menu at the pointer and suppresses the browser's own menu.
  const onContext=event=>{
    if(!alive)return;event.preventDefault();
    open(event.clientX,event.clientY);
  };
  // Shift+F10 or the Context Menu key on a focused object or the canvas opens it beside that object.
  const onKey=event=>{
    if(event.defaultPrevented||event.isComposing)return;
    const menuKey=event.key==='ContextMenu'||(event.key==='F10'&&event.shiftKey);
    if(!menuKey||event.target.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])'))return;
    event.preventDefault();
    const target=event.target.closest?.('[data-canvas-instance-selected],[data-canvas-instance-shape],.canvas-instance-note,.canvas-instance-drawing,.canvas-instance-image')??host;
    const rect=target.getBoundingClientRect();
    open(rect.left+rect.width/2,rect.top+rect.height/2);
  };
  // Arrow keys move through enabled items; Home and End jump; Escape closes and returns focus to the canvas (auto popover).
  const onMenuKey=event=>{
    const list=items();if(!list.length)return;
    const index=list.indexOf(doc.activeElement);let next=null;
    if(event.key==='ArrowDown')next=list[(index+1+list.length)%list.length];
    else if(event.key==='ArrowUp')next=list[(index-1+list.length)%list.length];
    else if(event.key==='Home')next=list[0];
    else if(event.key==='End')next=list[list.length-1];
    else if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true);return;}
    if(next){event.preventDefault();next.focus({preventScroll:true});}
  };
  host.addEventListener('contextmenu',onContext);host.addEventListener('keydown',onKey);
  menu.addEventListener('keydown',onMenuKey);
  return Object.freeze({open:(x,y)=>open(x,y),close:()=>close(true),isOpen,dispose(){
    if(!alive)return;alive=false;close(false);
    host.removeEventListener('contextmenu',onContext);host.removeEventListener('keydown',onKey);
    menu.removeEventListener('keydown',onMenuKey);
    menu.remove();mounted.delete(host);
  }});
}
