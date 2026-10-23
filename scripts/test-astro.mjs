import {mkdtemp,cp,mkdir,readFile,writeFile,rm,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
const npm=process.platform==='win32'?'npm.cmd':'npm';
const run=(args,cwd)=>execFileSync(npm,args,{cwd,encoding:'utf8',maxBuffer:8*1024*1024,stdio:['ignore','pipe','pipe']});
export async function prepareAstro(){
 const directory=await mkdtemp(join(tmpdir(),'dmf-canvas-astro-'));
 try{
  await cp(join(root,'examples/astro'),directory,{recursive:true,filter:source=>!/(?:^|[/\\])(?:node_modules|dist|\.astro)(?:[/\\]|$)/.test(source)});
  await mkdir(join(directory,'src/lib'),{recursive:true});
  for(const name of ['custom-host.js','custom-host.css'])await cp(join(root,'examples/shared',name),join(directory,'src/lib',name));
  const packed=JSON.parse(run(['pack','--ignore-scripts','--cache',join(directory,'cache'),'--pack-destination',directory,'--json'],root))[0];
  // Add only the dependency-free local archive to the fixture lock, then install
  // it with the already locked Astro tree in one clean operation. A second
  // lockfile-disabled install would resolve Astro metadata from a warm cache.
  const library=JSON.parse(await readFile(join(root,'package.json'),'utf8'));
  assert(!library.dependencies,'Update fixture lock generation if Canvas gains runtime dependencies.');
  const project=JSON.parse(await readFile(join(directory,'package.json'),'utf8'));
  project.dependencies={'dmf-canvas':'file:'+packed.filename};
  const lock=JSON.parse(await readFile(join(directory,'package-lock.json'),'utf8'));
  lock.packages[''].dependencies=project.dependencies;
  lock.packages['node_modules/dmf-canvas']={version:packed.version,resolved:'file:'+packed.filename,integrity:packed.integrity};
  await writeFile(join(directory,'package.json'),JSON.stringify(project,null,2)+'\n');
  await writeFile(join(directory,'package-lock.json'),JSON.stringify(lock,null,2)+'\n');
  run(['ci','--ignore-scripts','--no-audit','--no-fund'],directory);
  const installed=JSON.parse(await readFile(join(directory,'node_modules/dmf-canvas/package.json'),'utf8'));
  assert.equal(installed.name,'dmf-canvas');
  process.stdout.write(run(['run','build'],directory));
  const html=await readFile(join(directory,'dist/index.html'),'utf8');
  assert(html.includes('canvas-astro-example')&&html.includes('Canvas in Astro'));
  const away=await readFile(join(directory,'dist/away/index.html'),'utf8');assert(!away.includes('<canvas-astro-example'));
  const assets=await readdir(join(directory,'dist/_astro'));
  assert(assets.some(name=>name.endsWith('.css'))&&assets.some(name=>name.endsWith('.js')));
  const css=(await Promise.all(assets.filter(name=>name.endsWith('.css')).map(name=>readFile(join(directory,'dist/_astro',name),'utf8')))).join('\n');
  assert(css.includes('canvas-embed-toolbar')&&css.includes('canvas-instance-note')&&css.includes('cursor:'));
  for(const match of css.matchAll(/url\(['"]?([^'"\s)]+)/g))if(!match[1].startsWith('data:'))await readFile(join(directory,'dist',match[1].replace(/^\//,'')));
  await writeFile(join(directory,'INSTALL-PROVENANCE.json'),JSON.stringify({package:'dmf-canvas',version:installed.version,archive:packed.filename,integrity:packed.integrity,source:'npm pack of this checkout; no symlink or portfolio dependency'},null,2)+'\n');
  console.log('PASS Astro installed-package build and CSS assets');
  return directory;
 }catch(error){await rm(directory,{recursive:true,force:true});if(error.stderr)process.stderr.write(String(error.stderr));throw error;}
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const directory=await prepareAstro();
 if(process.argv.includes('--keep'))console.log(JSON.stringify({directory,dist:join(directory,'dist')}));
 else await rm(directory,{recursive:true,force:true});
}
