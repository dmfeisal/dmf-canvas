import { createDraftControls } from './canvas-instance-draft-controls.js';
import { createEmbedControls } from './canvas-example-controls.js';
// Optional example host UI. Core returns data; this host owns file I/O only.
export function createFileControls(container,getCanvas) {
  const controls=[...container.querySelectorAll('[data-document-action]')],input=container.querySelector('[data-document-file]'),dirtyOutput=container.querySelector('[data-document-dirty]'),output=container.querySelector('[data-document-message]');
  const drafts=createDraftControls(container,getCanvas);
  const embed=createEmbedControls(container,getCanvas,message=>{output.textContent=message;});
  let disposed=false,url=null,timer=null,generation=0,observed=null,offChanges=null;
  const renderDirty=()=>{if(!dirtyOutput)return;const state=getCanvas()?.getState(),label=!state?'Canvas stopped':state.dirty?'Unsaved changes':'No unsaved changes';if(dirtyOutput.textContent!==label)dirtyOutput.textContent=label;};
  const bindChanges=()=>{const canvas=getCanvas();if(canvas!==observed){offChanges?.();observed=canvas;offChanges=canvas?.subscribeChanges(renderDirty)??null;}renderDirty();};
  const release=()=>{if(timer!==null)clearTimeout(timer);timer=null;if(url)URL.revokeObjectURL(url);url=null;};
  const render=()=>{bindChanges();drafts.render();embed.render();const state=getCanvas()?.getState();for(const button of controls){const action=button.dataset.documentAction;if(action==='lock'){const label=state?.selectionLocked===true?'Unlock':'Lock';if(button.textContent!==label)button.textContent=label;button.setAttribute('aria-pressed',state?.selectionCount&&state.selectionLocked===null?'mixed':String(state?.selectionLocked===true));}
      button.disabled=action==='copy'?!state?.canCopy:action==='paste'?!state?.canPaste:action==='group'?!state?.canGroup:action==='ungroup'?!state?.canUngroup:action.startsWith('align-')?!state?.canAlign:action.startsWith('distribute-')?!state?.canDistribute:['bring-forward','bring-front'].includes(action)?!state?.canBringForward:['send-backward','send-back'].includes(action)?!state?.canSendBackward:action==='lock'?!state?.canLock:action==='delete'?!state?.canDelete:action==='duplicate'?!state?.canDuplicate:action==='open'?(!state?.canSave||state.settings.readOnly):!state?.canSave;}};
  const click=event=>{
    const button=event.currentTarget,canvas=getCanvas();if(!canvas)return;
    try{
      const action=button.dataset.documentAction;
      if(action==='open'){input.click();return;}
      if(action==='save'){
        const revision=canvas.getState().revision,data=canvas.saveDocument();release();url=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'}));
        const link=container.ownerDocument.createElement('a');link.href=url;link.download='canvas.json';link.click();canvas.markSaved(revision);timer=setTimeout(release,1000);output.textContent='Board file download requested.';
      }else {const result=canvas.execute(action);if(!result.ok)throw new Error(result.reason==='bounds'?'The complete selection cannot fit within this canvas.':result.reason==='overlap'?'There is not enough room for non-overlapping equal gaps.':'This selection cannot perform '+action+'.');}
    }catch(error){output.textContent=error.message;}
  };
  const change=async()=>{
    const file=input.files?.[0],canvas=getCanvas(),request=++generation;input.value='';if(!file||!canvas)return;
    try{
      if(file.size>1048576)throw new RangeError('Board file exceeds 1 MiB.');
      const text=await file.text();if(disposed||request!==generation||getCanvas()!==canvas)return;
      const result=canvas.loadDocument(JSON.parse(text));if(!result.ok)throw new Error('Finish the current interaction before opening a board.');
      output.textContent='Board opened. Undo history starts fresh.';
    }catch(error){if(!disposed&&request===generation)output.textContent='Could not open board: '+error.message;}
  };
  controls.forEach(button=>button.addEventListener('click',click));input.addEventListener('change',change);render();
  return {render,flushDraft:drafts.flush,getSettings:embed.getSettings,dispose(){drafts.dispose();offChanges?.();offChanges=null;observed=null;if(dirtyOutput)dirtyOutput.textContent='';embed.dispose();disposed=true;generation++;release();controls.forEach(button=>button.removeEventListener('click',click));input.removeEventListener('change',change);output.textContent='';}};
}
