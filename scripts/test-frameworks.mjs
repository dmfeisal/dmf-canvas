import {mkdtemp,cp,mkdir,readFile,writeFile,rm,readdir,realpath} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
const npm=process.platform==='win32'?'npm.cmd':'npm';
const run=(args,cwd)=>execFileSync(npm,args,{cwd,encoding:'utf8',maxBuffer:8*1024*1024,stdio:['ignore','pipe','pipe']});
export const frameworks=Object.freeze(['react','vue']);
export async function prepareFramework(framework,{configure}={}){
 if(!frameworks.includes(framework))throw new TypeError('Choose react or vue.');
 const directory=await mkdtemp(join(tmpdir(),'dmf-canvas-'+framework+'-'));
 try{
  await cp(join(root,'examples',framework),directory,{recursive:true,filter:source=>!/(?:^|[/\\])(?:node_modules|dist)(?:[/\\]|$)/.test(source)});
  await mkdir(join(directory,'src/lib'),{recursive:true});
  for(const name of ['custom-host.js','custom-host.css','framework-session.js'])await cp(join(root,'examples/shared',name),join(directory,'src/lib',name));
  if(configure)await configure(directory);
  const library=JSON.parse(await readFile(join(root,'package.json'),'utf8'));
  assert(!library.dependencies,'Update fixture lock generation if Canvas gains runtime dependencies.');
  const packed=JSON.parse(run(['pack','--ignore-scripts','--cache',join(directory,'cache'),'--pack-destination',directory,'--json'],root))[0];
  const project=JSON.parse(await readFile(join(directory,'package.json'),'utf8'));
  project.dependencies={...project.dependencies,'dmf-canvas':'file:'+packed.filename};
  const lock=JSON.parse(await readFile(join(directory,'package-lock.json'),'utf8'));
  lock.packages[''].dependencies=project.dependencies;
  lock.packages['node_modules/dmf-canvas']={version:packed.version,resolved:'file:'+packed.filename,integrity:packed.integrity};
  await writeFile(join(directory,'package.json'),JSON.stringify(project,null,2)+'\n');
  await writeFile(join(directory,'package-lock.json'),JSON.stringify(lock,null,2)+'\n');
  run(['ci','--ignore-scripts','--no-audit','--no-fund'],directory);
  const installed=await realpath(join(directory,'node_modules/dmf-canvas'));
  assert.equal(installed,await realpath(join(directory,'node_modules'))+'/dmf-canvas','No sibling/source symlinks');
  process.stdout.write(run(['run','build'],directory));
  const html=await readFile(join(directory,'dist/index.html'),'utf8');assert(html.includes('id="app"'));
  const assets=await readdir(join(directory,'dist/assets'));
  assert(assets.some(name=>name.endsWith('.css'))&&assets.some(name=>name.endsWith('.js')));
  const css=(await Promise.all(assets.filter(name=>name.endsWith('.css')).map(name=>readFile(join(directory,'dist/assets',name),'utf8')))).join('\n');
  assert(css.includes('canvas-instance-note')&&css.includes('canvas-embed-toolbar')&&css.includes('cursor:'));
  for(const match of css.matchAll(/url\(['"]?([^'"\s)]+)/g))if(!match[1].startsWith('data:'))await readFile(join(directory,'dist',match[1].replace(/^\//,'')));
  await writeFile(join(directory,'INSTALL-PROVENANCE.json'),JSON.stringify({framework,package:library.name,version:library.version,archive:packed.filename,integrity:packed.integrity,source:'npm pack installed with the locked framework tree; no source aliases or symlinks'},null,2)+'\n');
  console.log('PASS '+framework+' installed-package production build and CSS assets');
  return directory;
 }catch(error){await rm(directory,{recursive:true,force:true});if(error.stderr)process.stderr.write(String(error.stderr));throw error;}
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const directories=[];
 try{for(const framework of frameworks)directories.push({framework,directory:await prepareFramework(framework)});if(process.argv.includes('--keep'))console.log(JSON.stringify(directories));}
 finally{if(!process.argv.includes('--keep'))for(const item of directories)await rm(item.directory,{recursive:true,force:true});}
}
