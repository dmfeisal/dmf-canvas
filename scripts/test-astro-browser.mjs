import {prepareAstro} from './test-astro.mjs';
import {serve} from '../server.mjs';
import {spawn} from 'node:child_process';
import {readFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
const spaceId=Number(process.env.CANVAS_TEST_SPACE_ID);if(!Number.isSafeInteger(spaceId)||spaceId<1)throw new Error('Supply an existing agent-owned CANVAS_TEST_SPACE_ID.');
const prepared=!process.env.CANVAS_ASTRO_DIRECTORY,directory=process.env.CANVAS_ASTRO_DIRECTORY||await prepareAstro();
let fixture;
try{
 fixture=await serve(join(directory,'dist'));
 const config={spaceId,base:fixture.url,boardPath:join(tmpdir(),'canvas-astro-board.json'),mobilePath:join(tmpdir(),'canvas-astro-mobile.png'),desktopPath:join(tmpdir(),'canvas-astro-desktop.png')};
 const source='const astroTest='+JSON.stringify(config)+';\n'+await readFile(new URL('../tests/astro-browser.mjs',import.meta.url),'utf8');
 const child=spawn('ego-browser',['nodejs','-e',source],{stdio:'inherit'});
 const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',code=>resolve(code??1));});
 if(code!==0)throw new Error('Astro browser checks failed; resume the same test space.');
 if(fixture.writes)throw new Error('Astro browser attempted server writes.');
 console.log('PASS Astro browser server writes: 0');
}finally{await fixture?.close();if(prepared)await rm(directory,{recursive:true,force:true});}
