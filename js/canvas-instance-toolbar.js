import { toolbarIcons } from './canvas-instance-toolbar-icons.js';
// Portable DOM-only toolbar. Commands, state, file I/O and persistence stay host-owned.
// Icon names follow docs/design/TOOLBAR.md: one Lucide icon per meaning.
const definitions=[
 ['undo','[data-undo],[data-instance-undo]','undo-2','Z','History'],['redo','[data-redo],[data-instance-redo]','redo-2','Shift Z','History'],
 ['sticky','[data-add-note],[data-instance-add-note]','sticky-note','','Tools'],['image','[data-add-image]','image','','Tools'],['pencil','[data-pencil],[data-instance-pencil]','pencil','P','Tools'],['multiple','[data-multiple],[data-instance-multiple]','lasso-select','','Tools'],
 ...[['copy','copy','C'],['paste','clipboard-paste','V'],['duplicate','copy-plus','D'],['lock','lock-keyhole',''],['delete','trash','Delete'],['group','group','G'],['ungroup','ungroup','Shift G'],['bring-forward','arrow-up',''],['send-backward','arrow-down',''],['bring-front','bring-to-front',''],['send-back','send-to-back','']].map(([id,icon,key])=>[id,`[data-document-action="${id}"]`,icon,key,'Selection'])
];
const arrangement={'align-left':'align-start-vertical','align-center':'align-center-vertical','align-right':'align-end-vertical','align-top':'align-start-horizontal','align-middle':'align-center-horizontal','align-bottom':'align-end-horizontal','distribute-horizontal':'align-horizontal-space-between','distribute-vertical':'align-vertical-space-between'};
const svgNS='http://www.w3.org/2000/svg';
let serial=0;
export function createCanvasToolbar(container,{actions=null,label='Canvas editing',onSelect=null,orientation='horizontal',moreLabel='More actions'}={}) {
  if(!container?.ownerDocument?.defaultView||!(container instanceof container.ownerDocument.defaultView.HTMLElement)||['HTML','BODY'].includes(container.tagName)||container.closest('.canvas-embed-toolbar')||container.querySelector('.canvas-embed-toolbar'))throw new Error('Toolbar needs an independent mount.');
  if(onSelect!==null&&typeof onSelect!=='function')throw new TypeError('Select needs a host action.');
  if(!['horizontal','vertical'].includes(orientation))throw new TypeError('Toolbar orientation must be horizontal or vertical.');
  if(typeof moreLabel!=='string'||!moreLabel.trim())throw new TypeError('More menu needs a label.');
  if(actions!==null&&(!Array.isArray(actions)||actions.length>50||new Set(actions.map(item=>item?.id)).size!==actions.length||Array.from(actions).some(item=>!item?.id||item.id==='more'||!item.label||!Object.hasOwn(toolbarIcons,item.icon)||typeof item.run!=='function')))throw new TypeError('Invalid toolbar actions.');
  const doc=container.ownerDocument,view=doc.defaultView,vertical=orientation==='vertical',bar=doc.createElement('div');bar.className='canvas-embed-toolbar'+(vertical?' canvas-embed-toolbar--vertical':'');bar.setAttribute('role','toolbar');bar.setAttribute('aria-label',label);bar.setAttribute('aria-orientation',orientation);
  const rows=[],groups=new Map(),sections=new Map(),restore=[],generated=actions!==null,mod=/Mac|iPhone|iPad/.test(view.navigator.platform)?'⌘':'Ctrl';let alive=true,active=null,tipTarget=null;
  const id=++serial,menuItems=generated?actions.filter(item=>item.menu):[];
  let menu=null,more=null;
  function add(button,{id,icon,key='',group='Actions',run=null,menu:inMenu=false},move=true) {
    const marker=doc.createComment('Canvas toolbar control');if(move&&!inMenu)button.before(marker);
    restore.push({button,marker,move,nodes:[...button.childNodes],className:button.getAttribute('class'),aria:button.getAttribute('aria-label'),tab:button.getAttribute('tabindex'),described:button.getAttribute('aria-describedby')});
    const row={button,id,icon,key,run,menu:inMenu,label:button.getAttribute('aria-label')||button.textContent.trim()};rows.push(row);
    if(inMenu){if(!sections.has(group)){const node=doc.createElement('div');node.className='canvas-embed-menu__section';node.setAttribute('role','group');node.setAttribute('aria-label',group);menu.append(node);sections.set(group,node);}sections.get(group).append(button);}
    else if(move){if(!groups.has(group)){const node=doc.createElement('div');node.className='canvas-embed-toolbar__group';node.setAttribute('role','group');node.setAttribute('aria-label',group);bar.append(node);groups.set(group,node);}groups.get(group).append(button);}
    return row;
  }
  if(menuItems.length){menu=doc.createElement('div');menu.className='canvas-embed-menu';menu.id=`canvas-embed-menu-${id}`;menu.setAttribute('role','menu');menu.setAttribute('aria-label',moreLabel);menu.setAttribute('popover','manual');}
  if(!generated&&onSelect){const button=doc.createElement('button');button.type='button';button.textContent='Select';const row=add(button,{id:'select',icon:'mouse-pointer-2',key:'V',group:'Tools',run:onSelect});restore.at(-1).owned=true;row.button.setAttribute('aria-pressed','true');}
  if(generated)for(const item of actions){const button=doc.createElement('button');button.type='button';button.dataset.toolbarAction=item.id;button.textContent=item.label;button.disabled=!!item.disabled;button.hidden=!!item.hidden;
    if(item.menu){button.setAttribute('role',item.pressed===undefined?'menuitem':'menuitemcheckbox');button.tabIndex=-1;if(item.pressed!==undefined)button.setAttribute('aria-checked',String(item.pressed===true));}
    else if(item.pressed!==undefined)button.setAttribute('aria-pressed',String(item.pressed));
    add(button,{...item,key:item.shortcut??''});}
  else for(const [rowId,selector,icon,key,group]of definitions){const button=container.querySelector(selector);if(button)add(button,{id:rowId,icon,key,group});}
  if(menu){more=doc.createElement('button');more.type='button';more.dataset.toolbarAction='more';more.textContent=moreLabel;more.setAttribute('aria-haspopup','menu');more.setAttribute('aria-expanded','false');more.setAttribute('aria-controls',menu.id);add(more,{id:'more',icon:'ellipsis',group:'More',run:()=>toggleMenu()});restore.at(-1).owned=true;bar.append(menu);}
  container.prepend(bar);
  // Arrange retains its authored disclosure and real controls; no clones or extra dispatch.
  if(!generated)for(const [rowId,icon]of Object.entries(arrangement)){const button=container.querySelector(`[data-document-action="${rowId}"]`);if(button)add(button,{id:rowId,icon},false);}
  const tip=doc.createElement('div');tip.className='canvas-embed-tooltip';tip.id=`canvas-embed-tip-${id}`;tip.setAttribute('role','tooltip');tip.setAttribute('popover','manual');bar.append(tip);
  // P, Delete and Select's V are unmodified tool hints; every other shortcut uses the platform command key.
  const shortcut=row=>row.key?(row.key==='P'||row.id==='select'&&row.key==='V'||row.key==='Delete'?row.key:`${mod} ${row.key}`):'';
  const hide=()=>{if(tipTarget){const original=restore.find(item=>item.button===tipTarget)?.described;if(original===null)tipTarget.removeAttribute('aria-describedby');else if(original!==undefined)tipTarget.setAttribute('aria-describedby',original);}tipTarget=null;if(tip.matches(':popover-open'))tip.hidePopover();tip.hidden=true;};
  const describe=row=>{const key=shortcut(row);return row.label+(key?` · ${key}`:'');};
  const rtl=()=>view.getComputedStyle(bar).direction==='rtl';
  function show(button) {
    const row=rows.find(item=>item.button===button);if(!row||row.menu||button.hidden||tipTarget===button||button.getAttribute('aria-expanded')==='true')return;hide();tipTarget=button;
    tip.textContent=describe(row);tip.hidden=false;
    button.setAttribute('aria-describedby',[restore.find(item=>item.button===button)?.described,tip.id].filter(Boolean).join(' '));
    // Native popover focus restoration can run inside another popover operation.
    queueMicrotask(()=>{if(!alive||tipTarget!==button||!tip.isConnected)return;if(!tip.matches(':popover-open'))tip.showPopover();const r=button.getBoundingClientRect(),t=tip.getBoundingClientRect(),width=view.innerWidth,height=view.innerHeight;
      if(vertical){const after=rtl()?r.left-t.width-8:r.right+8,before=rtl()?r.right+8:r.left-t.width-8,left=after>=8&&after+t.width<=width-8?after:before;tip.style.left=Math.max(8,Math.min(width-t.width-8,left))+'px';tip.style.top=Math.max(8,Math.min(height-t.height-8,r.top+(r.height-t.height)/2))+'px';}
      else{tip.style.left=Math.max(8,Math.min(width-t.width-8,r.left+(r.width-t.width)/2))+'px';tip.style.top=Math.max(8,Math.min(height-t.height-8,r.top-t.height-8<8?r.bottom+8:r.top-t.height-8))+'px';}});
  }
  const usable=row=>!row.button.disabled&&!row.button.hidden&&!row.button.closest('[hidden]');
  const eligible=()=>rows.filter(row=>!row.menu&&bar.contains(row.button)&&usable(row)).map(row=>row.button);
  const items=()=>rows.filter(row=>row.menu&&usable(row)).map(row=>row.button);
  const menuOpen=()=>!!menu?.matches(':popover-open');
  // Open toward the roomier side of the trigger; scroll the menu when even that side is too short.
  function placeMenu(){if(!menuOpen())return;menu.style.maxHeight='';const r=more.getBoundingClientRect(),width=view.innerWidth,height=view.innerHeight,below=height-r.bottom-14,above=r.top-14;let m=menu.getBoundingClientRect();
    const down=below>=above,room=down?below:above;if(m.height>room){menu.style.maxHeight=Math.max(120,room)+'px';m=menu.getBoundingClientRect();}
    const top=down?r.bottom+6:r.top-m.height-6,start=rtl()?r.right-m.width:r.left;menu.style.left=Math.max(8,Math.min(width-m.width-8,start))+'px';menu.style.top=Math.max(8,Math.min(height-m.height-8,top))+'px';}
  // Manual popover: outside pointerdown and page scroll dismiss it; listeners exist only while it is open.
  const outside=event=>{if(!menu.contains(event.target)&&!more.contains(event.target))closeMenu(false);};
  const away=event=>{if(!menu.contains(event.target))closeMenu(false);};
  function openMenu(focusLast=false){if(!menu||menuOpen()||more.disabled||more.hidden)return;hide();menu.showPopover();more.setAttribute('aria-expanded','true');placeMenu();doc.addEventListener('pointerdown',outside,true);doc.addEventListener('scroll',away,true);const list=items();(focusLast?list.at(-1):list[0])?.focus({preventScroll:true});}
  function closeMenu(returnFocus=true){if(!menuOpen())return;doc.removeEventListener('pointerdown',outside,true);doc.removeEventListener('scroll',away,true);const inside=menu.contains(doc.activeElement);menu.hidePopover();more.setAttribute('aria-expanded','false');if(returnFocus&&inside&&!more.disabled&&!more.hidden)more.focus({preventScroll:true});}
  function toggleMenu(){if(menuOpen())closeMenu();else openMenu();}
  const toggled=event=>{if(more)more.setAttribute('aria-expanded',String(event.newState==='open'));};
  function render() {
    if(!alive)return;
    if(more){const visible=rows.filter(row=>row.menu&&!row.button.hidden);more.hidden=!visible.length;more.disabled=!visible.some(row=>!row.button.disabled);if((more.hidden||more.disabled)&&menuOpen())closeMenu();for(const section of sections.values()){const empty=![...section.children].some(button=>!button.hidden);if(section.hidden!==empty)section.hidden=empty;}}
    const available=eligible();if(bar.tabIndex!==(available.length?-1:0))bar.tabIndex=available.length?-1:0;if(!available.includes(active))active=available[0]??null;
    for(const row of rows){const b=row.button;
      if(!b.firstElementChild?.hasAttribute('data-toolbar-icon')){row.label=b.textContent.trim()||row.label;b.replaceChildren();const svg=doc.createElementNS(svgNS,'svg');for(const [name,value]of [['viewBox','0 0 24 24'],['fill','none'],['stroke','currentColor'],['stroke-width','2'],['stroke-linecap','round'],['stroke-linejoin','round'],['aria-hidden','true'],['data-toolbar-icon','']])svg.setAttribute(name,value);svg.innerHTML=toolbarIcons[row.id==='lock'&&(b.getAttribute('aria-pressed')==='true'||b.getAttribute('aria-checked')==='true')?'lock-keyhole-open':row.icon];
        const text=doc.createElement('span');text.className=row.menu?'canvas-embed-menu__label':'canvas-embed-toolbar__label';text.textContent=row.label;b.append(svg,text);
        if(row.menu){const key=shortcut(row);if(key){const kbd=doc.createElement('kbd');kbd.className='canvas-embed-menu__key';kbd.textContent=key;b.append(kbd);}}}
      const cls=row.menu?'canvas-embed-menu__item':'canvas-embed-toolbar__button';if(!b.classList.contains(cls))b.classList.add(cls);
      if(!row.menu&&b.getAttribute('aria-label')!==row.label)b.setAttribute('aria-label',row.label);
      if(!row.menu&&bar.contains(b)&&b.tabIndex!==(b===active?0:-1))b.tabIndex=b===active?0:-1;
    }
    for(const group of groups.values()){const empty=![...group.children].some(button=>!button.hidden);if(group.hidden!==empty)group.hidden=empty;}
    if(tipTarget&&(tipTarget.disabled||tipTarget.hidden||tipTarget.closest('[hidden]')))hide();
    if(tipTarget){const row=rows.find(item=>item.button===tipTarget);if(tip.textContent!==describe(row)){const button=tipTarget;hide();show(button);}}
  }
  const keys=vertical?['ArrowUp','ArrowDown']:['ArrowLeft','ArrowRight'];
  const keydown=event=>{
    if(menu?.contains(event.target)){
      const list=items(),index=list.indexOf(event.target);
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeMenu();return;}
      if(event.key==='Tab'){closeMenu(false);return;}
      if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key)||!list.length)return;event.preventDefault();
      const next=event.key==='Home'?0:event.key==='End'?list.length-1:(index+(event.key==='ArrowDown'?1:-1)+list.length)%list.length;list[next].focus({preventScroll:true});return;
    }
    if(event.key==='Escape'){hide();if(event.target===more&&menuOpen()){event.preventDefault();closeMenu();}return;}
    if(!bar.contains(event.target)||!event.target.matches('button')||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
    if(event.target===more&&['ArrowDown','ArrowUp'].includes(event.key)&&!vertical){event.preventDefault();openMenu(event.key==='ArrowUp');return;}
    const available=eligible(),index=available.indexOf(event.target);if(index<0||![...keys,'Home','End'].includes(event.key))return;event.preventDefault();
    const forward=event.key===keys[1],direction=(forward?1:-1)*(!vertical&&rtl()?-1:1),next=event.key==='Home'?0:event.key==='End'?available.length-1:(index+direction+available.length)%available.length;active=available[next];render();active.focus();
  };
  const over=event=>{const b=event.target.closest?.('button');if(b&&rows.some(row=>row.button===b&&!row.menu))show(b);};
  const out=event=>{if(!tipTarget?.contains(event.relatedTarget))hide();};
  const focus=event=>{if(bar.contains(event.target)&&event.target.matches('button')&&!menu?.contains(event.target)){active=event.target;render();event.target.scrollIntoView({block:'nearest',inline:'nearest'});}over(event);};
  const click=event=>{const row=rows.find(item=>item.button===event.target.closest?.('button'));hide();if(!row?.run||row.button.disabled||row.button.hidden)return;if(row.menu)closeMenu();row.run();};
  const scroll=()=>{closeMenu(false);const button=tipTarget;if(button&&doc.activeElement===button){hide();show(button);}else hide();};
  const listeners={keydown,pointerover:over,pointerout:out,focusin:focus,focusout:hide,click};for(const [type,fn]of Object.entries(listeners))container.addEventListener(type,fn);bar.addEventListener('scroll',scroll);menu?.addEventListener('toggle',toggled);const observer=new view.ResizeObserver(()=>{hide();placeMenu();});observer.observe(bar);render();
  return Object.freeze({render,update(rowId,patch){if(!alive)return;const row=rows.find(item=>item.id===rowId&&item.button!==more);if(!row)return;const b=row.button,focused=doc.activeElement===b;
    if(patch.label!==undefined){row.label=String(patch.label);b.querySelector(row.menu?'.canvas-embed-menu__label':'.canvas-embed-toolbar__label').textContent=row.label;}
    for(const name of ['disabled','hidden'])if(patch[name]!==undefined&&b[name]!==!!patch[name])b[name]=!!patch[name];
    if(patch.pressed!==undefined){const attr=row.menu?'aria-checked':'aria-pressed',value=row.menu?String(patch.pressed===true):String(patch.pressed);if(row.menu&&b.getAttribute('role')!=='menuitemcheckbox')b.setAttribute('role','menuitemcheckbox');if(b.getAttribute(attr)!==value)b.setAttribute(attr,value);if(row.id==='lock')b.querySelector('svg').innerHTML=toolbarIcons[patch.pressed?'lock-keyhole-open':'lock-keyhole'];}
    render();if(focused&&(b.disabled||b.hidden))(row.menu?(items()[0]??more):(active??bar)).focus();},
    dispose(){if(!alive)return;alive=false;hide();closeMenu(false);observer.disconnect();for(const [type,fn]of Object.entries(listeners))container.removeEventListener(type,fn);bar.removeEventListener('scroll',scroll);menu?.removeEventListener('toggle',toggled);
      for(const item of restore){const b=item.button;if(generated||item.owned)b.remove();else{b.replaceChildren(...item.nodes);for(const [attr,value]of [['class',item.className],['aria-label',item.aria],['tabindex',item.tab],['aria-describedby',item.described]])if(value===null)b.removeAttribute(attr);else b.setAttribute(attr,value);if(item.move)item.marker.replaceWith(b);}item.marker.remove();}
      bar.remove();rows.length=restore.length=0;groups.clear();sections.clear();active=null;}});
}
