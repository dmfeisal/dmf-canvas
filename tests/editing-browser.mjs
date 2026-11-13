// Editing precision (docs/prd/EDITING-PRECISION.md): pointer-drag snapping on the configurator's preview A.
const task=await taskSpace(editingTest.spaceId),page=task.page('p1');if(task.ownership!=='agent')throw new Error('Use an agent-owned space.');
const assert=(value,message)=>{if(!value)throw new Error(message);};let passed=0;
async function check(name,run){console.log('RUN '+name);await run();passed++;console.log('PASS '+name);}
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await page.goto(editingTest.base+'/examples/configurator/');await page.waitForFunction(()=>!document.getElementById('copy').disabled);
await page.evaluate(()=>{window.editErrors=[];window.addEventListener('error',e=>window.editErrors.push(e.message));window.addEventListener('unhandledrejection',e=>window.editErrors.push(String(e.reason)));});
const A='[data-preview=A]',action=id=>`${A} [data-toolbar-action="${id}"]`;
const host=()=>page.evaluate(sel=>{const h=document.querySelector(sel+' [data-host]');h.scrollIntoView({block:'center'});const r=h.getBoundingClientRect();return {x:r.left+h.clientLeft,y:r.top+h.clientTop};},A);
const box=selector=>page.evaluate(([sel,selector])=>{const r=document.querySelector(sel+' '+selector).getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};},[A,selector]);
const settings=()=>page.evaluate(()=>document.querySelector('main').configurator.previews.A.canvas.getState().settings.snapping);
const RECT=' [data-canvas-instance-shape=rectangle]';
// Drags the rectangle from its centre so its left edge lands at `left` (screen px), optionally holding Alt.
async function dragRectTo(left,top,{alt=false}={}){
 const r=await box(RECT),x=r.left+r.width/2,y=r.top+r.height/2,dx=left-r.left,dy=top-r.top;
 await page.mouse.move(x,y);await page.mouse.down();if(alt)await page.keyboard.down('Alt');
 await page.mouse.move(x+dx/2,y+dy/2,{steps:4});await page.mouse.move(x+dx,y+dy,{steps:4});
 await page.mouse.up();if(alt)await page.keyboard.up('Alt');
}

await check('a 200px rectangle is drawn away from the Text',async()=>{
 await page.click(action('shapes'));const h=await host();
 await page.mouse.move(h.x+300,h.y+180);await page.mouse.down();await page.mouse.move(h.x+400,h.y+220,{steps:4});await page.mouse.move(h.x+500,h.y+260,{steps:4});await page.mouse.up();
 const r=await box(RECT);assert(Math.abs(r.width-200)<=1,'Rectangle width was '+r.width);
 assert(JSON.stringify(await settings())==='{"align":true,"grid":false}','Snapping defaults changed');
});

await check('Align snaps the dragged edge to another object within 6px',async()=>{
 const text=await box(' [data-original]');await dragRectTo(text.left+3,text.bottom+80);
 const r=await box(RECT);assert(Math.abs(r.left-text.left)<0.5,`Left edge did not snap: ${r.left} vs ${text.left}`);
});

await check('Alt bypasses snapping for the drag',async()=>{
 // Start well away from the Text: a 3px move would stay under the 4px drag threshold.
 const text=await box(' [data-original]');await dragRectTo(text.left+90,text.bottom+80,{alt:true});await dragRectTo(text.left+3,text.bottom+80,{alt:true});
 const r=await box(RECT);assert(Math.abs(r.left-(text.left+3))<0.5,`Alt drag snapped anyway: ${r.left} vs ${text.left+3}`);
});

await check('More toggles show and change the snapping settings',async()=>{
 await page.click(action('more'));
 const rows=await page.evaluate(sel=>Object.fromEntries(['snap-align','snap-grid'].map(id=>{const b=document.querySelector(sel+` [data-toolbar-action="${id}"]`);return [id,{visible:!b.hidden,checked:b.getAttribute('aria-checked')??b.getAttribute('aria-pressed')}];})),A);
 assert(rows['snap-align'].visible&&rows['snap-grid'].visible&&rows['snap-align'].checked==='true'&&rows['snap-grid'].checked==='false','Snapping rows wrong: '+JSON.stringify(rows));
 await page.click(action('snap-align'));await page.click(action('more'));await page.click(action('snap-grid'));
 assert(JSON.stringify(await settings())==='{"align":false,"grid":true}','Toggles did not change the settings');
});

await check('Grid snaps the selection to the background dots, and arrow keys stay exact',async()=>{
 const h=await host();await dragRectTo(h.x+237,h.y+203);
 const r=await box(RECT),offset=((r.left-h.x)%24+24)%24,offsetY=((r.top-h.y)%24+24)%24;
 assert(Math.abs(offset-12)<0.5&&Math.abs(offsetY-12)<0.5,`Not on the grid: ${offset}, ${offsetY}`);
 await page.focus(A+RECT);await page.keyboard.press('ArrowRight');
 const moved=await box(RECT);assert(Math.abs(moved.left-r.left-1)<0.5,'Arrow nudge was not exactly 1px: '+(moved.left-r.left));
});

await check('snapping never enters saved boards',async()=>{
 const json=await page.evaluate(()=>JSON.stringify(document.querySelector('main').configurator.previews.A.canvas.saveDocument()));
 assert(!/snapping|"align"|"grid"/.test(json),'Snapping leaked into the board file');
});

assert(await page.evaluate(()=>window.editErrors.length===0&&!localStorage.length),'Editing raised page errors or wrote storage');
console.log(`PASS editing precision browser suite (${passed} checks)`);
