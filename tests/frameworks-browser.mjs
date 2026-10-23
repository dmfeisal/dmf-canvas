const task=await taskSpace(frameworkTest.spaceId),page=task.page('p1');if(task.ownership!=='agent')throw new Error('Use an agent-owned space.');
const assert=(value,message)=>{if(!value)throw new Error(message);};let passed=0;
async function check(name,run){console.log('RUN '+name);await run();passed++;console.log('PASS '+name);}
const host=name=>`[data-framework-host=${name}]`,consumer=name=>`[data-consumer=${name}]`;
for(const target of frameworkTest.targets){
 const label=target.framework+' '+target.mode,development=target.mode==='development',expectedMounts=target.framework==='react'&&development?2:1;
 await page.cdp('Emulation.setFocusEmulationEnabled',{enabled:true});await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await page.goto(target.base+'/');
 await page.waitForFunction(expected=>[...document.querySelectorAll('[data-framework-host]')].length===2&&[...document.querySelectorAll('[data-framework-host]')].every(e=>e.dataset.ready==='true'&&Number(e.dataset.mounts)===expected),expectedMounts);
 await check(label+' mounts two installed-package hosts with the correct lifecycle',async()=>{
  assert(await page.evaluate(({expectedMounts,development,framework})=>{
   const roots=[...document.querySelectorAll('[data-framework-host]')];
   return document.querySelector('main').dataset.framework===framework&&document.querySelector('main').dataset.development===String(development)&&roots.every(root=>Number(root.dataset.mounts)===expectedMounts&&Number(root.dataset.disposals||0)===expectedMounts-1&&root.canvasExample.canvas.getState().objects===1&&root.querySelectorAll('[data-canvas-instance-status]').length===1&&getComputedStyle(root.canvasExample.host).position==='relative')&&document.querySelectorAll('.canvas-embed-toolbar').length===2&&!window.DMFCanvasTools;
  },{expectedMounts,development,framework:target.framework}),'Wrong mount/cleanup counts or package styles');
 });
 await check(label+' parent updates preserve existing engines and edits',async()=>{
  await page.focus(consumer('A')+' [data-original]');await page.keyboard.press('F2');await page.keyboard.press('ControlOrMeta+a');await page.keyboard.type('Framework-owned lifecycle');await page.keyboard.press('Escape');
  await page.evaluate(()=>{window.previousCanvas=document.querySelector('[data-framework-host=A]').canvasExample.canvas;});await page.click('[data-rerender]');await page.waitForFunction(()=>document.querySelector('[data-renders]').textContent==='Parent updates: 1');
  assert(await page.evaluate(expected=>document.querySelector('[data-framework-host=A]').canvasExample.canvas===window.previousCanvas&&Number(document.querySelector('[data-framework-host=A]').dataset.mounts)===expected&&document.querySelector('[data-consumer=A] [data-canvas-instance-editor]').textContent==='Framework-owned lifecycle'&&document.querySelector('[data-consumer=B] [data-canvas-instance-editor]').textContent==='Independent B',expectedMounts),'Parent rerender remounted or overwrote Canvas');
  await page.click(consumer('A')+' button[aria-label=Undo]');assert(await page.evaluate(()=>document.querySelector('[data-consumer=A] [data-canvas-instance-editor]').textContent==='Independent A'),'Native edit Undo failed');await page.click(consumer('A')+' button[aria-label=Redo]');
 });
 await check(label+' removal disposes one engine without affecting its sibling',async()=>{
  await page.evaluate(()=>{window.previousCanvas=document.querySelector('[data-framework-host=A]').canvasExample.canvas;window.siblingCanvas=document.querySelector('[data-framework-host=B]').canvasExample.canvas;});await page.click('[data-toggle=A]');await page.waitForSelector(host('A'),{state:'detached'});
  assert(await page.evaluate(()=>!window.previousCanvas.getState().mounted&&window.siblingCanvas.getState().mounted&&document.querySelectorAll('[data-canvas-instance-status]').length===1&&document.querySelector('[data-framework-host=B]').canvasExample.canvas===window.siblingCanvas),'Unmount leaked or crossed hosts');
  await page.click('[data-toggle=A]');await page.waitForFunction(expected=>document.querySelector('[data-framework-host=A]')?.dataset.ready==='true'&&Number(document.querySelector('[data-framework-host=A]').dataset.mounts)===expected,expectedMounts);
  assert(await page.evaluate(()=>document.querySelector('[data-consumer=A] [data-canvas-instance-editor]').textContent==='Independent A'&&document.querySelector('[data-framework-host=A]').canvasExample.canvas.getState().objects===1),'Remount retained unsaved history');
 });
 if(!development)continue;
 await check(label+' native permissions themes clipboard and local files remain isolated',async()=>{
  await page.selectOption(consumer('A')+' [data-theme]','dark');await page.selectOption(consumer('B')+' [data-theme]','light');
  await page.click(consumer('A')+' button[aria-label="Add note"]');await page.click(consumer('A')+' button[aria-label=Copy]');await page.click(consumer('B')+' button[aria-label=Paste]');assert(await page.evaluate(()=>document.querySelector('[data-framework-host=B]').canvasExample.canvas.getState().objects===2),'Page-local clipboard failed');
  await page.click(consumer('B')+' [data-readonly]');assert(await page.evaluate(()=>document.querySelector('[data-consumer=B] button[aria-label="Add note"]').disabled&&document.querySelector('[data-framework-host=B]').canvasExample.canvas.execute('move',{dx:1,dy:0}).reason==='read-only'),'Read-only was visual-only');await page.click(consumer('B')+' [data-readonly]');
  const boardPath=frameworkTest.temporary+'/canvas-'+target.framework+'-board.json';const promise=page.waitForEvent('download');await page.click(consumer('A')+' [data-save]');await(await promise).saveAs(boardPath);
  await page.click(consumer('A')+' [data-stop]');await page.click(consumer('A')+' [data-stop]');await page.setInputFiles(consumer('A')+' [data-file]',[boardPath]);await page.waitForFunction(()=>document.querySelector('[data-consumer=A] [data-status]').textContent==='Board opened.');assert(await page.evaluate(()=>!!document.querySelector('[data-consumer=A] .canvas-instance-note')),'Board Open lost created object');
 });
 await check(label+' mobile RTL preserves bounds and parent updates',async()=>{
  await page.cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});await page.evaluate(()=>document.documentElement.dir='rtl');await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&[...document.querySelectorAll('.canvas-instance-note')].every(e=>{const r=e.getBoundingClientRect(),h=e.parentElement.getBoundingClientRect();return r.left>=h.left-1&&r.right<=h.right+1;})),'Mobile overflow or uncontained owner');
  await page.screenshot({path:frameworkTest.temporary+'/canvas-'+target.framework+'-mobile.png'});await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await page.evaluate(()=>document.documentElement.dir='ltr');
 });
 await check(label+' unmount cancels in-progress Pencil creation',async()=>{
  await page.click(consumer('A')+' button[aria-label=Pencil]');await page.evaluate(()=>document.querySelector('[data-consumer=A] [data-consumer-host]').scrollIntoView({block:'center',behavior:'instant'}));const r=await page.evaluate(()=>document.querySelector('[data-consumer=A] [data-consumer-host]').getBoundingClientRect().toJSON());await page.mouse.move(r.x+80,r.y+160);await page.mouse.down();await page.mouse.move(r.x+160,r.y+190);
  assert(await page.evaluate(()=>!!document.querySelector('[data-consumer=A] [data-canvas-instance-preview]')),'Pencil preview did not begin');await page.evaluate(()=>{window.previousCanvas=document.querySelector('[data-framework-host=A]').canvasExample.canvas;document.querySelector('[data-toggle=A]').click();});await page.waitForSelector(host('A'),{state:'detached'});await page.mouse.up();
  assert(await page.evaluate(()=>!window.previousCanvas.getState().mounted&&!document.querySelector('[data-canvas-instance-preview]')&&document.querySelector('[data-framework-host=B]').canvasExample.canvas.getState().mounted),'Unmount retained provisional ink');await page.click('[data-toggle=A]');await page.waitForSelector(host('A')+'[data-ready]');
 });
 await check(label+' ten hide/show cycles do not duplicate runtime UI',async()=>{
  for(let index=0;index<10;index++){
   await page.evaluate(()=>{window.previousCanvas=document.querySelector('[data-framework-host=A]').canvasExample.canvas;});await page.click('[data-toggle=A]');await page.waitForSelector(host('A'),{state:'detached'});assert(await page.evaluate(()=>!window.previousCanvas.getState().mounted),'Old engine survived removal');await page.click('[data-toggle=A]');await page.waitForSelector(host('A')+'[data-ready]');
   assert(await page.evaluate(expected=>document.querySelectorAll('[data-canvas-instance-status]').length===2&&document.querySelectorAll('.canvas-embed-toolbar').length===2&&Number(document.querySelector('[data-framework-host=A]').dataset.mounts)===expected,expectedMounts),'Repeated mount duplicated UI or changed lifecycle');
  }
 });
 await check(label+' no implicit persistence or external application services',async()=>{
  assert(await page.evaluate(()=>!localStorage.length&&performance.getEntriesByType('resource').every(entry=>{const u=new URL(entry.name);return ['data:','blob:'].includes(u.protocol)||u.origin===location.origin&&!/\.netlify|dmf-web|\/fonts\//.test(u.pathname);})),'Implicit storage or external service');
  await page.screenshot({path:frameworkTest.temporary+'/canvas-'+target.framework+'-desktop.png'});await page.evaluate(()=>{delete window.previousCanvas;delete window.siblingCanvas;});
 });
}
console.log(`PASS ${passed} React/Vue integration scenarios`);
