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

// Holds a drag of the rectangle part-way (pointer still down) so guides can be measured, then releases.
async function holdRectAt(left,top,{alt=false}={},inspect){
 const r=await box(RECT),x=r.left+r.width/2,y=r.top+r.height/2,dx=left-r.left,dy=top-r.top;
 await page.mouse.move(x,y);await page.mouse.down();if(alt)await page.keyboard.down('Alt');
 await page.mouse.move(x+dx/2,y+dy/2,{steps:4});await page.mouse.move(x+dx,y+dy,{steps:4});
 const seen=await page.evaluate(sel=>{const pick=cls=>{const n=document.querySelector(sel+' .'+cls);if(!n||n.hidden)return null;const b=n.getBoundingClientRect();return {left:b.left,top:b.top,width:b.width,height:b.height,label:n.textContent,pointer:getComputedStyle(n).pointerEvents,ariaHidden:n.getAttribute('aria-hidden')};};return {x:pick('canvas-instance-guide--x'),y:pick('canvas-instance-guide--y'),gapX:pick('canvas-instance-gap--x'),gapY:pick('canvas-instance-gap--y')};},A);
 await page.mouse.up();if(alt)await page.keyboard.up('Alt');
 const after=await page.evaluate(sel=>[...document.querySelectorAll(sel+' .canvas-instance-guide,'+sel+' .canvas-instance-gap')].every(n=>n.hidden),A);
 return {...seen,hiddenAfter:after};
}

await check('an alignment guide marks the snapped edge while dragging and hides on drop',async()=>{
 const text=await box(' [data-original]');await dragRectTo(text.left+90,text.bottom+80);
 const seen=await holdRectAt(text.left+3,text.bottom+80);
 assert(seen.x&&Math.abs(seen.x.left-text.left)<1,'Vertical guide missing or misplaced: '+JSON.stringify(seen.x)+' vs '+text.left);
 assert(seen.x.pointer==='none'&&seen.x.ariaHidden==='true','Guide must be pointer-inert and aria-hidden');
 assert(seen.hiddenAfter,'Guides stayed visible after the drop');
});

await check('Alt hides the guides along with snapping',async()=>{
 const text=await box(' [data-original]');const seen=await holdRectAt(text.left+60,text.bottom+80,{alt:true});
 assert(!seen.x&&!seen.y&&!seen.gapX&&!seen.gapY,'Guides showed during an Alt drag: '+JSON.stringify(seen));
});

await check('a gap guide labels the distance to a neighbour on the same row',async()=>{
 // Right of the Text, overlapping it vertically, 40px away and clear of every 6px snap line.
 const text=await box(' [data-original]');const seen=await holdRectAt(text.right+40,text.top-10);
 const r=await box(RECT),gap=r.left-text.right;
 assert(seen.gapX&&Math.abs(Number(seen.gapX.label)-Math.round(gap*10)/10)<0.15&&Math.abs(seen.gapX.width-gap)<1,'Gap guide wrong: '+JSON.stringify(seen.gapX)+' actual gap '+gap);
 assert(seen.gapX.pointer==='none'&&seen.hiddenAfter,'Gap guide must be pointer-inert and hide on drop');
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

await check('Shift after a drag starts locks the dominant axis until it is released',async()=>{
 // Start near the top so containment leaves room to move down once Shift is released.
 const h=await host();await dragRectTo(h.x+260,h.y+40);
 const r=await box(RECT),x=r.left+r.width/2,y=r.top+r.height/2;
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+30,y+30,{steps:4});
 const before=await box(RECT);await page.keyboard.down('Shift');
 await page.mouse.move(x+70,y+38,{steps:4});await page.mouse.move(x+110,y+46,{steps:4});
 const locked=await box(RECT),message=await page.evaluate(sel=>document.querySelector(sel+' [data-canvas-instance-status]').textContent,A);
 const perpendicular=await page.evaluate(sel=>document.querySelector(sel+' .canvas-instance-guide--y')?.hidden!==false,A);
 await page.keyboard.up('Shift');await page.mouse.move(x+110,y+100,{steps:4});
 const freed=await box(RECT);await page.mouse.up();
 assert(Math.abs(locked.top-before.top)<0.5&&locked.left>before.left+30,'Shift did not lock to horizontal: '+JSON.stringify({before:before.top,locked:locked.top,left:[before.left,locked.left]}));
 assert(/Horizontal movement constrained/.test(message),'No axis-lock announcement: '+message);
 assert(perpendicular,'The vertical-axis guide showed while movement was locked horizontally');
 assert(freed.top>locked.top+20,'Releasing Shift did not restore free movement');
});

await check('Alt-drag drops a snapped copy as one Undo step; an Alt-click or Escape makes none',async()=>{
 const canvas=()=>page.evaluate(()=>{const c=document.querySelector('main').configurator.previews.A.canvas,s=c.getState();return {objects:s.objects,canUndo:s.canUndo,revision:s.revision,rects:[...document.querySelectorAll('[data-preview=A] [data-canvas-instance-shape=rectangle]')].map(e=>{const r=e.getBoundingClientRect();return {left:r.left,top:r.top};})};});
 const start=await canvas(),r=await box(RECT),x=r.left+r.width/2,y=r.top+r.height/2,h=await host();
 // Alt held before pressing: a copy follows the pointer and still snaps to the grid (Alt does not bypass a copy).
 await page.keyboard.down('Alt');await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+50,y+40,{steps:5});await page.mouse.move(x+97,y+61,{steps:5});await page.mouse.up();await page.keyboard.up('Alt');
 const copied=await canvas(),copy=copied.rects[1];
 assert(copied.objects===start.objects+1&&copied.rects.length===2,'Alt-drag did not make exactly one copy');
 assert(Math.abs(copied.rects[0].left-r.left)<0.5&&Math.abs(copied.rects[0].top-r.top)<0.5,'The original moved during an Alt-drag');
 const offset=((copy.left-h.x)%24+24)%24;assert(Math.abs(offset-12)<0.5,'The copy did not snap to the grid: '+offset);
 await page.click(action('undo'));const undone=await canvas();
 assert(undone.objects===start.objects&&undone.rects.length===1,'One Undo did not remove the copy');
 await page.click(action('redo'));const redone=await canvas();
 assert(redone.rects.length===2&&Math.abs(redone.rects[1].left-copy.left)<0.5&&Math.abs(redone.rects[1].top-copy.top)<0.5,'Redo did not restore the copy where it was dropped');
 await page.click(action('undo'));
 // Alt-click without moving, and Escape part-way, leave no copy and no history.
 const before=await canvas();const r2=await box(RECT),x2=r2.left+r2.width/2,y2=r2.top+r2.height/2;
 await page.keyboard.down('Alt');await page.mouse.move(x2,y2);await page.mouse.down();await page.mouse.up();await page.keyboard.up('Alt');
 const clicked=await canvas();assert(clicked.objects===before.objects&&clicked.revision===before.revision,'An Alt-click made a copy or history');
 await page.keyboard.down('Alt');await page.mouse.move(x2,y2);await page.mouse.down();await page.mouse.move(x2+60,y2+30,{steps:5});
 await page.keyboard.up('Alt');await page.keyboard.press('Escape');await page.mouse.up();
 const escaped=await canvas();
 assert(escaped.objects===before.objects&&escaped.rects.length===1,'Escape left a copy behind: '+JSON.stringify(escaped));
});

await check('snapping never enters saved boards',async()=>{
 const json=await page.evaluate(()=>JSON.stringify(document.querySelector('main').configurator.previews.A.canvas.saveDocument()));
 assert(!/snapping|"align"|"grid"/.test(json),'Snapping leaked into the board file');
});

assert(await page.evaluate(()=>window.editErrors.length===0&&!localStorage.length),'Editing raised page errors or wrote storage');
console.log(`PASS editing precision browser suite (${passed} checks)`);
