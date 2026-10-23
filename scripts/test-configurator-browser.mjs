import {prepareGenerated} from './test-configurator.mjs';
import {serve} from '../server.mjs';
import {readFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {spawn} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url)),spaceId=Number(process.env.CANVAS_TEST_SPACE_ID);
if(!Number.isSafeInteger(spaceId)||spaceId<1)throw new Error('Supply an existing agent-owned CANVAS_TEST_SPACE_ID.');
const supplied=process.env.CANVAS_GENERATED_FIXTURES?JSON.parse(await readFile(process.env.CANVAS_GENERATED_FIXTURES,'utf8')):null,targets=supplied??await prepareGenerated(),servers=[];
try{
 const ui=await serve(root);servers.push(ui);const outputs=[];
 for(const target of targets){const server=await serve(target.dist);servers.push(server);outputs.push({format:target.format,base:server.url,config:target.config});}
 const config={spaceId,base:ui.url,outputs,temporary:tmpdir(),image:join(root,'tests/fixtures/canvas-transparent.png')};
 const source='const configuratorTest='+JSON.stringify(config)+';\ntry {\n'+await readFile(new URL('../tests/configurator-browser.mjs',import.meta.url),'utf8')+'\n} catch(error) { console.error(error.stack || String(error)); throw error; }';
 const child=spawn('ego-browser',['nodejs','-e',source],{stdio:'inherit'});const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',code=>resolve(code??1));});
 if(code!==0)throw new Error('Configurator checks failed; resume the same test space.');
 if(servers.some(server=>server.writes))throw new Error('Configurator attempted server writes.');console.log('PASS configurator and generated examples; server writes: 0');
}finally{for(const server of servers)await server.close();if(!supplied)for(const target of targets)await rm(target.directory,{recursive:true,force:true});}
