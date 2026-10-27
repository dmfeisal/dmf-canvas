import {defineConfig} from 'astro/config';
import starlight from '@astrojs/starlight';
import {fileURLToPath} from 'node:url';
import {readFileSync} from 'node:fs';
const library=new URL('../',import.meta.url);
const exports=JSON.parse(readFileSync(new URL('package.json',library),'utf8')).exports;
const aliases=Object.entries(exports).map(([key,value])=>({find:key==='.'?'dmf-canvas':'dmf-canvas'+key.slice(1),replacement:fileURLToPath(new URL(typeof value==='string'?value:value.import,library))})).sort((a,b)=>b.find.length-a.find.length);

export default defineConfig({
 site:'https://canvas.feisal.id',
 trailingSlash:'always',
 vite:{resolve:{alias:aliases}},
 integrations:[starlight({
  title:'DMF Canvas',
  description:'Documentation for the embeddable Canvas editor and its interactive publishing roadmap.',
  favicon:'/favicon.svg',
  social:[{icon:'github',label:'GitHub',href:'https://github.com/dmfeisal/dmf-canvas'}],
  customCss:['./src/styles/docs.css'],
  sidebar:[
   {label:'Overview',link:'/'},
   {label:'Try the live Canvas',link:'/playground/'},
   {label:'Current editor',items:[{slug:'getting-started'},{slug:'api'},{slug:'inspector'},{slug:'text-formatting'},{slug:'compatibility'},{slug:'changelog'}]},
   {label:'Integration recipes',items:[{autogenerate:{directory:'examples'}}]},
   {label:'Product direction',items:[{autogenerate:{directory:'product'}}],collapsed:true},
   {label:'Proposed features',items:[{autogenerate:{directory:'prd'}}],collapsed:true},
   {label:'Architecture',items:[{autogenerate:{directory:'architecture'}}],collapsed:true},
   {label:'Design',items:[{autogenerate:{directory:'design'}}],collapsed:true},
   {label:'Engineering',items:[{autogenerate:{directory:'engineering'}}],collapsed:true},
   {label:'Research',items:[{autogenerate:{directory:'research'}}],collapsed:true},
   {label:'Documentation index',slug:'documentation-index'},
   {label:'History and provenance',items:[{slug:'extraction'},{slug:'canvas-owner-adapters'},{slug:'canvas-package-boundary'},{slug:'canvas-extraction-rehearsal'},{slug:'roadmap-and-references'},{slug:'release-checklist'},{slug:'public'}],collapsed:true},
  ],
 })],
});
