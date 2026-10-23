import {mountConsumer} from './custom-host.js';

// Example-only lifecycle adapter. Neither the framework nor core owns this UI.
// Counters and canvasExample are bounded diagnostics for the local browser tests.
export function mountFrameworkHost(container,name){
  let alive=true,instance=null;
  const mount=()=>{
    if(!alive||!container.isConnected||instance)return;
    instance=mountConsumer(container,name);
    container.canvasExample=instance;
    container.dataset.mounts=String(Number(container.dataset.mounts||0)+1);
    container.dataset.ready='true';
  };
  const stop=()=>{
    if(!instance)return;
    instance.dispose();instance=null;
    delete container.canvasExample;
    container.dataset.disposals=String(Number(container.dataset.disposals||0)+1);
    delete container.dataset.ready;
  };
  mount();
  window.addEventListener('pagehide',stop);
  window.addEventListener('pageshow',mount);
  return ()=>{
    if(!alive)return;alive=false;
    window.removeEventListener('pagehide',stop);
    window.removeEventListener('pageshow',mount);
    stop();
  };
}
