import { createTextOwner, visibleCenter, savedPosition } from './canvas-instance-text.js';

// Paper-specific ownership stays outside core and shares the bounded editor/math.
// Sixteen paper colours (docs/prd/STYLING-EXPORT.md). Keys are hues, not third-party collection names. yellow, blue and
// pink are the original three and keep their values. Each colour reads its host token first, then the hex fallback.
export const legacyStickyColors=Object.freeze(['yellow','blue','pink']);
const paperDefs=[
  ['red','var(--dmf-note-candy-apple-red, #f05366)'],['orange','var(--dmf-note-vital-orange, #ffae5f)'],['yellow','var(--dmf-note-sunnyside, #ffcf34)'],['green','var(--dmf-note-lucky-green, #63c787)'],
  ['blue','var(--dmf-note-blue-paradise, #68d4f8)'],['iris','var(--dmf-note-iris-infusion, #c29bd4)'],['pink','var(--dmf-note-positively-pink, #ffbbd4)'],['blush','var(--dmf-note-pink-salt, #f2d4e0)'],
  ['lilac','var(--dmf-note-orchid-frost, #e5dcef)'],['denim','var(--dmf-note-washed-denim, #9cc7fc)'],['mint','var(--dmf-note-fresh-mint, #b5e2df)'],['gray','var(--dmf-note-pebble-gray, #bfb6b7)'],
  ['aqua','var(--dmf-note-aqua-splash, #6bd9e6)'],['lime','var(--dmf-note-acid-lime, #e4ee59)'],['guava','var(--dmf-note-guava, #ff8b98)'],['magenta','var(--dmf-note-tropical-pink, #f9a6ea)'],
];
export const stickyColors=Object.freeze(paperDefs.map(([key])=>key));
const paper=Object.freeze(Object.fromEntries(paperDefs));

export function createStickyNote(host) {
  if(!host?.isConnected||host.clientWidth<80||host.clientHeight<100)throw new TypeError('Sticky Note needs a visible sized host.');
  let root=host,node=host.ownerDocument.createElement('p'),color='yellow';
  node.className='canvas-instance-note';node.dataset.canvasInstanceNote='';node.textContent='New sticky note';
  node.setAttribute('aria-label','Sticky Note');
  if(host.getAttribute('aria-describedby'))node.setAttribute('aria-describedby',host.getAttribute('aria-describedby'));
  // New notes go to the middle of what the host shows: in a camera world, the visible centre in world units.
  const size=Math.min(240,host.clientWidth-64,host.clientHeight-80),center=visibleCenter(host)??{x:host.clientWidth/2,y:host.clientHeight/2};
  Object.assign(node.style,{width:size+'px',height:size+'px',left:savedPosition(center.x-size/2,size)+'px',top:savedPosition(center.y-(size+32)/2,size)+'px'});
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
