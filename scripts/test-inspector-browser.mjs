import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {serve} from '../server.mjs';
const spaceId=Number(process.env.CANVAS_TEST_SPACE_ID);if(!Number.isSafeInteger(spaceId)||spaceId<1)throw new Error('Supply an existing agent-owned CANVAS_TEST_SPACE_ID.');
const fixture=await serve(fileURLToPath(new URL('../',import.meta.url)));
try{
 const source='const inspectorTest='+JSON.stringify({base:fixture.url,spaceId})+';\ntry{\n'+await readFile(new URL('../tests/inspector-browser.mjs',import.meta.url),'utf8')+'\n}catch(error){console.error(error.stack||String(error));throw error;}';
 const child=spawn('ego-browser',['nodejs','-e',source],{stdio:'inherit'});const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',code=>resolve(code??1));});
 if(code)throw new Error('Inspector checks failed; resume the same space.');if(fixture.writes)throw new Error('Inspector attempted server writes.');console.log('PASS inspector server writes: 0');
}finally{await fixture.close();}
