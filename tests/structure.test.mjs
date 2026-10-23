import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const imports=text=>[...text.matchAll(/(?:\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)['"]([^'"]+)['"]/g)].map(m=>m[1]);
test('all package entrypoints import without browser globals or optional initialization',async()=>{
 assert.equal(typeof globalThis.document,'undefined');
 const pkg=JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));assert.equal(pkg.private,true);assert(!pkg.dependencies);
 for(const [name,entry] of Object.entries(pkg.exports)){
  if(typeof entry==='string'){await access(resolve(root,entry));continue;}
  const module=await import(name==='.'?'dmf-canvas':'dmf-canvas'+name.slice(1));assert(Object.keys(module).length);await access(resolve(root,entry.types));
 }
 assert.equal(typeof globalThis.document,'undefined');
});
test('runtime graph is normalized and core excludes optional UI theme and Pencil controllers',async()=>{
 const seen=new Set();async function walk(file){if(seen.has(file))return;seen.add(file);const text=await readFile(resolve(root,file),'utf8');assert(!/window\.DMFCanvasTools|window\.gsap|\.netlify\/functions|\/fonts\//.test(text),file);for(const specifier of imports(text)){assert(specifier.startsWith('.'),specifier);assert(!specifier.includes('?'),specifier);const child=fileURLToPath(new URL(specifier,new URL(file,'file://'+root)));await walk(child.slice(root.length));}}
 await walk('index.js');assert(![...seen].some(name=>/theme|toolbar|pencil|example|controls/.test(name)),[...seen].join(','));
 for(const file of await readdir(resolve(root,'js')))if(file.endsWith('.js'))await walk('js/'+file);
 await access(resolve(root,'assets/cursors/pencil.svg'));await access(resolve(root,'LICENSES/lucide.txt'));
});
test('custom host uses package entrypoints without implicit persistent storage',async()=>{
 const text=await readFile(resolve(root,'consumer.js'),'utf8');assert(!/localStorage|sessionStorage|fetch\(/.test(text));assert(imports(text).every(specifier=>specifier.startsWith('dmf-canvas')));
 const owners=await readFile(resolve(root,'js/canvas-instance-document.js'),'utf8');assert(!owners.includes('canvas-instance-pencil.js'));
});
