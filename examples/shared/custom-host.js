import {createCanvas} from 'dmf-canvas';
import {createTextOwner} from 'dmf-canvas/owners';
import {createStickyNote} from 'dmf-canvas/owners';
import {createImageObject} from 'dmf-canvas/owners';
import {createPencil} from 'dmf-canvas/pencil';
import {canvasDocuments} from 'dmf-canvas/owners';
import {createObjectClipboard} from 'dmf-canvas/clipboard';
import {createCanvasToolbar,createCanvasLayers,createCanvasContextMenu} from 'dmf-canvas/toolbar';
import {createCanvasTheme} from 'dmf-canvas/theme';
import {createLocalDraft} from 'dmf-canvas/drafts';
import {createCanvasExport} from 'dmf-canvas/export';

// This is consumer-owned integration code, not a proposed package entry point.
const clipboard=createObjectClipboard();
// `camera: true` gives the host a world element and zoom and pan (docs/prd/NAVIGATION.md); it is off by default.
export function mountConsumer(parent,name,{camera=false}={}){
  if(typeof camera!=='boolean')throw new TypeError('Consumer camera must be on or off.');
  if(!/^[A-Za-z0-9]{1,24}$/.test(name))throw new TypeError('Consumer fixture needs a simple name.');
  const root=document.createElement('section');root.dataset.consumer=name;root.setAttribute('aria-label','Consumer '+name);
  root.innerHTML=`<h2>Canvas ${name}</h2><div data-consumer-host data-canvas-theme-surface role="group" aria-label="Custom canvas ${name}">${camera?'<div data-world>':''}<p data-original>Independent ${name}</p>${camera?'</div>':''}</div><div data-toolbar class="controls"></div><div class="controls"><label>Theme <select data-theme><option>system</option><option>light</option><option>dark</option></select></label><label><input type="checkbox" data-readonly> Read-only</label><button data-save>Save board</button><button data-open>Open board</button><input data-file type="file" accept="application/json,.json" hidden><button data-draft>Enable memory draft</button><button data-restore>Restore memory draft</button><button data-stop>Stop</button><button data-fullscreen>Fullscreen</button><button data-export>Export PNG</button></div><output data-status aria-live="polite"></output>`;parent.append(root);
  const host=root.querySelector('[data-consumer-host]'),world=host.querySelector('[data-world]'),place=world??host,original=root.querySelector('[data-original]'),status=root.querySelector('[data-status]'),memory=new Map(),storage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value),removeItem:key=>memory.delete(key)};
  const theme=createCanvasTheme(root,{mode:'system'});let resizeFrame=null,lastSize=host.clientWidth+'x'+host.clientHeight;let canvas=null,pencil=null,off=null,toolbar=null,layers=null,contextMenu=null,draft=null,exporter=null,alive=true,url=null,timer=null,generation=0;
  const execute=command=>{const result=canvas?.execute(command);if(result&&!result.ok)status.textContent='Command unavailable: '+result.reason;};
  function addNote(){if(!canvas?.getState().canCreate)return;pencil.setActive(false);const item=createStickyNote(place);try{canvas.register(item.element,item.owner,{created:true});}catch(error){item.owner.dispose();throw error;}canvas.select(item.element);item.element.focus({preventScroll:true});}
  const drawWith=tool=>{if(!pencil)return;const s=pencil.getState();if(s.active&&s.tool===tool)pencil.setActive(false);else if(pencil.setTool(tool))pencil.setActive(true);canvas?.focus();};
  // Standard groups in one compact inline toolbar (docs/design/TOOLBAR.md): Tools, History, Selection + More.
  const command=(id,label,icon,extra={})=>({id,label,icon,run:()=>execute(id),...extra});
  const actions=[{id:'select',label:'Select',icon:'mouse-pointer-2',shortcut:'V',group:'Tools',run:()=>{pencil?.setActive(false);canvas?.execute('hand',false);canvas?.focus();}},{id:'hand',label:'Hand',icon:'hand',shortcut:'H',group:'Tools',hidden:!camera,run:()=>{pencil?.setActive(false);canvas?.execute('hand',canvas.getState().hand!=='tool');canvas?.focus();}},{id:'note',label:'Add note',icon:'sticky-note',group:'Tools',run:addNote},{id:'pencil',label:'Pencil',icon:'pencil',shortcut:'P',group:'Tools',run:()=>drawWith('pencil')},{id:'highlighter',label:'Highlighter',icon:'highlighter',shortcut:'Shift P',group:'Tools',run:()=>drawWith('highlighter')},{id:'eraser',label:'Stroke eraser',icon:'eraser',shortcut:'E',group:'Tools',run:()=>drawWith('eraser')},{id:'shapes',label:'Shapes',icon:'shapes',group:'Tools',run:()=>drawWith('shape')},
   {id:'zoom-out',label:'Zoom out',icon:'zoom-out',shortcut:'−',group:'Camera',hidden:!camera,run:()=>canvas?.execute('zoom',{by:1/1.2})},{id:'zoom-in',label:'Zoom in',icon:'zoom-in',shortcut:'+',group:'Camera',hidden:!camera,run:()=>canvas?.execute('zoom',{by:1.2})},{id:'fit',label:'Fit all',icon:'focus',shortcut:'Shift 1',group:'Camera',hidden:!camera,run:()=>canvas?.execute('fit')},
   {id:'layers',label:'Layers',icon:'layers',group:'History',run:()=>{}} /* the Layers controller handles this button's click */,
   command('undo','Undo','undo-2',{shortcut:'Z',group:'History'}),command('redo','Redo','redo-2',{shortcut:'Shift Z',group:'History'}),
   command('duplicate','Duplicate','copy-plus',{shortcut:'D',group:'Selection'}),command('delete','Delete','trash',{shortcut:'Delete',group:'Selection'}),
   command('copy','Copy','copy',{shortcut:'C',group:'Clipboard',menu:true}),command('paste','Paste','clipboard-paste',{shortcut:'V',group:'Clipboard',menu:true}),
   ...[['snap-align','Align to objects','magnet','align'],['snap-grid','Snap to grid','grid-2x2','grid']].map(([id,label,icon,key])=>({id,label,icon,group:'Snapping',menu:true,pressed:key==='align',run:()=>{const current=canvas?.getState().settings.snapping;if(current)canvas.configure({snapping:{[key]:!current[key]}});}}))];
  toolbar=createCanvasToolbar(root.querySelector('[data-toolbar]'),{actions,moreLabel:'More actions'});
  function render(){const state=canvas?.getState();for(const [id,disabled]of Object.entries({select:!state,note:!state?.canCreate,pencil:!state||state.settings.readOnly,highlighter:!state||state.settings.readOnly,eraser:!state||state.settings.readOnly,shapes:!state||state.settings.readOnly,undo:!state?.canUndo,redo:!state?.canRedo,copy:!state?.canCopy,paste:!state?.canPaste,duplicate:!state?.canDuplicate,delete:!state?.canDelete}))toolbar.update(id,{disabled});const ink=pencil?.getState();if(camera){const view=state?.camera,limits=state?.settings.camera;toolbar.update('hand',{disabled:!state,pressed:state?.hand==='tool'});toolbar.update('zoom-out',{disabled:!view||view.scale<=limits.minScale});toolbar.update('zoom-in',{disabled:!view||view.scale>=limits.maxScale});toolbar.update('fit',{disabled:!state?.objects});}toolbar.update('pencil',{pressed:!!ink?.active&&ink.tool==='pencil'});toolbar.update('highlighter',{pressed:!!ink?.active&&ink.tool==='highlighter'});toolbar.update('eraser',{pressed:!!ink?.active&&ink.tool==='eraser'});toolbar.update('shapes',{pressed:!!ink?.active&&ink.tool==='shape'});toolbar.update('select',{pressed:!!state&&!ink?.active});toolbar.update('snap-align',{pressed:!!state?.settings.snapping.align,disabled:!state});toolbar.update('snap-grid',{pressed:!!state?.settings.snapping.grid,disabled:!state});root.querySelector('[data-export]').disabled=!state;root.querySelector('[data-stop]').textContent=canvas?'Stop':'Start';root.querySelector('[data-save]').disabled=!state?.canSave;root.querySelector('[data-open]').disabled=!state?.canSave||state.settings.readOnly;}
  const release=()=>{clearTimeout(timer);timer=null;if(url)URL.revokeObjectURL(url);url=null;};
  function start(){if(!alive||canvas)return;canvas=createCanvas(host,{documents:canvasDocuments,clipboard,readOnly:root.querySelector('[data-readonly]').checked,...(world?{camera:{world}}:{})});canvas.register(original,createTextOwner(original,place));pencil=createPencil(canvas,host,render);exporter=createCanvasExport(canvas,{host,render:createHostRenderer(host)});off=canvas.subscribe(render);layers=createCanvasLayers(root,{canvas,trigger:root.querySelector('[data-toolbar-action="layers"]')});contextMenu=createCanvasContextMenu(host,{canvas,toolbar});render();}
  function stop(){if(resizeFrame!==null)cancelAnimationFrame(resizeFrame);resizeFrame=null;generation++;draft?.dispose();draft=null;exporter?.dispose();exporter=null;layers?.dispose();layers=null;contextMenu?.dispose();contextMenu=null;off?.();off=null;pencil?.dispose();pencil=null;canvas?.destroy();canvas=null;release();render();}
  // PNG export: the package picks the area and limits; the example renderer below draws the host.
  const exportPng=async()=>{if(!canvas||!exporter)return;const scope=canvas.getState().selectionCount?'selection':'visible';status.textContent='Exporting PNG…';try{const result=await exporter.exportPng({scope,scale:2});const url=URL.createObjectURL(result.blob),link=document.createElement('a');link.href=url;link.download='canvas.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent=`PNG exported: ${result.width} × ${result.height}${result.reduced?', reduced to fit the export limits':''}.`;}catch(error){status.textContent=error.message;}};
  const save=()=>{try{const revision=canvas.getState().revision;release();url=URL.createObjectURL(new Blob([JSON.stringify(canvas.saveDocument())],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='independent-canvas.json';link.click();canvas.markSaved(revision);timer=setTimeout(release,1000);status.textContent='Board saved locally.';}catch(error){status.textContent=error.message;}};
  const open=async()=>{const file=root.querySelector('[data-file]').files[0],id=++generation,target=canvas;root.querySelector('[data-file]').value='';if(!file||!target)return;try{if(file.size>1048576)throw new Error('Board exceeds 1 MiB.');const value=JSON.parse(await file.text());if(!alive||id!==generation||canvas!==target)return;if(!target.loadDocument(value).ok)throw new Error('Board unavailable.');status.textContent='Board opened.';}catch(error){if(alive&&id===generation)status.textContent=error.message;}};
  const events=[[root.querySelector('[data-theme]'),'change',event=>theme.configure({mode:event.target.value})],[root.querySelector('[data-readonly]'),'change',event=>canvas?.configure({readOnly:event.target.checked})],[root.querySelector('[data-save]'),'click',save],[root.querySelector('[data-open]'),'click',()=>root.querySelector('[data-file]').click()],[root.querySelector('[data-file]'),'change',open],[root.querySelector('[data-stop]'),'click',()=>canvas?stop():start()],[root.querySelector('[data-fullscreen]'),'click',()=>root.requestFullscreen()],[root.querySelector('[data-draft]'),'click',()=>{if(canvas&&!draft)draft=createLocalDraft(canvas,{key:'consumer:'+name,storage,delay:0,onStatus:state=>{status.textContent='Memory only: '+state.phase;}});}],[root.querySelector('[data-restore]'),'click',()=>draft?.restore()],[root.querySelector('[data-export]'),'click',exportPng]];
  const observer=new ResizeObserver(()=>{const size=host.clientWidth+'x'+host.clientHeight;if(size===lastSize)return;lastSize=size;if(resizeFrame!==null)cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{resizeFrame=null;if(canvas){pencil?.cancel();canvas.execute('cancel');canvas.execute('contain');}});});observer.observe(host);
  for(const [node,type,fn]of events)node.addEventListener(type,fn);start();
  return {root,host,original,memory,get canvas(){return canvas;},get draft(){return draft;},theme,start,stop,addImage(data){const item=createImageObject(place,data);try{canvas.register(item.element,item.owner,{created:true});}catch(error){item.owner.dispose();throw error;}canvas.select(item.element);return item;},dispose(){if(!alive)return;observer.disconnect();stop();alive=false;toolbar.dispose();theme.dispose();for(const [node,type,fn]of events)node.removeEventListener(type,fn);root.remove();}};
}

// Example PNG renderer for createCanvasExport({host, render}) (docs/prd/STYLING-EXPORT.md). Copied from the configurator
// example so this file stays self-contained for the framework and Astro fixtures, which copy only this file and its CSS.
// It draws the host through an SVG foreignObject with the page's stylesheets embedded. Fonts and images loaded from other
// origins are not embedded, so the PNG can differ from the screen for those.
const svgNS='http://www.w3.org/2000/svg';
function pageCss(){
  const parts=[];
  for(const sheet of document.styleSheets){
    try{for(const rule of sheet.cssRules)parts.push(rule.cssText);}catch{/* cross-origin sheets are skipped */}
  }
  return parts.join('\n');
}
function createHostRenderer(host){
  const view=host.ownerDocument.defaultView;
  return async function renderPng({bounds,width,height,scale,signal}){
    if(signal?.aborted)throw new DOMException('Export was cancelled.','AbortError');
    const wrapper=host.ownerDocument.createElement('div');
    const themed=host.closest('[data-canvas-embed-theme]');
    if(themed)for(const attribute of themed.attributes)if(attribute.name.startsWith('data-canvas-embed')||attribute.name==='class')wrapper.setAttribute(attribute.name,attribute.value);
    wrapper.setAttribute('xmlns','http://www.w3.org/1999/xhtml');
    wrapper.style.cssText=`position:absolute;left:${-bounds.left}px;top:${-bounds.top}px;width:${host.clientWidth}px;height:${host.clientHeight}px;overflow:visible;margin:0`;
    const clone=host.cloneNode(true);
    clone.style.height=`${host.clientHeight}px`;clone.style.width=`${host.clientWidth}px`;
    wrapper.append(clone);
    const style=host.ownerDocument.createElementNS('http://www.w3.org/1999/xhtml','style');style.textContent=pageCss();
    const body=host.ownerDocument.createElementNS('http://www.w3.org/1999/xhtml','div');
    body.setAttribute('xmlns','http://www.w3.org/1999/xhtml');body.style.cssText='position:relative;width:100%;height:100%;overflow:hidden';
    body.append(style,wrapper);
    const serializer=new view.XMLSerializer();
    const svg=`<svg xmlns="${svgNS}" width="${bounds.width}" height="${bounds.height}" viewBox="0 0 ${bounds.width} ${bounds.height}"><foreignObject width="100%" height="100%">${serializer.serializeToString(body)}</foreignObject></svg>`;
    const image=new view.Image();
    image.decoding='sync';
    const loaded=new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('The host could not be drawn for export.'));});
    image.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await loaded;
    if(signal?.aborted)throw new DOMException('Export was cancelled.','AbortError');
    const canvas=host.ownerDocument.createElement('canvas');canvas.width=width;canvas.height=height;
    const context=canvas.getContext('2d');
    context.fillStyle=getComputedStyle(host).backgroundColor||'#ffffff';context.fillRect(0,0,width,height);
    context.drawImage(image,0,0,width,height);
    return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('The PNG could not be encoded.')),'image/png'));
  };
}
