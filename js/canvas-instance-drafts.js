// Optional host adapter. Core never chooses a storage service or draft key.
const limit=1049600;
export function parseLocalDraft(raw) {
  if(typeof raw!=='string'||raw.length>limit||new TextEncoder().encode(raw).byteLength>limit)throw new RangeError('Local draft exceeds its size limit.');
  const value=JSON.parse(raw),doc=value?.document;
  if(value?.format!=='dmf-canvas-draft'||value.version!==1||!Number.isSafeInteger(value.savedAt)||value.savedAt<0||doc?.format!=='dmf-canvas'||doc.version!==1||!Array.isArray(doc.originals)||!Array.isArray(doc.objects)||doc.originals.length+doc.objects.length>50)throw new TypeError('Unsupported local draft.');
  return value;
}
export function createLocalDraft(canvas,{key,storage,delay=600,onStatus=()=>{},now=Date.now,setTimer=setTimeout,clearTimer=clearTimeout}={}) {
  if(typeof key!=='string'||! /^[a-zA-Z0-9._:/-]{1,120}$/.test(key)||!storage||!['getItem','setItem','removeItem'].every(name=>typeof storage[name]==='function')||!Number.isInteger(delay)||delay<0||delay>5000||[onStatus,now,setTimer,clearTimer].some(fn=>typeof fn!=='function'))throw new TypeError('Local drafts need an explicit key, storage and bounded delay.');
  const storageKey='dmf:canvas-draft:v1:'+key;
  const initial=canvas.getState();
  let alive=true,timer=null,pending=!!initial.dirty,recovery=false,failed=false,initialized=false,lastRaw=null,savedAt=null,phase='ready',message='',savedRevision=initial.dirty?null:initial.revision,ignoreRevision=null;
  const state=()=>Object.freeze({phase,message,hasDraft:recovery,hasStored:initialized&&lastRaw!==null,savedAt,pending});
  const emit=()=>{if(alive)try{onStatus(state());}catch(error){globalThis.reportError?.(error);}};
  const cancelTimer=()=>{if(timer!==null)clearTimer(timer);timer=null;};
  const error=problem=>{failed=true;phase='error';message=problem?.name==='QuotaExceededError'?'Local storage is full. Free space, then Retry.':'Local draft unavailable. Retry or turn local drafts off.';emit();return false;};
  const inspect=(raw,conflict=false)=>{
    lastRaw=raw;initialized=true;savedAt=null;recovery=raw!==null;
    if(raw===null){phase='ready';message='Local drafts enabled on this device.';return;}
    try{savedAt=parseLocalDraft(raw).savedAt;phase=conflict?'conflict':'available';message=conflict?'The stored draft changed. Restore or discard it before saving here.':'A local draft is available. Restore replaces this canvas; Discard removes the draft.';}
    catch{phase='error';failed=true;message='This local draft cannot be read. Discard it to start a new draft.';}
  };
  function schedule() {
    cancelTimer();
    if(!alive||!pending||recovery||failed)return;
    phase='pending';message='Local draft waiting to save.';
    if(canvas.getState().canSave)timer=setTimer(()=>{timer=null;flush();},delay);
    emit();
  }
  function flush() {
    cancelTimer();
    if(!alive||!canvas.getState().mounted||recovery||failed)return false;
    const current=canvas.getState();if(current.revision===savedRevision){pending=false;return true;}
    pending=true;if(!current.canSave){phase='pending';message='Finish the current interaction to save the local draft.';emit();return false;}
    try{
      const raw=storage.getItem(storageKey);
      if(raw!==lastRaw){inspect(raw,true);emit();if(!recovery&&!failed)schedule();return false;}
      phase='saving';message='Saving local draft…';emit();
      const revision=canvas.getState().revision,stamp=now(),document=canvas.saveDocument(),next=JSON.stringify({format:'dmf-canvas-draft',version:1,savedAt:stamp,document});parseLocalDraft(next);
      storage.setItem(storageKey,next);lastRaw=next;savedAt=stamp;savedRevision=revision;pending=canvas.getState().revision!==revision;phase='saved';message='Draft saved on this device.';emit();if(pending)schedule();return true;
    }catch(problem){return error(problem);}
  }
  function read() {
    cancelTimer();failed=false;
    try{const raw=storage.getItem(storageKey);if(!initialized||raw!==lastRaw||recovery)inspect(raw,initialized&&raw!==lastRaw);else{phase=savedAt===null?'ready':'saved';message=savedAt===null?'Local drafts enabled on this device.':'Draft saved on this device.';}emit();if(pending&&!recovery&&!failed)schedule();return !failed;}
    catch(problem){return error(problem);}
  }
  const offChanges=canvas.subscribeChanges(event=>{
    if(!alive||event.revision===ignoreRevision)return;
    pending=canvas.getState().revision!==savedRevision;if(pending)schedule();
  });
  let offState=()=>{};
  try{offState=canvas.subscribe(current=>{if(!current.mounted){dispose();return;}if(pending&&timer===null&&current.canSave&&!recovery&&!failed)schedule();});}catch(problem){offChanges();throw problem;}
  function dispose(){if(!alive)return;alive=false;cancelTimer();offChanges();offState();}
  read();
  return Object.freeze({
    getState:state,flush,retry:()=>alive&&read(),
    restore(){
      if(!alive||!recovery)return false;
      cancelTimer();
      try{
        const raw=storage.getItem(storageKey);if(raw!==lastRaw){failed=false;inspect(raw,true);emit();return false;}
        const draft=parseLocalDraft(raw),result=canvas.loadDocument(draft.document);
        if(!result.ok){message='Finish editing and enable Save/Open on an editable canvas to restore.';emit();return false;}
        ignoreRevision=savedRevision=canvas.getState().revision;pending=recovery=failed=false;phase='restored';message='Local draft restored.';emit();return true;
      }catch{failed=true;phase='error';message='The draft could not be restored to this canvas. The canvas and stored draft were kept.';emit();return false;}
    },
    discard(){
      if(!alive)return false;
      cancelTimer();
      try{const raw=storage.getItem(storageKey);if(initialized&&raw!==lastRaw&&raw!==null){failed=false;inspect(raw,true);emit();return false;}storage.removeItem(storageKey);lastRaw=null;initialized=true;pending=recovery=failed=false;savedAt=null;savedRevision=canvas.getState().revision;phase='ready';message='Local draft discarded. The next completed edit will start a new draft.';emit();return true;}
      catch(problem){return error(problem);}
    },
    dispose,
  });
}
