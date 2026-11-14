// Layers panel (docs/prd/ORGANISATION.md step 1): one row per object, front to back, with its type icon and type name.
// A native popover opened from a host's button, like the inspector. Visit-local: it only shows and selects objects.
import {toolbarIcons} from './canvas-instance-toolbar-icons.js';
const iconFor={Text:'type','Sticky Note':'sticky-note',Image:'image',Drawing:'pencil',Highlight:'highlighter',Rectangle:'square',Ellipse:'ellipse',Diamond:'diamond',Line:'slash',Arrow:'move-up-right'};
let serial=0;const mounted=new WeakSet();
export function createCanvasLayers(container,{canvas,trigger}){
  const doc=container?.ownerDocument,view=doc?.defaultView;
  if(!view||!container?.isConnected||['HTML','BODY'].includes(container.tagName)||!canvas?.getLayers||!(trigger instanceof view.HTMLButtonElement)||!container.contains(trigger)||mounted.has(trigger))throw new TypeError('Layers need a mounted canvas and an independent contained trigger.');
  mounted.add(trigger);
  const id='canvas-layers-'+(++serial);
  const original=new Map(['aria-controls','aria-expanded','aria-haspopup'].map(name=>[name,trigger.getAttribute(name)]));
  const panel=doc.createElement('section');panel.id=id;panel.className='canvas-embed-layers';panel.popover='auto';
  panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Layers');
  const heading=doc.createElement('h2');heading.textContent='Layers';
  const note=doc.createElement('p');note.id=id+'-note';note.textContent='Front to back. Choose a layer to select it.';
  const list=doc.createElement('ul');list.className='canvas-embed-layers__list';list.setAttribute('aria-describedby',note.id);
  const empty=doc.createElement('p');empty.hidden=true;empty.textContent='No objects yet.';
  panel.append(heading,note,list,empty);container.append(panel);
  trigger.setAttribute('aria-controls',id);trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-haspopup','dialog');
  let alive=true,rowsKey='';
  const isOpen=()=>panel.matches(':popover-open');
  // One button per object. Rows are rebuilt only when the list's contents change, never on every pointer move.
  function render(){
    if(!alive)return;
    const layers=canvas.getLayers(),key=layers.map(item=>`${item.id}:${item.name}:${item.locked}:${item.group}:${item.selected}`).join('|');
    empty.hidden=layers.length>0;
    if(key===rowsKey)return;rowsKey=key;
    list.replaceChildren(...layers.map((item,index)=>{
      const li=doc.createElement('li'),button=doc.createElement('button');
      button.type='button';button.className='canvas-embed-layers__row';button.dataset.layerId=String(item.id);
      button.setAttribute('aria-pressed',String(item.selected));
      const label=`${item.name}${item.locked?', locked':''}${item.group!==null?', grouped':''}`;
      button.setAttribute('aria-label',`${index+1} of ${layers.length}: ${label}`);
      const icon=doc.createElementNS('http://www.w3.org/2000/svg','svg');
      icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');icon.setAttribute('focusable','false');
      icon.setAttribute('fill','none');icon.setAttribute('stroke','currentColor');icon.setAttribute('stroke-width','2');icon.setAttribute('stroke-linecap','round');icon.setAttribute('stroke-linejoin','round');
      icon.innerHTML=toolbarIcons[iconFor[item.name]??'square']??'';
      const text=doc.createElement('span');text.textContent=item.name;
      button.append(icon,text);
      if(item.locked){const mark=doc.createElement('span');mark.className='canvas-embed-layers__mark';mark.textContent='Locked';button.append(mark);}
      button.addEventListener('click',()=>{const target=canvas.getLayers().find(entry=>entry.id===item.id);if(target)canvas.select(target.element);});
      li.append(button);return li;
    }));
  }
  // Escape closes from anywhere while open (the canvas may hold focus after a change), then returns focus to the trigger.
  // Light dismissal keeps focus where the user put it.
  const onDocKey=event=>{if(event.key==='Escape'&&isOpen()){event.preventDefault();close(true);}};
  function close(focus=false){
    if(!isOpen())return;
    panel.hidePopover();trigger.setAttribute('aria-expanded','false');doc.removeEventListener('keydown',onDocKey,true);
    if(focus&&!trigger.disabled)trigger.focus({preventScroll:true});
  }
  function toggle(){
    if(!alive||trigger.disabled)return;
    if(isOpen()){close(true);return;}
    render();panel.showPopover();trigger.setAttribute('aria-expanded','true');doc.addEventListener('keydown',onDocKey,true);
    list.querySelector('button')?.focus({preventScroll:true});
  }
  // Native light dismissal (outside click) reaches here through the popover's toggle event.
  const onToggle=()=>{if(!isOpen()){trigger.setAttribute('aria-expanded','false');doc.removeEventListener('keydown',onDocKey,true);}};
  const onClick=()=>toggle();
  panel.addEventListener('toggle',onToggle);trigger.addEventListener('click',onClick);
  const off=canvas.subscribe(()=>{if(isOpen())render();});
  render();
  return Object.freeze({toggle,render,close:()=>close(true),dispose(){
    if(!alive)return;alive=false;off();
    close();doc.removeEventListener('keydown',onDocKey,true);
    panel.removeEventListener('toggle',onToggle);trigger.removeEventListener('click',onClick);
    for(const [name,value] of original){if(value===null)trigger.removeAttribute(name);else trigger.setAttribute(name,value);}
    panel.remove();mounted.delete(trigger);
  }});
}
