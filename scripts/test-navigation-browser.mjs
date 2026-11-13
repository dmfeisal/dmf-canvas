import {serve} from '../server.mjs';
import {fileURLToPath} from 'node:url';
import {browserSpaceId,runBrowserSuite} from './browser-driver.mjs';
// Navigation browser suite: the camera model on tests/fixtures/camera.html. Read-only server.
const root=fileURLToPath(new URL('../',import.meta.url)),spaceId=browserSpaceId();
const server=await serve(root);
try{
 const code=await runBrowserSuite({suite:'navigation-browser.mjs',name:'navigationTest',config:{spaceId,base:server.url},wrap:true});
 if(code!==0)throw new Error('Navigation checks failed'+(spaceId?'; resume the same test space.':'.'));
 if(server.writes)throw new Error('Navigation suite attempted server writes.');
 console.log('PASS navigation; server writes: 0');
}finally{await server.close();}
