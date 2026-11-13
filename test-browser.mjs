import {fileURLToPath} from 'node:url';import {serve} from './server.mjs';import {browserSpaceId,runBrowserSuite} from './scripts/browser-driver.mjs';
const spaceId=browserSpaceId();
const fixture=await serve(fileURLToPath(new URL('.',import.meta.url)));try{process.exitCode=await runBrowserSuite({suite:'browser.mjs',name:'rehearsal',config:{base:fixture.url,spaceId}});if(fixture.writes)throw new Error('Browser attempted server writes.');console.log(JSON.stringify({serverWrites:fixture.writes,requestedPaths:[...new Set(fixture.requests)]}));}finally{await fixture.close();}
