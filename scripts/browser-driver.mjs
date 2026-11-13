// Runs a browser suite from tests/ with one of two drivers:
// - ego-browser, when CANVAS_TEST_SPACE_ID names an existing agent-owned space (interactive rehearsal);
// - headless Playwright Chromium otherwise (local runs and CI).
// Suites are plain scripts that receive a config global and call taskSpace(id).page(name).
import {readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';

export function browserSpaceId(){
 const raw=process.env.CANVAS_TEST_SPACE_ID;if(raw===undefined||raw==='')return null;
 const id=Number(raw);if(!Number.isSafeInteger(id)||id<1)throw new Error('CANVAS_TEST_SPACE_ID must name an existing agent-owned space.');return id;
}

export async function runBrowserSuite({suite,name,config,wrap=false}){
 const body=await readFile(new URL('../tests/'+suite,import.meta.url),'utf8');
 const spaceId=config.spaceId;
 if(spaceId){
  const source='const '+name+'='+JSON.stringify(config)+';\n'+(wrap?'try{\n'+body+'\n}catch(error){console.error(error.stack||String(error));throw error;}':body);
  const child=spawn('ego-browser',['nodejs','-e',source],{stdio:'inherit'});
  return await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',code=>resolve(code??1));});
 }
 return runPlaywright(body,name,config);
}

async function runPlaywright(body,name,config){
 const {chromium}=await import('playwright');
 const browser=await chromium.launch({headless:process.env.CANVAS_BROWSER_HEADED!=='1'});
 try{
  const context=await browser.newContext({acceptDownloads:true,viewport:{width:1440,height:1000}});
  // Suites call task.page('p1') synchronously, so the page is opened before the suite starts.
  const page=await adapt(await context.newPage());
  const taskSpace=async()=>({ownership:'agent',page(key){if(key!=='p1')throw new Error('Only page p1 is available under Playwright.');return page;}});
  const AsyncFunction=Object.getPrototypeOf(async()=>{}).constructor;
  await new AsyncFunction('taskSpace',name,body)(taskSpace,{...config,spaceId:0});
  return 0;
 }catch(error){console.error(error.stack||String(error));return 1;}
 finally{await browser.close();}
}

async function adapt(page){
 const session=await page.context().newCDPSession(page);
 return new Proxy(page,{get(target,key){
  // Playwright owns viewport and media emulation; CDP overrides from a second session do not stick.
  if(key==='cdp')return async(method,params={})=>{
   if(method==='Emulation.setDeviceMetricsOverride'){await target.setViewportSize({width:params.width,height:params.height});return {};}
   if(method==='Emulation.setEmulatedMedia'){const scheme=params.features?.find(item=>item.name==='prefers-color-scheme')?.value;await target.emulateMedia({colorScheme:scheme??null});return {};}
   return session.send(method,params);
  };
  if(key==='snapshot')return ()=>target.locator('body').ariaSnapshot();
  const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;
 }});
}
