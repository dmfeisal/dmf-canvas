import {fileURLToPath} from 'node:url';
import {serve} from '../server.mjs';
import {browserSpaceId,runBrowserSuite} from './browser-driver.mjs';
const spaceId=browserSpaceId();
const fixture=await serve(fileURLToPath(new URL('../',import.meta.url)));
try{
 const code=await runBrowserSuite({suite:'inspector-browser.mjs',name:'inspectorTest',config:{base:fixture.url,spaceId},wrap:true});
 if(code)throw new Error('Inspector checks failed'+(spaceId?'; resume the same space.':'.'));if(fixture.writes)throw new Error('Inspector attempted server writes.');console.log('PASS inspector server writes: 0');
}finally{await fixture.close();}
