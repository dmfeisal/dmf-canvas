import { createLocalDraft } from '../../js/canvas-instance-drafts.js';
// Opt-in example UI. Storage access happens only after the user enables drafts.
export function createDraftControls(container,getCanvas) {
  const toggle=container.querySelector('[data-draft-enabled]'),output=container.querySelector('[data-draft-status]'),restore=container.querySelector('[data-draft-restore]'),discard=container.querySelector('[data-draft-discard]'),retry=container.querySelector('[data-draft-retry]');
  let enabled=false,adapter=null,observed=null,status=null,disposed=false;
  const renderStatus=()=>{
    if(!toggle)return;toggle.checked=enabled;
    const canvas=getCanvas(),current=canvas?.getState();
    const label=!enabled?'Local drafts are off. Enable to save, restore or discard a draft.':!canvas?'Local drafts enabled. Start canvas to check for a draft.':status?.message??'Local drafts unavailable. Retry or turn local drafts off.';
    if(output.textContent!==label)output.textContent=label;
    restore.hidden=!enabled||!status?.hasDraft;discard.hidden=!enabled||!status?.hasStored;restore.disabled=!current?.canSave||!!current?.settings.readOnly;discard.disabled=!canvas;
    retry.hidden=!enabled||!canvas||!['error','conflict'].includes(status?.phase??'error');
  };
  const start=()=>{
    if(!enabled||!observed||disposed)return;
    try{adapter=createLocalDraft(observed,{key:container.dataset.draftKey,storage:container.ownerDocument.defaultView.localStorage,onStatus:next=>{status=next;renderStatus();}});}
    catch{status={phase:'error',hasDraft:false,message:'Local storage is unavailable. Retry or turn local drafts off.'};renderStatus();}
  };
  const render=()=>{if(disposed)return;const canvas=getCanvas();if(canvas!==observed){adapter?.dispose();adapter=null;status=null;observed=canvas;start();}renderStatus();};
  const change=()=>{enabled=toggle.checked;adapter?.dispose();adapter=null;status=null;if(enabled)start();renderStatus();};
  const onRestore=()=>{if(adapter?.restore())toggle.focus();},onDiscard=()=>{if(adapter?.discard())toggle.focus();},onRetry=()=>{if(adapter)adapter.retry();else start();if(retry.hidden)toggle.focus();};
  if(toggle)toggle.disabled=false;
  toggle?.addEventListener('change',change);restore?.addEventListener('click',onRestore);discard?.addEventListener('click',onDiscard);retry?.addEventListener('click',onRetry);render();
  return {render,flush:()=>adapter?.flush(),dispose(){if(disposed)return;disposed=true;adapter?.dispose();adapter=null;observed=null;toggle?.removeEventListener('change',change);restore?.removeEventListener('click',onRestore);discard?.removeEventListener('click',onDiscard);retry?.removeEventListener('click',onRetry);}};
}
