import { toolbarIcons } from './canvas-instance-toolbar-icons.js';
// Portable DOM-only toolbar. Commands, state, file I/O and persistence stay host-owned.
const definitions=[
 ['undo','[data-undo],[data-instance-undo]','undo-2','Z','History'],['redo','[data-redo],[data-instance-redo]','redo-2','Shift Z','History'],
 ['sticky','[data-add-note],[data-instance-add-note]','sticky-note','','Tools'],['image','[data-add-image]','image','','Tools'],['pencil','[data-pencil],[data-instance-pencil]','pencil','P','Tools'],['multiple','[data-multiple],[data-instance-multiple]','lasso-select','','Tools'],
 ...[['copy','copy','C'],['paste','sticky-note','V'],['duplicate','copy-plus','D'],['lock','lock-keyhole',''],['delete','trash','Delete'],['group','group','G'],['ungroup','ungroup','Shift G'],['bring-forward','layers',''],['send-backward','layers',''],['bring-front','bring-to-front',''],['send-back','send-to-back','']].map(([id,icon,key])=>[id,`[data-document-action="${id}"]`,icon,key,'Selection'])
];
const arrangement={'align-left':'align-start-vertical','align-center':'align-center-vertical','align-right':'align-end-vertical','align-top':'align-start-horizontal','align-middle':'align-center-horizontal','align-bottom':'align-end-horizontal','distribute-horizontal':'align-horizontal-space-between','distribute-vertical':'align-vertical-space-between'};
let serial=0;
export function createCanvasToolbar(container,{actions=null,label='Canvas editing',onSelect=null}={}) {
  if(!container?.ownerDocument?.defaultView||!(container instanceof container.ownerDocument.defaultView.HTMLElement)||['HTML','BODY'].includes(container.tagName)||container.closest('.canvas-embed-toolbar')||container.querySelector('.canvas-embed-toolbar'))throw new Error('Toolbar needs an independent mount.');
  if(onSelect!==null&&typeof onSelect!=='function')throw new TypeError('Select needs a host action.');
  if(actions!==null&&(!Array.isArray(actions)||actions.length>50||new Set(actions.map(item=>item?.id)).size!==actions.length||Array.from(actions).some(item=>!item?.id||!item.label||!Object.hasOwn(toolbarIcons,item.icon)||typeof item.run!=='function')))throw new TypeError('Invalid toolbar actions.');
  const doc=container.ownerDocument,view=doc.defaultView,bar=doc.createElement('div');bar.className='canvas-embed-toolbar';bar.setAttribute('role','toolbar');bar.setAttribute('aria-label',label);bar.setAttribute('aria-orientation','horizontal');
  const rows=[],groups=new Map(),restore=[],generated=actions!==null,mod=/Mac|iPhone|iPad/.test(view.navigator.platform)?'⌘':'Ctrl';let alive=true,active=null,tipTarget=null;
  function add(button,{id,icon,key='',group='Actions',run=null},move=true) {
    const marker=doc.createComment('Canvas toolbar control');if(move)button.before(marker);
    restore.push({button,marker,move,nodes:[...button.childNodes],className:button.getAttribute('class'),aria:button.getAttribute('aria-label'),tab:button.getAttribute('tabindex'),described:button.getAttribute('aria-describedby')});
    const row={button,id,icon,key,run,label:button.getAttribute('aria-label')||button.textContent.trim()};rows.push(row);
    if(move){if(!groups.has(group)){const node=doc.createElement('div');node.className='canvas-embed-toolbar__group';node.setAttribute('role','group');node.setAttribute('aria-label',group);bar.append(node);groups.set(group,node);}groups.get(group).append(button);}
    return row;
  }
  if(!generated&&onSelect){const button=doc.createElement('button');button.type='button';button.textContent='Select';const row=add(button,{id:'select',icon:'mouse-pointer-2',key:'V',group:'Tools',run:onSelect});restore.at(-1).owned=true;row.button.setAttribute('aria-pressed','true');}
  if(generated)for(const item of actions){const button=doc.createElement('button');button.type='button';button.textContent=item.label;button.disabled=!!item.disabled;button.hidden=!!item.hidden;if(item.pressed!==undefined)button.setAttribute('aria-pressed',String(item.pressed));add(button,{...item,key:item.shortcut??''});}
  else for(const [id,selector,icon,key,group]of definitions){const button=container.querySelector(selector);if(button)add(button,{id,icon,key,group});}
  container.prepend(bar);
  // Arrange retains its authored disclosure and real controls; no clones or extra dispatch.
  if(!generated)for(const [id,icon]of Object.entries(arrangement)){const button=container.querySelector(`[data-document-action="${id}"]`);if(button)add(button,{id,icon},false);}
  const tip=doc.createElement('div');tip.className='canvas-embed-tooltip';tip.id=`canvas-embed-tip-${++serial}`;tip.setAttribute('role','tooltip');tip.setAttribute('popover','manual');bar.append(tip);
  const hide=()=>{if(tipTarget){const original=restore.find(item=>item.button===tipTarget)?.described;if(original===null)tipTarget.removeAttribute('aria-describedby');else if(original!==undefined)tipTarget.setAttribute('aria-describedby',original);}tipTarget=null;if(tip.matches(':popover-open'))tip.hidePopover();tip.hidden=true;};
  const describe=row=>{const key=row.key?(row.key==='P'||row.id==='select'&&row.key==='V'||row.key==='Delete'?row.key:`${mod} ${row.key}`):'';return row.label+(key?` · ${key}`:'');};
  function show(button) {
    const row=rows.find(item=>item.button===button);if(!row||button.hidden||tipTarget===button)return;hide();tipTarget=button;
    tip.textContent=describe(row);tip.hidden=false;
    button.setAttribute('aria-describedby',[restore.find(item=>item.button===button)?.described,tip.id].filter(Boolean).join(' '));
    tip.showPopover();const r=button.getBoundingClientRect(),t=tip.getBoundingClientRect(),width=view.innerWidth,height=view.innerHeight;tip.style.left=Math.max(8,Math.min(width-t.width-8,r.left+(r.width-t.width)/2))+'px';tip.style.top=Math.max(8,Math.min(height-t.height-8,r.top-t.height-8<8?r.bottom+8:r.top-t.height-8))+'px';
  }
  const eligible=()=>rows.filter(row=>bar.contains(row.button)&&!row.button.disabled&&!row.button.hidden&&!row.button.closest('[hidden]')).map(row=>row.button);
  function render() {
    if(!alive)return;const available=eligible();if(bar.tabIndex!==(available.length?-1:0))bar.tabIndex=available.length?-1:0;if(!available.includes(active))active=available[0]??null;
    for(const row of rows){const b=row.button;if(!b.firstElementChild?.hasAttribute('data-toolbar-icon')){row.label=b.textContent.trim()||row.label;b.replaceChildren();const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','2');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');svg.setAttribute('data-toolbar-icon','');svg.innerHTML=toolbarIcons[row.id==='lock'&&b.getAttribute('aria-pressed')==='true'?'lock-keyhole-open':row.icon];const text=doc.createElement('span');text.className='canvas-embed-toolbar__label';text.textContent=row.label;b.append(svg,text);}
      if(!b.classList.contains('canvas-embed-toolbar__button'))b.classList.add('canvas-embed-toolbar__button');if(b.getAttribute('aria-label')!==row.label)b.setAttribute('aria-label',row.label);if(bar.contains(b)&&b.tabIndex!==(b===active?0:-1))b.tabIndex=b===active?0:-1;
    }
    for(const group of groups.values()){const empty=![...group.children].some(button=>!button.hidden);if(group.hidden!==empty)group.hidden=empty;}
    if(tipTarget&&(tipTarget.disabled||tipTarget.hidden||tipTarget.closest('[hidden]')))hide();
    if(tipTarget){const row=rows.find(item=>item.button===tipTarget);if(tip.textContent!==describe(row)){const button=tipTarget;hide();show(button);}}
  }
  const keydown=event=>{if(event.key==='Escape'){hide();return;}if(!bar.contains(event.target)||!event.target.matches('button')||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;if(event.key==='Escape'){hide();return;}const available=eligible(),index=available.indexOf(event.target);if(index<0||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const direction=(event.key==='ArrowRight'?1:-1)*(view.getComputedStyle(bar).direction==='rtl'?-1:1),next=event.key==='Home'?0:event.key==='End'?available.length-1:(index+direction+available.length)%available.length;active=available[next];render();active.focus();};
  const over=event=>{const b=event.target.closest?.('button');if(b&&rows.some(row=>row.button===b))show(b);};
  const out=event=>{if(!tipTarget?.contains(event.relatedTarget))hide();};
  const focus=event=>{if(bar.contains(event.target)&&event.target.matches('button')){active=event.target;render();}over(event);};
  const click=event=>{const row=rows.find(item=>item.button===event.target.closest?.('button'));hide();if(row?.run&&!row.button.disabled&&!row.button.hidden)row.run();};
  const scroll=()=>{const button=tipTarget;if(button&&doc.activeElement===button){hide();show(button);}else hide();};
  const listeners={keydown,pointerover:over,pointerout:out,focusin:focus,focusout:hide,click};for(const [type,fn]of Object.entries(listeners))container.addEventListener(type,fn);bar.addEventListener('scroll',scroll);const observer=new view.ResizeObserver(hide);observer.observe(bar);render();
  return Object.freeze({render,update(id,patch){if(!alive)return;const row=rows.find(item=>item.id===id);if(!row)return;const b=row.button,focused=doc.activeElement===b;if(patch.label!==undefined){row.label=String(patch.label);b.querySelector('.canvas-embed-toolbar__label').textContent=row.label;}for(const name of ['disabled','hidden'])if(patch[name]!==undefined&&b[name]!==!!patch[name])b[name]=!!patch[name];if(patch.pressed!==undefined){if(b.getAttribute('aria-pressed')!==String(patch.pressed))b.setAttribute('aria-pressed',String(patch.pressed));if(row.id==='lock')b.querySelector('svg').innerHTML=toolbarIcons[patch.pressed?'lock-keyhole-open':'lock-keyhole'];}render();if(focused&&(b.disabled||b.hidden))(active??bar).focus();},dispose(){if(!alive)return;alive=false;hide();observer.disconnect();for(const [type,fn]of Object.entries(listeners))container.removeEventListener(type,fn);bar.removeEventListener('scroll',scroll);for(const item of restore){const b=item.button;if(generated||item.owned)b.remove();else{b.replaceChildren(...item.nodes);for(const [attr,value]of [['class',item.className],['aria-label',item.aria],['tabindex',item.tab],['aria-describedby',item.described]])if(value===null)b.removeAttribute(attr);else b.setAttribute(attr,value);if(item.move)item.marker.replaceWith(b);}item.marker.remove();}bar.remove();rows.length=restore.length=0;groups.clear();active=null;}});
}
