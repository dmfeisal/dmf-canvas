// Host-owned appearance; no canvas commands, document writes or persistence.
const mounts=new WeakSet();
const palettes={
  light:{surface:'#ffffff',grid:'#d4d4d8',selection:'#1677ff',toolbar:'#fafafa',ink:'#171717',line:'#d4d4d8'},
  dark:{surface:'#18181b',grid:'#414148',selection:'#70adff',toolbar:'#242427',ink:'#f4f4f5',line:'#52525b'}
};
const slots=Object.freeze(['surface','grid','selection','toolbar','ink','line']);
const properties={'--canvas-embed-surface':'surface','--canvas-embed-grid':'grid','--canvas-embed-toolbar':'toolbar','--dmf-color-text':'ink','--dmf-color-line':'line','--dmf-color-canvas-selection':'selection','--dmf-color-canvas-handle':'surface','--dmf-color-canvas-halo':'surface','--dmf-color-paper-canvas':'toolbar'};
const plain=value=>!!value&&Object.getPrototypeOf(value)===Object.prototype;
export function resolveTheme(patch={},previous={mode:'inherit',colors:{}}){
  if(!plain(patch)||Object.keys(patch).some(key=>!['mode','colors'].includes(key))||patch.mode!==undefined&&!['inherit','light','dark','system'].includes(patch.mode))throw new TypeError('Invalid canvas theme.');
  if(patch.colors!==undefined&&(!plain(patch.colors)||Object.entries(patch.colors).some(([key,value])=>!slots.includes(key)||value!==null&&(typeof value!=='string'||!/^#[\da-f]{6}$/i.test(value)))))throw new TypeError('Canvas colors must be six-digit hex values or null.');
  const colors={...previous.colors};for(const [key,value]of Object.entries(patch.colors??{})){if(value===null)delete colors[key];else colors[key]=value.toLowerCase();}
  return Object.freeze({mode:patch.mode??previous.mode,colors:Object.freeze(colors)});
}
export function createCanvasTheme(container,options={}){
  const view=container?.ownerDocument?.defaultView;
  if(!view||!(container instanceof view.HTMLElement)||['HTML','BODY'].includes(container.tagName)||mounts.has(container))throw new TypeError('Theme needs an independent embed container.');
  const hadStyle=container.hasAttribute('style');
  const initial=resolveTheme(options),attribute=container.getAttribute('data-canvas-embed-theme');
  const names=[...Object.keys(properties),'--dmf-color-canvas-marquee','color-scheme'];
  const original=new Map(names.map(name=>[name,[container.style.getPropertyValue(name),container.style.getPropertyPriority(name)]]));
  let state=initial,alive=true,listening=false;const media=view.matchMedia('(prefers-color-scheme: dark)');
  function write(name,value,priority=''){if(value){if(container.style.getPropertyValue(name)!==value||container.style.getPropertyPriority(name)!==priority)container.style.setProperty(name,value,priority);}else if(container.style.getPropertyValue(name))container.style.removeProperty(name);}
  function restore(name){const [value,priority]=original.get(name);write(name,value,priority);}
  function render(){
    const mode=state.mode==='system'?(media.matches?'dark':'light'):state.mode;
    if(container.getAttribute('data-canvas-embed-theme')!==mode)container.setAttribute('data-canvas-embed-theme',mode);
    const colors={...palettes[mode],...state.colors};
    for(const [name,slot]of Object.entries(properties)){if(colors[slot])write(name,colors[slot]);else restore(name);}
    if(mode==='inherit')restore('color-scheme');else write('color-scheme',mode);
    if(colors.selection)write('--dmf-color-canvas-marquee',`color-mix(in srgb, ${colors.selection} ${mode==='dark'?12:8}%, transparent)`);else restore('--dmf-color-canvas-marquee');
    const needs=state.mode==='system';if(needs!==listening){media[needs?'addEventListener':'removeEventListener']('change',render);listening=needs;}
  }
  mounts.add(container);render();
  return Object.freeze({getState:()=>state,configure(patch){if(!alive)return false;const next=resolveTheme(patch,state);if(JSON.stringify(next)!==JSON.stringify(state)){state=next;render();}return true;},dispose(){if(!alive)return;alive=false;if(listening)media.removeEventListener('change',render);for(const name of names)restore(name);if(attribute===null)container.removeAttribute('data-canvas-embed-theme');else container.setAttribute('data-canvas-embed-theme',attribute);if(!hadStyle&&!container.style.length)container.removeAttribute('style');mounts.delete(container);}});
}
