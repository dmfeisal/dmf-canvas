import {mkdtemp,writeFile,readFile,rm,copyFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
const scratch=await mkdtemp(join(tmpdir(),'dmf-canvas-package-'));
const npm=process.platform==='win32'?'npm.cmd':'npm';
const run=(file,args,cwd)=>execFileSync(file,args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']});
try{
 const packed=JSON.parse(run(npm,['pack','--ignore-scripts','--cache',join(scratch,'cache'),'--pack-destination',scratch,'--json'],root))[0];
 assert(!packed.files.some(f=>/^(examples|tests|consumer|server|node_modules)\b/.test(f.path)));
 await writeFile(join(scratch,'package.json'),'{"private":true,"type":"module"}');
 run(npm,['install','--offline','--ignore-scripts','--cache',join(scratch,'cache'),join(scratch,packed.filename)],scratch);
 const exports=Object.keys(JSON.parse(await readFile(join(root,'package.json'),'utf8')).exports).filter(name=>!name.endsWith('.css'));
 await writeFile(join(scratch,'smoke.mjs'),exports.map(name=>`await import(${JSON.stringify(name==='.'?'dmf-canvas':'dmf-canvas'+name.slice(1))});`).join('\n')+'\nconsole.log("Installed entrypoints import without DOM");');
 process.stdout.write(run(process.execPath,[join(scratch,'smoke.mjs')],scratch));
 await copyFile(join(root,'tests/types/consumer.ts'),join(scratch,'consumer.ts'));
 await copyFile(join(root,'tests/types/tsconfig.json'),join(scratch,'tsconfig.json'));
 run(process.execPath,[join(root,'node_modules/typescript/bin/tsc'),'-p',join(scratch,'tsconfig.json')],scratch);
 const css=await readFile(join(scratch,'node_modules/dmf-canvas/css/canvas-instance.css'),'utf8');
 for(const match of css.matchAll(/url\(['"]?([^'"\s)]+)/g))await readFile(join(scratch,'node_modules/dmf-canvas/css',match[1]));
 console.log(`Installed archive types and CSS assets passed (${packed.files.length} files, ${packed.size} bytes packed).`);
}finally{await rm(scratch,{recursive:true,force:true});}
