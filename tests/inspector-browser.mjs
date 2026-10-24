const task=await taskSpace(inspectorTest.spaceId),page=task.page('p1');if(task.ownership!=='agent')throw new Error('Use an agent-owned space.');
const assert=(ok,message)=>{if(!ok)throw new Error(message);};let passed=0;
async function check(name,run){console.log('RUN '+name);await run();passed++;console.log('PASS '+name);}
const field=name=>'[data-preview=A] [data-inspector-field='+name+']';
await page.cdp('Emulation.setFocusEmulationEnabled',{enabled:true});await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await page.goto(inspectorTest.base+'/examples/configurator/');await page.waitForFunction(()=>!!document.querySelector('main').configurator);console.log((await page.snapshot()).slice(0,600));
await page.evaluate(()=>{window.inspectorErrors=[];window.addEventListener('error',e=>window.inspectorErrors.push(e.message));window.addEventListener('unhandledrejection',e=>window.inspectorErrors.push(String(e.reason)));});
await check('empty selection disables the trigger and original selection exposes five fields',async()=>{
 assert(await page.evaluate(()=>document.querySelector('[data-preview=A] button[aria-label="Selection inspector"]').disabled),'Empty inspector enabled');
 await page.click('[data-preview=A] [data-original]');await page.click('[data-preview=A] button[aria-label="Selection inspector"]');
 assert(await page.evaluate(()=>document.querySelectorAll('[data-preview=A] .canvas-embed-inspector input').length===5&&document.querySelector('[data-preview=A] .canvas-embed-inspector').matches(':popover-open')&&[...document.querySelectorAll('[data-preview=A] .canvas-embed-inspector input')].every(i=>i.getBoundingClientRect().height>=44)),'Inspector did not open with 44px fields');
});
await check('X and Y commit independently with exact one-action Undo and isolation',async()=>{
 const before=await page.evaluate(()=>{const a=document.querySelector('main').configurator;window.inspectorBefore=a.previews.A.canvas.saveDocument();return a.previews.B.canvas.saveDocument();});
 await page.fill(field('x'),'70');await page.press(field('x'),'Enter');await page.fill(field('y'),'90');await page.press(field('y'),'Enter');
 assert(await page.evaluate(()=>{const c=document.querySelector('main').configurator.previews.A.canvas,g=c.getInspector();return Math.abs(g.x-70)<.05&&Math.abs(g.y-90)<.05;}),'Position differs from fields');
 await page.click('[data-preview=A] .canvas-embed-inspector button');await page.click('[data-preview=A] button[aria-label=Undo]');assert(await page.evaluate(()=>Math.abs(document.querySelector('main').configurator.previews.A.canvas.getInspector().y-56)<.1),'Undo did not revert only Y');await page.click('[data-preview=A] button[aria-label=Redo]');
 assert(await page.evaluate(value=>JSON.stringify(document.querySelector('main').configurator.previews.B.canvas.saveDocument())===JSON.stringify(value),before),'Other instance changed');
});
await check('width height and absolute rotation preserve text layout and proportional shape',async()=>{
 await page.click('[data-preview=A] button[aria-label="Selection inspector"]');
 const start=await page.evaluate(()=>{const c=document.querySelector('main').configurator.previews.A.canvas,n=document.querySelector('[data-preview=A] [data-original]');return {g:c.getInspector(),layout:[n.offsetWidth,n.offsetHeight,n.style.width]};});
 await page.fill(field('width'),String(start.g.width*1.2));await page.press(field('width'),'Enter');
 assert(await page.evaluate(start=>{const c=document.querySelector('main').configurator.previews.A.canvas,g=c.getInspector(),n=document.querySelector('[data-preview=A] [data-original]');return Math.abs(g.width/start.g.width-1.2)<.001&&Math.abs(g.height/start.g.height-1.2)<.001&&Math.abs(g.x-start.g.x)<.1&&JSON.stringify([n.offsetWidth,n.offsetHeight,n.style.width])===JSON.stringify(start.layout);},start),'Width reflowed text or broke anchor');
 await page.fill(field('height'),String(start.g.height));await page.press(field('height'),'Enter');await page.fill(field('rotation'),'30');await page.press(field('rotation'),'Enter');
 assert(await page.evaluate(()=>Math.abs(document.querySelector('main').configurator.previews.A.canvas.getInspector().rotation-30)<.001),'Rotation not absolute');
});
await check('invalid blank and Escape never commit unfinished typing and return focus',async()=>{
 const revision=await page.evaluate(()=>document.querySelector('main').configurator.previews.A.canvas.getState().revision);
 await page.fill(field('width'),'');await page.press(field('width'),'Enter');assert(await page.evaluate(()=>document.querySelector('[data-preview=A] [data-inspector-field=width]').getAttribute('aria-invalid')==='true'),'Blank input not explained');
 await page.fill(field('width'),'-2');await page.press(field('width'),'Enter');await page.fill(field('width'),'123');await page.press(field('width'),'Escape');
 assert(await page.evaluate(revision=>{const root=document.querySelector('[data-preview=A]');return document.querySelector('main').configurator.previews.A.canvas.getState().revision===revision&&!root.querySelector('.canvas-embed-inspector').matches(':popover-open')&&document.activeElement===root.querySelector('[aria-label="Selection inspector"]');},revision),'Escape committed or lost focus');
});
await check('native number-field arrows and Undo do not transform canvas objects',async()=>{
 await page.click('[data-preview=A] button[aria-label="Selection inspector"]');const before=await page.evaluate(()=>document.querySelector('main').configurator.previews.A.canvas.getState().revision);
 await page.focus(field('x'));await page.keyboard.press('ControlOrMeta+a');await page.keyboard.press('ArrowUp');await page.keyboard.press('ControlOrMeta+z');
 assert(await page.evaluate(revision=>document.querySelector('main').configurator.previews.A.canvas.getState().revision===revision,before),'Native key mutated canvas history');await page.press(field('x'),'Escape');
});
await check('read-only and locked selections remain measurable but cannot change',async()=>{
 await page.click('[data-preview=B] [data-original]');await page.click('[data-preview=B] button[aria-label="Selection inspector"]');
 assert(await page.evaluate(()=>[...document.querySelectorAll('[data-preview=B] .canvas-embed-inspector input')].every(i=>i.disabled)&&!document.querySelector('main').configurator.previews.B.canvas.execute('inspect',{field:'x',value:99}).ok),'Read-only bypass');
 await page.click('[data-preview=B] .canvas-embed-inspector button');
 assert(await page.evaluate(()=>{const c=document.querySelector('main').configurator.previews.A.canvas;c.execute('lock',true);const before=JSON.stringify(c.saveDocument()),r=c.execute('inspect',{field:'rotation',value:45});const ok=!r.ok&&!c.getInspector().editable&&JSON.stringify(c.saveDocument())===before;c.execute('lock',false);return ok;}),'Lock bypass');
});
await page.evaluate(async()=>{
 const {createCanvas}=await import('/index.js'),{createTextOwner,createStickyNote,createDrawing,createImageObject,canvasDocuments}=await import('/owners.js');
 const container=document.createElement('section');container.id='inspector-fixtures';document.body.append(container);const host=document.createElement('div');host.style.cssText='position:relative;width:700px;height:500px';container.append(host);
 const canvas=createCanvas(host,{documents:canvasDocuments});
 const text=document.createElement('p');text.id='inspector-fixture-text';text.textContent='Precise text';text.style.cssText='position:absolute;left:60px;top:60px;width:110px;margin:0;font-size:18px';host.append(text);const owner=createTextOwner(text,host);canvas.register(text,owner);
 const note=createStickyNote(host);canvas.register(note.element,note.owner,{created:true});canvas.select(note.element);canvas.execute('move',{dx:80,dy:-50});canvas.execute('paper-color','pink');
 const drawing=createDrawing(host,[{x:60,y:240},{x:180,y:260}],{});canvas.register(drawing.element,drawing.owner,{created:true});
 const src=await new Promise(resolve=>{const c=document.createElement('canvas');c.width=40;c.height=20;resolve(c.toDataURL('image/png'));});
 const image=createImageObject(host,{src,width:40,height:20,alt:'Original image'});canvas.register(image.element,image.owner,{created:true});canvas.select(image.element);canvas.execute('image-description','Edited description');
 window.inspectorFixture={canvas,host,container,text,owner,note,drawing,image,createCanvas};
});
await check('mixed selections scale and rotate rigidly with single-step Undo and Redo',async()=>{
 assert(await page.evaluate(()=>{const f=window.inspectorFixture,c=f.canvas;c.selectMany([f.text,f.note.element,f.drawing.element,f.image.element]);const before=JSON.stringify(c.saveDocument()),g=c.getInspector();const scaled=c.execute('inspect',{field:'width',value:g.width*.8});const after=JSON.stringify(c.saveDocument()),s=c.getInspector();const ok=scaled.ok&&Math.abs(s.width/g.width-.8)<.001&&c.execute('undo').ok&&JSON.stringify(c.saveDocument())===before&&c.execute('redo').ok&&JSON.stringify(c.saveDocument())===after;const turn=c.execute('inspect',{field:'rotation',value:15});return ok&&turn.ok&&c.getInspector().relativeRotation&&c.getInspector().rotation===0;}),'Mixed selection transform/history failed');
});
await check('image description paper color text content and drawing path survive inspector edits',async()=>{
 assert(await page.evaluate(()=>{const f=window.inspectorFixture;return f.image.owner.description.read()==='Edited description'&&f.note.owner.paperColor.read()==='pink'&&f.owner.serialize().text==='Precise text'&&f.drawing.owner.serialize().points.length===2;}),'Inspector changed content');
});
await check('whole groups remain selected and one locked member rejects the entire plan',async()=>{
 assert(await page.evaluate(()=>{const f=window.inspectorFixture,c=f.canvas;c.selectMany([f.text,f.note.element]);if(!c.execute('group').ok)return false;c.select(f.text);const grouped=c.getState().selectionCount===2&&c.execute('inspect',{field:'x',value:90}).ok;c.execute('lock',true);const before=JSON.stringify(c.saveDocument());const rejected=!c.execute('inspect',{field:'height',value:150}).ok&&before===JSON.stringify(c.saveDocument());c.execute('lock',false);c.execute('ungroup');return grouped&&rejected;}),'Group or batch lock contract failed');
});
await check('unsupported custom owners disable mixed inspection without DOM fallback',async()=>{
 assert(await page.evaluate(()=>{const f=window.inspectorFixture,el=document.createElement('div');el.textContent='Unsupported';f.host.append(el);const reg=f.canvas.register(el,{capture:()=>({}),restore(){},dispose(){}});f.canvas.selectMany([f.text,el]);const ok=f.canvas.getInspector()===null&&!f.canvas.execute('inspect',{field:'x',value:20}).ok;reg.dispose();el.remove();return ok;}),'Unsupported owner acquired geometry');
});
await check('owner failure rolls back the entire batch and preserves history revision',async()=>{
 assert(await page.evaluate(()=>{const f=window.inspectorFixture,el=document.createElement('div');el.textContent='Failing owner';f.host.append(el);let value=0;const geometry={...f.owner.geometry,prepare:()=>()=>{value=2;throw Error('test owner rejection');}};const reg=f.canvas.register(el,{geometry,capture:()=>({value}),restore:s=>{value=s.value;},dispose(){}});f.canvas.selectMany([f.text,el]);const before=JSON.stringify(f.owner.capture()),revision=f.canvas.getState().revision;let threw=false;try{f.canvas.execute('inspect',{field:'x',value:100});}catch{threw=true;}const ok=threw&&value===0&&JSON.stringify(f.owner.capture())===before&&f.canvas.getState().revision===revision;reg.dispose();el.remove();return ok;}),'Atomic rollback failed');
});
await check('bounds clamps invalid API inputs and no-op edits do not create history',async()=>{
 assert(await page.evaluate(()=>{const f=window.inspectorFixture,c=f.canvas;c.select(f.text);const bounded=c.execute('inspect',{field:'x',value:-999});const g=c.getInspector(),revision=c.getState().revision;const noOp=c.execute('inspect',{field:'x',value:g.x});const ok=bounded.ok&&Math.abs(g.x-8)<.1&&noOp.ok&&c.getState().revision===revision;const before=JSON.stringify(c.saveDocument());return ok&&[null,NaN,Infinity,'10'].every(value=>!c.execute('inspect',{field:'width',value}).ok)&&JSON.stringify(c.saveDocument())===before;}),'Bounds validation or no-op history failed');
});
await check('editing and provisional creation reject numeric changes',async()=>{
 assert(await page.evaluate(()=>{const f=window.inspectorFixture,c=f.canvas;c.select(f.text);c.execute('edit');const editing=c.getInspector()===null&&c.execute('inspect',{field:'x',value:50}).reason==='busy';c.execute('finish-edit');const pending=c.beginCreation(()=>{});const creating=c.getInspector()===null&&c.execute('inspect',{field:'x',value:50}).reason==='busy';pending.cancel();return editing&&creating;}),'Busy state bypassed');
});
await check('active keyboard gestures reject inspector commands until key release',async()=>{
 await page.focus('#inspector-fixture-text');await page.keyboard.down('ArrowRight');
 assert(await page.evaluate(()=>{const c=window.inspectorFixture.canvas;return c.getInspector()===null&&c.execute('inspect',{field:'x',value:100}).reason==='busy';}),'Gesture bypass');
 await page.keyboard.up('ArrowRight');assert(await page.evaluate(()=>!!window.inspectorFixture.canvas.getInspector()),'Gesture did not release');
});
await check('mobile RTL dark popover is contained with 44px inputs and explicit Close',async()=>{
 await page.evaluate(()=>{window.inspectorFixture.canvas.destroy();window.inspectorFixture.container.remove();document.documentElement.dir='rtl';const a=document.querySelector('main').configurator.previews.A;a.update({...a.getConfig(),theme:'dark'});a.canvas.select(document.querySelector('[data-preview=A] [data-original]'));});
 await page.cdp('Emulation.setDeviceMetricsOverride',{width:320,height:700,deviceScaleFactor:1,mobile:false});await page.click('[data-preview=A] button[aria-label="Selection inspector"]');
 assert(await page.evaluate(()=>{const p=document.querySelector('[data-preview=A] .canvas-embed-inspector'),r=p.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight&&[...p.querySelectorAll('input')].every(i=>i.getBoundingClientRect().height>=44&&getComputedStyle(i).color===getComputedStyle(p).color)&&document.documentElement.scrollWidth<=innerWidth&&getComputedStyle(p).backgroundColor==='rgb(36, 36, 39)';}),'Mobile theme or containment failed');
 await page.screenshot({path:'/tmp/canvas-inspector-mobile.png'});await page.click('[data-preview=A] .canvas-embed-inspector button');
 assert(await page.evaluate(()=>!document.querySelector('[data-preview=A] .canvas-embed-inspector').matches(':popover-open')),'Close failed');
 await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await page.evaluate(()=>document.documentElement.dir='ltr');
});
await check('viewport changes dismiss unfinished fields without mutation',async()=>{
 await page.click('[data-preview=A] button[aria-label="Selection inspector"]');const revision=await page.evaluate(()=>document.querySelector('main').configurator.previews.A.canvas.getState().revision);await page.fill(field('x'),'123');await page.cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
 assert(await page.evaluate(revision=>!document.querySelector('[data-preview=A] .canvas-embed-inspector').matches(':popover-open')&&document.querySelector('main').configurator.previews.A.canvas.getState().revision===revision,revision),'Viewport dismissal committed');
});
await check('full-screen inspector stays in its host and Escape returns focus',async()=>{
 await page.evaluate(()=>{const root=document.querySelector('[data-preview=A] .configured-canvas'),button=document.createElement('button');button.id='inspector-fullscreen';button.textContent='Test full screen';button.onclick=()=>root.requestFullscreen();root.append(button);});
 await page.click('#inspector-fullscreen');await page.waitForFunction(()=>!!document.fullscreenElement);
 await page.click('[data-preview=A] button[aria-label="Selection inspector"]');
 assert(await page.evaluate(()=>{const p=document.querySelector('[data-preview=A] .canvas-embed-inspector'),r=p.getBoundingClientRect();return document.fullscreenElement.contains(p)&&p.matches(':popover-open')&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;}),'Full-screen containment failed');
 await page.screenshot({path:'/tmp/canvas-inspector-fullscreen.png'});await page.press(field('x'),'Escape');await page.evaluate(()=>document.exitFullscreen());await page.waitForFunction(()=>!document.fullscreenElement);await page.evaluate(()=>document.getElementById('inspector-fullscreen').remove());
});
await check('50 repeated inspector-host disposals release DOM and scoped listeners',async()=>{
 await page.cdp('HeapProfiler.collectGarbage');const before=await page.cdp('Memory.getDOMCounters');
 const clean=await page.evaluate(async()=>{const {mountEmbed}=await import('/examples/configurator/canvas-embed.js'),el=document.createElement('div');document.body.append(el);const count=document.querySelectorAll('*').length;let ok=true;for(let i=0;i<50;i++){const e=mountEmbed(el),old=e.canvas;e.dispose();e.dispose();ok&&=!old.getState().mounted&&!el.childElementCount;}ok&&=document.querySelectorAll('*').length===count;el.remove();return ok;});
 await page.cdp('HeapProfiler.collectGarbage');const after=await page.cdp('Memory.getDOMCounters');console.log('Inspector cleanup metrics',{listenerDelta:after.jsEventListeners-before.jsEventListeners});assert(clean&&after.jsEventListeners<=before.jsEventListeners,'Inspector disposal retained resources');
});
assert(await page.evaluate(()=>window.inspectorErrors.length===0),'Unexpected console errors');console.log(`PASS ${passed} inspector scenarios`);
