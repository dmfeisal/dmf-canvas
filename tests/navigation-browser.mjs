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
const state=()=>page.evaluate(()=>{const s=window.cam.canvas.getState();return {camera:s.camera,limits:s.settings.camera,canUndo:s.canUndo,status:document.querySelector('#host [data-canvas-instance-status]').textContent};});
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

await check('destroy restores the world and the host background',async()=>{
 const left=await page.evaluate(()=>{window.cam.canvas.destroy();const w=window.cam.world,h=window.cam.host;return {style:w.getAttribute('style'),marked:w.hasAttribute('data-canvas-instance-world'),size:h.style.backgroundSize,position:h.style.backgroundPosition,overlays:h.querySelectorAll('.canvas-instance-guide,.canvas-instance-gap,.canvas-instance-label').length};});
 assert(left.style===null&&!left.marked&&left.size===''&&left.position===''&&left.overlays===0,'Left behind: '+JSON.stringify(left));
 const errors=await page.evaluate(()=>window.camErrors);assert(!errors.length,'Page errors: '+errors.join('; '));
});

console.log(`PASS navigation: ${passed} checks`);
