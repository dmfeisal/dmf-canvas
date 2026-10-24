let serial=0;const mounted=new WeakSet();
export function createCanvasInspector(container,{canvas,trigger}){
 const doc=container?.ownerDocument,view=doc?.defaultView;
 if(!view||!container?.isConnected||['HTML','BODY'].includes(container.tagName)||!canvas?.getInspector||!(trigger instanceof view.HTMLButtonElement)||!container.contains(trigger)||mounted.has(trigger))throw new TypeError('Inspector needs a mounted canvas and independent contained trigger.');
 const original=new Map(['aria-controls','aria-expanded','aria-haspopup'].map(name=>[name,trigger.getAttribute(name)])),disabled=trigger.disabled;mounted.add(trigger);
 const panel=doc.createElement('section');panel.className='canvas-embed-inspector';panel.popover='auto';panel.setAttribute('aria-label','Selection inspector');
 const id='canvas-inspector-'+(++serial);panel.id=id;trigger.setAttribute('aria-controls',id);trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-haspopup','dialog');panel.setAttribute('role','dialog');
 panel.setAttribute('aria-modal','false');
 const heading=doc.createElement('h2');heading.textContent='Selection inspector';panel.append(heading);
 const help=doc.createElement('p');help.id=id+'-help';help.textContent='Visible bounds in px. Width and height scale proportionally.';panel.append(help);
 const fields=new Map(),grid=doc.createElement('div');grid.className='canvas-embed-inspector__fields';
 for(const [key,title]of [['x','X'],['y','Y'],['width','Width'],['height','Height'],['rotation','Rotation (degrees)']]){
  const label=doc.createElement('label'),text=doc.createElement('span'),input=doc.createElement('input');text.textContent=title;input.type='number';input.step='any';input.required=true;input.dataset.inspectorField=key;input.setAttribute('aria-describedby',help.id+' '+id+'-message');if(key==='width'||key==='height')input.min='0.01';label.append(text,input);grid.append(label);fields.set(key,input);
 }
 const message=doc.createElement('output');message.id=id+'-message';message.setAttribute('aria-live','polite');
 const closeButton=doc.createElement('button');closeButton.type='button';closeButton.textContent='Close inspector';panel.append(grid,message,closeButton);container.append(panel);
 let alive=true,committing=false,selectionKey='',values=null;const dirty=new Set();
 const isOpen=()=>panel.matches(':popover-open');
 function close(focus=false){if(!alive)return;if(isOpen())panel.hidePopover();trigger.setAttribute('aria-expanded','false');if(focus&&!trigger.disabled)trigger.focus({preventScroll:true});}
 function refresh(force=false){
  if(!alive)return;const state=canvas.getState(),key=state.selectionIds.join(',');
  if(key!==selectionKey){selectionKey=key;close();}
  values=canvas.getInspector();trigger.disabled=!values;
  if(!values){close();return;}if(!isOpen()&&!force)return;
  for(const [field,input]of fields){input.disabled=!values.editable;if(force||doc.activeElement!==input){input.value=String(Math.round(values[field]*100)/100);input.removeAttribute('aria-invalid');dirty.delete(input);}}
  fields.get('rotation').parentElement.firstChild.textContent=values.relativeRotation?'Turn selection (degrees)':'Rotation (degrees)';
 }
 function commit(input){
  if(committing||!isOpen()||input.disabled||!dirty.has(input))return;const field=input.dataset.inspectorField,value=input.valueAsNumber;
  if(!input.value.trim()||!Number.isFinite(value)||!input.checkValidity()){
   input.setAttribute('aria-invalid','true');message.textContent='Enter a valid number. Size must be greater than zero.';return;
  }
  committing=true;
  try{const result=canvas.execute('inspect',{field,value});refresh(true);message.textContent=result.ok?'Applied within canvas and owner limits.':'The complete selection cannot apply this value.';}
  catch{refresh(true);message.textContent='Could not change this selection. No changes were kept.';}
  finally{committing=false;}
 }
 function position(){
  const r=trigger.getBoundingClientRect(),v=view.visualViewport,left=v?.offsetLeft??0,top=v?.offsetTop??0,width=v?.width??view.innerWidth,height=v?.height??view.innerHeight;
  panel.style.maxWidth=Math.max(1,width-16)+'px';panel.style.maxHeight=Math.max(1,height-16)+'px';
  const box=panel.getBoundingClientRect();panel.style.left=Math.max(left+8,Math.min(left+width-box.width-8,r.left))+'px';panel.style.top=Math.max(top+8,Math.min(top+height-box.height-8,r.bottom+8))+'px';
 }
 function toggle(){
  if(!alive||trigger.disabled)return;if(isOpen()){close(true);return;}
  if(doc.querySelector('dialog:modal'))return;
  refresh(true);message.textContent='';panel.showPopover();trigger.setAttribute('aria-expanded','true');position();fields.get('x').focus({preventScroll:true});
 }
 const onInput=event=>{if(fields.has(event.target.dataset?.inspectorField))dirty.add(event.target);};
 const onBlur=event=>{if(fields.has(event.target.dataset?.inspectorField))commit(event.target);};
 const onKey=event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();refresh(true);close(true);}
  else if(event.key==='Enter'&&fields.has(event.target.dataset?.inspectorField)&&!event.isComposing){event.preventDefault();commit(event.target);}
 };
 const onToggle=()=>{if(!isOpen()){trigger.setAttribute('aria-expanded','false');refresh(true);}};
 const dismiss=event=>{if(event?.type==='scroll'&&panel.contains(event.target))return;close();};
 const onClose=()=>close(true);
 panel.addEventListener('input',onInput);panel.addEventListener('focusout',onBlur);panel.addEventListener('keydown',onKey);panel.addEventListener('toggle',onToggle);closeButton.addEventListener('click',onClose);
 const listeners=[[view,'resize',dismiss],[view,'pagehide',dismiss],[doc,'fullscreenchange',dismiss],[doc,'scroll',dismiss,true]];
 if(view.visualViewport)listeners.push([view.visualViewport,'resize',dismiss],[view.visualViewport,'scroll',dismiss]);
 for(const [target,type,fn,capture]of listeners)target.addEventListener(type,fn,capture);
 const off=canvas.subscribe(()=>{if(!committing)refresh();});refresh();
 return Object.freeze({toggle,close:()=>close(true),dispose(){if(!alive)return;close();alive=false;off();for(const [target,type,fn,capture]of listeners)target.removeEventListener(type,fn,capture);panel.removeEventListener('input',onInput);panel.removeEventListener('focusout',onBlur);panel.removeEventListener('keydown',onKey);panel.removeEventListener('toggle',onToggle);closeButton.removeEventListener('click',onClose);panel.remove();for(const [name,value]of original)if(value===null)trigger.removeAttribute(name);else trigger.setAttribute(name,value);trigger.disabled=disabled;mounted.delete(trigger);fields.clear();dirty.clear();values=null;}});
}
