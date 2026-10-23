import {mkdtemp,readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {generateFiles} from '../examples/configurator/generate.js';
import {normalizeConfig} from '../examples/configurator/canvas-embed.js';
import {prepareFramework} from './test-frameworks.mjs';
import {prepareAstro} from './test-astro.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),npm=process.platform==='win32'?'npm.cmd':'npm';
const sources=Object.fromEntries(await Promise.all(['canvas-embed.js','canvas-embed.css','image-controls.js'].map(async name=>[name,await readFile(join(root,'examples/configurator',name),'utf8')])));
const run=(args,cwd)=>execFileSync(npm,args,{cwd,encoding:'utf8',maxBuffer:8*1024*1024,stdio:['ignore','pipe','pipe']});
export async function prepareGenerated(){
 const targets=[];
 try{for(const format of ['html','astro','react','vue']){
  const config=normalizeConfig({readOnly:['html','vue'].includes(format),theme:['astro','vue'].includes(format)?'dark':'light',width:640,height:280,tools:{pencil:false,clipboard:false,files:false}});
  const files=generateFiles(config,format,sources);
  const write=async directory=>{await mkdir(directory,{recursive:true});for(const [name,text]of Object.entries(files))await writeFile(join(directory,name),text);};
  let directory;
  if(format==='html'){
   directory=await mkdtemp(join(tmpdir(),'canvas-generated-html-'));targets.push({format,directory,config,dist:directory});
   await write(directory);const packed=JSON.parse(run(['pack','--ignore-scripts','--cache',join(directory,'cache'),'--pack-destination',directory,'--json'],root))[0];
   const project={name:'canvas-generated-html',private:true,type:'module',dependencies:{'dmf-canvas':'file:'+packed.filename}},lock={name:project.name,lockfileVersion:3,requires:true,packages:{'':{dependencies:project.dependencies},'node_modules/dmf-canvas':{version:packed.version,resolved:'file:'+packed.filename,integrity:packed.integrity}}};
   await writeFile(join(directory,'package.json'),JSON.stringify(project));await writeFile(join(directory,'package-lock.json'),JSON.stringify(lock));run(['ci','--offline','--ignore-scripts','--no-audit','--no-fund'],directory);
  }else if(format==='astro'){
   directory=await prepareAstro({expectedTag:'dmf-canvas-embed',configure:async directory=>{await write(join(directory,'src/components'));await writeFile(join(directory,'src/pages/index.astro'),`---\nimport Layout from '../layouts/Layout.astro';\nimport CanvasEmbed from '../components/CanvasEmbed.astro';\n---\n<Layout><h1>Canvas in Astro</h1><a href="/away/" data-leave>Leave this page</a><CanvasEmbed/></Layout>\n`);}});
   targets.push({format,directory,config,dist:join(directory,'dist')});
  }else{
   directory=await prepareFramework(format,{configure:async directory=>{
    await write(join(directory,'src'));
    if(format==='react')await writeFile(join(directory,'src/main.jsx'),`import {StrictMode,useState} from 'react';\nimport {createRoot} from 'react-dom/client';\nimport CanvasEmbed from './CanvasEmbed.jsx';\nimport './lib/custom-host.css';\nfunction App(){const [shown,setShown]=useState(true);return <main><h1>Generated React example</h1><button data-toggle onClick={()=>setShown(v=>!v)}>Toggle canvas</button>{shown&&<CanvasEmbed/>}</main>;}\ncreateRoot(document.getElementById('app')).render(<StrictMode><App/></StrictMode>);\n`);
    else await writeFile(join(directory,'src/App.vue'),`<script setup>\nimport {ref} from 'vue';\nimport CanvasEmbed from './CanvasEmbed.vue';\nconst shown=ref(true);\n</script>\n<template><main><h1>Generated Vue example</h1><button data-toggle @click="shown=!shown">Toggle canvas</button><CanvasEmbed v-if="shown"/></main></template>\n`);
   }});targets.push({format,directory,config,dist:join(directory,'dist')});
  }
  console.log('PASS generated '+format+' example installs'+(format==='html'?'':' and builds'));
 }
 return targets;
 }catch(error){for(const target of targets)await rm(target.directory,{recursive:true,force:true});if(error.stderr)process.stderr.write(String(error.stderr));throw error;}
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const targets=await prepareGenerated();if(process.argv.includes('--keep'))console.log(JSON.stringify(targets));else for(const target of targets)await rm(target.directory,{recursive:true,force:true});
}
