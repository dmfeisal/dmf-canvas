import {prepareAstro} from './test-astro.mjs';
import {serve} from '../server.mjs';
import {rm} from 'node:fs/promises';
import {browserSpaceId,runBrowserSuite} from './browser-driver.mjs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
const spaceId=browserSpaceId();
const prepared=!process.env.CANVAS_ASTRO_DIRECTORY,directory=process.env.CANVAS_ASTRO_DIRECTORY||await prepareAstro();
let fixture;
try{
 fixture=await serve(join(directory,'dist'));
 const config={spaceId,base:fixture.url,boardPath:join(tmpdir(),'canvas-astro-board.json'),mobilePath:join(tmpdir(),'canvas-astro-mobile.png'),desktopPath:join(tmpdir(),'canvas-astro-desktop.png')};
 const code=await runBrowserSuite({suite:'astro-browser.mjs',name:'astroTest',config});
 if(code!==0)throw new Error('Astro browser checks failed'+(spaceId?'; resume the same test space.':'.'));
 if(fixture.writes)throw new Error('Astro browser attempted server writes.');
 console.log('PASS Astro browser server writes: 0');
}finally{await fixture?.close();if(prepared)await rm(directory,{recursive:true,force:true});}
