import { createTextOwner } from './canvas-instance-text.js';

// Paper-specific ownership stays outside core and shares the bounded editor/math.
export const stickyColors=Object.freeze(['yellow','blue','pink']);
const paper={yellow:'var(--dmf-note-sunnyside, #ffcf34)',blue:'var(--dmf-note-blue-paradise, #68d4f8)',pink:'var(--dmf-note-positively-pink, #ffbbd4)'};

export function createStickyNote(host) {
  if(!host?.isConnected||host.clientWidth<80||host.clientHeight<100)throw new TypeError('Sticky Note needs a visible sized host.');
  let root=host,node=host.ownerDocument.createElement('p'),color='yellow';
  node.className='canvas-instance-note';node.dataset.canvasInstanceNote='';node.textContent='New sticky note';
  node.setAttribute('aria-label','Sticky Note');
  if(host.getAttribute('aria-describedby'))node.setAttribute('aria-describedby',host.getAttribute('aria-describedby'));
  const size=Math.min(240,host.clientWidth-64,host.clientHeight-80);
  Object.assign(node.style,{width:size+'px',height:size+'px',left:(host.clientWidth-size)/2+'px',top:(host.clientHeight-size-32)/2+'px'});
  root.append(node);
  let base;
  try{base=createTextOwner(node,root,{name:'Sticky Note',widthHandles:false});}catch(error){node.remove();throw error;}
  const setColor=value=>{
    if(!node||!stickyColors.includes(value))return false;
    color=value;node.style.setProperty('--canvas-instance-paper',paper[color]);return true;
  };
  setColor(color);
  const owner=Object.freeze({
    ...base,
    serialize:()=>({...base.serialize(),type:'sticky',state:{...base.capture(),content:base.serialize().text,paperColor:color}}),
    capture:()=>({...base.capture(),paperColor:color}),
    restore(value){
      if(!stickyColors.includes(value?.paperColor))throw new TypeError('Invalid paper color.');
      base.restore(value);setColor(value.paperColor);
    },
    paperColor:Object.freeze({read:()=>color,set:setColor}),
    setPresent(present){
      if(!node)return;
      if(present){root.append(node);base.restore(base.capture());}else node.remove();
    },
    dispose(){if(!node)return;base.dispose();node.remove();node=root=null;},
  });
  return Object.freeze({element:node,owner});
}
