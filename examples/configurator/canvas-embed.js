import {createCanvas,resolveSettings} from 'dmf-canvas';
import {createTextOwner,createStickyNote,canvasDocuments} from 'dmf-canvas/owners';
import {createPencil} from 'dmf-canvas/pencil';
import {createObjectClipboard} from 'dmf-canvas/clipboard';
import {createCanvasToolbar} from 'dmf-canvas/toolbar';
import {createCanvasTheme} from 'dmf-canvas/theme';
import {createImageControls} from './image-controls.js';
const clipboard=createObjectClipboard();
export function normalizeConfig(value={}){
 if(!value||Object.getPrototypeOf(value)!==Object.prototype||Object.keys(value).some(key=>!['readOnly','tools','theme','width','height'].includes(key)))throw new TypeError('Use supported Canvas settings.');
 const {readOnly,tools}=resolveSettings({readOnly:value.readOnly,tools:value.tools});
 const theme=value.theme??'system',width=value.width??720,height=value.height??320;
 if(!['system','light','dark','inherit'].includes(theme))throw new TypeError('Choose a supported theme.');
 if(!Number.isInteger(width)||width<280||width>1600)throw new RangeError('Maximum width must be a whole number from 280 to 1600 px.');
 if(!Number.isInteger(height)||height<200||height>800)throw new RangeError('Height must be a whole number from 200 to 800 px.');
 return Object.freeze({readOnly,tools,theme,width,height});
}
export function mountEmbed(parent,initial={}){
 if(!parent?.isConnected||!(parent instanceof parent.ownerDocument.defaultView.HTMLElement))throw new TypeError('Mount Canvas in a connected HTML container.');
 if(parent.canvasEmbed)throw new Error('This container already has a Canvas embed.');
 let config=normalizeConfig(initial),alive=true,current=null;
 const start=()=>{
  if(!alive||current||!parent.isConnected)return;
  const root=parent.ownerDocument.createElement('section');root.className='configured-canvas';root.setAttribute('aria-label','Configured canvas');
  root.innerHTML=`<div data-host data-canvas-theme-surface role="group" aria-label="Editable canvas"><p data-original>Move this text</p></div><div data-actions></div><div class="embed-fields"><label data-arrange-label>Arrange <select data-arrange><option value="">Choose alignment</option><option value="align-left">Align left</option><option value="align-center">Align center</option><option value="align-right">Align right</option><option value="align-top">Align top</option><option value="align-middle">Align middle</option><option value="align-bottom">Align bottom</option><option value="distribute-horizontal">Equal horizontal gaps</option><option value="distribute-vertical">Equal vertical gaps</option></select></label><label data-paper-label>Paper <select data-paper><option value="">Select a note</option><option>yellow</option><option>blue</option><option>pink</option></select></label><button data-save>Save board</button><button data-open>Open board</button><input data-board-file type="file" accept="application/json,.json" hidden><button data-add-image type="button">Add image</button><input data-image-file type="file" accept="image/png,image/jpeg,image/webp" hidden><output data-image-progress hidden>Importing image</output><button data-image-cancel hidden>Cancel import</button></div><div class="embed-image" data-image-details hidden><label>Image description <input data-image-description maxlength="120"></label><button data-image-description-save>Save description</button><output data-image-dimensions></output></div><output data-document-message aria-live="polite"></output>`;
  parent.append(root);const cleanup=[];current={root,canvas:null,dispose(){for(const release of cleanup.reverse())try{release();}catch(error){root.ownerDocument.defaultView.reportError?.(error);}root.remove();}};const host=root.querySelector('[data-host]');host.style.height=config.height+'px';root.style.maxWidth=config.width+'px';
  const theme=createCanvasTheme(root,{mode:config.theme});cleanup.push(()=>theme.dispose());const canvas=createCanvas(host,{documents:canvasDocuments,clipboard,readOnly:config.readOnly,tools:config.tools});cleanup.push(()=>canvas.destroy());
  canvas.register(host.querySelector('[data-original]'),createTextOwner(host.querySelector('[data-original]'),host));
  let pencil,toolbar,images,frame=null,url=null,timer=null,generation=0,lastSize=host.clientWidth+'x'+host.clientHeight;
  const message=root.querySelector('[data-document-message]');
  const execute=command=>{pencil.setActive(false);const result=canvas.execute(command);if(!result.ok)message.textContent='This action is unavailable for the current selection.';};
  const addNote=()=>{const s=canvas.getState();if(!s.canCreate||!s.settings.tools.sticky)return;pencil.setActive(false);const item=createStickyNote(host);try{canvas.register(item.element,item.owner,{created:true});}catch(error){item.owner.dispose();throw error;}canvas.select(item.element);item.element.focus({preventScroll:true});};
  const actions=[{id:'select',label:'Select',icon:'mouse-pointer-2',run:()=>{pencil.setActive(false);canvas.focus();}},{id:'sticky',label:'Add note',icon:'sticky-note',run:addNote},{id:'pencil',label:'Pencil',icon:'pencil',run:()=>pencil.setActive(!pencil.getState().active)},...[
   ['undo','Undo','undo-2'],['redo','Redo','redo-2'],['copy','Copy','copy'],['paste','Paste','sticky-note'],['duplicate','Duplicate','copy-plus'],['delete','Delete','trash'],['lock','Lock','lock-keyhole'],['group','Group','group'],['ungroup','Ungroup','ungroup'],['bring-front','Bring to front','bring-to-front'],['send-back','Send to back','send-to-back']
  ].map(([id,label,icon])=>({id,label,icon,run:()=>execute(id)}))];
  function render(){
   if(!toolbar)return;const s=canvas.getState(),t=s.settings.tools;host.setAttribute('aria-label',s.settings.readOnly?'Read-only canvas':'Editable canvas');
   const states={select:[false,false],sticky:[!t.sticky,!s.canCreate],pencil:[!t.pencil,s.settings.readOnly||s.editing],undo:[!t.history,!s.canUndo],redo:[!t.history,!s.canRedo],copy:[!t.clipboard,!s.canCopy],paste:[!t.clipboard,!s.canPaste],duplicate:[!t.duplicate,!s.canDuplicate],delete:[!t.delete,!s.canDelete],lock:[!t.lock,!s.canLock],group:[!t.group,!s.canGroup],ungroup:[!t.group,!s.canUngroup],'bring-front':[!t.layers,!s.canBringForward],'send-back':[!t.layers,!s.canSendBackward]};
   for(const [id,[hidden,disabled]]of Object.entries(states))toolbar.update(id,{hidden,disabled});toolbar.update('pencil',{pressed:!!pencil?.getState().active});toolbar.update('lock',{label:s.selectionLocked?'Unlock':'Lock',pressed:s.selectionLocked===true});
   for(const name of ['save','open']){root.querySelector('[data-'+name+']').hidden=!t.files;root.querySelector('[data-'+name+']').disabled=!s.canSave||(name==='open'&&s.settings.readOnly);}
   root.querySelector('[data-arrange-label]').hidden=!t.arrange;const arrange=root.querySelector('[data-arrange]');arrange.disabled=!s.canAlign;for(const option of arrange.options)if(option.value.startsWith('distribute'))option.disabled=!s.canDistribute;
   root.querySelector('[data-paper-label]').hidden=!t.paperColor;root.querySelector('[data-paper]').disabled=!s.paperColor;root.querySelector('[data-paper]').value=s.paperColor??'';images?.render();
  }
  pencil=createPencil(canvas,host,render);cleanup.push(()=>pencil.dispose());toolbar=createCanvasToolbar(root.querySelector('[data-actions]'),{actions});cleanup.push(()=>toolbar.dispose());images=createImageControls(root,()=>canvas,()=>pencil.setActive(false));cleanup.push(()=>images.dispose());const off=canvas.subscribe(render);cleanup.push(off);
  const release=()=>{clearTimeout(timer);timer=null;if(url)URL.revokeObjectURL(url);url=null;};
  const save=()=>{try{if(!canvas.getState().canSave)return;release();const revision=canvas.getState().revision;url=URL.createObjectURL(new Blob([JSON.stringify(canvas.saveDocument())],{type:'application/json'}));const a=root.ownerDocument.createElement('a');a.href=url;a.download='canvas-board.json';a.click();canvas.markSaved(revision);timer=setTimeout(release,1000);message.textContent='Board saved locally.';}catch(error){message.textContent=error.message;}};
  const open=async()=>{const input=root.querySelector('[data-board-file]'),file=input.files[0],id=++generation;input.value='';if(!file||!canvas.getState().canSave||canvas.getState().settings.readOnly)return;try{if(file.size>1048576)throw new Error('Choose a board file smaller than 1 MiB.');const data=JSON.parse(await file.text());if(!alive||!root.isConnected||id!==generation)return;if(!canvas.loadDocument(data).ok)throw new Error('This board cannot be opened here.');message.textContent='Board opened.';}catch(error){if(id===generation)message.textContent=error.message;}};
  const events=[[root.querySelector('[data-save]'),'click',save],[root.querySelector('[data-open]'),'click',()=>root.querySelector('[data-board-file]').click()],[root.querySelector('[data-board-file]'),'change',open],[root.querySelector('[data-arrange]'),'change',event=>{if(event.target.value)execute(event.target.value);event.target.value='';}],[root.querySelector('[data-paper]'),'change',event=>canvas.execute('paper-color',event.target.value)]];
  for(const [element,type,listener]of events)element.addEventListener(type,listener);
  const observer=new ResizeObserver(()=>{const size=host.clientWidth+'x'+host.clientHeight;if(size===lastSize)return;lastSize=size;if(frame!==null)cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{frame=null;pencil.cancel();canvas.execute('cancel');canvas.execute('contain');});});observer.observe(host);
  current={root,canvas,update(next){generation++;const importing=!root.querySelector('[data-image-progress]').hidden;images.cancel();if(importing)message.textContent='Image import cancelled.';pencil.cancel();canvas.configure({readOnly:next.readOnly,tools:next.tools});theme.configure({mode:next.theme});root.style.maxWidth=next.width+'px';host.style.height=next.height+'px';render();},dispose(){generation++;observer.disconnect();if(frame!==null)cancelAnimationFrame(frame);release();off();images.dispose();pencil.dispose();canvas.destroy();toolbar.dispose();theme.dispose();for(const [element,type,listener]of events)element.removeEventListener(type,listener);root.remove();}};render();
 };
 const stop=()=>{current?.dispose();current=null;};
 const api=Object.freeze({get root(){return current?.root??null;},get canvas(){return current?.canvas??null;},getConfig:()=>config,update(value){if(!alive)return false;const next=normalizeConfig(value);current?.update(next);config=next;return true;},dispose(){if(!alive)return;alive=false;window.removeEventListener('pagehide',stop);window.removeEventListener('pageshow',start);stop();if(parent.canvasEmbed===api)delete parent.canvasEmbed;}});
 try{start();}catch(error){stop();throw error;}parent.canvasEmbed=api;window.addEventListener('pagehide',stop);window.addEventListener('pageshow',start);return api;
}
