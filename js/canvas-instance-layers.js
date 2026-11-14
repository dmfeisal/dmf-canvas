// Layers panel (docs/prd/ORGANISATION.md): one row per object, front to back, with its type icon and name.
// A native popover opened from a host's button, like the inspector. Visit-local: it shows, searches, selects and
// renames objects; nothing it does is saved.
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
  const search=doc.createElement('input');search.type='search';search.className='canvas-embed-layers__search';search.setAttribute('aria-label','Search layers');search.placeholder='Search layers';
  const note=doc.createElement('p');note.id=id+'-note';note.textContent='Front to back. Choose a layer to select it; Rename or F2 changes its name.';
  const list=doc.createElement('ul');list.className='canvas-embed-layers__list';list.setAttribute('aria-describedby',note.id);
  const empty=doc.createElement('p');empty.hidden=true;empty.textContent='No objects yet.';
  const none=doc.createElement('p');none.hidden=true;none.textContent='No layers match this search.';
  panel.append(heading,search,note,list,empty,none);container.append(panel);
  trigger.setAttribute('aria-controls',id);trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-haspopup','dialog');
  let alive=true,rowsKey='',renaming=null,renameForm=null;
  const isOpen=()=>panel.matches(':popover-open');
  const matches=(item,query)=>!query||item.name.toLowerCase().includes(query)||item.typeName.toLowerCase().includes(query);
  // Search only hides rows; order and selection never change.
  function applyFilter(){
    const query=search.value.trim().toLowerCase();let shown=0;
    for(const li of list.children){const row=li.querySelector('[data-layer-id]');const visible=matches(row.__item,query);li.hidden=!visible;if(visible)shown++;}
    none.hidden=!(list.children.length>0&&shown===0);
  }
  function startRename(item,button){
    if(item.locked||renaming!==null)return;
    renaming=item.id;const li=button.closest('li');
    renameForm=doc.createElement('form');renameForm.className='canvas-embed-layers__rename';
    const field=doc.createElement('input');field.type='text';field.maxLength=100;field.value=item.name;field.setAttribute('aria-label',`Name for ${item.typeName}`);
    const save=doc.createElement('button');save.type='submit';save.textContent='Save';
    const cancel=doc.createElement('button');cancel.type='button';cancel.textContent='Cancel';
    renameForm.append(field,save,cancel);li.replaceChildren(renameForm);field.focus();field.select();
    const finish=(commit)=>{
      const value=field.value;renaming=null;renameForm=null;
      if(commit){const result=canvas.execute('rename',{id:item.id,name:value});if(!result.ok)note.textContent=result.reason==='unsupported'?'This layer cannot be renamed.':'The name could not be saved.';}
      rowsKey='';render();const back=list.querySelector(`[data-layer-id="${item.id}"]`);back?.focus({preventScroll:true});
    };
    renameForm.addEventListener('submit',event=>{event.preventDefault();finish(true);});
    cancel.addEventListener('click',()=>finish(false));
    field.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();finish(false);}});
  }
  // One button per object. Rows are rebuilt only when the list's contents change, never on every pointer move.
  function render(){
    if(!alive||renaming!==null)return;
    const layers=canvas.getLayers(),key=layers.map(item=>`${item.id}:${item.name}:${item.typeName}:${item.locked}:${item.group}:${item.selected}`).join('|');
    empty.hidden=layers.length>0;
    if(key===rowsKey){applyFilter();return;}rowsKey=key;
    list.replaceChildren(...layers.map((item,index)=>{
      const li=doc.createElement('li'),button=doc.createElement('button');
      button.type='button';button.className='canvas-embed-layers__row';button.dataset.layerId=String(item.id);button.__item=item;
      button.setAttribute('aria-pressed',String(item.selected));
      const label=`${item.name}${item.renamed?` (${item.typeName})`:''}${item.locked?', locked':''}${item.group!==null?', grouped':''}`;
      button.setAttribute('aria-label',`${index+1} of ${layers.length}: ${label}`);
      const icon=doc.createElementNS('http://www.w3.org/2000/svg','svg');
      icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');icon.setAttribute('focusable','false');
      icon.setAttribute('fill','none');icon.setAttribute('stroke','currentColor');icon.setAttribute('stroke-width','2');icon.setAttribute('stroke-linecap','round');icon.setAttribute('stroke-linejoin','round');
      icon.innerHTML=toolbarIcons[iconFor[item.typeName]??'square']??'';
      const text=doc.createElement('span');text.textContent=item.name;
      button.append(icon,text);
      if(item.locked){const mark=doc.createElement('span');mark.className='canvas-embed-layers__mark';mark.textContent='Locked';button.append(mark);}
      button.addEventListener('click',()=>{const target=canvas.getLayers().find(entry=>entry.id===item.id);if(target)canvas.select(target.element);});
      const rename=doc.createElement('button');rename.type='button';rename.className='canvas-embed-layers__rename-button';rename.textContent='Rename';
      rename.setAttribute('aria-label',`Rename ${item.name}`);rename.disabled=item.locked;
      rename.addEventListener('click',()=>startRename(item,rename));
      li.append(button,rename);return li;
    }));
    applyFilter();
  }
  // F2 on a focused row starts a rename, as dmf-web does.
  list.addEventListener('keydown',event=>{
    if(event.key!=='F2'||event.repeat||renaming!==null)return;
    const row=event.target.closest?.('[data-layer-id]');if(!row)return;
    event.preventDefault();startRename(row.__item,row.parentElement.querySelector('.canvas-embed-layers__rename-button'));
  });
  search.addEventListener('input',applyFilter);
  // Escape closes from anywhere while open (the canvas may hold focus after a change), then returns focus to the trigger.
  // Escape inside the rename field belongs to the field. Light dismissal keeps focus where the user put it.
  const onDocKey=event=>{if(event.key==='Escape'&&isOpen()&&!(renameForm&&renameForm.contains(event.target))){event.preventDefault();close(true);}};
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
