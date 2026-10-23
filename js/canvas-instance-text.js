// Bounded text geometry owner for the isolation specimen. No automatic discovery,
// storage or dependency on the production document-global coordinator.
export function createTextOwner(element, host, { name = 'Text', widthHandles = true, editable = true } = {}) {
  const kinds=widthHandles?['nw','ne','sw','se','w','e','rotate']:['nw','ne','sw','se','rotate'];
  if (!element || element.parentElement !== host || element.querySelector('input,textarea,button,a,[contenteditable],img,svg') || element.isContentEditable) {
    throw new TypeError('Text owner needs a direct, static text child.');
  }
  const style = element.ownerDocument.defaultView.getComputedStyle(element);
  if (style.transform !== 'none' || style.rotate !== 'none' || style.scale !== 'none' || (style.translate !== 'none' && style.translate.split(' ').some(value => parseFloat(value) !== 0))) {
    throw new TypeError('Text owner requires untransformed text.');
  }
  if (!['absolute','relative'].includes(style.position)) throw new TypeError('Text owner needs positioned text.');
  let node = element, root = host, x = 0, y = 0, scale = 1, angle = 0;
  const originalNodes=[...element.childNodes];
  const originalText=(()=>{const copy=element.cloneNode(true);copy.querySelectorAll('br').forEach(br=>br.replaceWith('\n'));return copy.textContent.replace(/\r\n?/g,'\n').replace(/\0/g,'');})();
  const textLimit=Math.max(240,originalText.length);
  let content=null,editAnchor=null,activeEdit=false,composing=false;
  let editor=editable?element.ownerDocument.createElement('span'):null;
  if(editor){
    editor.className='canvas-instance-editor';editor.dataset.canvasInstanceEditor='';editor.contentEditable='false';
    editor.append(...originalNodes);element.append(editor);
  }
  const hadStyle = element.hasAttribute('style');
  const original = Object.fromEntries(['translate','scale','rotate','width','transformOrigin'].map(key=>[key,element.style[key]]));
  const inverse = element.style.getPropertyValue('--canvas-instance-inverse'), inversePriority = element.style.getPropertyPriority('--canvas-instance-inverse');
  const gaps = ['--canvas-instance-gap-x','--canvas-instance-gap-y'].map(key=>({key,value:element.style.getPropertyValue(key),priority:element.style.getPropertyPriority(key)}));
  let localWidth=element.offsetWidth,localHeight=element.offsetHeight;
  const handles = [];
  for (const kind of kinds) {
    const button = element.ownerDocument.createElement('button');button.type='button';
    button.className='canvas-instance-handle canvas-instance-handle--'+kind;button.dataset.canvasInstanceHandle=kind;
    const label=kind==='rotate'?'Rotate '+name:kind.length===1?'Change '+(kind==='w'?'left':'right')+' width of '+name:'Resize '+kind.toUpperCase()+' corner of '+name;
    const hint=kind==='rotate'?'Arrow keys: 5 degrees; Shift: 15-degree snapping':kind.length===1?'Arrow keys: 10px; Shift: 40px':'Arrow keys: 5 percent';
    button.setAttribute('aria-label',label);button.title=label+'. '+hint;
    if(element.getAttribute('aria-describedby'))button.setAttribute('aria-describedby',element.getAttribute('aria-describedby'));
    element.append(button);handles.push(button);
  }
  const apply = () => {
    node.style.translate = `${x}px ${y}px`;node.style.scale=String(scale);node.style.rotate=`${angle}deg`;
    node.style.transformOrigin='center';node.style.setProperty('--canvas-instance-inverse',String(1/scale));
    // Keep 24px targets apart when the scaled text becomes shorter/narrower.
    node.style.setProperty('--canvas-instance-gap-x',`${Math.max(0,(24-localWidth*scale)/2)}px`);
    node.style.setProperty('--canvas-instance-gap-y',`${Math.max(0,(24-localHeight*scale)/2)}px`);
  };
  const areaBounds = () => {
    const area=root.getBoundingClientRect();return {left:area.left+root.clientLeft+8,right:area.left+root.clientLeft+root.clientWidth-8,top:area.top+root.clientTop+8,bottom:area.top+root.clientTop+root.clientHeight-32};
  };
  const contain = () => {
    localWidth=node.offsetWidth;localHeight=node.offsetHeight;
    const area=areaBounds();let rect=node.getBoundingClientRect();
    const fit=Math.min(1,Math.max(1,area.right-area.left)/rect.width,Math.max(1,area.bottom-area.top)/rect.height);
    if(fit<1){scale*=fit;apply();rect=node.getBoundingClientRect();}
    x+=Math.max(0,area.left-rect.left)-Math.max(0,rect.right-area.right);
    y+=Math.max(0,area.top-rect.top)-Math.max(0,rect.bottom-area.bottom);
    apply();
  };
  const anchor = kind => {
    localWidth=node.offsetWidth;localHeight=node.offsetHeight;
    const rect=node.getBoundingClientRect(),radians=angle*Math.PI/180;
    const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2,width=node.offsetWidth*scale,height=node.offsetHeight*scale;
    const localX=(kind.includes('w')?1:-1)*width/2,localY=(kind.length===1?0:kind.includes('n')?1:-1)*height/2;
    return {cx,cy,width,height,x:cx+localX*Math.cos(radians)-localY*Math.sin(radians),y:cy+localX*Math.sin(radians)+localY*Math.cos(radians)};
  };
  const setWidth = (width,max) => {node.style.width=`${Math.max(Math.min(80,max),Math.min(max,width))}px`;};
  const preserveAnchor = (kind, fixed) => {const now=anchor(kind);x+=fixed.x-now.x;y+=fixed.y-now.y;apply();};
  const readText = () => (editor.innerText ?? editor.textContent).replace(/\r\n?/g,'\n').replace(/\0/g,'');
  const caretAtEnd = () => {
    const selection=node.ownerDocument.getSelection(),range=node.ownerDocument.createRange();
    range.selectNodeContents(editor);range.collapse(false);selection.removeAllRanges();selection.addRange(range);
  };
  const renderContent = () => {
    if(!editor)return;
    if(content===null){editor.replaceChildren(...originalNodes);editor.removeAttribute('data-instance-plain-text');}
    else {editor.textContent=content;editor.setAttribute('data-instance-plain-text','');}
  };
  const syncInput = event => {
    if(!activeEdit)return;
    let text=readText();
    if(!composing&&!event?.isComposing&&text.length>textLimit){text=text.slice(0,textLimit);editor.textContent=text;caretAtEnd();}
    content=text===originalText?null:text;
    if(editAnchor)preserveAnchor('se',editAnchor);
  };
  const beforeInput = event => {
    if(!activeEdit||composing||event.isComposing||!['insertText','insertParagraph','insertLineBreak'].includes(event.inputType))return;
    const selection=node.ownerDocument.getSelection();
    const replacing=selection?.rangeCount&&editor.contains(selection.anchorNode)&&editor.contains(selection.focusNode)?selection.toString().length:0;
    const added=event.inputType==='insertText'?(event.data?.length||0):1;
    if(readText().length-replacing+added>textLimit)event.preventDefault();
  };
  const paste = event => {
    if(!activeEdit)return;
    event.preventDefault();if(composing)return;
    const doc=node.ownerDocument,selection=doc.getSelection();
    if(!selection?.rangeCount||!editor.contains(selection.anchorNode)||!editor.contains(selection.focusNode))return;
    const range=selection.getRangeAt(0),remaining=textLimit-readText().length+selection.toString().length;
    const value=(event.clipboardData?.getData('text/plain')||'').replace(/\r\n?/g,'\n').replace(/\0/g,'').slice(0,Math.max(0,remaining));
    if(!value)return;
    // Legacy insertText preserves native Undo; the fallback never parses HTML.
    let inserted=false;try{inserted=typeof doc.execCommand==='function'&&doc.execCommand('insertText',false,value);}catch{}
    if(!inserted){range.deleteContents();const text=doc.createTextNode(value);range.insertNode(text);range.setStartAfter(text);range.collapse(true);selection.removeAllRanges();selection.addRange(range);}
    syncInput();
  };
  const compositionStart=()=>{if(activeEdit)composing=true;};
  const compositionEnd=()=>{composing=false;syncInput();};
  const editorListeners={input:syncInput,beforeinput:beforeInput,paste,compositionstart:compositionStart,compositionend:compositionEnd};
  for(const [type,listener]of Object.entries(editorListeners))editor?.addEventListener(type,listener);
  const finishEditing = () => {
    if(!node||!activeEdit)return;
    const text=readText().slice(0,textLimit),value=text.trim()?text:originalText;
    content=value===originalText?null:value;activeEdit=composing=false;
    editor.contentEditable='false';for(const key of ['role','aria-label','aria-multiline'])editor.removeAttribute(key);
    renderContent();if(editAnchor)preserveAnchor('se',editAnchor);editAnchor=null;contain();
  };
  return Object.freeze({
    name,
    serialize() {const style=node.ownerDocument.defaultView.getComputedStyle(node);return {type:'text',layout:{left:node.offsetLeft,top:node.offsetTop,width:Math.ceil(parseFloat(style.width)*100)/100,height:node.offsetHeight,fontSize:parseFloat(style.fontSize),lineHeight:style.lineHeight==='normal'?'normal':parseFloat(style.lineHeight),fontWeight:Number(style.fontWeight)},text:content??originalText,state:{x,y,scale,angle,width:node.style.width,content:content??originalText}};},
    capture: () => ({ x, y, scale, angle, width:node.style.width, content }),
    restore(value) {
      if (!node) return;
      if (value?.content!==null&&(typeof value?.content!=='string'||value.content.length>textLimit))throw new TypeError('Invalid text content.');
      if (!['x','y','scale','angle'].every(key=>Number.isFinite(value?.[key])) || value.scale<=0 || typeof value.width!=='string' || (value.width!==original.width&&!/^\d+(?:\.\d+)?px$/.test(value.width))) throw new TypeError('Invalid text geometry.');
      ({ x, y, scale, angle, content } = value);renderContent();node.style.width=value.width;apply();contain();
    },
    beginEdit() {
      if(!editable||!node?.isConnected||activeEdit)return null;
      editAnchor=anchor('se');activeEdit=true;composing=false;
      editor.textContent=content??originalText;editor.setAttribute('data-instance-plain-text','');
      try{editor.contentEditable='plaintext-only';}catch{editor.contentEditable='true';}
      editor.setAttribute('role','textbox');editor.setAttribute('aria-label','Edit '+name);editor.setAttribute('aria-multiline','true');
      preserveAnchor('se',editAnchor);
      return {editor,finish:finishEditing,focus:()=>{editor.focus({preventScroll:true});caretAtEnd();}};
    },
    beginMove() {
      if (!node?.isConnected) return null;
      const rect = node.getBoundingClientRect(), area = root.getBoundingClientRect(), startX = x, startY = y;
      const left = area.left + root.clientLeft + 8 - rect.left, right = area.left + root.clientLeft + root.clientWidth - 8 - rect.right;
      const top = area.top + root.clientTop + 8 - rect.top, bottom = area.top + root.clientTop + root.clientHeight - 32 - rect.bottom;
      return {
        limits: { left: Math.min(left,right), right: Math.max(left,right), top: Math.min(top,bottom), bottom: Math.max(top,bottom) },
        move(dx,dy) { x = startX + dx;y = startY + dy;apply(); },
        finish: contain,
      };
    },
    beginTransform(kind, point) {
      if (!node?.isConnected || !kinds.includes(kind)) return null;
      const fixed=anchor(kind),start={x,y,scale,angle,width:node.offsetWidth},radians=angle*Math.PI/180,maxWidth=Math.max(1,root.clientWidth-64);
      const vectorX=(point?.clientX??fixed.cx)-fixed.x,vectorY=(point?.clientY??fixed.cy)-fixed.y;
      const bearing=point?Math.atan2(point.clientY-fixed.cy,point.clientX-fixed.cx):0;
      const resize = value => {
        scale=Math.max(.5,Math.min(1.8,value));const compensation=1-scale/start.scale;
        x=start.x+(fixed.x-fixed.cx)*compensation;y=start.y+(fixed.y-fixed.cy)*compensation;apply();
      };
      return {
        pointer(dx,dy,shift) {
          if(kind==='rotate') {
            const current=Math.atan2(point.clientY+dy-fixed.cy,point.clientX+dx-fixed.cx);
            angle=start.angle+Math.atan2(Math.sin(current-bearing),Math.cos(current-bearing))*180/Math.PI;
            if(shift)angle=Math.round(angle/15)*15;apply();
          } else if(kind.length===1) {
            const delta=(dx*Math.cos(radians)+dy*Math.sin(radians))/start.scale;
            setWidth(start.width+delta*(kind==='w'?-1:1),maxWidth);preserveAnchor(kind,fixed);
          } else resize(start.scale*((vectorX+dx)*vectorX+(vectorY+dy)*vectorY)/Math.max(1,vectorX**2+vectorY**2));
        },
        step(direction,shift) {
          if(kind==='rotate'){angle+=direction*(shift?15:5);if(shift)angle=Math.round(angle/15)*15;apply();}
          else if(kind.length===1){setWidth(node.offsetWidth+direction*(shift?40:10),maxWidth);preserveAnchor(kind,fixed);}
          else resize(scale+direction*.05);
        },
        finish: contain,
      };
    },
    dispose() {
      if (!node) return;
      finishEditing();for(const [type,listener]of Object.entries(editorListeners))editor?.removeEventListener(type,listener);
      editor?.remove();node.replaceChildren(...originalNodes);originalNodes.length=0;editor=null;
      handles.forEach(handle=>handle.remove());handles.length=0;
      for(const [key,value]of Object.entries(original))node.style[key]=value;
      if(inverse)node.style.setProperty('--canvas-instance-inverse',inverse,inversePriority);else node.style.removeProperty('--canvas-instance-inverse');
      for(const {key,value,priority}of gaps){if(value)node.style.setProperty(key,value,priority);else node.style.removeProperty(key);}
      if(!hadStyle&&!node.style.length)node.removeAttribute('style');
      node = root = null;
    },
  });
}
