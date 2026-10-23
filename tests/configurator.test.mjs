import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {normalizeConfig} from '../examples/configurator/canvas-embed.js';
import {generateFiles,formats} from '../examples/configurator/generate.js';
const sources=Object.fromEntries(await Promise.all(['canvas-embed.js','canvas-embed.css','image-controls.js'].map(async name=>[name,await readFile(new URL('../examples/configurator/'+name,import.meta.url),'utf8')])));
test('configuration rejects unsupported policy and unsafe geometry without changing previous values',()=>{
 const config=normalizeConfig({tools:{pencil:false},theme:'dark',height:400,width:640});
 for(const value of [null,[],{unknown:true},{tools:{bad:true}},{readOnly:'yes'},{theme:'</script>'},{width:0},{width:640.5},{height:NaN},{height:801},{height:199},{width:1601}])assert.throws(()=>normalizeConfig(value));
 assert.equal(config.tools.pencil,false);assert.equal(config.height,400);assert(Object.isFrozen(config)&&Object.isFrozen(config.tools));
 const other=normalizeConfig();assert.equal(other.tools.pencil,true);assert.equal(other.theme,'system');
});
test('each format returns a complete deterministic file set using the actual shared host',()=>{
 const config=normalizeConfig({readOnly:true,theme:'light',width:900,height:440,tools:{pencil:false,clipboard:false}});
 const entries={html:'index.html',astro:'CanvasEmbed.astro',react:'CanvasEmbed.jsx',vue:'CanvasEmbed.vue'};
 for(const format of formats){
  const first=generateFiles(config,format,sources);assert.deepEqual(first,generateFiles(config,format,sources));assert.equal(Object.keys(first).length,4);
  for(const name of Object.keys(sources))assert.equal(first[name],sources[name]);
  const entry=first[entries[format]];assert(entry.includes('"readOnly": true')&&entry.includes('"width": 900')&&entry.includes('"pencil": false'));
  assert(!entry.includes('localStorage')&&!entry.includes('sessionStorage'));
 }
 assert.throws(()=>generateFiles(config,'unknown',sources));assert.throws(()=>generateFiles(config,'html',{}));
});
test('generated lifecycle wrappers expose cleanup and HTML maps every host import',()=>{
 const config=normalizeConfig(),html=generateFiles(config,'html',sources)['index.html'];
 const map=JSON.parse(html.match(/<script type="importmap">(.*?)<\/script>/)[1]).imports;
 for(const name of ['dmf-canvas','dmf-canvas/owners','dmf-canvas/pencil','dmf-canvas/clipboard','dmf-canvas/theme','dmf-canvas/toolbar','dmf-canvas/images'])assert(map[name]);
 assert(generateFiles(config,'react',sources)['CanvasEmbed.jsx'].includes('return ()=>embed.dispose()'));
 assert(generateFiles(config,'vue',sources)['CanvasEmbed.vue'].includes('onBeforeUnmount'));
 assert(generateFiles(config,'astro',sources)['CanvasEmbed.astro'].includes('disconnectedCallback'));
});
