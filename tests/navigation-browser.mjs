// Navigation (docs/prd/NAVIGATION.md) step 1: the camera model in core, on tests/fixtures/camera.html.
const task=await taskSpace(navigationTest.spaceId),page=task.page('p1');if(task.ownership!=='agent')throw new Error('Use an agent-owned space.');
const assert=(value,message)=>{if(!value)throw new Error(message);};let passed=0;
async function check(name,run){console.log('RUN '+name);await run();passed++;console.log('PASS '+name);}
const near=(a,b,tolerance=0.75)=>Math.abs(a-b)<=tolerance;
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await page.goto(navigationTest.base+'/tests/fixtures/camera.html');await page.waitForFunction(()=>!!window.cam);
await page.evaluate(()=>{window.camErrors=[];window.addEventListener('error',e=>window.camErrors.push(e.message));window.addEventListener('unhandledrejection',e=>window.camErrors.push(String(e.reason)));
 window.camChanges=0;window.cam.canvas.subscribeChanges(()=>window.camChanges++);});
const run=(command,value)=>page.evaluate(([command,value])=>window.cam.canvas.execute(command,value),[command,value]);
const state=()=>page.evaluate(()=>{const s=window.cam.canvas.getState();return {camera:s.camera,hand:s.hand,limits:s.settings.camera,canUndo:s.canUndo,status:document.querySelector('#host [data-canvas-instance-status]').textContent};});
const rect=selector=>page.evaluate(selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,cx:r.left+r.width/2,cy:r.top+r.height/2};},selector);
const host=()=>page.evaluate(()=>{const h=window.cam.host,r=h.getBoundingClientRect();return {x:r.left+h.clientLeft,y:r.top+h.clientTop,width:h.clientWidth,height:h.clientHeight};});
async function drag(from,to){await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move((from.x+to.x)/2,(from.y+to.y)/2,{steps:4});await page.mouse.move(to.x,to.y,{steps:4});await page.mouse.up();}

await check('the camera starts at 100%, marks the world and reports its limits',async()=>{
 const s=await state();assert(JSON.stringify(s.camera)==='{"x":0,"y":0,"scale":1}','Initial camera '+JSON.stringify(s.camera));
 assert(JSON.stringify(s.limits)==='{"minScale":0.2,"maxScale":4}','Limits '+JSON.stringify(s.limits));
 assert(await page.evaluate(()=>window.cam.world.hasAttribute('data-canvas-instance-world')),'World not marked');
});

await check('zoom keeps the world point under the chosen point in place',async()=>{
 const before=await rect('#text');const h=await host();
 const around={x:before.cx-h.x,y:before.cy-h.y};
 assert((await run('zoom',{to:2,around})).ok,'Zoom failed');
 const after=await rect('#text'),s=await state();
 assert(s.camera.scale===2,'Scale '+s.camera.scale);
 assert(near(after.cx,before.cx)&&near(after.cy,before.cy),`Anchor moved: ${before.cx},${before.cy} -> ${after.cx},${after.cy}`);
 assert(near(after.width,before.width*2,1),'Text did not scale: '+before.width+' -> '+after.width);
 assert(s.status==='Zoom 200%.','Status '+s.status);
});

await check('zoom clamps to the limits and the camera command sets the view',async()=>{
 await run('zoom',{by:100});assert((await state()).camera.scale===4,'Max clamp');
 await run('zoom',{to:.01});assert((await state()).camera.scale===.2,'Min clamp');
 assert(!(await run('zoom',{by:2,to:1})).ok,'Zoom with by and to accepted');
 assert(!(await run('camera',{scale:-1})).ok,'Negative scale accepted');
 assert((await run('camera',{x:0,y:0,scale:2})).ok,'Camera command failed');
 const s=await state();assert(JSON.stringify(s.camera)==='{"x":0,"y":0,"scale":2}','Camera '+JSON.stringify(s.camera));
});

await check('the dotted grid follows the camera',async()=>{
 await run('camera',{x:5,y:7,scale:2});
 const bg=await page.evaluate(()=>({size:window.cam.host.style.backgroundSize,position:window.cam.host.style.backgroundPosition}));
 assert(bg.size==='48px 48px','Grid size '+bg.size);assert(bg.position==='38px 34px','Grid offset '+bg.position);
 await run('camera',{x:0,y:0,scale:2});
});

await check('a pointer drag at 2x keeps the object under the pointer',async()=>{
 // Look at the rectangle (world 400,250): it is drawn 200,100 into the host at 2x.
 await run('camera',{x:300,y:200,scale:2});
 const before=await rect('#host [data-canvas-instance-shape]');
 await drag({x:before.cx,y:before.cy},{x:before.cx+100,y:before.cy+60});
 const after=await rect('#host [data-canvas-instance-shape]');
 // A 6px snap may pull the edge, so allow the snap distance.
 assert(near(after.left-before.left,100,6.5)&&near(after.top-before.top,60,6.5),`Moved ${after.left-before.left},${after.top-before.top} for a 100,60 drag`);
 const record=await page.evaluate(()=>window.cam.canvas.saveDocument().objects[0].state);
 assert(near(record.x*2,after.left-before.left,1),'World state did not move by screen/scale: '+JSON.stringify(record));
});

await check('arrow-key nudges move whole screen pixels at 2x',async()=>{
 await page.evaluate(()=>window.cam.rect.focus());const before=await rect('#host [data-canvas-instance-shape]');
 await page.keyboard.press('ArrowRight');await page.keyboard.down('Shift');await page.keyboard.press('ArrowDown');await page.keyboard.up('Shift');
 const after=await rect('#host [data-canvas-instance-shape]');
 assert(near(after.left-before.left,1,.2)&&near(after.top-before.top,10,.2),`Nudged ${after.left-before.left},${after.top-before.top}`);
});

await check('transform handles stay 24 screen pixels and resize follows the pointer at 2x',async()=>{
 const handle=await rect('#host [data-canvas-instance-shape] .canvas-instance-handle--se');
 assert(near(handle.width,24,.5)&&near(handle.height,24,.5),'Handle size '+handle.width+'x'+handle.height);
 const before=await rect('#host [data-canvas-instance-shape]');
 await drag({x:handle.cx,y:handle.cy},{x:handle.cx+40,y:handle.cy+30});
 const after=await rect('#host [data-canvas-instance-shape]');
 assert(near(after.width-before.width,40,1.5)&&near(after.height-before.height,30,1.5),`Resized by ${after.width-before.width},${after.height-before.height}`);
 assert(near(after.left,before.left,1)&&near(after.top,before.top,1),'Opposite corner moved');
});

await check('the world is unbounded: a drag past the host edge is not clamped',async()=>{
 const h=await host(),before=await rect('#host [data-canvas-instance-shape]');
 await drag({x:before.cx,y:before.cy},{x:h.x+h.width-10,y:before.cy});
 const after=await rect('#host [data-canvas-instance-shape]');
 assert(after.right>h.x+h.width+20,'Object was clamped to the host: right '+after.right+' vs host '+(h.x+h.width));
});

await check('Fit all frames every object and Zoom to selection frames the selection',async()=>{
 assert((await run('fit')).ok,'Fit failed');
 const h=await host(),text=await rect('#text'),shape=await rect('#host [data-canvas-instance-shape]');
 const inside=r=>r.left>=h.x+31&&r.right<=h.x+h.width-31&&r.top>=h.y+31&&r.bottom<=h.y+h.height-31;
 assert(inside(text)&&inside(shape),'Fit left objects outside: '+JSON.stringify({text,shape,h}));
 assert((await state()).camera.scale<=1,'Fit zoomed past 100%');
 await page.evaluate(()=>window.cam.canvas.select(window.cam.text));
 assert((await run('zoom-to-selection')).ok,'Zoom to selection failed');
 const t=await rect('#text'),s=await state();
 assert(near(t.cx,h.x+h.width/2,1)&&near(t.cy,h.y+h.height/2,1),'Selection not centred');
 assert(s.camera.scale>1&&s.camera.scale<=4,'Zoom to selection scale '+s.camera.scale);
});

await check('camera changes never enter history or change events, and work read-only',async()=>{
 const changes=await page.evaluate(()=>window.camChanges),undoBefore=await page.evaluate(()=>window.cam.canvas.getState().canUndo);
 await run('zoom',{by:.5});await run('camera',{x:10,y:10});
 assert(await page.evaluate(()=>window.camChanges)===changes,'Camera produced change events');
 assert(await page.evaluate(()=>window.cam.canvas.getState().canUndo)===undoBefore,'Camera changed history');
 const saved=await page.evaluate(()=>JSON.stringify(window.cam.canvas.saveDocument()));
 assert(!/camera|"scale":2\b/.test(saved.replace(/"state":\{[^}]*\}/g,'')),'Camera leaked into the board');
 await page.evaluate(()=>window.cam.canvas.configure({readOnly:true}));
 assert((await run('zoom',{to:1})).ok,'Read-only zoom refused');
 await page.evaluate(()=>window.cam.canvas.configure({readOnly:false}));
});

await check('configure changes the limits but not the world',async()=>{
 await run('zoom',{to:4});
 assert((await page.evaluate(()=>window.cam.canvas.configure({camera:{maxScale:2}}))).ok,'Limit change failed');
 assert((await state()).camera.scale===2,'Scale not re-clamped');
 const threw=await page.evaluate(()=>{try{window.cam.canvas.configure({camera:false});return false;}catch{return true;}});
 assert(threw,'Turning the camera off was accepted');
});

await check('panning and zooming while editing text does not move it when editing ends',async()=>{
 await run('camera',{x:0,y:0,scale:1});
 const read=()=>page.evaluate(()=>{const o=window.cam.canvas.saveDocument().originals[0].data.state;return {x:o.x,y:o.y};});
 const before=await read();
 await page.evaluate(()=>{window.cam.canvas.select(window.cam.text);window.cam.canvas.execute('edit');});
 assert(await page.evaluate(()=>window.cam.canvas.getState().editing),'Editing did not start');
 assert((await run('zoom',{to:1.5,around:{x:50,y:40}})).ok&&(await run('camera',{x:-30,y:20})).ok,'Camera refused while editing');
 await run('finish-edit');const after=await read();
 assert(near(after.x,before.x,.01)&&near(after.y,before.y,.01),'Text moved: '+JSON.stringify({before,after}));
});

await check('at low zoom, handle spacing and small-box hiding use the drawn size',async()=>{
 await page.evaluate(()=>window.cam.canvas.select(window.cam.rect));await run('zoom-to-selection');await run('zoom',{to:.2});
 const seen=await page.evaluate(()=>{const n=window.cam.rect,box=n.getBoundingClientRect(),h=k=>n.querySelector('.canvas-instance-handle--'+k).getBoundingClientRect();
  return {width:box.width,height:box.height,narrow:n.hasAttribute('data-canvas-instance-narrow'),short:n.hasAttribute('data-canvas-instance-short'),nw:h('nw').toJSON(),sw:h('sw').toJSON(),ne:h('ne').toJSON()};});
 assert(seen.width<48&&seen.narrow&&seen.short,'Small-box hiding ignored the zoom: '+JSON.stringify(seen));
 assert(seen.nw.bottom<=seen.sw.top+.5&&seen.nw.right<=seen.ne.left+.5,'Corner handles overlap: '+JSON.stringify(seen));
 assert(near(seen.nw.width,24,.5),'Handle size '+seen.nw.width);
});

// Step 2: coordinates everywhere else.
const worldLeft=()=>page.evaluate(()=>{const r=window.cam.world.getBoundingClientRect();return {x:r.left,y:r.top};});
const selectedRect=()=>page.evaluate(()=>{const el=[...window.cam.host.querySelectorAll('[data-canvas-instance-selected]')][0];const r=el.getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height,cx:r.left+r.width/2,cy:r.top+r.height/2};});

await check('the inspector reports and applies world units at 2x',async()=>{
 await run('camera',{x:300,y:200,scale:2});await page.evaluate(()=>window.cam.canvas.select(window.cam.rect));
 const r=await rect('#host [data-canvas-instance-shape]'),w=await worldLeft(),ins=await page.evaluate(()=>window.cam.canvas.getInspector());
 assert(near(ins.x,(r.left-w.x)/2,.6)&&near(ins.y,(r.top-w.y)/2,.6),'Inspector position not in world units: '+JSON.stringify({ins,r,w}));
 assert(near(ins.width,r.width/2,.6)&&near(ins.height,r.height/2,.6),'Inspector size not in world units: '+JSON.stringify(ins));
 assert((await run('inspect',{field:'x',value:ins.x+50})).ok,'Inspector X refused');
 const after=await rect('#host [data-canvas-instance-shape]');assert(near(after.left-r.left,100,.6),'X +50 world moved '+(after.left-r.left)+' screen px');
});

await check('the inspector panel closes when the camera moves and says it shows canvas units',async()=>{
 const open=await page.evaluate(()=>{window.cam.inspector.toggle();const p=document.querySelector('.canvas-embed-inspector');return {open:p.matches(':popover-open'),help:p.querySelector('p').textContent};});
 assert(open.open&&/Canvas units/.test(open.help),'Inspector did not open with canvas-unit help: '+JSON.stringify(open));
 await run('camera',{x:310});
 assert(!(await page.evaluate(()=>document.querySelector('.canvas-embed-inspector').matches(':popover-open'))),'Inspector stayed open after a pan');
});

await check('a new Sticky Note goes to the visible centre',async()=>{
 await run('camera',{x:1000,y:800,scale:.5});const h=await host();
 assert(await page.evaluate(()=>!!window.cam.addNote()),'Note not created');
 const note=await page.evaluate(()=>{const r=window.cam.world.querySelector('.canvas-instance-note').getBoundingClientRect();return {cx:r.left+r.width/2,cy:r.top+r.height/2,width:r.width};});
 // The note sits 16 world units above the centre (room for its toolbar), 8 screen px at 0.5x.
 assert(near(note.cx,h.x+h.width/2,1)&&near(note.cy,h.y+h.height/2-8,1.5),'Note not at the visible centre: '+JSON.stringify({note,h}));
});

await check('paste puts copies at the visible centre',async()=>{
 await page.evaluate(()=>window.cam.canvas.select(window.cam.rect));assert((await run('copy')).ok,'Copy failed');
 await run('camera',{x:-1500,y:-900,scale:1});assert((await run('paste')).ok,'Paste failed');
 const h=await host(),copy=await selectedRect();
 assert(near(copy.cx,h.x+h.width/2,1)&&near(copy.cy,h.y+h.height/2,1),'Paste not centred: '+JSON.stringify({copy,h}));
});

await check('Pencil strokes at 2x land under the pointer in world units',async()=>{
 await run('camera',{x:-1500,y:-900,scale:2});const h=await host();
 const count=()=>page.evaluate(()=>window.cam.world.querySelectorAll('.canvas-instance-drawing').length),before=await count();
 assert(await page.evaluate(()=>{window.cam.pencil.setTool('pencil');return window.cam.pencil.setActive(true);}),'Pencil did not arm');
 await drag({x:h.x+100,y:h.y+100},{x:h.x+300,y:h.y+200});
 assert(await count()===before+1,'No drawing committed');
 const d=await selectedRect();
 // 200 x 100 screen px at 2x is 100 x 50 world units, plus 4 units of padding on each side (16 screen px in all).
 assert(near(d.width,216,3)&&near(d.height,116,3)&&near(d.left,h.x+92,3)&&near(d.top,h.y+92,3),'Drawing misplaced: '+JSON.stringify({d,h}));
});

await check('a camera change mid-stroke cancels the unfinished ink',async()=>{
 const h=await host(),count=()=>page.evaluate(()=>window.cam.world.querySelectorAll('.canvas-instance-drawing').length),before=await count();
 await page.evaluate(()=>window.cam.pencil.setActive(true));
 await page.mouse.move(h.x+400,h.y+300);await page.mouse.down();await page.mouse.move(h.x+450,h.y+320,{steps:4});
 assert(await page.evaluate(()=>window.cam.pencil.getState().drawing),'Stroke did not start');
 await run('camera',{x:-1400});await page.mouse.move(h.x+500,h.y+340,{steps:2});await page.mouse.up();
 const left=await page.evaluate(()=>({drawing:window.cam.pencil.getState().drawing,previews:window.cam.host.querySelectorAll('[data-canvas-instance-preview]').length}));
 assert(await count()===before&&!left.drawing&&left.previews===0,'Stroke survived the camera change: '+JSON.stringify(left));
 await page.evaluate(()=>window.cam.pencil.setActive(false));
});

await check('the Shapes tool at 2x draws world-unit shapes under the pointer',async()=>{
 await run('camera',{x:-1500,y:-900,scale:2});const h=await host();
 assert(await page.evaluate(()=>{window.cam.pencil.setTool('shape');window.cam.pencil.setShape('ellipse');return window.cam.pencil.setActive(true);}),'Shapes did not arm');
 await drag({x:h.x+500,y:h.y+120},{x:h.x+600,y:h.y+180});
 const shape=await selectedRect(),layout=await page.evaluate(()=>{const s=window.cam.canvas.saveDocument().objects.find(o=>o.shape==='ellipse');return s.layout;});
 assert(near(shape.left,h.x+500,1)&&near(shape.width,100,1)&&near(shape.height,60,1),'Shape misplaced: '+JSON.stringify({shape,h}));
 assert(near(layout.width,50,.1)&&near(layout.height,30,.1),'Shape not in world units: '+JSON.stringify(layout));
});

// Step 3: Hand, wheel, pinch and keys.
const cam=async()=>(await state()).camera;
const focusHost=()=>page.evaluate(()=>{window.cam.canvas.select(null);window.cam.canvas.focus();});
const frame=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));

await check('H arms Hand, which pans on drag without moving objects, and V returns to Select',async()=>{
 await page.evaluate(()=>window.cam.canvas.configure({camera:{maxScale:4}}));await run('camera',{x:300,y:200,scale:2});await focusHost();
 await page.keyboard.press('h');let s=await state();
 assert(s.hand==='tool'&&await page.evaluate(()=>window.cam.host.hasAttribute('data-canvas-instance-hand')),'H did not arm Hand: '+JSON.stringify(s));
 const before=await rect('#host [data-canvas-instance-shape]'),saved=await page.evaluate(()=>JSON.stringify(window.cam.canvas.saveDocument()));
 const h=await host();await drag({x:h.x+300,y:h.y+200},{x:h.x+380,y:h.y+240});await frame();
 s=await state();assert(near(s.camera.x,300-40,.01)&&near(s.camera.y,200-20,.01),'Hand did not pan by screen/scale: '+JSON.stringify(s.camera));
 const after=await rect('#host [data-canvas-instance-shape]');assert(near(after.left-before.left,80,.6)&&near(after.top-before.top,40,.6),'The view did not follow the drag');
 assert(await page.evaluate(()=>JSON.stringify(window.cam.canvas.saveDocument()))===saved,'Hand moved an object');
 await page.keyboard.press('v');assert((await state()).hand===null,'V did not return to Select');
});

await check('Space held is a temporary Hand, and arming Pencil or Hand releases the other',async()=>{
 await focusHost();const h=await host(),start=await cam();
 await page.keyboard.down('Space');assert((await state()).hand==='space','Space did not arm a temporary Hand');
 await drag({x:h.x+300,y:h.y+300},{x:h.x+250,y:h.y+300});await page.keyboard.up('Space');await frame();
 const s=await state();assert(s.hand===null&&near(s.camera.x,start.x+50/start.scale,.01),'Space pan wrong: '+JSON.stringify(s));
 await page.evaluate(()=>{window.cam.pencil.setTool('pencil');window.cam.pencil.setActive(true);});await page.keyboard.press('h');
 assert((await state()).hand==='tool'&&!(await page.evaluate(()=>window.cam.pencil.getState().active)),'Hand did not disarm Pencil');
 assert(await page.evaluate(()=>window.cam.pencil.setActive(true)),'Pencil did not arm');
 assert((await state()).hand===null,'Pencil did not disarm Hand');
 const count=()=>page.evaluate(()=>window.cam.world.querySelectorAll('.canvas-instance-drawing').length),drawings=await count();
 await page.keyboard.down('Space');await drag({x:h.x+300,y:h.y+260},{x:h.x+360,y:h.y+280});await page.keyboard.up('Space');
 assert(await count()===drawings,'Space with Pencil armed drew instead of panning');
 await page.evaluate(()=>window.cam.pencil.setActive(false));
});

await check('the wheel pans the camera and never scrolls the page',async()=>{
 const h=await host(),start=await cam(),scroll=await page.evaluate(()=>scrollY);
 await page.mouse.move(h.x+200,h.y+200);await page.mouse.wheel(0,120);await page.mouse.wheel(60,0);await frame();
 const c=await cam();assert(near(c.y,start.y+120/start.scale,.01)&&near(c.x,start.x+60/start.scale,.01),'Wheel pan wrong: '+JSON.stringify({start,c}));
 assert(await page.evaluate(()=>scrollY)===scroll,'The page scrolled');
});

await check('Ctrl+wheel (pinch) zooms around the pointer and announces once it settles',async()=>{
 const h=await host(),point={x:h.x+260,y:h.y+180},start=await cam();
 // World-local point under the pointer: (screen - drawn world origin) / scale.
 const under=()=>page.evaluate(([x,y])=>{const c=window.cam.canvas.getState().camera,w=window.cam.world.getBoundingClientRect();return {x:(x-w.left)/c.scale,y:(y-w.top)/c.scale};},[point.x,point.y]);
 const before=await under();
 await page.mouse.move(point.x,point.y);await page.keyboard.down('Control');await page.mouse.wheel(0,-100);await page.mouse.wheel(0,-100);await page.keyboard.up('Control');await frame();
 const c=await cam(),after=await under();
 assert(c.scale>start.scale*1.5&&c.scale<=4,'Pinch zoom scale '+c.scale);
 assert(near(after.x,before.x,.05)&&near(after.y,before.y,.05),'The world point under the pointer moved: '+JSON.stringify({before,after}));
 await page.waitForTimeout(500);assert(/^Zoom \d+%\.$/.test((await state()).status),'No settled zoom announcement: '+(await state()).status);
});

await check('+, -, 0, Shift+1, Shift+2 and arrows drive the camera from the keyboard',async()=>{
 await run('camera',{x:300,y:200,scale:1});await focusHost();
 await page.keyboard.press('+');assert(near((await cam()).scale,1.2,1e-9),'+ did not zoom in');
 await page.keyboard.press('-');await page.keyboard.press('-');assert(near((await cam()).scale,1/1.2,1e-9),'- did not zoom out');
 await page.keyboard.press('0');assert((await cam()).scale===1,'0 did not return to 100%');
 const x=(await cam()).x;await page.keyboard.press('ArrowRight');assert(near((await cam()).x,x+50,1e-9),'Arrow did not pan 50px');
 await page.keyboard.press('Shift+Digit1');const fitted=await cam();assert(fitted.scale<=1,'Shift+1 did not fit');
 await page.evaluate(()=>{window.cam.canvas.select(window.cam.text);window.cam.text.focus();});await page.keyboard.press('Shift+Digit2');
 const t=await rect('#text'),h=await host();assert(near(t.cx,h.x+h.width/2,1),'Shift+2 did not frame the selection');
});

await check('far pans, new objects, pastes and drags stay within the range saved boards accept',async()=>{
 await run('camera',{x:5e6,y:-5e6,scale:1});const c=await cam(),h=await host();
 assert(near(c.x+h.width/2,1e5,.01)&&near(c.y+h.height/2,-1e5,.01),'Visible centre not kept in range: '+JSON.stringify(c));
 assert(await page.evaluate(()=>!!window.cam.addNote()),'Note not created far out');
 await page.evaluate(()=>window.cam.canvas.select(window.cam.rect));await run('copy');await run('paste');
 const n=await selectedRect();await drag({x:n.cx,y:n.cy},{x:n.cx+300,y:n.cy-200});
 const saved=await page.evaluate(()=>{try{return {ok:true,count:window.cam.canvas.saveDocument().objects.length};}catch(error){return {ok:false,error:error.message};}});
 assert(saved.ok,'Board could not be saved: '+JSON.stringify(saved));
});

await check('destroy restores the world and the host background',async()=>{
 const left=await page.evaluate(()=>{window.cam.canvas.destroy();const w=window.cam.world,h=window.cam.host;return {style:w.getAttribute('style'),marked:w.hasAttribute('data-canvas-instance-world'),size:h.style.backgroundSize,position:h.style.backgroundPosition,overlays:h.querySelectorAll('.canvas-instance-guide,.canvas-instance-gap,.canvas-instance-label').length+(h.hasAttribute('data-canvas-instance-hand')||h.hasAttribute('data-canvas-instance-panning')?1:0)};});
 assert(left.style===null&&!left.marked&&left.size===''&&left.position===''&&left.overlays===0,'Left behind: '+JSON.stringify(left));
 const errors=await page.evaluate(()=>window.camErrors);assert(!errors.length,'Page errors: '+errors.join('; '));
});

console.log(`PASS navigation: ${passed} checks`);
