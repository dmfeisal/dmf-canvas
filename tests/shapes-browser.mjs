// Shapes (docs/prd/SHAPES.md step 6): drawing, free resize, Shape style, Save/Open, permission and mobile RTL,
// on the configurator's preview A, which runs the same embed as the playground and generated integrations.
const task=await taskSpace(shapesTest.spaceId),page=task.page('p1');if(task.ownership!=='agent')throw new Error('Use an agent-owned space.');
const assert=(value,message)=>{if(!value)throw new Error(message);};let passed=0;
async function check(name,run){console.log('RUN '+name);await run();passed++;console.log('PASS '+name);}
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await page.goto(shapesTest.base+'/examples/configurator/');await page.waitForFunction(()=>!document.getElementById('copy').disabled);
await page.evaluate(()=>{window.shapeErrors=[];window.addEventListener('error',e=>window.shapeErrors.push(e.message));window.addEventListener('unhandledrejection',e=>window.shapeErrors.push(String(e.reason)));});
const A='[data-preview=A]';
// Host-local geometry helpers: the preview host's client box, and a shape record by kind.
const host=()=>page.evaluate(sel=>{const h=document.querySelector(sel+' [data-host]');h.scrollIntoView({block:'center'});const r=h.getBoundingClientRect();return {x:r.left+h.clientLeft,y:r.top+h.clientTop,w:h.clientWidth,h:h.clientHeight};},A);
const shapes=()=>page.evaluate(()=>document.querySelector('main').configurator.previews.A.canvas.saveDocument().objects.filter(o=>o.type==='shape'));
const state=()=>page.evaluate(()=>{const p=document.querySelector('main').configurator.previews.A,h=p.root.querySelector('[data-host]');return {...p.canvas.getState(),tool:h.dataset.instancePencilTool??null};});
const action=id=>`${A} [data-toolbar-action="${id}"]`;
async function drag(from,to,{shift=false}={}){
 const box=await host();await page.mouse.move(box.x+from[0],box.y+from[1]);if(shift)await page.keyboard.down('Shift');
 await page.mouse.down();await page.mouse.move(box.x+(from[0]+to[0])/2,box.y+(from[1]+to[1])/2,{steps:4});await page.mouse.move(box.x+to[0],box.y+to[1],{steps:4});await page.mouse.up();
 if(shift)await page.keyboard.up('Shift');
}

await check('the rail arms Shapes and the options bar offers kinds, inks, widths, fill and corners',async()=>{
 await page.click(action('shapes'));
 const visible=await page.evaluate(sel=>[...document.querySelectorAll(sel+' [data-chrome-slot=options] [data-toolbar-action]')].filter(b=>!b.hidden).map(b=>b.dataset.toolbarAction+(b.getAttribute('aria-pressed')==='true'?'*':'')),A);
 assert(JSON.stringify(visible)===JSON.stringify(['shape-rectangle*','shape-ellipse','shape-diamond','shape-line','shape-arrow','ink-shape-primary*','ink-shape-blue','ink-shape-red','width-thin','width-medium*','width-bold','shape-fill','shape-corners']),'Unexpected Shapes options: '+visible.join(','));
 assert((await state()).tool==='shape','Shapes did not arm');
});

await check('a drag draws a rectangle the size of the drag, selects it and returns to Select',async()=>{
 await page.click(action('ink-shape-blue'));await page.click(action('shape-fill'));
 await drag([300,60],[460,160]);
 const [rect]=await shapes(),s=await state();
 assert(rect?.shape==='rectangle'&&rect.ink==='blue'&&rect.fill==='tint'&&Math.abs(rect.layout.width-160)<=1&&Math.abs(rect.layout.height-100)<=1,'Rectangle did not match the drag: '+JSON.stringify(rect?.layout));
 assert(s.selectionName==='Rectangle'&&s.tool===null&&s.canUndo,'Rectangle was not selected or the tool stayed armed');
});

await check('Shift keeps a circle and snaps a line to 45 degrees',async()=>{
 await page.focus(A+' [data-host]');await page.keyboard.press('o');await drag([520,60],[620,110],{shift:true});
 const ellipse=(await shapes()).at(-1);assert(ellipse.shape==='ellipse'&&Math.abs(ellipse.layout.width-ellipse.layout.height)<=1,'Shift did not keep a circle: '+JSON.stringify(ellipse.layout));
 await page.focus(A+' [data-host]');await page.keyboard.press('l');await drag([320,200],[420,250],{shift:true});
 const line=(await shapes()).at(-1),[a,b]=line.points,angle=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
 assert(line.shape==='line'&&Math.abs(Math.abs(angle)%45)<0.5,'Shift did not snap the line: '+angle);
});

await check('a click places a default shape and Enter places one without a pointer',async()=>{
 await page.click(action('shapes'));await page.click(action('shape-diamond'));const box=await host();await page.mouse.click(box.x+600,box.y+230);
 const diamond=(await shapes()).at(-1);assert(diamond.shape==='diamond'&&diamond.layout.width===120&&diamond.layout.height===80,'Click did not place a 120 x 80 diamond');
 await page.focus(A+' [data-host]');await page.keyboard.press('a');await page.keyboard.press('Enter');
 const arrow=(await shapes()).at(-1),s=await state();
 assert(arrow.shape==='arrow'&&s.selectionName==='Arrow'&&await page.evaluate(()=>document.activeElement.getAttribute('aria-label'))==='Arrow','Enter did not place and focus an arrow');
});

await check('side and corner handles resize freely, keep the opposite edge and keep the stroke width',async()=>{
 // The Enter-placed arrow sits on the rectangle's bottom edge; handles render at their object's layer, so bring it forward.
 await page.evaluate(()=>{const p=document.querySelector('main').configurator.previews.A;p.canvas.select(p.root.querySelector('[data-canvas-instance-shape=rectangle]'));p.canvas.execute('bring-front');});
 const before=await page.evaluate(sel=>{const r=document.querySelector(sel+' [data-canvas-instance-shape=rectangle]').getBoundingClientRect();return {left:r.left,top:r.top,w:r.width,h:r.height};},A);
 const handle=async kind=>page.evaluate(([sel,kind])=>{const b=document.querySelector(sel+' [data-canvas-instance-shape=rectangle] .canvas-instance-handle--'+kind).getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2];},[A,kind]);
 let [x,y]=await handle('e');await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+50,y,{steps:5});await page.mouse.up();
 [x,y]=await handle('s');await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x,y+30,{steps:5});await page.mouse.up();
 const after=await page.evaluate(sel=>{const e=document.querySelector(sel+' [data-canvas-instance-shape=rectangle]'),r=e.getBoundingClientRect();return {left:r.left,top:r.top,w:r.width,h:r.height,scale:e.style.scale,stroke:e.querySelector('rect').getAttribute('stroke-width'),handles:e.querySelectorAll('.canvas-instance-handle').length};},A);
 assert(Math.abs(after.w-before.w-50)<=1&&Math.abs(after.h-before.h-30)<=1&&Math.abs(after.left-before.left)<0.5&&Math.abs(after.top-before.top)<0.5,'Free resize failed: '+JSON.stringify({before,after}));
 assert(after.scale==='1'&&after.stroke==='4'&&after.handles===9,'Resize scaled the shape or lost handles');
 const hit=await page.evaluate(sel=>{const b=document.querySelector(sel+' [data-canvas-instance-shape=rectangle] .canvas-instance-handle--n').getBoundingClientRect();return [Math.round(b.width),Math.round(b.height)];},A);
 assert(hit[0]===24&&hit[1]===24,'Shape handles must keep 24px hit areas');
});

await check('More › Shape style restyles the selection as one Undo step',async()=>{
 await page.click(action('more'));await page.click(action('style-ink-red'));
 await page.click(action('more'));await page.click(action('style-corners'));
 let rect=(await shapes()).find(o=>o.shape==='rectangle');assert(rect.ink==='red'&&rect.corners==='round','Shape style did not apply');
 await page.click(action('undo'));rect=(await shapes()).find(o=>o.shape==='rectangle');assert(rect.ink==='red'&&rect.corners==='sharp','One Undo did not revert exactly one style change');
 await page.click(action('redo'));
 const rows=await page.evaluate(sel=>{const p=document.querySelector('main').configurator.previews.A;p.canvas.select(p.root.querySelector('[data-canvas-instance-shape=line]'));return [...document.querySelectorAll(sel+' [role=menu] [data-toolbar-action^=style-]')].filter(r=>!r.hidden).map(r=>r.dataset.toolbarAction);},A);
 assert(!rows.includes('style-fill')&&!rows.includes('style-corners')&&rows.includes('style-ink-blue'),'A line offered Fill or Round corners: '+rows.join(','));
});

await check('Save and Open keep every shape, its box and its style',async()=>{
 const result=await page.evaluate(()=>{
  const c=document.querySelector('main').configurator.previews.A.canvas,saved=c.saveDocument(),loaded=c.loadDocument(saved),again=c.saveDocument();
  // Report the first differing path so a failure says what changed. Positions are saved through whole-pixel offsets, so
  // Open may re-contain a box by a fraction of a pixel (as for Drawings); numbers within half a pixel count as equal.
  const diff=(a,b,path='')=>{if(JSON.stringify(a)===JSON.stringify(b)||typeof a==='number'&&typeof b==='number'&&Math.abs(a-b)<0.5)return null;if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const key of new Set([...Object.keys(a),...Object.keys(b)])){const found=diff(a[key],b[key],path+'.'+key);if(found)return found;}return null;}return path+': '+JSON.stringify(a)+' -> '+JSON.stringify(b);};
  const changed=diff(saved.objects,again.objects);
  return {version:saved.version,loaded:loaded.ok,same:changed===null,diff:changed,kinds:saved.objects.filter(o=>o.type==='shape').map(o=>o.shape).sort().join(',')};
 });
 assert(result.version===4&&result.loaded&&result.same&&result.kinds==='arrow,diamond,ellipse,line,rectangle','Save/Open lost shapes: '+JSON.stringify(result));
});

await check('turning off the shapes permission hides the tool, ignores R and leaves Pencil alone',async()=>{
 await page.click('[data-tool=shapes]');await page.focus(A+' [data-host]');await page.keyboard.press('r');
 const off=await page.evaluate(sel=>{const p=document.querySelector('main').configurator.previews.A,b=document.querySelector(sel+' [data-toolbar-action="shapes"]');return {hidden:b.hidden||!!b.closest('[hidden]'),tool:p.root.querySelector('[data-host]').dataset.instancePencilTool??null,pencil:!document.querySelector(sel+' [data-toolbar-action="pencil"]').hidden,code:document.getElementById('code').value.includes('"shapes": false')};},A);
 assert(off.hidden&&off.tool===null&&off.pencil&&off.code,'Shapes permission did not apply: '+JSON.stringify(off));
 await page.click('[data-tool=shapes]');
});

await check('mobile RTL keeps the rail usable and a drawn shape inside the surface',async()=>{
 await page.cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
 await page.evaluate(sel=>{document.documentElement.dir='rtl';document.querySelector(sel+' [data-host]').scrollIntoView({block:'center'});},A);
 await page.click(action('shapes'));await page.click(action('shape-rectangle'));
 const box=await host();await drag([box.w/2-40,60],[box.w/2+40,120]);
 const fits=await page.evaluate(sel=>{const h=document.querySelector(sel+' [data-host]').getBoundingClientRect(),shapes=[...document.querySelectorAll(sel+' .canvas-instance-shape')].map(e=>e.getBoundingClientRect());return document.documentElement.scrollWidth<=innerWidth&&shapes.every(r=>r.left>=h.left-1&&r.right<=h.right+1);},A);
 assert(fits,'Mobile RTL overflowed or a shape left the surface');
 await page.evaluate(()=>{document.documentElement.dir='';});
});

assert(await page.evaluate(()=>window.shapeErrors.length===0&&!localStorage.length),'Shapes raised page errors or wrote storage');
console.log(`PASS shapes browser suite (${passed} checks)`);
