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
 const config={spaceId,base:server.url,board:join(tmpdir(),'dmf-import-board.json'),mobile:join(tmpdir(),'dmf-import-mobile.png')};
 const source='const importTest='+JSON.stringify(config)+';\n'+await readFile(new URL('../tests/import-browser.mjs',import.meta.url),'utf8');
 const child=spawn('ego-browser',['nodejs','-e',source],{stdio:'inherit'});
 const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',code=>resolve(code??1));});
 if(code!==0)throw new Error('Import regression failed; resume the same browser space.');
 if(server.writes)throw new Error('Import attempted server writes.');
 console.log('PASS import server writes: 0');
}finally{await server.close();}
