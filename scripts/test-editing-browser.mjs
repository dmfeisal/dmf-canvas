import {serve} from '../server.mjs';
import {fileURLToPath} from 'node:url';
import {browserSpaceId,runBrowserSuite} from './browser-driver.mjs';
// Editing precision browser suite: snapping on the configurator embed. Read-only server.
const root=fileURLToPath(new URL('../',import.meta.url)),spaceId=browserSpaceId();
const server=await serve(root);
try{
 const code=await runBrowserSuite({suite:'editing-browser.mjs',name:'editingTest',config:{spaceId,base:server.url},wrap:true});
 if(code!==0)throw new Error('Editing checks failed'+(spaceId?'; resume the same test space.':'.'));
 if(server.writes)throw new Error('Editing suite attempted server writes.');
 console.log('PASS editing; server writes: 0');
}finally{await server.close();}
