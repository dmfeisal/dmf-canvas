import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawn} from 'node:child_process';
import {serve} from '../../server.mjs';
const spaceId=Number(process.env.CANVAS_TEST_SPACE_ID);
if(!Number.isSafeInteger(spaceId)||spaceId<1)throw new Error('Supply an existing agent-owned CANVAS_TEST_SPACE_ID.');
const repo=fileURLToPath(new URL('../../',import.meta.url));
const server=await serve(join(repo,'site/dist'));
try{
 const config={spaceId,base:server.url,image:join(repo,'tests/fixtures/canvas-transparent.png'),board:join(tmpdir(),'dmf-playground-board.json'),desktop:join(tmpdir(),'dmf-playground-desktop.png'),mobile:join(tmpdir(),'dmf-playground-mobile.png')};
 const source='const playgroundTest='+JSON.stringify(config)+';\n'+await readFile(new URL('../tests/playground-browser.mjs',import.meta.url),'utf8');
 const child=spawn('ego-browser',['nodejs','-e',source],{stdio:'inherit'});
 const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',code=>resolve(code??1));});
 if(code!==0)throw new Error('Playground regression failed; resume the same browser space.');
 if(server.writes)throw new Error('Playground attempted server writes.');
 console.log('PASS playground server writes: 0');
}finally{await server.close();}
