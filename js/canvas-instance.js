import { createChangeTracker } from './canvas-instance-changes.js';
import { resolveSettings } from './canvas-instance-settings.js';
import { validateTransfer } from './canvas-instance-clipboard.js';
// Internal lifecycle spike. Production object owners still use DMFCanvasTools.
// No document/window listeners, storage, camera or owner geometry writes.
const mounted = new WeakMap(), registrations = new WeakMap();
const nativeControl = 'input,textarea,select,button,a,[contenteditable]:not([contenteditable="false"]),dialog,[popover]';
const result = (ok, reason = null) => Object.freeze({ ok, reason });

export function createCanvas(host, { documents = null, clipboard = null, readOnly = false, tools = {} } = {}) {
  const view = host?.ownerDocument?.defaultView;
  if (!view || !(host instanceof view.HTMLElement) || ['HTML', 'BODY'].includes(host.tagName)) {
    throw new TypeError('Canvas needs a dedicated HTML host.');
  }
  for (let ancestor = host; ancestor; ancestor = ancestor.parentElement) {
    if (mounted.has(ancestor)) throw new Error('Canvas hosts must be independent.');
  }
  if ([...host.querySelectorAll('*')].some(child => mounted.has(child))) {
    throw new Error('Canvas hosts must be independent.');
  }

  if(clipboard&&(!['read','write','subscribe'].every(key=>typeof clipboard[key]==='function')||!Number.isInteger(clipboard.count)||clipboard.count<0||clipboard.count>50))throw new TypeError('Canvas needs an explicit object clipboard.');
  let settings=resolveSettings({readOnly,tools});
  const changes=createChangeTracker(error=>view.reportError(error));
  let unsubscribeClipboard=null;
  let root = host;
  let status = host.ownerDocument.createElement('output');
  let alive = true;
  let focused = root.contains(root.ownerDocument.activeElement);
  let selected = null, gesture = null, editing = null, creation = null, serial = 0, groupSerial = 0;
  let multiple=false, batchRegistration=false;
  const selection=new Set(), originalMultiple=host.getAttribute('data-canvas-instance-multiple'),originalReadOnly=host.getAttribute('data-canvas-instance-readonly');
  root.toggleAttribute('data-canvas-instance-readonly',settings.readOnly);
  const owners = new Map(), undo = [], redo = [], subscribers = new Set();
  const addedTabIndex = !root.hasAttribute('tabindex');
  if (addedTabIndex) root.setAttribute('tabindex', '0');
  status.className = 'canvas-instance-status';
  status.setAttribute('data-canvas-instance-status', '');
  status.setAttribute('aria-live', 'polite');
  status.textContent = focused ? 'Canvas focused' : 'Canvas ready';
  root.append(status);
  let done = host.ownerDocument.createElement('button');
  done.type='button';done.className='canvas-instance-edit-done';done.dataset.canvasInstanceDone='';
  done.textContent='Done editing';done.hidden=true;root.append(done);

  const usable = entry => alive && entry?.alive && entry.present && root.contains(entry.element) && entry.element.isConnected;
  const clone = value => {
    const encoded = JSON.stringify(value, function(key, current) {
      const raw = this[key];
      if (current === undefined || ['function','symbol','bigint'].includes(typeof current) || (typeof current === 'number' && !Number.isFinite(current)) ||
        (raw && typeof raw === 'object' && !['[object Object]','[object Array]'].includes(Object.prototype.toString.call(raw)))) throw new TypeError('Owner snapshots must be finite JSON data.');
      return current;
    });
    if (!encoded || encoded.length > 65536 || new TextEncoder().encode(encoded).byteLength > 65536) throw new RangeError('Owner snapshot exceeds 64 KiB.');
    return JSON.parse(encoded);
  };
  const capture = entry => clone(entry.adapter.capture());
  const stack = () => [...owners.values()].sort((a,b)=>a.layer-b.layer||a.id-b.id);
  function layerPlan(command) {
    const all=stack(),before=all.filter(entry=>entry.present);
    if(!selection.size||[...selection].some(entry=>!usable(entry)||entry.locked||entry.element.parentElement!==root)||before.some(entry=>entry.present&&entry.element.parentElement!==root))return null;
    const after=[...before], chosen=entry=>selection.has(entry);
    if(command==='bring-front')after.splice(0,after.length,...before.filter(entry=>!chosen(entry)),...before.filter(chosen));
    else if(command==='send-back')after.splice(0,after.length,...before.filter(chosen),...before.filter(entry=>!chosen(entry)));
    else if(command==='bring-forward'){
      for(let i=after.length-2;i>=0;i--)if(chosen(after[i])&&!chosen(after[i+1]))[after[i],after[i+1]]=[after[i+1],after[i]];
    }else if(command==='send-backward'){
      for(let i=1;i<after.length;i++)if(chosen(after[i])&&!chosen(after[i-1]))[after[i],after[i-1]]=[after[i-1],after[i]];
    }else return null;
    const changed=after.some((entry,index)=>entry!==before[index]);
    let index=0;return {before:all,after:all.map(entry=>entry.present?after[index++]:entry),changed};
  }
  function applyLayers(entries) {
    entries.forEach((entry,index)=>{entry.layer=index;entry.element.style.setProperty('z-index',String(index+1));});
  }
  const arrangeEligible = count => alive&&!settings.readOnly&&settings.tools.arrange&&!editing&&!creation&&!gesture&&selection.size>=count&&[...selection].every(entry=>usable(entry)&&!entry.locked&&!entry.group&&typeof entry.adapter.beginMove==='function');
  const state = () => Object.freeze({ mounted: alive, focused, settings, ...changes.state(), objects: [...owners.values()].filter(entry=>entry.present).length, selection: selected?.id ?? null, selectionName:selection.size>1?`${selection.size} objects`:selected?.name??null,
    selectionIds:Object.freeze([...selection].map(entry=>entry.id)), selectionCount:selection.size, multiple,
    imageDescription:selection.size===1&&usable(selected)?selected.adapter.description?.read()??null:null,
    canDescribeImage:alive&&!settings.readOnly&&settings.tools.image&&!editing&&!creation&&!gesture&&selection.size===1&&!selected?.locked&&usable(selected)&&!!selected.adapter.description,
    imageDimensions:selection.size===1&&usable(selected)&&selected.adapter.imageSize?Object.freeze({...selected.adapter.imageSize}):null,
    paperColor:!settings.readOnly&&settings.tools.paperColor&&selection.size===1&&!selected?.locked?selected?.adapter.paperColor?.read()??null:null, canCreate:alive&&!settings.readOnly&&(settings.tools.text||settings.tools.sticky||settings.tools.image||settings.tools.pencil)&&!editing&&!gesture&&!creation&&owners.size<50, editing: !!editing, creating:!!creation,
    canDelete:alive&&!settings.readOnly&&settings.tools.delete&&!editing&&!creation&&!gesture&&selection.size>0&&[...selection].every(entry=>usable(entry)&&entry.created&&!entry.locked),
    canCopy:alive&&settings.tools.clipboard&&!editing&&!creation&&!gesture&&!!documents&&!!clipboard&&selection.size>0&&[...selection].every(entry=>usable(entry)&&!entry.locked&&typeof entry.adapter.serialize==='function'),
    canPaste:alive&&!settings.readOnly&&settings.tools.clipboard&&!editing&&!creation&&!gesture&&!!documents&&!!clipboard&&clipboard.count>0&&owners.size+clipboard.count<=50,
    canDuplicate:alive&&!settings.readOnly&&settings.tools.duplicate&&!editing&&!creation&&!gesture&&!!documents&&selection.size>0&&owners.size+selection.size<=50&&[...selection].every(entry=>usable(entry)&&!entry.locked&&typeof entry.adapter.serialize==='function'),
    canLock:alive&&!settings.readOnly&&settings.tools.lock&&!editing&&!creation&&!gesture&&selection.size>0&&[...selection].every(usable),
    selectionLocked:selection.size&&[...selection].every(entry=>entry.locked)?true:selection.size&&[...selection].every(entry=>!entry.locked)?false:null,
    canBringForward:alive&&!settings.readOnly&&settings.tools.layers&&!editing&&!creation&&!gesture&&!!layerPlan('bring-forward')?.changed,
    canSendBackward:alive&&!settings.readOnly&&settings.tools.layers&&!editing&&!creation&&!gesture&&!!layerPlan('send-backward')?.changed,
    canGroup:alive&&!settings.readOnly&&settings.tools.group&&!editing&&!creation&&!gesture&&selection.size>=2&&[...selection].every(entry=>usable(entry)&&!entry.locked&&!entry.group&&typeof entry.adapter.beginMove==='function'),
    canUngroup:alive&&!settings.readOnly&&settings.tools.group&&!editing&&!creation&&!gesture&&selection.size>0&&[...selection].every(entry=>usable(entry)&&!entry.locked)&&[...selection].some(entry=>entry.group),
    selectionGroups:new Set([...selection].map(entry=>entry.group).filter(Boolean)).size,
    canAlign:arrangeEligible(2), canDistribute:arrangeEligible(3),
    canSave:alive&&settings.tools.files&&!editing&&!creation&&!gesture&&!!documents,
    canUndo: !settings.readOnly&&settings.tools.history&&!editing && !creation && !!undo.length, canRedo: !settings.readOnly&&settings.tools.history&&!editing && !creation && !!redo.length });
  function emit() {
    if (status) status.textContent = (settings.readOnly?'Read-only. ':'')+(editing ? `Editing ${editing.entry.name}. Done or Escape finishes.` : selection.size>1?`${selection.size} objects selected${[...selection].some(entry=>entry.group)?' (grouped)':''}${[...selection].some(entry=>entry.locked)?' ('+[...selection].filter(entry=>entry.locked).length+' locked)':''}` : selected ? `${selected.name}${selected.locked?' (locked)':''} selected` : focused ? 'Canvas focused' : 'Canvas ready');
    status?.classList.toggle('canvas-instance-status--editing',!!editing);
    const snapshot = state();
    for (const listener of [...subscribers]) {
      try { listener(snapshot); } catch (error) { view.reportError(error); }
    }
  }
  function select(entry) {
    selectEntries(entry?[entry]:[]);
  }
  function expandEntries(entries) {
    const groups=new Set(entries.map(entry=>entry.group).filter(Boolean)),expanded=new Set(entries);
    if(groups.size)for(const entry of owners.values())if(usable(entry)&&groups.has(entry.group))expanded.add(entry);
    return [...expanded];
  }
  function selectEntries(entries, primary=entries[0]??null, expand=true) {
    if(expand)entries=expandEntries(entries);
    for(const entry of selection)if(!entries.includes(entry))entry.element.removeAttribute('data-canvas-instance-selected');
    selection.clear();for(const entry of entries){selection.add(entry);entry.element.setAttribute('data-canvas-instance-selected','');}
    selected=selection.has(primary)?primary:entries[0]??null;
    root?.toggleAttribute('data-canvas-instance-multiple',selection.size>1);
    emit();
  }
  function toggle(entry) {
    const members=expandEntries([entry]);
    const entries=selection.has(entry)?[...selection].filter(item=>!members.includes(item)):[...selection,...members];
    selectEntries(entries,selected);
  }
  const actionEntries=action=>(action.groupItems??action.layerItems??action.lockItems??action.presenceItems??action.items)?.map(item=>item.entry)??[action.entry];
  function record(entry, before, source='move') {
    const after = capture(entry);
    if (JSON.stringify(before) === JSON.stringify(after)) return;
    pushAction({ entry, before, after },source);
  }
  function pushAction(action, source) {
    undo.push(action);
    if (undo.length > 50) undo.shift();
    redo.length = 0;
    // Undone creations discarded by a branch must release their DOM/listeners.
    pruneAbsent();
    Object.assign(action,changes.commit(source));
  }
  function pruneAbsent() {
    for(const entry of [...owners.values()])if(!entry.present&&![...undo,...redo].some(item=>actionEntries(item).includes(entry)))entry.release();
  }
  function finish(cancel = false) {
    if (!gesture) return;
    const active = gesture; gesture = null;
    try {
      if(active.marquee){
        active.overlay?.remove();
        if(cancel)selectEntries(active.previous.filter(usable),active.primary);
        else if(!active.started)selectEntries(active.additive?active.previous.filter(usable):[],active.primary);
        return;
      }
      if(!cancel&&active.pointerId!==undefined&&!active.started)return;
      const parts=active.items??[active];
      if(cancel){for(const part of parts)if(part.entry.alive)part.entry.adapter.restore(clone(part.before));}
      else if(parts.every(part=>usable(part.entry))){
        try{
          active.session.finish?.();
          if(active.items){
            const items=parts.map(part=>({entry:part.entry,before:part.before,after:capture(part.entry)}));
            if(new TextEncoder().encode(JSON.stringify(items.map(({before,after})=>({before,after})))).byteLength>131072)throw new RangeError('Selection history exceeds 128 KiB.');
            if(items.some(item=>JSON.stringify(item.before)!==JSON.stringify(item.after)))pushAction({entry:active.entry,items},active.kind?'transform':'move');
          }else record(active.entry,active.before,active.kind?'transform':'move');
        }catch(error){for(const part of parts)if(part.entry.alive)part.entry.adapter.restore(clone(part.before));throw error;}
      }else for(const part of parts)if(part.entry.alive)part.entry.adapter.restore(clone(part.before));
    } finally {
      if (active.pointerId !== undefined && root?.hasPointerCapture(active.pointerId)) root.releasePointerCapture(active.pointerId);
      emit();
    }
  }
  function finishEdit(focus = false, keepHistory = true) {
    if (!editing) return;
    const active=editing;editing=null;
    try {
      if(active.entry.alive){active.session.finish();if(keepHistory)record(active.entry,active.before,'text');}
    } finally {
      active.entry.element?.removeAttribute('data-canvas-instance-editing');
      if(done)done.hidden=true;
      if(usable(active.entry)&&active.entry.group)select(active.entry);else emit();
      if(focus&&usable(active.entry))active.entry.element.focus({preventScroll:true});
    }
  }
  function cancelCreation() {
    if(!creation)return;
    const pending=creation;creation=null;
    try{pending.cancel();}finally{emit();}
  }
  function startEdit(entry) {
    if(creation)return false;
    if(settings.readOnly||!settings.tools.text||!usable(entry)||entry.locked||typeof entry.adapter.beginEdit!=='function')return false;
    if(editing?.entry===entry)return true;
    finish(true);finishEdit();multiple=false;selectEntries([entry],entry,false);
    const before=capture(entry),session=entry.adapter.beginEdit();
    if(!session){select(entry);return false;}
    if(!(session.editor instanceof view.HTMLElement)||!entry.element.contains(session.editor)||typeof session.finish!=='function')throw new TypeError('Owner editor must be contained and finishable.');
    editing={entry,before,session};entry.element.setAttribute('data-canvas-instance-editing','');done.hidden=false;emit();
    if(session.focus)session.focus();else session.editor.focus({preventScroll:true});
    return true;
  }
  function beginOne(entry, kind = null, point = null) {
    if (settings.readOnly||!usable(entry)||entry.locked) return null;
    const method = kind ? entry.adapter.beginTransform : entry.adapter.beginMove;
    if (typeof method !== 'function') return null;
    const before = capture(entry), session = method.call(entry.adapter,kind,point);
    if (!session) return null;
    if (kind) {
      if (typeof session.pointer !== 'function' || typeof session.step !== 'function') throw new TypeError('Owner transform needs pointer and keyboard methods.');
      return { entry, before, session, kind, dx: 0, dy: 0 };
    }
    if (typeof session.move !== 'function') return null;
    const limits = session.limits;
    if (!limits || !['left','right','top','bottom'].every(key => typeof limits[key] === 'number' && !Number.isNaN(limits[key])) || limits.left > limits.right || limits.top > limits.bottom) {
      throw new TypeError('Owner movement needs ordered screen-space limits.');
    }
    return { entry, before, session, kind: null, dx: 0, dy: 0 };
  }
  function begin(entry,kind=null,point=null) {
    if(selection.size<2)return beginOne(entry,kind,point);
    if(kind||!selection.has(entry))return null;
    const items=[...selection].map(member=>beginOne(member));
    if(items.some(item=>!item))return null;
    if(new TextEncoder().encode(JSON.stringify(items.map(item=>item.before))).byteLength>65536)return null;
    const limits={left:Math.max(...items.map(item=>item.session.limits.left)),right:Math.min(...items.map(item=>item.session.limits.right)),top:Math.max(...items.map(item=>item.session.limits.top)),bottom:Math.min(...items.map(item=>item.session.limits.bottom))};
    if(limits.left>0||limits.right<0||limits.top>0||limits.bottom<0)return null;
    return {entry,items,kind:null,dx:0,dy:0,session:{limits,
      move(dx,dy){for(const item of items)item.session.move(dx,dy);},
      finish(){for(const item of items)item.session.finish?.();},
    }};
  }
  function move(active, dx, dy) {
    const limits = active.session.limits;
    active.session.move(Math.max(limits.left, Math.min(limits.right, dx)), Math.max(limits.top, Math.min(limits.bottom, dy)));
  }
  const entryAt = target => {
    for (let element = target; element && element !== root; element = element.parentElement) {
      if (owners.has(element)) return owners.get(element);
    }
    return null;
  };
  const handleAt = target => {
    const handle = target?.closest?.('[data-canvas-instance-handle]');
    const entry = handle && entryAt(handle);
    return entry && handle.parentElement === entry.element && typeof entry.adapter.beginTransform === 'function' ? handle : null;
  };
  const native = target => {
    const control = target?.closest?.(nativeControl);
    return control && control !== handleAt(target);
  };
  function onFocus(event) {
    focused = true;
    const entry = entryAt(event.target);
    if (entry && !native(event.target)&&!selection.has(entry)&&!multiple) select(entry);
    emit();
  }
  function onBlur(event) {
    focused = root.contains(event.relatedTarget);
    if(editing&&!editing.session.editor.contains(event.relatedTarget)&&event.relatedTarget!==done)finishEdit();
    if (!focused) {cancelCreation();finish(gesture?.pointerId !== undefined);}
    emit();
  }
  function onPointer(event) {
    if(creation)return;
    if(editing){
      if(done.contains(event.target)){event.preventDefault();return;}
      if(editing.session.editor.contains(event.target))return;
      finishEdit();
    }
    if (event.button !== 0 || event.pointerType === 'touch' || !event.isPrimary || native(event.target)) return;
    finish(true);
    const entry = entryAt(event.target);
    if(entry&&!handleAt(event.target)&&(event.shiftKey||multiple)){
      toggle(entry);(selection.has(entry)?entry.element:root).focus({preventScroll:true});event.preventDefault();return;
    }
    if(!entry){
      if(event.target!==root)return;
      const rect=root.getBoundingClientRect(),left=rect.left+root.clientLeft,top=rect.top+root.clientTop;
      const bounds={left,top,right:left+root.clientWidth,bottom:top+root.clientHeight};
      gesture={marquee:true,pointerId:event.pointerId,x:Math.max(bounds.left,Math.min(bounds.right,event.clientX)),y:Math.max(bounds.top,Math.min(bounds.bottom,event.clientY)),started:false,bounds,previous:[...selection],primary:selected,additive:event.shiftKey,candidates:[...owners.values()].filter(usable).map(entry=>({entry,rect:entry.element.getBoundingClientRect().toJSON()}))};
      root.focus({preventScroll:true});
      try{root.setPointerCapture(event.pointerId);}catch{finish(true);return;}
      event.preventDefault();emit();return;
    }
    if(!selection.has(entry))select(entry);
    const handle = handleAt(event.target);
    (handle || entry.element).focus({ preventScroll: true });
    const active = begin(entry,handle?.dataset.canvasInstanceHandle || null,{ clientX:event.clientX,clientY:event.clientY });
    if (!active) return;
    Object.assign(active, { pointerId: event.pointerId, x: event.clientX, y: event.clientY, started: false });
    gesture = active;
    root.setPointerCapture(event.pointerId);
    event.preventDefault();
  }
  function onMove(event) {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    if(gesture.marquee){
      const active=gesture,b=active.bounds;
      const x=Math.max(b.left,Math.min(b.right,event.clientX)),y=Math.max(b.top,Math.min(b.bottom,event.clientY));
      if(!active.started&&Math.hypot(x-active.x,y-active.y)<4)return;
      active.started=true;
      const left=Math.min(active.x,x),top=Math.min(active.y,y),right=Math.max(active.x,x),bottom=Math.max(active.y,y);
      if(!active.overlay){active.overlay=root.ownerDocument.createElement('div');active.overlay.className='canvas-instance-marquee';active.overlay.setAttribute('aria-hidden','true');root.append(active.overlay);}
      Object.assign(active.overlay.style,{left:left-b.left+'px',top:top-b.top+'px',width:right-left+'px',height:bottom-top+'px'});
      const hits=active.candidates.filter(({entry,rect:r})=>usable(entry)&&r.width>0&&r.height>0&&r.right>=left&&r.left<=right&&r.bottom>=top&&r.top<=bottom).map(item=>item.entry);
      const entries=expandEntries([...new Set([...(active.additive?active.previous.filter(usable):[]),...hits])]);
      if(entries.length!==selection.size||entries.some(entry=>!selection.has(entry)))selectEntries(entries);
      event.preventDefault();return;
    }
    if (!(gesture.items??[gesture]).every(item=>usable(item.entry))) { finish(true); return; }
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    if (!gesture.kind && !gesture.started && Math.hypot(dx,dy) < 4) return;
    gesture.started = true;
    try{if (gesture.kind) gesture.session.pointer(dx,dy,event.shiftKey);else move(gesture, dx, dy);}
    catch(error){finish(true);view.reportError(error);}
  }
  function onPointerEnd(event) {
    if (event.pointerId === gesture?.pointerId) finish(event.type !== 'pointerup');
  }
  function onKey(event) {
    if (event.defaultPrevented || event.isComposing || event.keyCode === 229) return;
    if(creation)return;
    if(gesture?.marquee){
      if(event.key==='Escape'||event.key==='Tab'){finish(true);if(event.key==='Escape')event.preventDefault();}
      else if(!['Shift','Control','Meta','Alt'].includes(event.key))event.preventDefault();
      return;
    }
    if(editing){
      if(event.key==='Escape'||(event.key==='Enter'&&(event.ctrlKey||event.metaKey))){event.preventDefault();finishEdit(true);}
      return;
    }
    if(native(event.target))return;
    if(clipboard&&(event.ctrlKey||event.metaKey)&&!event.altKey&&!event.shiftKey&&['c','v'].includes(event.key.toLowerCase())){
      event.preventDefault();if(!event.repeat){
        const command=event.key.toLowerCase()==='c'?'copy':'paste';
        try{const response=execute(command);if(!response.ok)status.textContent=response.reason==='bounds'?'The complete selection cannot fit within this canvas.':command==='copy'?'This selection cannot be copied.':'No paste is available, or the canvas object limit would be exceeded.';}catch(error){status.textContent='Could not '+command+': '+error.message;}
      }return;
    }
    if((event.ctrlKey||event.metaKey)&&!event.altKey&&event.key.toLowerCase()==='g'){
      event.preventDefault();if(!event.repeat)execute(event.shiftKey?'ungroup':'group');return;
    }
    if((event.ctrlKey||event.metaKey)&&!event.altKey&&!event.shiftKey&&event.key.toLowerCase()==='a'){
      event.preventDefault();if(!event.repeat)execute('select-all');return;
    }
    if(!event.shiftKey&&!event.altKey&&((!event.ctrlKey&&!event.metaKey&&['Delete','Backspace'].includes(event.key))||((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='d'))){
      const command=['Delete','Backspace'].includes(event.key)?'delete':'duplicate';event.preventDefault();if(!event.repeat)execute(command);return;
    }
    const entry = entryAt(event.target);
    if(entry&&event.key==='Enter'&&event.shiftKey&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.repeat){if(gesture?.pointerId!==undefined)return;finish();toggle(entry);event.preventDefault();return;}
    if (entry&&!selection.has(entry)&&!multiple) select(entry);
    if(entry&&!handleAt(event.target)&&!event.repeat&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.shiftKey&&['Enter','F2'].includes(event.key)){
      if(startEdit(entry))event.preventDefault();return;
    }
    if (event.key === 'Escape') {
      if (gesture) finish(true); else {multiple=false;select(null);}
      event.preventDefault();return;
    }
    if ((event.ctrlKey || event.metaKey) && !event.altKey && ['z','y'].includes(event.key.toLowerCase())) {
      event.preventDefault();
      if (!event.repeat) execute(event.key.toLowerCase() === 'y' || event.shiftKey ? 'redo' : 'undo');
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const delta = { ArrowLeft: [-1,0], ArrowRight: [1,0], ArrowUp: [0,-1], ArrowDown: [0,1] }[event.key];
    if (!delta || !selected || gesture?.pointerId !== undefined || (entry&&!selection.has(entry))) return;
    const kind = handleAt(event.target)?.dataset.canvasInstanceHandle || null;
    if (gesture && (gesture.key !== event.key || gesture.kind !== kind || gesture.entry !== selected)) finish();
    if (!gesture) { gesture = begin(selected,kind); if (!gesture) return; gesture.key = event.key; }
    event.preventDefault();
    try{
      if (kind) { gesture.session.step(delta[0] || delta[1],event.shiftKey);return; }
      const step = event.shiftKey ? 10 : 1;
      gesture.dx += delta[0] * step; gesture.dy += delta[1] * step;
      move(gesture, gesture.dx, gesture.dy);
    }catch(error){finish(true);view.reportError(error);}
  }
  function onKeyUp(event) { if (gesture?.key === event.key) finish(); }
  function onContext() { cancelCreation();finish(true); }
  function onDoubleClick(event) {
    if(event.shiftKey||multiple)return;
    // Pointer capture routes clicks to the host; recover the visible object.
    const target=event.target===root?root.ownerDocument.elementFromPoint(event.clientX,event.clientY):event.target;
    if(!native(target)&&!handleAt(target)&&startEdit(entryAt(target)))event.preventDefault();
  }
  function onClick(event) { if(editing&&done.contains(event.target))finishEdit(true); }
  function arrange(command) {
    const distribute=command.startsWith('distribute-'),horizontal=['align-left','align-center','align-right','distribute-horizontal'].includes(command);
    if(!arrangeEligible(distribute?3:2))return result(false,'unsupported');
    const items=[...selection].map(entry=>beginOne(entry));
    if(items.some(item=>!item))return result(false,'unsupported');
    if(new TextEncoder().encode(JSON.stringify(items.map(item=>item.before))).byteLength>65536)return result(false,'resource-limit');
    // All owner sessions, bounds and visible geometry are read before any write.
    for(const item of items){item.rect=item.entry.element.getBoundingClientRect();if(!['left','right','top','bottom','width','height'].every(key=>Number.isFinite(item.rect[key]))||item.rect.width<=0||item.rect.height<=0)return result(false,'unsupported');}
    const start=horizontal?'left':'top',end=horizontal?'right':'bottom',size=horizontal?'width':'height';
    const first=Math.min(...items.map(item=>item.rect[start])),last=Math.max(...items.map(item=>item.rect[end]));
    if(distribute){
      const sorted=[...items].sort((a,b)=>a.rect[start]-b.rect[start]);
      const gap=(last-first-items.reduce((sum,item)=>sum+item.rect[size],0))/(items.length-1);
      if(gap<0)return result(false,'overlap');
      let position=first;for(const item of sorted){item.delta=position-item.rect[start];position+=item.rect[size]+gap;}
    }else for(const item of items){
      item.delta=['align-left','align-top'].includes(command)?first-item.rect[start]:['align-right','align-bottom'].includes(command)?last-item.rect[end]:(first+last-item.rect[start]-item.rect[end])/2;
    }
    for(const item of items){
      item.dx=horizontal?item.delta:0;item.dy=horizontal?0:item.delta;
      const l=item.session.limits;
      if(item.dx<l.left-1e-6||item.dx>l.right+1e-6||item.dy<l.top-1e-6||item.dy>l.bottom+1e-6)return result(false,'bounds');
    }
    if(items.every(item=>Math.abs(item.delta)<.01)){emit();return result(true);}
    try{
      for(const item of items)item.session.move(item.dx,item.dy);
      for(const item of items)item.session.finish?.();
      const snapshots=items.map(item=>({entry:item.entry,before:item.before,after:capture(item.entry)}));
      if(new TextEncoder().encode(JSON.stringify(snapshots.map(({before,after})=>({before,after})))).byteLength>131072)throw new RangeError('Selection history exceeds 128 KiB.');
      if(snapshots.some(item=>JSON.stringify(item.before)!==JSON.stringify(item.after)))pushAction({entry:selected,items:snapshots},command);
    }catch(error){for(const item of items)if(item.entry.alive)item.entry.adapter.restore(clone(item.before));throw error;}
    emit();status.textContent=distribute?'Selection spaced evenly.':'Selection aligned.';return result(true);
  }
  function execute(command, value) {
    if (!alive) return result(false,'destroyed');
    if (command === 'cancel') { cancelCreation();finishEdit();finish(true);return result(true); }
    if (command === 'finish-edit') { finishEdit(true);return result(true); }
    if(settings.readOnly&&!['cancel','finish-edit','contain','select-all','copy'].includes(command))return result(false,'read-only');
    const feature=['copy','paste'].includes(command)?'clipboard':['group','ungroup'].includes(command)?'group':command.startsWith('align-')||command.startsWith('distribute-')?'arrange':['bring-forward','bring-front','send-backward','send-back'].includes(command)?'layers':['undo','redo'].includes(command)?'history':command==='image-description'?'image':command==='paper-color'?'paperColor':command==='edit'?'text':['lock','delete','duplicate'].includes(command)?command:null;
    if(feature&&!settings.tools[feature])return result(false,'disabled');
    if (command === 'edit') {const ok=startEdit(selected);return result(ok,ok?null:'unsupported');}
    if(editing||creation)return result(false,'busy');
    if (gesture) return result(false,'busy');
    if(command==='group'||command==='ungroup'){
      if(!(command==='group'?state().canGroup:state().canUngroup)||command==='group'&&!begin(selected))return result(false,'unsupported');
      const after=command==='group'?++groupSerial:null,groupItems=[...selection].filter(entry=>command==='group'||entry.group).map(entry=>({entry,before:entry.group,after}));
      for(const item of groupItems)item.entry.group=after;
      pushAction({groupItems,selection:[...selection]},command);selectEntries([...selection]);return result(true);
    }
    if(['align-left','align-center','align-right','align-top','align-middle','align-bottom','distribute-horizontal','distribute-vertical'].includes(command))return arrange(command);
    if(['bring-forward','send-backward','bring-front','send-back'].includes(command)){
      const plan=layerPlan(command);if(!plan)return result(false,'unsupported');
      if(plan.changed){
        const layerItems=plan.before.map(entry=>({entry,before:entry.layer,beforeZ:entry.element.style.getPropertyValue('z-index'),beforePriority:entry.element.style.getPropertyPriority('z-index'),after:plan.after.indexOf(entry)}));
        applyLayers(plan.after);pushAction({layerItems,selection:[...selection]},command);
      }
      emit();status.textContent=plan.changed?'Selection layer order changed.':'Selection is already at this layer boundary.';return result(true);
    }
    if(command==='lock'){
      if(!state().canLock||value!==undefined&&typeof value!=='boolean')return result(false,'unsupported');
      const after=value??(state().selectionLocked!==true),items=[...selection].map(entry=>({entry,before:entry.locked,after}));
      if(items.some(item=>item.before!==item.after)){for(const item of items)applyLock(item.entry,after);pushAction({lockItems:items},'lock');}
      emit();return result(true);
    }
    if(command==='delete'){
      if(!state().canDelete)return result(false,'unsupported');
      const entries=[...selection];applyPresence(entries.map(entry=>({entry,present:false})));
      pushAction({presenceItems:entries.map(entry=>({entry,before:true,after:false})),beforeSelection:entries,afterSelection:[]},'delete');
      select(null);root.focus({preventScroll:true});status.textContent=`${entries.length} object${entries.length===1?'':'s'} deleted. Undo restores the selection.`;return result(true);
    }
    if(command==='copy')return copySelection();
    if(command==='paste')return pasteSelection();
    if(command==='duplicate')return duplicate();
    if(command==='select-all'){
      selectEntries([...owners.values()].filter(usable));return result(true);
    }
    if(command==='contain'){
      for(const entry of owners.values())if(usable(entry))entry.adapter.restore(capture(entry));
      emit();return result(true);
    }
    if(command==='image-description'){
      if(selection.size!==1||!usable(selected)||!selected.adapter.description||selected.locked)return result(false,'unsupported');
      const before=capture(selected);if(!selected.adapter.description.set(value))return result(false,'invalid-description');record(selected,before,'image-description');emit();return result(true);
    }
    if(command==='paper-color'){
      if(selection.size!==1||!usable(selected)||!selected.adapter.paperColor||selected.locked)return result(false,'unsupported');
      const before=capture(selected);
      if(!selected.adapter.paperColor.set(value))return result(false,'invalid-color');
      record(selected,before,'paper-color');emit();return result(true);
    }
    if (command === 'move') {
      if (!Number.isFinite(value?.dx) || !Number.isFinite(value?.dy)) return result(false,'invalid-delta');
      const active = begin(selected);
      if (!active) return result(false,'unsupported');
      gesture = active;
      try { move(active, value.dx, value.dy); finish(); } catch (error) { finish(true);throw error; }
      return result(true);
    }
    if (command !== 'undo' && command !== 'redo') return result(false,'unsupported');
    const source = command === 'undo' ? undo : redo, destination = command === 'undo' ? redo : undo;
    while (source.length && actionEntries(source.at(-1)).some(entry=>!entry.alive||(!source.at(-1).presence&&!source.at(-1).presenceItems&&!source.at(-1).layerItems&&!source.at(-1).groupItems&&!usable(entry)))) source.pop();
    if (!source.length) { emit();return result(false,'empty-history'); }
    const action = source.at(-1);
    if(action.groupItems){
      for(const item of action.groupItems)item.entry.group=command==='undo'?item.before:item.after;
      source.pop();destination.push(action);changes.restore(command,command==='undo'?action.beforeToken:action.afterToken);selectEntries(action.selection.filter(usable));return result(true);
    }
    if(action.layerItems){
      for(const item of action.layerItems){item.entry.layer=command==='undo'?item.before:item.after;if(command==='undo'){if(item.beforeZ)item.entry.element.style.setProperty('z-index',item.beforeZ,item.beforePriority);else item.entry.element.style.removeProperty('z-index');}else item.entry.element.style.setProperty('z-index',String(item.entry.layer+1));}
      source.pop();destination.push(action);changes.restore(command,command==='undo'?action.beforeToken:action.afterToken);selectEntries(action.selection.filter(usable));return result(true);
    }
    if(action.lockItems){
      for(const item of action.lockItems)applyLock(item.entry,command==='undo'?item.before:item.after);
      source.pop();destination.push(action);changes.restore(command,command==='undo'?action.beforeToken:action.afterToken);selectEntries(action.lockItems.map(item=>item.entry));return result(true);
    }
    if(action.presenceItems){
      const returnFocus=root.contains(root.ownerDocument.activeElement)&&!native(root.ownerDocument.activeElement);
      applyPresence(action.presenceItems.map(item=>({entry:item.entry,present:command==='undo'?item.before:item.after})));
      source.pop();destination.push(action);changes.restore(command,command==='undo'?action.beforeToken:action.afterToken);selectEntries((command==='undo'?action.beforeSelection:action.afterSelection).filter(usable));
      if(returnFocus)(selected?.element??root).focus({preventScroll:true});return result(true);
    }
    if(action.items){
      const rollback=action.items.map(item=>({entry:item.entry,state:capture(item.entry)}));
      try{for(const item of action.items)item.entry.adapter.restore(clone(command==='undo'?item.before:item.after));}
      catch(error){for(const item of rollback)item.entry.adapter.restore(item.state);throw error;}
      source.pop();destination.push(action);changes.restore(command,command==='undo'?action.beforeToken:action.afterToken);selectEntries(action.items.map(item=>item.entry),action.entry);return result(true);
    }
    const valueToRestore=command==='undo'?action.before:action.after;
    if(action.presence){
      const returnFocus=root.contains(root.ownerDocument.activeElement)&&!native(root.ownerDocument.activeElement);
      action.entry.adapter.setPresent(valueToRestore);action.entry.present=valueToRestore;
      if(valueToRestore)root.append(status,done);
      select(valueToRestore?action.entry:null);
      if(returnFocus)(valueToRestore?action.entry.element:root).focus({preventScroll:true});
    }else action.entry.adapter.restore(clone(valueToRestore));
    source.pop();destination.push(action);changes.restore(command,command==='undo'?action.beforeToken:action.afterToken);if(!action.presence)select(action.entry);emit();return result(true);
  }
  function applyLock(entry,locked){entry.locked=locked;entry.element.toggleAttribute('data-canvas-instance-locked',locked);}
  function applyPresence(items) {
    const rollback=items.map(({entry})=>({entry,present:entry.present}));
    // Cache all positions before detaching any member; preserve stacking/Tab order.
    for(const {entry,present}of items)if(!present&&entry.present&&entry.element.parentElement===root)entry.presenceIndex=[...root.children].indexOf(entry.element);
    const restoreOrder=rows=>{
      const shown=rows.filter(({entry,present})=>present&&entry.element.parentElement===root&&Number.isInteger(entry.presenceIndex)).sort((a,b)=>a.entry.presenceIndex-b.entry.presenceIndex);
      for(const {entry}of shown)entry.element.remove();
      for(const {entry}of shown)root.insertBefore(entry.element,root.children[entry.presenceIndex]??null);
    };
    try{for(const {entry,present}of items){entry.adapter.setPresent(present);entry.present=present;}restoreOrder(items);}
    catch(error){for(const {entry,present}of rollback){entry.adapter.setPresent(present);entry.present=present;}restoreOrder(rollback);throw error;}
    root.append(status,done);
  }
  function copySelection() {
    if(!state().canCopy)return result(false,'unsupported');
    const area=root.getBoundingClientRect(),groups=new Map(),entries=stack().filter(entry=>selection.has(entry));
    const objects=entries.map((entry,index)=>{
      if(entry.group&&!groups.has(entry.group))groups.set(entry.group,groups.size+1);
      const data={...documents.validate(clone(entry.adapter.serialize())),locked:false,layer:index,...(entry.group?{group:groups.get(entry.group)}:{})};
      if(!entry.group)delete data.group;
      const r=entry.element.getBoundingClientRect();return {data,bounds:{left:r.left-area.left-root.clientLeft,top:r.top-area.top-root.clientTop,width:r.width,height:r.height}};
    });
    clipboard.write(validateTransfer({format:'dmf-canvas-clipboard',version:1,objects}));
    status.textContent=`${objects.length} object${objects.length===1?'':'s'} copied for this page.`;return result(true);
  }
  function pasteSelection() {
    if(!state().canPaste)return result(false,'unsupported');
    const payload=validateTransfer(clipboard.read()),objects=payload.objects;
    if(owners.size+objects.length>50)return result(false,'resource-limit');
    const records=objects.map(item=>documents.validate(item.data)),counts=new Map();
    for(const record of records){if(record.locked)throw new TypeError('Locked objects cannot be pasted.');if(record.group!==undefined)counts.set(record.group,(counts.get(record.group)??0)+1);}
    if([...counts.values()].some(count=>count<2))throw new TypeError('Clipboard groups need two members.');
    const left=Math.max(...objects.map(({bounds:b})=>8-b.left)),right=Math.min(...objects.map(({bounds:b})=>root.clientWidth-8-b.left-b.width));
    const top=Math.max(...objects.map(({bounds:b})=>8-b.top)),bottom=Math.min(...objects.map(({bounds:b})=>root.clientHeight-32-b.top-b.height));
    if(left>right||top>bottom)return result(false,'bounds');
    const dx=Math.max(left,Math.min(24,right)),dy=Math.max(top,Math.min(24,bottom));
    const beforeSelection=[...selection],allocated=[],entries=[];
    try{
      for(const record of records)allocated.push(documents.create(root,{...record,layout:{...record.layout,left:record.layout.left+dx,top:record.layout.top+dy}}));
      const area=root.getBoundingClientRect();
      if(allocated.some((item,index)=>{const r=item.element.getBoundingClientRect(),b=objects[index].bounds;return Math.abs(r.left-area.left-root.clientLeft-b.left-dx)>.75||Math.abs(r.top-area.top-root.clientTop-b.top-dy)>.75||Math.abs(r.width-b.width)>.75||Math.abs(r.height-b.height)>.75;})){
        for(const item of allocated)item.owner.dispose();return result(false,'bounds');
      }
      batchRegistration=true;
      for(const item of allocated){instance.register(item.element,item.owner,{created:true});entries.push(owners.get(item.element));}
      const groups=new Map();records.forEach((record,index)=>{if(record.group!==undefined){if(!groups.has(record.group))groups.set(record.group,++groupSerial);entries[index].group=groups.get(record.group);}});
      pushAction({presenceItems:entries.map(entry=>({entry,before:false,after:true})),beforeSelection,afterSelection:entries},'paste');
      selectEntries(entries);entries[0].element.focus({preventScroll:true});status.textContent=`${entries.length} object${entries.length===1?'':'s'} pasted.`;return result(true);
    }catch(error){const registered=new Set(entries.map(entry=>entry.element));for(const entry of entries)entry.release();for(const item of allocated)if(!registered.has(item.element))item.owner.dispose();throw error;}
    finally{batchRegistration=false;}
  }
  function duplicate() {
    if(!state().canDuplicate)return result(false,'unsupported');
    const beforeSelection=[...selection], allocated=[],entries=[];
    try{
      const records=beforeSelection.map(entry=>documents.validate(clone(entry.adapter.serialize())));
      if(new TextEncoder().encode(JSON.stringify(records)).byteLength>131072)return result(false,'resource-limit');
      for(const record of records)allocated.push(documents.create(root,record));
      const moves=allocated.map(item=>item.owner.beginMove());
      if(moves.some(item=>!item))throw new TypeError('Copy needs movement.');
      const left=Math.max(...moves.map(item=>item.limits.left)),right=Math.min(...moves.map(item=>item.limits.right)),top=Math.max(...moves.map(item=>item.limits.top)),bottom=Math.min(...moves.map(item=>item.limits.bottom));
      if(left>right||top>bottom)throw new RangeError('Copies have no shared movement bounds.');
      const dx=Math.max(left,Math.min(24,right)),dy=Math.max(top,Math.min(24,bottom));
      for(const move of moves){move.move(dx,dy);move.finish?.();}
      batchRegistration=true;
      for(const item of allocated){instance.register(item.element,item.owner,{created:true});entries.push(owners.get(item.element));}
      batchRegistration=false;
      const groups=new Map();
      beforeSelection.forEach((source,index)=>{if(source.group){if(!groups.has(source.group))groups.set(source.group,++groupSerial);entries[index].group=groups.get(source.group);}});
      pushAction({presenceItems:entries.map(entry=>({entry,before:false,after:true})),beforeSelection,afterSelection:entries},'duplicate');
      selectEntries(entries);entries[0].element.focus({preventScroll:true});status.textContent=`${entries.length} object${entries.length===1?'':'s'} duplicated.`;return result(true);
    }catch(error){for(const entry of entries)entry.release();for(const item of allocated)if(!owners.has(item.element))item.owner.dispose();throw error;}
    finally{batchRegistration=false;}
  }
  function saveDocument() {
    if(!state().canSave)throw new Error('Canvas document unavailable or busy.');
    const document={format:'dmf-canvas',version:1,originals:[],objects:[]};
    const layers=stack().filter(entry=>entry.present),groups=new Map();
    for(const entry of layers)if(entry.group&&layers.filter(item=>item.group===entry.group).length>=2&&!groups.has(entry.group))groups.set(entry.group,groups.size+1);
    for(const entry of owners.values())if(entry.present){
      if(typeof entry.adapter.serialize!=='function')throw new TypeError('Owner cannot be saved.');
      const data={...documents.validate(clone(entry.adapter.serialize())),locked:entry.locked,layer:layers.indexOf(entry),...(groups.has(entry.group)?{group:groups.get(entry.group)}:{})};
      if(entry.created)document.objects.push(data);else document.originals.push({id:entry.id,data});
    }
    const json=JSON.stringify(document);if(new TextEncoder().encode(json).byteLength>1048576)throw new RangeError('Board file exceeds 1 MiB.');
    return JSON.parse(json);
  }
  function loadDocument(document) {
    if(!alive)return result(false,'destroyed');
    if(settings.readOnly)return result(false,'read-only');
    if(!settings.tools.files)return result(false,'disabled');
    if(!state().canSave)return result(false,'busy');
    // Validate the complete envelope before allocating or changing live owners.
    const json=JSON.stringify(document);if(!json||new TextEncoder().encode(json).byteLength>1048576)throw new RangeError('Board file exceeds 1 MiB.');
    const value=JSON.parse(json),originals=[...owners.values()].filter(entry=>!entry.created);
    if(value?.format!=='dmf-canvas'||value.version!==1||!Array.isArray(value.originals)||!Array.isArray(value.objects)||value.originals.length!==originals.length||value.objects.length+originals.length>50)throw new TypeError('Unsupported board file.');
    const ids=new Set();
    const plans=value.originals.map(item=>{
      const entry=originals.find(entry=>entry.id===item.id);if(!entry||ids.has(item.id))throw new TypeError('Board originals do not match this canvas.');ids.add(item.id);
      const data=documents.validate(item.data),own=entry.adapter.serialize?.();if(!own||own.type!==data.type)throw new TypeError('Board owner type mismatch.');return {entry,data,before:capture(entry)};
    });
    const records=value.objects.map(item=>documents.validate(item)),allocated=[];
    const groupCounts=new Map();
    for(const data of [...plans.map(plan=>plan.data),...records])if(data.group!==undefined)groupCounts.set(data.group,(groupCounts.get(data.group)??0)+1);
    if([...groupCounts.values()].some(count=>count<2))throw new TypeError('Board groups need at least two members.');
    const layerValues=[...plans.map(plan=>plan.data.layer),...records.map(record=>record.layer)];
    const hasLayers=layerValues.some(layer=>layer!==undefined);
    if(hasLayers&&(layerValues.some(layer=>layer===undefined)||new Set(layerValues).size!==layerValues.length||layerValues.some(layer=>layer>=layerValues.length)))throw new TypeError('Invalid board layer order.');
    try{
      for(const record of records)allocated.push(documents.create(root,record));
      for(const plan of plans)plan.entry.adapter.restore(clone(plan.data.state));
    }catch(error){for(const item of allocated)item.owner.dispose();for(const plan of plans)plan.entry.adapter.restore(plan.before);throw error;}
    for(const plan of plans)applyLock(plan.entry,plan.data.locked??false);
    const returnFocus=root.contains(root.ownerDocument.activeElement)&&!native(root.ownerDocument.activeElement);
    select(null);for(const entry of [...owners.values()])if(entry.created)entry.release();undo.length=redo.length=0;
    batchRegistration=true;
    try{for(const [index,item]of allocated.entries())instance.register(item.element,item.owner,{created:true,locked:records[index].locked??false});}finally{batchRegistration=false;}
    const loaded=[...plans.map(plan=>({entry:plan.entry,layer:plan.data.layer})),...allocated.map((item,index)=>({entry:owners.get(item.element),layer:records[index].layer}))];
    const groups=new Map();
    for(const item of [...plans,...records.map((data,index)=>({entry:owners.get(allocated[index].element),data}))]){
      const group=item.data.group;if(group!==undefined&&!groups.has(group))groups.set(group,++groupSerial);item.entry.group=group===undefined?null:groups.get(group);
    }
    applyLayers((hasLayers?loaded.sort((a,b)=>a.layer-b.layer):loaded).map(item=>item.entry));
    multiple=false;changes.open();emit();if(returnFocus)root.focus({preventScroll:true});return result(true);
  }
  const listeners = { focusin: onFocus, focusout: onBlur, pointerdown: onPointer, pointermove: onMove,
    pointerup: onPointerEnd, pointercancel: onPointerEnd, lostpointercapture: onPointerEnd, keydown: onKey, keyup: onKeyUp, contextmenu: onContext, dblclick: onDoubleClick, click: onClick };
  for (const [type,listener] of Object.entries(listeners)) root.addEventListener(type,listener);
  emit();
  const instance = Object.freeze({
    getState: state,
    subscribeChanges(listener) { return changes.subscribe(listener); },
    markSaved(revision=changes.state().revision) {
      if(!alive)return result(false,'destroyed');
      if(editing||gesture||creation)return result(false,'busy');
      if(!changes.markSaved(revision))return result(false,'stale-revision');
      emit();return result(true);
    },
    configure(patch) {
      if(!alive)return result(false,'destroyed');
      const next=resolveSettings(patch,settings);
      if(JSON.stringify(next)===JSON.stringify(settings))return result(true);
      cancelCreation();finish(true);finishEdit();settings=next;
      root.toggleAttribute('data-canvas-instance-readonly',settings.readOnly);emit();return result(true);
    },
    saveDocument,
    loadDocument,
    subscribe(listener) {
      if (!alive || typeof listener !== 'function' || subscribers.size >= 50) throw new Error('Canvas subscription unavailable.');
      subscribers.add(listener);
      return () => subscribers.delete(listener);
    },
    select(element) {
      if (!alive||creation) return false;
      const entry = element === null ? null : owners.get(element);
      if (element !== null && !usable(entry)) return false;
      finishEdit();finish(true);select(entry);return true;
    },
    selectMany(elements) {
      if(!alive||creation||!Array.isArray(elements)||elements.length>50||new Set(elements).size!==elements.length)return false;
      const entries=elements.map(element=>owners.get(element));if(entries.some(entry=>!usable(entry)))return false;
      finishEdit();finish(true);selectEntries(entries);return true;
    },
    setMultiple(value) {
      if(!alive||creation||editing||typeof value!=='boolean')return false;
      finish(true);multiple=value;emit();return true;
    },
    execute,
    beginCreation(cancel,kind='sticky') {
      if(!['sticky','pencil','text'].includes(kind)||!settings.tools[kind]||!state().canCreate||typeof cancel!=='function')return null;
      const pending={cancel};creation=pending;emit();
      return Object.freeze({
        cancel(){if(creation===pending)cancelCreation();},
        commit(element,adapter){
          if(!alive||creation!==pending)return null;
          creation=null;
          try{return instance.register(element,adapter,{created:true});}finally{emit();}
        },
      });
    },
    register(element, adapter, { created = false, locked = false } = {}) {
      if (!alive) throw new Error('Canvas is destroyed.');
      if(typeof locked!=='boolean')throw new TypeError('Lock state must be boolean.');
      if(creation)throw new Error('Canvas creation is busy.');
      if (!(element instanceof view.HTMLElement) || element === root || !root.contains(element) || registrations.has(element) || owners.size >= 50) throw new Error('Canvas registration unavailable.');
      if ([...owners.keys()].some(other => other.contains(element) || element.contains(other))) throw new Error('Canvas objects must not overlap in the DOM.');
      if (!adapter || !['capture','restore','dispose'].every(key => typeof adapter[key] === 'function')) throw new TypeError('Canvas owner needs capture, restore and dispose.');
      if(created&&(settings.readOnly||editing||gesture||typeof adapter.setPresent!=='function'))throw new Error('Created objects need idle canvas and owner presence.');
      clone(adapter.capture());
      // Keep Done after all objects in native Tab order, including new paper.
      root.append(status,done);
      let entry = { id: ++serial, element, adapter, alive: true, present:true, created, locked, group:null, name: String(adapter.name || 'Text').slice(0,100),
        layer:created?Math.max(-1,...[...owners.values()].map(entry=>entry.layer))+1:Number.parseInt(view.getComputedStyle(element).zIndex)||0,
        zIndex:element.style.getPropertyValue('z-index'),zPriority:element.style.getPropertyPriority('z-index'),lockedAttribute:element.getAttribute('data-canvas-instance-locked'),tab: element.getAttribute('tabindex'), selectedAttribute: element.getAttribute('data-canvas-instance-selected'), editingAttribute: element.getAttribute('data-canvas-instance-editing') };
      if (entry.tab === null) element.setAttribute('tabindex','0');
      owners.set(element,entry);registrations.set(element,entry);applyLock(entry,locked);
      if(created)element.style.setProperty('z-index',String(entry.layer+1));
      const dispose = () => {
        if (!entry?.alive) return;
        const current = entry;entry = null;
        try { if(gesture?.marquee)finish(true);if(editing?.entry===current)finishEdit(false,false);if ((gesture?.items??(gesture?[gesture]:[])).some(item=>item.entry===current)) finish(true); }
        finally {
          current.alive=false;
          if (selection.has(current)) selectEntries([...selection].filter(entry=>entry!==current));
          current.alive = false;owners.delete(current.element);
          const remaining=[...owners.values()].filter(entry=>entry.group&&entry.group===current.group);if(remaining.length===1)remaining[0].group=null;registrations.delete(current.element);
          for (const history of [undo,redo]) for (let index=history.length-1;index>=0;index--) if (actionEntries(history[index]).includes(current)) history.splice(index,1);
          if(current.zIndex)current.element.style.setProperty('z-index',current.zIndex,current.zPriority);else current.element.style.removeProperty('z-index');
          if(current.lockedAttribute===null)current.element.removeAttribute('data-canvas-instance-locked');else current.element.setAttribute('data-canvas-instance-locked',current.lockedAttribute);
          if (current.tab === null && current.element.getAttribute('tabindex') === '0') current.element.removeAttribute('tabindex');
          if (current.selectedAttribute === null) current.element.removeAttribute('data-canvas-instance-selected');
          else current.element.setAttribute('data-canvas-instance-selected',current.selectedAttribute);
          if(current.editingAttribute===null)current.element.removeAttribute('data-canvas-instance-editing');else current.element.setAttribute('data-canvas-instance-editing',current.editingAttribute);
          try { current.adapter.dispose(); } finally { current.element = current.adapter = null;pruneAbsent();emit(); }
        }
      };
      entry.release = dispose;
      if(created&&!batchRegistration)pushAction({entry,before:false,after:true,presence:true},'create');
      emit();
      return Object.freeze({ dispose });
    },
    focus() {
      if (!alive || !root.isConnected) return false;
      root.focus({ preventScroll: true });
      return root.ownerDocument.activeElement === root;
    },
    destroy() {
      if (!alive) return;
      alive = focused = false;
      changes.destroy();
      unsubscribeClipboard?.();unsubscribeClipboard=null;
      const errors = [];
      try { cancelCreation(); } catch(error) { errors.push(error); }
      try { finishEdit(false,false); } catch(error) { errors.push(error); }
      try { finish(true); } catch (error) { errors.push(error); }
      for (const entry of [...owners.values()]) {
        try { entry.release(); } catch (error) { errors.push(error); }
      }
      alive = focused = false;
      undo.length = redo.length = 0;selected = null;selection.clear();multiple=false;
      for (const [type,listener] of Object.entries(listeners)) root.removeEventListener(type,listener);
      mounted.delete(root);status.remove();done.remove();
      if (addedTabIndex && root.getAttribute('tabindex') === '0') root.removeAttribute('tabindex');
      if(originalMultiple===null)root.removeAttribute('data-canvas-instance-multiple');else root.setAttribute('data-canvas-instance-multiple',originalMultiple);
      if(originalReadOnly===null)root.removeAttribute('data-canvas-instance-readonly');else root.setAttribute('data-canvas-instance-readonly',originalReadOnly);
      root = status = done = null;emit();subscribers.clear();
      for (const error of errors) view.reportError(error);
    },
  });
  if(clipboard)try{unsubscribeClipboard=clipboard.subscribe(emit);}catch(error){instance.destroy();throw error;}
  mounted.set(host, instance);
  return instance;
}
