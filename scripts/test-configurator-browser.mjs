import {prepareGenerated} from './test-configurator.mjs';
import {serve} from '../server.mjs';
import {readFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {browserSpaceId,runBrowserSuite} from './browser-driver.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),spaceId=browserSpaceId();
const supplied=process.env.CANVAS_GENERATED_FIXTURES?JSON.parse(await readFile(process.env.CANVAS_GENERATED_FIXTURES,'utf8')):null,targets=supplied??await prepareGenerated(),servers=[];
try{
 const ui=await serve(root);servers.push(ui);const outputs=[];
 for(const target of targets){const server=await serve(target.dist);servers.push(server);outputs.push({format:target.format,base:server.url,config:target.config});}
 const config={spaceId,base:ui.url,outputs,temporary:tmpdir(),image:join(root,'tests/fixtures/canvas-transparent.png')};
 const code=await runBrowserSuite({suite:'configurator-browser.mjs',name:'configuratorTest',config,wrap:true});
 if(code!==0)throw new Error('Configurator checks failed'+(spaceId?'; resume the same test space.':'.'));
 if(servers.some(server=>server.writes))throw new Error('Configurator attempted server writes.');console.log('PASS configurator and generated examples; server writes: 0');
}finally{for(const server of servers)await server.close();if(!supplied)for(const target of targets)await rm(target.directory,{recursive:true,force:true});}
