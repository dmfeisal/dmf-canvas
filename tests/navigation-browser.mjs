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

// Step 7: snapping at zoom. The snap distance stays 6 screen pixels; the grid stays on the 24px world lattice.
const SHAPE='#host [data-canvas-instance-shape]';
async function placeRect(x,y){await page.evaluate(()=>window.cam.canvas.select(window.cam.rect));await run('inspect',{field:'x',value:x});await run('inspect',{field:'y',value:y});}
async function dragRectBy(dx,dy){const r=await rect(SHAPE);await drag({x:r.cx,y:r.cy},{x:r.cx+dx,y:r.cy+dy});}
for(const [scale,camera] of [[2,{x:50,y:50,scale:2}],[.5,{x:0,y:0,scale:.5}]]){
 await check(`Align snaps within 6 screen pixels at ${scale}x`,async()=>{
  await placeRect(300,200);await run('camera',camera);
  const text=await rect('#text'),r=await rect(SHAPE);await dragRectBy(text.left+3-r.left,0);
  const after=await rect(SHAPE);assert(near(after.left,text.left,.5),`No snap at ${scale}x: ${after.left} vs ${text.left}`);
 });
}
await check('Grid snaps to the 24px world lattice at 2x',async()=>{
 await page.evaluate(()=>window.cam.canvas.configure({snapping:{align:false,grid:true}}));
 await placeRect(300,200);await run('camera',{x:50,y:50,scale:2});await dragRectBy(37,23);
 const ins=await page.evaluate(()=>window.cam.canvas.getInspector()),off=v=>Math.abs(((v-12)%24+24)%24);
 await page.evaluate(()=>window.cam.canvas.configure({snapping:{align:true,grid:false}}));
 assert(Math.min(off(ins.x),24-off(ins.x))<.05&&Math.min(off(ins.y),24-off(ins.y))<.05,'Not on the world grid: '+JSON.stringify({x:ins.x,y:ins.y}));
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
 // Measured in screen pixels. Layout snaps transforms to device pixels, so CI measured up to ~0.6px at 3.3x zoom;
 // a 1px bound still catches a real anchor error, which moves the point by tens of pixels.
 assert(Math.abs(after.x-before.x)*c.scale<1&&Math.abs(after.y-before.y)*c.scale<1,'The world point under the pointer moved more than 1px: '+JSON.stringify({before,after,scale:c.scale}));
 await page.waitForTimeout(500);assert(/^Zoom \d+%\.$/.test((await state()).status),'No settled zoom announcement: '+(await state()).status);
});

await check('a keyboard zoom right after a wheel zoom announces the new scale, not the old one',async()=>{
 const h=await host();await run('camera',{x:0,y:0,scale:1});await focusHost();
 await page.mouse.move(h.x+200,h.y+200);await page.keyboard.down('Control');await page.mouse.wheel(0,-100);await page.keyboard.up('Control');await frame();
 await page.keyboard.press('0');await page.waitForTimeout(550);
 const s=await state();assert(s.camera.scale===1&&s.status==='Zoom 100%.','Stale announcement: '+JSON.stringify(s));
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

// Step 4: touch, dispatched through CDP so several contacts can be down at once.
const touch=(type,points)=>page.cdp('Input.dispatchTouchEvent',{type,touchPoints:points.map(p=>({x:p.x,y:p.y,id:p.id,radiusX:1,radiusY:1,force:1}))});
async function touchPath(from,to,steps=5){for(let i=1;i<=steps;i++){const t=i/steps;await touch('touchMove',from.map((p,k)=>({id:p.id,x:p.x+(to[k].x-p.x)*t,y:p.y+(to[k].y-p.y)*t})));}}

await check('one finger pans from empty space and drags an object after 4px',async()=>{
 await run('camera',{x:-3000,y:-3000,scale:1});const h=await host(),start=await cam();
 const a={id:1,x:h.x+400,y:h.y+300};await touch('touchStart',[a]);await touchPath([a],[{id:1,x:a.x-50,y:a.y-20}]);await touch('touchEnd',[]);await frame();
 const c=await cam();assert(near(c.x,start.x+50,.01)&&near(c.y,start.y+20,.01),'One-finger pan wrong: '+JSON.stringify({start,c}));
 await run('camera',{x:0,y:0,scale:1});await page.evaluate(()=>window.cam.canvas.select(null));
 const before=await rect('#text'),undo=await page.evaluate(()=>window.cam.canvas.getState().canUndo);void undo;
 const f={id:2,x:before.cx,y:before.cy};await touch('touchStart',[f]);await touchPath([f],[{id:2,x:f.x+60,y:f.y+30}]);await touch('touchEnd',[]);await frame();
 const after=await rect('#text');
 assert(near(after.left-before.left,60,6.5)&&near(after.top-before.top,30,6.5),'Touch drag moved '+(after.left-before.left)+','+(after.top-before.top));
 assert(JSON.stringify(await cam())==='{"x":0,"y":0,"scale":1}','Touch drag moved the camera');
});

await check('two fingers take the camera: a started drag finishes as one Undo step, then pinch zooms around the midpoint',async()=>{
 await run('camera',{x:0,y:0,scale:1});await page.evaluate(()=>window.cam.canvas.select(null));
 // The owner's translate, readable mid-gesture (saving is refused while a gesture is active).
 const read=()=>page.evaluate(()=>{const [x,y]=(window.cam.text.style.translate||'0px 0px').split(' ').map(parseFloat);return {x,y:y||0};});
 const t=await rect('#text'),before=await read();
 const a={id:3,x:t.cx,y:t.cy};await touch('touchStart',[a]);await touchPath([a],[{id:3,x:a.x+20,y:a.y}],3);
 const moved=await read();assert(near(moved.x-before.x,20,6.5),'The first finger did not drag the text: '+JSON.stringify({before,moved}));
 const a2={id:3,x:a.x+20,y:a.y},b={id:4,x:a.x+120,y:a.y};
 await touch('touchStart',[a2,b]);
 const mid={x:(a2.x+b.x)/2,y:(a2.y+b.y)/2};
 const under=()=>page.evaluate(([x,y])=>{const c=window.cam.canvas.getState().camera,w=window.cam.world.getBoundingClientRect();return {x:(x-w.left)/c.scale,y:(y-w.top)/c.scale};},[mid.x,mid.y]);
 const anchor=await under();
 await touchPath([a2,b],[{id:3,x:a2.x-50,y:a2.y},{id:4,x:b.x+50,y:b.y}]);await frame();
 const c=await cam(),after=await under(),still=await read();
 assert(near(c.scale,2,.02),'Pinch did not double the zoom: '+c.scale);
 assert(near(after.x,anchor.x,.1)&&near(after.y,anchor.y,.1),'The midpoint world point moved: '+JSON.stringify({anchor,after}));
 assert(near(still.x,moved.x,.01)&&near(still.y,moved.y,.01),'The object kept moving during the pinch');
 // Lifting one finger keeps panning with the other; a new finger rebases without a jump.
 await touch('touchEnd',[{id:4,x:b.x+50,y:b.y}]);const one=await cam();
 await touchPath([{id:3,x:a2.x-50,y:a2.y}],[{id:3,x:a2.x-90,y:a2.y}],3);await frame();
 const panned=await cam();assert(near(panned.x,one.x+40/one.scale,.05)&&panned.scale===one.scale,'Remaining finger did not pan: '+JSON.stringify({one,panned}));
 await touch('touchStart',[{id:3,x:a2.x-90,y:a2.y},{id:5,x:a2.x+60,y:a2.y+40}]);await frame();
 assert(JSON.stringify(await cam())===JSON.stringify(panned),'Adding a finger made the camera jump');
 await touch('touchEnd',[]);await frame();
 assert(await page.evaluate(()=>!window.cam.host.hasAttribute('data-canvas-instance-panning')),'Panning state left behind');
 assert((await run('undo')).ok&&near((await read()).x,before.x,.01),'The handed-off drag was not one Undo step');
});

await check('F puts the whole chrome container into full screen, and the camera keeps its view',async()=>{
 await page.evaluate(()=>window.cam.canvas.select(null));await run('camera',{x:40,y:30,scale:1.5});const view=await cam();
 const supported=await page.evaluate(()=>window.cam.fullscreen.getState().supported);
 assert(supported,'Full screen reported unsupported in Chromium');
 await focusHost();await page.keyboard.press('f');
 await page.waitForFunction(()=>document.fullscreenElement===document.getElementById('frame'),null,{timeout:3000});
 const on=await page.evaluate(()=>({state:window.cam.fullscreen.getState(),seen:[...window.cam.fullStates]}));
 assert(on.state.active&&on.seen.includes(true),'Full screen state not reported: '+JSON.stringify(on));
 assert(JSON.stringify(await cam())===JSON.stringify(view),'Entering full screen moved the camera');
 await page.keyboard.press('f');await page.waitForFunction(()=>!document.fullscreenElement,null,{timeout:3000});
 assert(!(await page.evaluate(()=>window.cam.fullscreen.getState().active)),'F did not leave full screen');
 // F is ignored while editing text, and after dispose.
 await page.evaluate(()=>{window.cam.canvas.select(window.cam.text);window.cam.canvas.execute('edit');});await page.keyboard.press('f');
 assert(!(await page.evaluate(()=>document.fullscreenElement)),'F entered full screen while editing');
 await run('finish-edit');await page.evaluate(()=>window.cam.fullscreen.dispose());await focusHost();await page.keyboard.press('f');await page.waitForTimeout(200);
 assert(!(await page.evaluate(()=>document.fullscreenElement)),'F still worked after dispose');
 // Disposing while entry is in flight must not leave the page in full screen.
 await page.evaluate(async()=>{const {createCanvasFullscreen}=await import('/toolbar.js'),frame=document.getElementById('frame'),button=document.getElementById('enter-dispose');
  button.onclick=()=>{const c=createCanvasFullscreen(frame);c.enter();c.dispose();};});
 await page.click('#enter-dispose');await page.waitForTimeout(600);
 assert(!(await page.evaluate(()=>document.fullscreenElement)),'Full screen left on after an in-flight dispose');
});

// Organisation step 1: the Layers panel (docs/prd/ORGANISATION.md) against the canvas's own order.
const layerRows=()=>page.evaluate(()=>[...document.querySelectorAll('.canvas-embed-layers__row')].map(b=>({id:+b.dataset.layerId,name:b.querySelector('span').textContent,pressed:b.getAttribute('aria-pressed')})));
const openLayers=async()=>{await page.evaluate(()=>{if(!document.querySelector('.canvas-embed-layers').matches(':popover-open'))document.getElementById('layers').click();});await frame();};
const zOrder=()=>page.evaluate(()=>{const items=window.cam.canvas.getLayers();return items.map(item=>({id:item.id,z:Number.parseInt(getComputedStyle(item.element).zIndex,10)||0}));});

await check('the Layers panel lists objects front to back, in the same order as the canvas stacks them',async()=>{
 await page.evaluate(()=>window.cam.canvas.select(null));await openLayers();
 const rows=await layerRows(),layers=await page.evaluate(()=>window.cam.canvas.getLayers().map(item=>item.id));
 assert(rows.length>=2&&rows.map(row=>row.id).join()===layers.join(),'Rows do not match getLayers: '+JSON.stringify({rows,layers}));
 const z=await zOrder();const zs=z.map(item=>item.z);
 assert(zs.every((value,index)=>index===0||zs[index-1]>=value),'Front-to-back order wrong against z-index: '+JSON.stringify(z));
 assert(rows.every(row=>row.name.length>0&&row.name!=='undefined'),'Missing type names: '+JSON.stringify(rows));
});

await check('the Layers order follows bring-front and send-back, and a row selects its object',async()=>{
 const rect=await page.evaluate(()=>window.cam.canvas.getLayers().find(item=>item.element===window.cam.rect)?.id??null);
 assert(rect!==null,'No rectangle layer');
 await page.evaluate(()=>{const c=window.cam.canvas;c.select(window.cam.rect);c.execute('send-back');});
 const sent=(await layerRows()).map(row=>row.id);
 assert(sent[sent.length-1]===rect,'send-back did not move the rectangle to the back: '+JSON.stringify(sent));
 await page.click(`.canvas-embed-layers__row[data-layer-id="${rect}"]`);
 const selected=await page.evaluate(()=>window.cam.canvas.getState().selectionName);
 assert(selected==='Rectangle','Row did not select its object: '+selected);
 assert((await layerRows()).find(row=>row.id===rect).pressed==='true','Selected row not pressed');
 await page.evaluate(()=>window.cam.canvas.execute('bring-front'));
});

await check('the Layers panel follows new objects while open, and Escape closes it and returns focus',async()=>{
 await openLayers();const before=(await layerRows()).length;
 await page.evaluate(()=>window.cam.addNote());await frame();
 assert((await layerRows()).length===before+1,'New note not listed while open');
 await page.keyboard.press('Escape');await frame();
 const state=await page.evaluate(()=>({open:document.querySelector('.canvas-embed-layers').matches(':popover-open'),expanded:document.getElementById('layers').getAttribute('aria-expanded'),focus:document.activeElement?.id}));
 assert(!state.open&&state.expanded==='false'&&state.focus==='layers','Escape did not close or return focus: '+JSON.stringify(state));
});

// Organisation step 2: rename (visit-local, one Undo step, never dirties the board) and search.
await check('rename from the Layers panel is visit-local, one Undo step, and leaves the board clean',async()=>{
 await page.evaluate(()=>window.cam.canvas.select(null));await openLayers();
 const rows=await layerRows(),target=rows.find(row=>row.name==='Rectangle');
 const before=await page.evaluate(()=>window.cam.canvas.getState().revision);
 await page.click(`.canvas-embed-layers__row[data-layer-id="${target.id}"] + .canvas-embed-layers__rename-button`);
 await page.fill('.canvas-embed-layers__rename input[type=text]','  Hero   box\u0001 ');await page.keyboard.press('Enter');await frame();
 const after=await layerRows(),renamed=after.find(row=>row.id===target.id);
 assert(renamed.name==='Hero box','Name not normalised: '+JSON.stringify(renamed));
 assert(await page.evaluate(()=>window.cam.canvas.getState().revision)===before,'Rename dirtied the board');
 assert(await page.evaluate(()=>window.cam.canvas.getState().canUndo),'Rename is not in history');
 assert(await page.evaluate(()=>window.cam.canvas.execute('undo').ok)&&(await layerRows()).find(row=>row.id===target.id).name==='Rectangle','Undo did not restore the type name');
 assert(await page.evaluate(()=>window.cam.canvas.execute('redo').ok)&&(await layerRows()).find(row=>row.id===target.id).name==='Hero box','Redo did not restore the name');
 await page.evaluate(()=>window.cam.canvas.execute('undo'));
});

await check('search filters rows by name and type without changing order or selection',async()=>{
 await openLayers();const all=await layerRows();
 await page.fill('.canvas-embed-layers__search','sticky');await frame();
 const shown=await page.evaluate(()=>[...document.querySelectorAll('.canvas-embed-layers__list li')].filter(li=>!li.hidden).map(li=>li.querySelector('[data-layer-id]').dataset.layerId));
 const expected=all.filter(row=>/sticky/i.test(row.name)).map(row=>String(row.id));
 assert(shown.join()===expected.join()&&shown.length>0,'Search wrong: '+JSON.stringify({shown,expected}));
 await page.fill('.canvas-embed-layers__search','zzz-no-match');await frame();
 assert(await page.evaluate(()=>!document.querySelector('.canvas-embed-layers p:not([hidden])')?.textContent.includes('No objects')&&!!document.querySelector('.canvas-embed-layers p:not([hidden])')),'No-match message missing');
 await page.fill('.canvas-embed-layers__search','');await frame();
});

await check('F2 on a focused row starts a rename; Escape cancels it without closing the panel; a locked layer cannot be renamed',async()=>{
 await openLayers();const rows=await layerRows(),row=rows[0];
 await page.focus(`.canvas-embed-layers__row[data-layer-id="${row.id}"]`);await page.keyboard.press('F2');
 assert(await page.evaluate(()=>!!document.querySelector('.canvas-embed-layers__rename input')),'F2 did not start a rename');
 await page.keyboard.press('Escape');await frame();
 const state=await page.evaluate(()=>({open:document.querySelector('.canvas-embed-layers').matches(':popover-open'),form:!!document.querySelector('.canvas-embed-layers__rename')}));
 assert(state.open&&!state.form,'Escape in the rename field did not cancel only the rename: '+JSON.stringify(state));
 await page.evaluate(()=>window.cam.canvas.execute('lock',true));await frame();
 const locked=await page.evaluate(()=>{const b=[...document.querySelectorAll('.canvas-embed-layers__rename-button')];return b.some(x=>x.disabled);});
 assert(locked,'A locked layer offered Rename');
 await page.evaluate(()=>window.cam.canvas.execute('lock',false));await frame();
 await page.keyboard.press('Escape');await frame();
});

// Organisation step 3: Reset object and Reset canvas edits (one Undo step each, board-changing).
await check('Reset object returns the selection to its start state, and Undo restores it',async()=>{
 await placeRect(300,200);await page.evaluate(()=>window.cam.canvas.select(window.cam.rect));
 await page.evaluate(()=>window.cam.canvas.execute('rename',{id:window.cam.canvas.getLayers().find(i=>i.element===window.cam.rect).id,name:'Moved box'}));
 await run('inspect',{field:'x',value:420});await page.evaluate(()=>window.cam.canvas.execute('lock',true));
 const moved=await page.evaluate(()=>window.cam.canvas.getLayers().find(i=>i.element===window.cam.rect).name);
 assert(moved==='Moved box','Setup rename failed');
 assert((await page.evaluate(()=>window.cam.canvas.execute('reset-object'))).ok,'Reset object refused');
 const after=await page.evaluate(()=>{const i=window.cam.canvas.getLayers().find(x=>x.element===window.cam.rect);return {name:i.name,locked:i.locked};});
 assert(after.name==='Rectangle'&&after.locked===false,'Reset object did not clear the name and lock: '+JSON.stringify(after));
 assert((await page.evaluate(()=>window.cam.canvas.execute('undo'))).ok,'Undo refused');
 const undone=await page.evaluate(()=>window.cam.canvas.getLayers().find(x=>x.element===window.cam.rect).name);
 assert(undone==='Moved box','Undo did not restore the name: '+undone);
});

await check('Reset canvas edits removes visit-local objects, keeps locked ones, restores originals, and is one Undo step',async()=>{
 await page.evaluate(()=>window.cam.canvas.execute('move',{dx:40,dy:0}));
 const count=()=>page.evaluate(()=>window.cam.canvas.getState().objects);
 await page.evaluate(()=>window.cam.addNote());await page.evaluate(()=>window.cam.canvas.select(null));
 const withNote=await count(),board=await page.evaluate(()=>window.cam.canvas.getState().revision);
 assert((await page.evaluate(()=>window.cam.canvas.execute('reset-canvas'))).ok,'Reset canvas edits refused');
 const after=await count();
 assert(after<withNote,'Visit-local note was not removed: '+withNote+' -> '+after);
 assert(await page.evaluate(()=>!!window.cam.text.isConnected&&window.cam.canvas.getLayers().some(i=>i.element===window.cam.text)),'The authored original was removed');
 const [x=0,y=0]=(await page.evaluate(()=>window.cam.text.style.translate)||'0px 0px').split(' ').map(v=>parseFloat(v)||0);const now=[x,y];
 assert(JSON.stringify([x,y])==='[0,0]','The original was not restored to its registration position: '+now);
 assert(await page.evaluate(()=>window.cam.canvas.getState().revision)>board,'Reset did not change the board');
 assert((await page.evaluate(()=>window.cam.canvas.execute('undo'))).ok&&await count()===withNote,'Undo did not restore the removed object');
});

// Organisation step 4: the context menu (docs/prd/ORGANISATION.md) lists the toolbar's own actions.
const menuState=()=>page.evaluate(()=>{const m=document.querySelector('.canvas-embed-context');return {open:m?.matches(':popover-open')??false,items:[...(m?.querySelectorAll('[role=menuitem]')??[])].map(b=>({id:b.dataset.contextAction,disabled:b.disabled,label:b.textContent.trim()}))};});

await check('right-click opens the toolbar\'s actions at the pointer, with their availability, and suppresses the native menu',async()=>{
 await page.evaluate(()=>window.cam.canvas.select(window.cam.rect));
 const h=await host();
 const defaultPrevented=await page.evaluate(([x,y])=>{const e=new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:x,clientY:y});window.cam.host.dispatchEvent(e);return e.defaultPrevented;},[h.x+200,h.y+150]);
 assert(defaultPrevented,'The native context menu was not suppressed');
 const state=await menuState();
 assert(state.open&&state.items.length===4,'Menu not open with the toolbar actions: '+JSON.stringify(state));
 // The menu must report exactly the toolbar's availability, whatever it is at this moment.
 const bar=await page.evaluate(()=>[...document.querySelectorAll('#bar [data-toolbar-action]')].map(b=>({id:b.dataset.toolbarAction,disabled:b.disabled})));
 assert(state.items.length===bar.length&&state.items.every(item=>{const b=bar.find(x=>x.id===item.id);return b&&b.disabled===item.disabled;}),'Menu availability differs from the toolbar: '+JSON.stringify({state,bar}));
 await page.keyboard.press('Escape');await frame();
 assert(!(await menuState()).open,'Escape did not close the menu');
});

await check('a menu item runs the same action as the toolbar, and a disabled item cannot run',async()=>{
 await page.evaluate(()=>window.cam.canvas.select(window.cam.rect));
 const h=await host();
 await page.evaluate(([x,y])=>window.cam.host.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:x,clientY:y})),[h.x+200,h.y+150]);
 await page.click('.canvas-embed-context [data-context-action="lock"]');await frame();
 assert(await page.evaluate(()=>window.cam.canvas.getLayers().find(i=>i.element===window.cam.rect).locked),'Lock from the menu did not lock the object');
 assert(!(await menuState()).open,'Choosing an item did not close the menu');
 await page.evaluate(()=>window.cam.canvas.execute('lock',false));
 // A disabled or unknown action never runs: activate() refuses, as a disabled button's click does.
 const refused=await page.evaluate(()=>{window.cam.bar.update('duplicate',{disabled:true});const off=window.cam.bar.activate('duplicate'),unknown=window.cam.bar.activate('no-such-action');window.cam.bar.update('duplicate',{disabled:false});return {off,unknown};});
 assert(refused.off===false&&refused.unknown===false,'A disabled or unknown action ran: '+JSON.stringify(refused));
});

await check('Shift+F10 on a focused object opens the menu beside it, and Escape returns focus to the canvas',async()=>{
 await page.evaluate(()=>window.cam.canvas.select(window.cam.rect));
 await page.evaluate(()=>window.cam.rect.focus());
 await page.keyboard.press('Shift+F10');await frame();
 const state=await menuState();assert(state.open&&state.items.length===4,'Shift+F10 did not open the menu: '+JSON.stringify(state));
 const near=await page.evaluate(()=>{const m=document.querySelector('.canvas-embed-context').getBoundingClientRect(),r=window.cam.rect.getBoundingClientRect();return {x:m.left-r.left,y:m.top-r.top};});
 assert(Number.isFinite(near.x)&&near.x>-400&&near.x<400,'Menu not beside the object: '+JSON.stringify(near));
 await page.keyboard.press('ArrowDown');await page.keyboard.press('Escape');await frame();
 assert(!(await menuState()).open,'Escape did not close the menu after Shift+F10');
});

await check('destroy restores the world and the host background',async()=>{
 const left=await page.evaluate(()=>{window.cam.canvas.destroy();const w=window.cam.world,h=window.cam.host;return {style:w.getAttribute('style'),marked:w.hasAttribute('data-canvas-instance-world'),size:h.style.backgroundSize,position:h.style.backgroundPosition,overlays:h.querySelectorAll('.canvas-instance-guide,.canvas-instance-gap,.canvas-instance-label').length+(h.hasAttribute('data-canvas-instance-hand')||h.hasAttribute('data-canvas-instance-panning')?1:0)};});
 assert(left.style===null&&!left.marked&&left.size===''&&left.position===''&&left.overlays===0,'Left behind: '+JSON.stringify(left));
 const errors=await page.evaluate(()=>window.camErrors);assert(!errors.length,'Page errors: '+errors.join('; '));
});

// Step 6: the camera in a real host, the configurator's preview A.
await page.goto(navigationTest.base+'/examples/configurator/');await page.waitForFunction(()=>!document.getElementById('copy').disabled);
await page.evaluate(()=>{window.hostErrors=[];window.addEventListener('error',e=>window.hostErrors.push(e.message));window.addEventListener('unhandledrejection',e=>window.hostErrors.push(String(e.reason)));});
const A='[data-preview=A]',embed=()=>page.evaluate(()=>{const p=document.querySelector('main').configurator.previews.A,s=p.canvas.getState();return {camera:s.camera,hand:s.hand,objects:s.objects,config:p.getConfig().camera};});
const visible=selector=>page.evaluate(selector=>{const b=document.querySelector(selector);return !!b&&!b.hidden&&b.getBoundingClientRect().width>0;},selector);

await check('the configurator has no camera by default and hides the camera controls',async()=>{
 const e=await embed();assert(e.camera===null&&e.config===false,'Camera on by default: '+JSON.stringify(e));
 for(const id of ['hand','zoom-in','zoom-out','fit','fullscreen'])assert(!(await visible(`${A} [data-toolbar-action="${id}"]`)),id+' visible without a camera');
});

await check('Zoom and pan remounts preview A with a world, Hand, the Camera group and help rows',async()=>{
 await page.check('input[name=camera]');await page.waitForFunction(()=>!!document.querySelector('main').configurator.previews.A.canvas.getState().camera);
 const e=await embed();assert(e.config===true&&e.objects===1&&await page.evaluate(sel=>!!document.querySelector(sel+' [data-world] [data-original]'),A),'No world around the original: '+JSON.stringify(e));
 for(const id of ['hand','zoom-in','zoom-out','fit','fullscreen'])assert(await visible(`${A} [data-toolbar-action="${id}"]`),id+' hidden with a camera');
 assert(await page.evaluate(sel=>/Fit all/.test(document.querySelector(sel+' [data-help]').textContent),A),'Keyboard help lacks camera rows');
 assert(/zoom and pan/.test(await page.textContent('[data-preview-summary=A]')),'Summary does not mention zoom and pan');
 const files=await page.evaluate(()=>document.querySelector('main').configurator.files);
 assert(Object.values(files).some(text=>/"camera": true/.test(text)),'Generated code does not pass camera');
});

await check('the toolbar zooms, fits and arms Hand, and new notes land at the visible centre',async()=>{
 await page.click(`${A} [data-toolbar-action="zoom-in"]`);assert(near((await embed()).camera.scale,1.2,1e-9),'Zoom in button');
 await page.click(`${A} [data-toolbar-action="hand"]`);assert((await embed()).hand==='tool'&&await page.getAttribute(`${A} [data-toolbar-action="hand"]`,'aria-pressed')==='true','Hand button');
 await page.click(`${A} [data-toolbar-action="select"]`);assert((await embed()).hand===null,'Select did not leave Hand');
 await page.evaluate(()=>document.querySelector('main').configurator.previews.A.canvas.execute('camera',{x:900,y:600}));
 await page.click(`${A} [data-toolbar-action="sticky"]`);
 const note=await page.evaluate(sel=>{const n=document.querySelector(sel+' [data-world] .canvas-instance-note'),h=document.querySelector(sel+' [data-host]'),a=n.getBoundingClientRect(),b=h.getBoundingClientRect();return {nx:a.left+a.width/2,hx:b.left+h.clientLeft+h.clientWidth/2};},A);
 assert(near(note.nx,note.hx,1.5),'Note not at the visible centre: '+JSON.stringify(note));
 await page.click(`${A} [data-toolbar-action="fit"]`);const fitted=(await embed()).camera;assert(fitted.scale<=1,'Fit all: '+JSON.stringify(fitted));
});

await check('Full screen from the toolbar takes the whole chrome and swaps its icon and label',async()=>{
 await page.click(`${A} [data-toolbar-action="fullscreen"]`);
 await page.waitForFunction(sel=>document.fullscreenElement===document.querySelector(sel+' [data-stage]'),A,{timeout:3000});
 const button=await page.evaluate(sel=>{const b=document.querySelector(sel+' [data-toolbar-action="fullscreen"]');return {label:b.textContent.trim(),pressed:b.getAttribute('aria-pressed'),icon:b.querySelector('svg').innerHTML.includes('M8 3v3')};},A);
 assert(button.pressed==='true'&&/Exit full screen/.test(button.label)&&button.icon,'Button not updated (pressed, label, Minimize icon): '+JSON.stringify(button));
 await page.click(`${A} [data-toolbar-action="fullscreen"]`);await page.waitForFunction(()=>!document.fullscreenElement,null,{timeout:3000});
});

await check('mobile RTL keeps the camera controls on screen and the page from scrolling sideways',async()=>{
 await page.cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
 await page.evaluate(sel=>{document.documentElement.dir='rtl';document.querySelector(sel+' [data-host]').scrollIntoView({block:'center'});},A);await frame();
 const seen=await page.evaluate(sel=>{const ids=['hand','zoom-out','zoom-in','fit'],out={};for(const id of ids){const b=document.querySelector(`${sel} [data-toolbar-action="${id}"]`).getBoundingClientRect();out[id]=b.left>=-.5&&b.right<=innerWidth+.5&&b.width>0;}out.overflow=document.documentElement.scrollWidth>innerWidth;return out;},A);
 assert(Object.entries(seen).every(([key,value])=>key==='overflow'?!value:value),'Mobile RTL layout wrong: '+JSON.stringify(seen));
 const before=(await embed()).camera.scale;await page.click(`${A} [data-toolbar-action="zoom-in"]`);
 assert(near((await embed()).camera.scale,Math.min(4,before*1.2),1e-9),'Zoom in failed in mobile RTL');
 await page.evaluate(()=>{document.documentElement.dir='';});await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
});

await check('turning the camera off and on again leaves no stray listeners or styles',async()=>{
 await page.uncheck('input[name=camera]');await page.waitForFunction(()=>document.querySelector('main').configurator.previews.A.canvas.getState().camera===null);
 const flat=await page.evaluate(sel=>{const h=document.querySelector(sel+' [data-host]'),e=new WheelEvent('wheel',{deltaY:100,bubbles:true,cancelable:true});h.dispatchEvent(e);return {blocked:e.defaultPrevented,size:h.style.backgroundSize,touch:h.style.touchAction,hand:h.hasAttribute('data-canvas-instance-hand')};},A);
 assert(!flat.blocked&&!flat.size&&!flat.touch&&!flat.hand,'A camera-off host kept camera behaviour: '+JSON.stringify(flat));
 await page.check('input[name=camera]');await page.waitForFunction(()=>!!document.querySelector('main').configurator.previews.A.canvas.getState().camera);
 const box=await page.evaluate(sel=>{const h=document.querySelector(sel+' [data-host]');h.scrollIntoView({block:'center'});const r=h.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};},A);
 const start=(await embed()).camera;await page.mouse.move(box.x,box.y);await page.mouse.wheel(0,100);await frame();
 const c=(await embed()).camera;assert(near(c.y,start.y+100/start.scale,.01),'One wheel notch panned '+((c.y-start.y)*start.scale)+'px (expected 100)');
});

await check('turning Zoom and pan off remounts without a camera and leaves no page errors',async()=>{
 await page.uncheck('input[name=camera]');await page.waitForFunction(()=>document.querySelector('main').configurator.previews.A.canvas.getState().camera===null);
 assert(!(await page.evaluate(sel=>!!document.querySelector(sel+' [data-world]'),A)),'World left behind');
 assert(!(await visible(`${A} [data-toolbar-action="hand"]`)),'Hand still visible');
 const errors=await page.evaluate(()=>window.hostErrors);assert(!errors.length,'Page errors: '+errors.join('; '));
});

await check('the shared custom host takes camera: true and shows Hand and the Camera group',async()=>{
 await page.goto(navigationTest.base+'/');await page.waitForFunction(()=>!!document.querySelector('[data-consumer]'));
 const seen=await page.evaluate(async()=>{
  const {mountConsumer}=await import('/consumer.js'),parent=document.createElement('div');document.body.append(parent);
  const item=mountConsumer(parent,'Cam',{camera:true}),bar=id=>item.root.querySelector(`[data-toolbar-action="${id}"]`);
  const before=item.canvas.getState().camera.scale;bar('zoom-in').click();const after=item.canvas.getState().camera.scale;
  const out={world:!!item.host.querySelector('[data-world] [data-original]'),hand:!bar('hand').hidden,fit:!bar('fit').hidden,before,after,overflow:getComputedStyle(item.host).overflow};
  item.dispose();parent.remove();
  const plain=mountConsumer(document.body,'Flat');out.plainHand=plain.root.querySelector('[data-toolbar-action="hand"]').hidden;out.plainCamera=plain.canvas.getState().camera;plain.dispose();return out;
 });
 assert(seen.world&&seen.hand&&seen.fit&&near(seen.after,seen.before*1.2,1e-9)&&seen.overflow==='hidden','Camera consumer wrong: '+JSON.stringify(seen));
 assert(seen.plainHand===true&&seen.plainCamera===null,'Default consumer gained a camera: '+JSON.stringify(seen));
});

// Organisation step 5: the Layers action and the context menu in the configurator and the shared custom host.
await check('the configurator preview opens Layers from its History group, and right-click lists every bar\'s actions',async()=>{
 await page.goto(navigationTest.base+'/examples/configurator/');await page.waitForFunction(()=>!document.getElementById('copy').disabled);
 await page.evaluate(()=>{document.querySelector('main').configurator.previews.A.canvas.select(null);});
 await page.click(`${A} [data-toolbar-action="layers"]`);await frame();
 const layersOpen=await page.evaluate(sel=>{const p=document.querySelector(sel+' .canvas-embed-layers');return {open:p.matches(':popover-open'),rows:p.querySelectorAll('.canvas-embed-layers__row').length};},A);
 assert(layersOpen.open&&layersOpen.rows>=1,'Layers did not open with rows: '+JSON.stringify(layersOpen));
 await page.keyboard.press('Escape');await frame();
 const h=await page.evaluate(()=>{const e=document.querySelector('[data-preview=A] [data-host]');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.left+e.clientLeft,y:r.top+e.clientTop};});
 await page.evaluate(([x,y])=>document.querySelector('[data-preview=A] [data-host]').dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:x,clientY:y})),[h.x+200,h.y+150]);
 const menu=await page.evaluate(()=>[...document.querySelectorAll('.canvas-embed-context [role=menuitem]')].map(b=>b.dataset.contextAction));
 assert(menu.includes('select')&&menu.includes('undo')&&menu.includes('inspect'),'Menu lacks actions from more than one bar: '+JSON.stringify(menu));
 await page.keyboard.press('Escape');await frame();
});

await check('the shared custom host opens Layers and its context menu, and disposing it leaves no panel or menu behind',async()=>{
 await page.goto(navigationTest.base+'/');await page.waitForFunction(()=>!!document.querySelector('[data-consumer]'));
 const seen=await page.evaluate(async()=>{
  const {mountConsumer}=await import('/consumer.js'),parent=document.createElement('div');document.body.append(parent);
  // The homepage already hosts its own playground, so count what this mount adds and removes, not the page's total.
  const count=()=>({panels:document.querySelectorAll('.canvas-embed-layers').length,menus:document.querySelectorAll('.canvas-embed-context').length});const baseline=count();
  const item=mountConsumer(parent,'Lay');
  item.root.querySelector('[data-toolbar-action="layers"]').click();
  const open=item.root.querySelector('.canvas-embed-layers').matches(':popover-open');
  item.root.querySelector('[data-toolbar-action="layers"]').click();
  const h=item.host.getBoundingClientRect();
  item.host.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:h.left+40,clientY:h.top+40}));
  const menu=document.querySelectorAll('.canvas-embed-context [role=menuitem]').length;
  document.querySelectorAll('.canvas-embed-context').forEach(m=>m.hidePopover?.());
  item.dispose();
  const left=count();
  parent.remove();
  return {open,menu,added:{panels:left.panels-baseline.panels,menus:left.menus-baseline.menus}};
 });
 assert(seen.open&&seen.menu>=3,'Custom host Layers or menu failed: '+JSON.stringify(seen));
 assert(seen.added.panels===0&&seen.added.menus===0,'Dispose left a panel or menu behind: '+JSON.stringify(seen));
});

// Organisation step 6: row order after moves and layer changes, and the Layers panel and context menu in RTL.
await check('Layers rows keep the canvas order after moves and layer changes',async()=>{
 await page.goto(navigationTest.base+'/tests/fixtures/camera.html');await page.waitForFunction(()=>!!window.cam);
 await run('camera',{x:0,y:0,scale:1});
 const order=()=>page.evaluate(()=>window.cam.canvas.getLayers().map(i=>i.id));
 const rowsOrder=()=>page.evaluate(()=>[...document.querySelectorAll('.canvas-embed-layers__row')].map(b=>+b.dataset.layerId));
 await page.evaluate(()=>window.cam.canvas.select(null));await openLayers();
 const start=await order();
 assert(JSON.stringify(await rowsOrder())===JSON.stringify(start),'Rows differ before any change');
 const r=await rect('#host [data-canvas-instance-shape]');
 await page.evaluate(()=>window.cam.canvas.select(window.cam.rect));
 await drag({x:r.cx,y:r.cy},{x:r.cx+60,y:r.cy+30});await frame();
 assert(JSON.stringify(await order())===JSON.stringify(start),'A move changed the layer order');
 assert(JSON.stringify(await rowsOrder())===JSON.stringify(start),'A move changed the rows');
 const target=start[0];
 await page.evaluate(id=>{const c=window.cam.canvas,item=c.getLayers().find(i=>i.id===id);c.select(item.element);c.execute('send-back');},target);await frame();
 const after=await order();
 assert(after[after.length-1]===target,'send-back did not move the object to the back: '+JSON.stringify(after));
 assert(JSON.stringify(await rowsOrder())===JSON.stringify(after),'Rows did not follow send-back');
 const z=await page.evaluate(()=>window.cam.canvas.getLayers().map(i=>Number.parseInt(getComputedStyle(i.element).zIndex,10)||0));
 assert(z.every((value,index)=>index===0||z[index-1]>=value),'Rows and z-index disagree: '+JSON.stringify(z));
 await page.evaluate(()=>window.cam.canvas.execute('bring-front'));
 await page.evaluate(()=>window.cam.canvas.execute('undo'));
});

await check('the Layers panel and the context menu stay on screen in right-to-left layout',async()=>{
 await page.cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
 await page.evaluate(()=>{document.documentElement.dir='rtl';window.cam.canvas.select(window.cam.rect);});
 // The fixture's 800px host is wider than this screen already; the panel and menu must not widen the page further.
 const widthBefore=await page.evaluate(()=>document.documentElement.scrollWidth);
 await openLayers();
 const panel=await page.evaluate(()=>{const p=document.querySelector('.canvas-embed-layers').getBoundingClientRect();return {left:p.left,right:p.right,top:p.top,bottom:p.bottom,vw:innerWidth,vh:innerHeight,open:document.querySelector('.canvas-embed-layers').matches(':popover-open')};});
 assert(panel.open&&panel.left>=-.5&&panel.right<=panel.vw+.5&&panel.top>=-.5&&panel.bottom<=panel.vh+.5,'Layers panel off screen in RTL: '+JSON.stringify(panel));
 await page.keyboard.press('Escape');await frame();
 await page.focus('[data-canvas-instance-selected]');await page.keyboard.press('Shift+F10');await frame();
 const menu=await page.evaluate(()=>{const m=document.querySelector('.canvas-embed-context');const b=m.getBoundingClientRect();return {open:m.matches(':popover-open'),left:b.left,right:b.right,top:b.top,bottom:b.bottom,vw:innerWidth,vh:innerHeight,items:m.querySelectorAll('[role=menuitem]').length};});
 assert(menu.open&&menu.items>=3&&menu.left>=-.5&&menu.right<=menu.vw+.5&&menu.top>=-.5&&menu.bottom<=menu.vh+.5,'Context menu off screen in RTL: '+JSON.stringify(menu));
 assert((await page.evaluate(()=>document.documentElement.scrollWidth))<=widthBefore,'The Layers panel or menu widened the page in RTL');
 await page.keyboard.press('Escape');await frame();
 await page.evaluate(()=>{document.documentElement.dir='';});await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
});

// Styling phase 4, step 1: ink, line height and letter spacing (docs/prd/STYLING-EXPORT.md), schema 5.
await check('Text ink, line height and letter spacing apply, save as schema 5 only when set, and round-trip',async()=>{
 await page.goto(navigationTest.base+'/tests/fixtures/camera.html');await page.waitForFunction(()=>!!window.cam);
 const text=async()=>page.evaluate(()=>{const s=window.cam.canvas.getTextStyle();return {ink:s?.ink,lineHeight:s?.lineHeight,letterSpacing:s?.letterSpacing,color:getComputedStyle(window.cam.text).color,inline:[window.cam.text.style.lineHeight,window.cam.text.style.letterSpacing]};});
 await page.evaluate(()=>{window.cam.canvas.select(window.cam.text);});
 const plain=await page.evaluate(()=>window.cam.canvas.saveDocument().version);
 assert(plain<5,'A default Text saved as schema '+plain);
 assert((await page.evaluate(()=>window.cam.canvas.execute('text-style',{field:'ink',value:'blue'}))).ok,'Ink refused');
 const blue=await text();assert(blue.ink==='blue'&&/rgb\(22, 119, 255\)/.test(blue.color),'Blue ink not applied: '+JSON.stringify(blue));
 assert((await page.evaluate(()=>window.cam.canvas.execute('text-style',{field:'lineHeight',value:1.5}))).ok,'Line height refused');
 assert((await text()).inline[0]==='1.5','Line height not applied: '+JSON.stringify(await text()));
 assert((await page.evaluate(()=>window.cam.canvas.execute('text-style',{field:'letterSpacing',value:.1}))).ok,'Letter spacing refused');
 assert((await text()).inline[1]==='0.1em','Letter spacing not applied: '+JSON.stringify(await text()));
 assert(!(await page.evaluate(()=>window.cam.canvas.execute('text-style',{field:'lineHeight',value:3.5}))).ok,'Out-of-range line height accepted');
 const saved=await page.evaluate(()=>window.cam.canvas.saveDocument());
 assert(saved.version===5,'Styled Text saved as schema '+saved.version);
 const trip=await page.evaluate(doc=>{const json=JSON.parse(JSON.stringify(doc));return json;},saved);
 await page.evaluate(()=>window.cam.canvas.execute('text-style',{field:'reset'}));
 const reset=await page.evaluate(()=>window.cam.canvas.saveDocument().version);
 assert(reset<5,'Reset Text still saved as schema '+reset);
 const loaded=await page.evaluate(doc=>window.cam.canvas.loadDocument(doc),trip);
 assert(loaded.ok,'Schema 5 board did not load: '+JSON.stringify(loaded));
 // Loading clears the selection; the Text style summary needs a selected object, so select the reloaded original first.
 await page.evaluate(()=>window.cam.canvas.select(window.cam.text));
 const back=await text();assert(back.ink==='blue'&&back.inline[0]==='1.5','Round trip lost styling: '+JSON.stringify(back));
});

// Styling step 2: sixteen note colours in the inspector, saved as schema 5 when they are new, and undone as one step.
await check('a note takes one of sixteen colours from the inspector; a new colour saves as schema 5 and Undo restores it',async()=>{
 await page.goto(navigationTest.base+'/tests/fixtures/camera.html');await page.waitForFunction(()=>!!window.cam);
 // addNote() only creates the note; select it, since the colour is read for a single selected note.
 await page.evaluate(()=>{const note=window.cam.addNote();window.cam.canvas.select(note);});
 const paper=()=>page.evaluate(()=>window.cam.canvas.getState().paperColor);
 assert((await paper())==='yellow','New note not yellow: '+await paper());
 assert((await page.evaluate(()=>window.cam.canvas.saveDocument().version))<5,'Default note saved as schema 5');
 await page.evaluate(()=>{window.cam.inspector.toggle();});await frame();
 const options=await page.evaluate(()=>{const sel=document.querySelector('.canvas-embed-inspector select[data-inspector-paper]');return {count:sel.options.length,visible:!sel.closest('fieldset').hidden};});
 assert(options.count===16&&options.visible,'Inspector Note colour wrong: '+JSON.stringify(options));
 await page.selectOption('.canvas-embed-inspector select[data-inspector-paper]','magenta');await frame();
 assert((await paper())==='magenta','Inspector did not change the colour: '+await paper());
 const saved=await page.evaluate(()=>window.cam.canvas.saveDocument().version);
 assert(saved===5,'A new colour did not save as schema 5: '+saved);
 await page.evaluate(()=>window.cam.canvas.execute('undo'));
 assert((await paper())==='yellow','Undo did not restore the colour: '+await paper());
 await page.keyboard.press('Escape');await frame();
});

console.log(`PASS navigation: ${passed} checks`);
