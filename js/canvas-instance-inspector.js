import {stickyColors} from './canvas-instance-sticky.js';
// Labels for the sixteen paper keys (docs/prd/STYLING-EXPORT.md). Keys are hues; labels are plain colour names.
const paperLabels={red:'Red',orange:'Orange',yellow:'Yellow',green:'Green',blue:'Blue',iris:'Iris',pink:'Pink',blush:'Blush',lilac:'Lilac',denim:'Denim',mint:'Mint',gray:'Gray',aqua:'Aqua',lime:'Lime',guava:'Guava',magenta:'Magenta'};
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
 const textSection=doc.createElement('fieldset');textSection.className='canvas-embed-inspector__text';const legend=doc.createElement('legend');legend.textContent='Text';textSection.append(legend);const textGrid=doc.createElement('div');textGrid.className='canvas-embed-inspector__fields';const textFields=new Map();
 for(const [key,title,options]of [['font','Font',[['original','Original'],['sans','Sans-serif'],['serif','Serif'],['mono','Monospace']]],['size','Text size (px)',null],['weight','Weight',[[400,'Regular (400)'],[500,'Medium (500)'],[600,'Semi bold (600)'],[700,'Bold (700)']]],['align','Alignment',[['original','Original'],['left','Left'],['center','Center'],['right','Right']]],['wrap','Wrapping',[['auto','Auto width'],['fixed','Fixed width']]],['ink','Ink',[['primary','Primary ink'],['blue','Blue ink'],['red','Red ink']]],['lineHeight','Line height',null],['letterSpacing','Letter spacing (em)',null]]){
  const label=doc.createElement('label'),span=doc.createElement('span'),input=doc.createElement(options?'select':'input');span.textContent=title;input.dataset.inspectorText=key;input.setAttribute('aria-describedby',message.id);
  if(options){const mixed=doc.createElement('option');mixed.value='';mixed.textContent='Mixed';mixed.disabled=true;input.append(mixed);for(const [value,text]of options){const option=doc.createElement('option');option.value=String(value);option.textContent=text;input.append(option);}}
  else{
    input.type='number';input.step='any';input.required=true;input.placeholder='Mixed';
    // Ranges match the record's (docs/prd/STYLING-EXPORT.md). A blank line height means Normal.
    const range={size:[8,320],lineHeight:[.8,3],letterSpacing:[-.08,.3]}[key];input.min=String(range[0]);input.max=String(range[1]);
    if(key==='lineHeight'){input.required=false;input.placeholder='Normal';input.step='.05';}
    if(key==='letterSpacing')input.step='.01';
  }
  label.append(span,input);textGrid.append(label);textFields.set(key,input);
 }
 // Text size presets (docs/prd/STYLING-EXPORT.md): S 14px, M 18px, L 24px, or Original (the authored size). One Undo step.
 const presetLabel=doc.createElement('label'),presetSpan=doc.createElement('span'),preset=doc.createElement('select');
 presetSpan.textContent='Size preset';preset.dataset.inspectorPreset='';preset.setAttribute('aria-describedby',message.id);
 for(const [value,label]of [['','Custom'],['original','Original'],['14','S · 14px'],['18','M · 18px'],['24','L · 24px']]){const option=doc.createElement('option');option.value=value;option.textContent=label;if(value==='')option.disabled=true;preset.append(option);}
 presetLabel.append(presetSpan,preset);textGrid.append(presetLabel);
 const reset=doc.createElement('button');reset.type='button';reset.textContent='Reset text styles';reset.dataset.inspectorTextReset='';textSection.append(textGrid,reset);
 const closeButton=doc.createElement('button');closeButton.type='button';closeButton.textContent='Close inspector';panel.append(grid,message,closeButton);container.append(panel);
 panel.insertBefore(textSection,message);closeButton.className='canvas-embed-inspector__close';
 // Note colour (docs/prd/STYLING-EXPORT.md): one select of the sixteen paper keys, shown only for a Sticky Note.
 const noteSection=doc.createElement('fieldset');noteSection.className='canvas-embed-inspector__note';noteSection.hidden=true;
 const noteLegend=doc.createElement('legend');noteLegend.textContent='Note';noteSection.append(noteLegend);
 const noteLabel=doc.createElement('label'),noteSpan=doc.createElement('span'),paperSelect=doc.createElement('select');
 noteSpan.textContent='Colour';paperSelect.dataset.inspectorPaper='';paperSelect.setAttribute('aria-describedby',message.id);
 for(const key of stickyColors){const option=doc.createElement('option');option.value=key;option.textContent=paperLabels[key];paperSelect.append(option);}
 noteLabel.append(noteSpan,paperSelect);noteSection.append(noteLabel);panel.insertBefore(noteSection,message);
 let alive=true,committing=false,selectionKey='',values=null,cameraKey=null;const dirty=new Set();
 const isOpen=()=>panel.matches(':popover-open');
 function close(focus=false){if(!alive)return;if(isOpen())panel.hidePopover();trigger.setAttribute('aria-expanded','false');if(focus&&!trigger.disabled)trigger.focus({preventScroll:true});}
 function refresh(force=false){
  if(!alive)return;const state=canvas.getState(),key=state.selectionIds.join(',');
  if(key!==selectionKey){selectionKey=key;close();}
  // Camera hosts (docs/prd/NAVIGATION.md): values are world units, and any pan or zoom closes the panel.
  const view=JSON.stringify(state.camera);if(view!==cameraKey){if(cameraKey!==null)close();cameraKey=view;help.textContent=state.camera?'Canvas units, unaffected by zoom. Width and height scale proportionally.':'Visible bounds in px. Width and height scale proportionally.';}
  values=canvas.getInspector();trigger.disabled=!values;
  if(!values){close();return;}if(!isOpen()&&!force)return;
  for(const [field,input]of fields){input.disabled=!values.editable;if(force||doc.activeElement!==input){input.value=String(Math.round(values[field]*100)/100);input.removeAttribute('aria-invalid');dirty.delete(input);}}
  fields.get('rotation').parentElement.firstChild.textContent=values.relativeRotation?'Turn selection (degrees)':'Rotation (degrees)';
  const text=canvas.getTextStyle();textSection.hidden=!text;
  const paper=state.paperColor;noteSection.hidden=paper===null||paper===undefined;
  if(!noteSection.hidden&&(force||doc.activeElement!==paperSelect)){paperSelect.value=paper;paperSelect.disabled=!values.editable;}
  for(const [key,input]of textFields){input.disabled=!text?.editable;if(force||doc.activeElement!==input){const value=text?.[key]??'';if(key==='weight'){for(const option of [...input.options])if(option.dataset.originalWeight)option.remove();if(value!==''&&![...input.options].some(option=>option.value===String(value))){const option=doc.createElement('option');option.value=String(value);option.textContent=value+' (original)';option.disabled=true;option.dataset.originalWeight='';input.append(option);}for(const option of input.options)if(option.value&&!option.dataset.originalWeight)option.disabled=!text?.weights.includes(Number(option.value));}input.value=key==='lineHeight'&&value==='normal'?'':String(value);input.removeAttribute('aria-invalid');dirty.delete(input);}}
  reset.disabled=!text?.editable;
  // The summary reports the rendered size, so a preset shows only when the size matches one; otherwise Custom.
  preset.value=[14,18,24].includes(text?.size)?String(text.size):'';preset.disabled=!text?.editable;
 }
 function commit(input){
  if(committing||!isOpen()||input.disabled||!dirty.has(input))return;const text=!!input.dataset.inspectorText,field=text?input.dataset.inspectorText:input.dataset.inspectorField,value=text&&field==='lineHeight'&&!input.value.trim()?'normal':text&&!['size','weight','lineHeight','letterSpacing'].includes(field)?input.value:input.type==='number'?input.valueAsNumber:Number(input.value);
  if((!input.value.trim()&&!(field==='lineHeight'&&text))||typeof value==='number'&&!Number.isFinite(value)||!input.checkValidity()){
   input.setAttribute('aria-invalid','true');message.textContent=text?'Choose a value. Text size must be from 8 to 320 px.':'Enter a valid number. Size must be greater than zero.';return;
  }
  committing=true;
  try{const result=canvas.execute(text?'text-style':'inspect',{field,value});refresh(true);message.textContent=result.ok?'Applied within canvas and owner limits.':'The complete selection cannot apply this value.';}
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
  refresh(true);message.textContent='';panel.showPopover();trigger.setAttribute('aria-expanded','true');position();(fields.get('x').disabled?closeButton:fields.get('x')).focus({preventScroll:true});
 }
 const isField=input=>fields.has(input.dataset?.inspectorField)||textFields.has(input.dataset?.inspectorText);
 const onInput=event=>{if(isField(event.target))dirty.add(event.target);};
 const onBlur=event=>{if(isField(event.target))commit(event.target);};
 const onChange=event=>{if(textFields.has(event.target.dataset?.inspectorText)&&event.target.tagName==='SELECT'){dirty.add(event.target);commit(event.target);}};
 const onPreset=()=>{if(committing||!preset.value)return;committing=true;try{const value=preset.value==='original'?null:Number(preset.value);const result=canvas.execute('text-style',{field:'size',value});refresh(true);message.textContent=result.ok?'Text size applied.':'This selection cannot change text size.';}catch{refresh(true);message.textContent='Could not change text size.';}finally{committing=false;}};
 preset.addEventListener('change',onPreset);
 const onReset=()=>{committing=true;try{const result=canvas.execute('text-style',{field:'reset'});refresh(true);message.textContent=result.ok?'Original text styles restored.':'This selection cannot reset text styles.';}catch{message.textContent='Could not reset this selection.';}finally{committing=false;}};
 const onKey=event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();refresh(true);close(true);}
  else if(event.key==='Enter'&&isField(event.target)&&!event.isComposing){event.preventDefault();commit(event.target);}
 };
 const onToggle=()=>{if(!isOpen()){trigger.setAttribute('aria-expanded','false');refresh(true);}};
 const dismiss=event=>{
  if(event?.type==='scroll'&&panel.contains(event.target))return;
  const active=doc.activeElement;
  if(panel.contains(active)&&!dirty.has(active)){position();return;}
  close();
 };
 const onClose=()=>close(true);
 paperSelect.addEventListener('change',()=>{if(!isOpen()||committing)return;committing=true;try{const result=canvas.execute('paper-color',paperSelect.value);refresh(true);message.textContent=result.ok?'Note colour applied.':'This selection cannot change colour.';}catch{refresh(true);message.textContent='Could not change the note colour.';}finally{committing=false;}});
 panel.addEventListener('input',onInput);panel.addEventListener('focusout',onBlur);panel.addEventListener('change',onChange);reset.addEventListener('click',onReset);panel.addEventListener('keydown',onKey);panel.addEventListener('toggle',onToggle);closeButton.addEventListener('click',onClose);
 const listeners=[[view,'resize',dismiss],[view,'pagehide',dismiss],[doc,'fullscreenchange',dismiss],[doc,'scroll',dismiss,true]];
 if(view.visualViewport)listeners.push([view.visualViewport,'resize',dismiss],[view.visualViewport,'scroll',dismiss]);
 for(const [target,type,fn,capture]of listeners)target.addEventListener(type,fn,capture);
 // Re-contain when content changes size while open (e.g. text options reveal Reset); position() moves the panel without resizing it.
 const resized=new view.ResizeObserver(()=>{if(alive&&isOpen())position();});resized.observe(panel);
 const off=canvas.subscribe(()=>{if(!committing)refresh();});refresh();
 return Object.freeze({toggle,close:()=>close(true),dispose(){if(!alive)return;close();alive=false;resized.disconnect();off();for(const [target,type,fn,capture]of listeners)target.removeEventListener(type,fn,capture);panel.removeEventListener('input',onInput);panel.removeEventListener('focusout',onBlur);panel.removeEventListener('change',onChange);reset.removeEventListener('click',onReset);panel.removeEventListener('keydown',onKey);panel.removeEventListener('toggle',onToggle);closeButton.removeEventListener('click',onClose);panel.remove();for(const [name,value]of original)if(value===null)trigger.removeAttribute(name);else trigger.setAttribute(name,value);trigger.disabled=disabled;mounted.delete(trigger);fields.clear();textFields.clear();dirty.clear();values=null;}});
}
