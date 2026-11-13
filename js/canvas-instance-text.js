// Bounded text geometry owner for the isolation specimen. No automatic discovery,
// storage or dependency on the production document-global coordinator.
import {defaultTextStyle,validateTextStyle,resolveTextStyle,textFonts,textWeights,hasTextStyle} from './canvas-instance-text-style.js';
// freeResize (shapes): eight handles change the box's own width and height instead of its scale; onBox(width,height) runs after every size change.
export function createTextOwner(element, host, { name = 'Text', widthHandles = true, editable = true, freeResize = false, onBox = null } = {}) {
  const formatting=editable&&widthHandles&&!freeResize;
  const kinds=freeResize?['nw','n','ne','e','se','s','sw','w','rotate']:widthHandles?['nw','ne','sw','se','w','e','rotate']:['nw','ne','sw','se','rotate'];
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
  const original = Object.fromEntries(['translate','scale','rotate','width',...(freeResize?['height']:[]),'transformOrigin',...(formatting?['fontFamily','fontSize','fontWeight','textAlign']:[])].map(key=>[key,element.style[key]]));
  let typography=defaultTextStyle;
  const inverse = element.style.getPropertyValue('--canvas-instance-inverse'), inversePriority = element.style.getPropertyPriority('--canvas-instance-inverse');
  const gaps = ['--canvas-instance-gap-x','--canvas-instance-gap-y'].map(key=>({key,value:element.style.getPropertyValue(key),priority:element.style.getPropertyPriority(key)}));
  let localWidth=element.offsetWidth,localHeight=element.offsetHeight;
  const handles = [];
  for (const kind of kinds) {
    const button = element.ownerDocument.createElement('button');button.type='button';
    button.className='canvas-instance-handle canvas-instance-handle--'+kind;button.dataset.canvasInstanceHandle=kind;
    const side={w:'left width',e:'right width',n:'top height',s:'bottom height'}[kind];
    const label=kind==='rotate'?'Rotate '+name:side?'Change '+side+' of '+name:'Resize '+kind.toUpperCase()+' corner of '+name;
    const hint=kind==='rotate'?'Arrow keys: 5 degrees; Shift: 15-degree snapping':side||freeResize?'Arrow keys: 10px; Shift: 40px':'Arrow keys: 5 percent';
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
    // Side handles of small free boxes would overlap the corners, so hide them; corners still resize both ways.
    if(freeResize){node.toggleAttribute('data-canvas-instance-narrow',localWidth*scale<48);node.toggleAttribute('data-canvas-instance-short',localHeight*scale<48);}
  };
  // Camera worlds (docs/prd/NAVIGATION.md): inside a world element the owner keeps world units in its state and
  // converts the screen-space deltas core gives it by the world's measured scale. Worlds are unbounded.
  const unbounded = () => !!root?.hasAttribute('data-canvas-instance-world');
  const worldScale = () => {
    if (!unbounded()) return 1;
    const width = root.getBoundingClientRect().width;
    return root.offsetWidth > 0 && width > 0 ? width / root.offsetWidth : 1;
  };
  const areaBounds = () => {
    const area=root.getBoundingClientRect();return {left:area.left+root.clientLeft+8,right:area.left+root.clientLeft+root.clientWidth-8,top:area.top+root.clientTop+8,bottom:area.top+root.clientTop+root.clientHeight-32};
  };
  const contain = () => {
    localWidth=node.offsetWidth;localHeight=node.offsetHeight;
    if(unbounded())return;
    const area=areaBounds();let rect=node.getBoundingClientRect();
    const fit=Math.min(1,Math.max(1,area.right-area.left)/rect.width,Math.max(1,area.bottom-area.top)/rect.height);
    if(fit<1){scale*=fit;apply();rect=node.getBoundingClientRect();}
    x+=Math.max(0,area.left-rect.left)-Math.max(0,rect.right-area.right);
    y+=Math.max(0,area.top-rect.top)-Math.max(0,rect.bottom-area.bottom);
    apply();
  };
  const anchor = kind => {
    localWidth=node.offsetWidth;localHeight=node.offsetHeight;
    const rect=node.getBoundingClientRect(),radians=angle*Math.PI/180,style=node.ownerDocument.defaultView.getComputedStyle(node),k=worldScale();
    const dimension=(key,extras)=>parseFloat(style[key])+(style.boxSizing==='border-box'?0:extras.reduce((sum,key)=>sum+parseFloat(style[key]),0));
    const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2,width=dimension('width',['paddingLeft','paddingRight','borderLeftWidth','borderRightWidth'])*scale*k,height=dimension('height',['paddingTop','paddingBottom','borderTopWidth','borderBottomWidth'])*scale*k;
    // The fixed point opposite the handle: corners use the opposite corner, sides the opposite edge midpoint.
    const handle=kind==='rotate'?'se':kind,localX=(handle.includes('w')?1:handle.includes('e')?-1:0)*width/2,localY=(handle.includes('n')?1:handle.includes('s')?-1:0)*height/2;
    return {cx,cy,width,height,x:cx+localX*Math.cos(radians)-localY*Math.sin(radians),y:cy+localX*Math.sin(radians)+localY*Math.cos(radians)};
  };
  const setWidth = (width,max) => {node.style.width=`${Math.max(Math.min(80,max),Math.min(max,width))}px`;};
  const box = () => {const style=node.ownerDocument.defaultView.getComputedStyle(node);return {width:parseFloat(style.width),height:parseFloat(style.height)};};
  const setBox = (width,height,max) => {
    node.style.width=`${Math.round(Math.max(16,Math.min(max.width,width))*100)/100}px`;node.style.height=`${Math.round(Math.max(16,Math.min(max.height,height))*100)/100}px`;
    localWidth=node.offsetWidth;localHeight=node.offsetHeight;const size=box();onBox?.(size.width,size.height);
  };
  const preserveAnchor = (kind, fixed) => {const now=anchor(kind),k=worldScale();x+=(fixed.x-now.x)/k;y+=(fixed.y-now.y)/k;apply();};
  const applyTypography=(next,width)=>{
    typography=next;
    node.style.fontFamily=next.font==='original'?original.fontFamily:textFonts[next.font];
    node.style.fontSize=next.size===null?original.fontSize:next.size+'px';
    node.style.fontWeight=next.weight===null?original.fontWeight:String(next.weight);
    node.style.textAlign=next.align==='original'?original.textAlign:next.align;
    node.style.width=width;
  };
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
    ...(formatting?{textStyle:Object.freeze({
      read(){if(!node?.isConnected||activeEdit)return null;const style=node.ownerDocument.defaultView.getComputedStyle(node),alignment=style.textAlign==='start'?(style.direction==='rtl'?'right':'left'):style.textAlign==='end'?(style.direction==='rtl'?'left':'right'):style.textAlign;return {font:typography.font,family:style.fontFamily,size:parseFloat(style.fontSize),weight:Number(style.fontWeight),align:['left','center','right'].includes(alignment)?alignment:'original',wrap:['','fit-content'].includes(node.style.width)?'auto':'fixed',weights:[...textWeights]};},
      prepare(field,value){
        if(!node?.isConnected||activeEdit)return null;
        const next=resolveTextStyle(typography,field,value),fixed=anchor('se'),style=node.ownerDocument.defaultView.getComputedStyle(node);
        const width=field==='reset'?original.width:field==='wrap'?(value==='auto'?'fit-content':style.width):node.style.width;
        return {apply:()=>applyTypography(next,width),finish(){preserveAnchor('se',fixed);contain();}};
      },
    })}:{}),
    geometry:Object.freeze({
      read(){
        if(!node?.isConnected||activeEdit)return null;
        const rect=node.getBoundingClientRect(),area=root.getBoundingClientRect(),bounds=areaBounds(),style=node.ownerDocument.defaultView.getComputedStyle(node);
        const left=area.left+root.clientLeft,top=area.top+root.clientTop;
        const dimension=(key,extras)=>parseFloat(style[key])+(style.boxSizing==='border-box'?0:extras.reduce((sum,key)=>sum+parseFloat(style[key]),0));
        return {centerX:rect.left+rect.width/2-left,centerY:rect.top+rect.height/2-top,localWidth:dimension('width',['paddingLeft','paddingRight','borderLeftWidth','borderRightWidth']),localHeight:dimension('height',['paddingTop','paddingBottom','borderTopWidth','borderBottomWidth']),scale,angle,minScale:Math.min(.5,scale),maxScale:Math.max(1.8,scale),bounds:{left:bounds.left-left,right:bounds.right-left,top:bounds.top-top,bottom:bounds.bottom-top}};
      },
      prepare(target){
        if(!node?.isConnected||activeEdit)return null;
        const rect=node.getBoundingClientRect(),area=root.getBoundingClientRect(),k=worldScale();
        const nextX=x+(target.centerX-(rect.left+rect.width/2-area.left-root.clientLeft))/k,nextY=y+(target.centerY-(rect.top+rect.height/2-area.top-root.clientTop))/k;
        return ()=>{x=nextX;y=nextY;scale=target.scale;angle=target.angle;localWidth=node.offsetWidth;localHeight=node.offsetHeight;apply();};
      },
    }),
    serialize() {const style=node.ownerDocument.defaultView.getComputedStyle(node);return {type:'text',layout:{left:node.offsetLeft,top:node.offsetTop,width:Math.ceil(parseFloat(style.width)*100)/100,height:node.offsetHeight,fontSize:parseFloat(style.fontSize),lineHeight:style.lineHeight==='normal'?'normal':parseFloat(style.lineHeight),fontWeight:Number(style.fontWeight)},text:content??originalText,state:{x,y,scale,angle,width:node.style.width,content:content??originalText,...(formatting&&hasTextStyle(typography)?{typography:{...typography}}:{})}};},
    capture: () => ({ x, y, scale, angle, width:node.style.width, ...(freeResize?{height:node.style.height}:{}), content,...(formatting?{typography:{...typography}}:{}) }),
    restore(value) {
      if (!node) return;
      if (value?.content!==null&&(typeof value?.content!=='string'||value.content.length>textLimit))throw new TypeError('Invalid text content.');
      if (!['x','y','scale','angle'].every(key=>Number.isFinite(value?.[key])) || value.scale<=0 || typeof value.width!=='string' || (value.width!==original.width&&!['','fit-content'].includes(value.width)&&!/^\d+(?:\.\d+)?px$/.test(value.width))) throw new TypeError('Invalid text geometry.');
      if (freeResize && value.height!==undefined && (typeof value.height!=='string'||!/^\d+(?:\.\d+)?px$/.test(value.height))) throw new TypeError('Invalid box height.');
      const next=formatting?validateTextStyle(value.typography??defaultTextStyle):null;
      ({ x, y, scale, angle, content } = value);renderContent();if(formatting)applyTypography(next,value.width);else node.style.width=value.width;
      if(freeResize){if(value.height!==undefined)node.style.height=value.height;localWidth=node.offsetWidth;localHeight=node.offsetHeight;const size=box();onBox?.(size.width,size.height);}
      apply();contain();
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
      const startX = x, startY = y, k = worldScale();
      // Limits and deltas are screen pixels; a camera world has no limits.
      if (unbounded()) return { limits: { left: -Infinity, right: Infinity, top: -Infinity, bottom: Infinity }, move(dx,dy) { x = startX + dx / k;y = startY + dy / k;apply(); }, finish: contain };
      const rect = node.getBoundingClientRect(), area = root.getBoundingClientRect();
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
      const fixed=anchor(kind),k=worldScale(),start={x,y,scale,angle,width:node.offsetWidth,...(freeResize?box():{})},radians=angle*Math.PI/180,maxWidth=Math.max(1,root.clientWidth-64);
      const maxBox={width:Math.max(16,(root.clientWidth-16)/scale),height:Math.max(16,(root.clientHeight-40)/scale)};
      // Free boxes: local deltas grow the edges a handle owns; Shift on a corner keeps the starting ratio.
      const reshape=(lx,ly,shift)=>{
        let width=start.width+(kind.includes('w')?-lx:kind.includes('e')?lx:0),height=start.height+(kind.includes('n')?-ly:kind.includes('s')?ly:0);
        if(shift&&kind.length===2){const ratio=Math.max(width/start.width,height/start.height);width=start.width*ratio;height=start.height*ratio;}
        setBox(width,height,maxBox);preserveAnchor(kind,fixed);
      };
      const vectorX=(point?.clientX??fixed.cx)-fixed.x,vectorY=(point?.clientY??fixed.cy)-fixed.y;
      const bearing=point?Math.atan2(point.clientY-fixed.cy,point.clientX-fixed.cx):0;
      const resize = value => {
        scale=Math.max(.5,Math.min(1.8,value));const compensation=1-scale/start.scale;
        x=start.x+(fixed.x-fixed.cx)*compensation/k;y=start.y+(fixed.y-fixed.cy)*compensation/k;apply();
      };
      return {
        pointer(dx,dy,shift) {
          if(kind==='rotate') {
            const current=Math.atan2(point.clientY+dy-fixed.cy,point.clientX+dx-fixed.cx);
            angle=start.angle+Math.atan2(Math.sin(current-bearing),Math.cos(current-bearing))*180/Math.PI;
            if(shift)angle=Math.round(angle/15)*15;apply();
          } else if(freeResize) {
            reshape((dx*Math.cos(radians)+dy*Math.sin(radians))/start.scale/k,(-dx*Math.sin(radians)+dy*Math.cos(radians))/start.scale/k,shift);
          } else if(kind.length===1) {
            const delta=(dx*Math.cos(radians)+dy*Math.sin(radians))/start.scale/k;
            setWidth(start.width+delta*(kind==='w'?-1:1),maxWidth);preserveAnchor(kind,fixed);
          } else resize(start.scale*((vectorX+dx)*vectorX+(vectorY+dy)*vectorY)/Math.max(1,vectorX**2+vectorY**2));
        },
        step(direction,shift) {
          if(kind==='rotate'){angle+=direction*(shift?15:5);if(shift)angle=Math.round(angle/15)*15;apply();}
          else if(freeResize){
            // Each step grows (or shrinks) the edges this handle owns; corners keep the current ratio.
            const now=box(),amount=direction*(shift?40:10),ratio=kind.length===2?(now.width+amount)/now.width:1;
            start.width=now.width;start.height=now.height;Object.assign(fixed,anchor(kind));
            const sign=v=>kind.includes(v)?1:0;
            setBox(kind.length===2?now.width*ratio:now.width+amount*(sign('w')+sign('e')),kind.length===2?now.height*ratio:now.height+amount*(sign('n')+sign('s')),maxBox);preserveAnchor(kind,fixed);
          }
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
