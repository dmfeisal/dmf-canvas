import {serve} from '../server.mjs';
import {fileURLToPath} from 'node:url';
import {browserSpaceId,runBrowserSuite} from './browser-driver.mjs';
// Shapes browser suite: draws, resizes, restyles and saves shapes in the configurator's embed. Read-only server.
const root=fileURLToPath(new URL('../',import.meta.url)),spaceId=browserSpaceId();
const server=await serve(root);
try{
 const code=await runBrowserSuite({suite:'shapes-browser.mjs',name:'shapesTest',config:{spaceId,base:server.url},wrap:true});
 if(code!==0)throw new Error('Shapes checks failed'+(spaceId?'; resume the same test space.':'.'));
 if(server.writes)throw new Error('Shapes suite attempted server writes.');
 console.log('PASS shapes; server writes: 0');
}finally{await server.close();}
