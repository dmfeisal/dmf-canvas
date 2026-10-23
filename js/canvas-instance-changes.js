// Instance-local document revisions. No documents, DOM, storage or history retained.
export function createChangeTracker(reportError) {
  let alive=true,revision=0,token=0,serial=0,saved=0,scheduled=false;
  const listeners=new Map();let pending=[];
  const state=()=>Object.freeze({revision,dirty:token!==saved});
  function publish(source) {
    if(!listeners.size)return;
    pending.push(Object.freeze({...state(),source}));
    if(scheduled)return;
    scheduled=true;
    queueMicrotask(()=>{
      scheduled=false;const events=pending;pending=[];
      for(const event of events)for(const [listener,after]of [...listeners]){
        if(!alive)return;
        if(event.revision<=after||listeners.get(listener)!==after)continue;
        try{listener(event);}catch(error){reportError(error);}
      }
    });
  }
  return Object.freeze({
    state,
    commit(source){const beforeToken=token,afterToken=++serial;token=afterToken;revision++;publish(source);return {beforeToken,afterToken};},
    restore(source,value){token=value;revision++;publish(source);},
    open(){token=++serial;saved=token;revision++;publish('open');},
    markSaved(expected=revision){if(!alive||expected!==revision)return false;saved=token;return true;},
    subscribe(listener){if(!alive||typeof listener!=='function'||listeners.size>=50)throw new Error('Canvas change subscription unavailable.');listeners.set(listener,revision);return ()=>listeners.delete(listener);},
    destroy(){alive=false;listeners.clear();pending.length=0;},
  });
}
