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
  customCss:['./src/styles/tokens.css','./src/styles/docs.css'],
  components:{Header:'./src/components/StarlightHeader.astro',MobileMenuFooter:'./src/components/StarlightMobileMenuFooter.astro'},
  sidebar:[
   {label:'Overview',link:'/docs/'},
   {label:'Try the live Canvas',link:'/'},
   {label:'Experimental import lab',link:'/labs/import/'},
   {label:'Current editor',items:['getting-started','glossary','api','inspector','text-formatting','compatibility','changelog'].map(slug=>({slug:'docs/'+slug}))},
   {label:'Integration recipes',items:[{autogenerate:{directory:'docs/examples'}}]},
   {label:'Product direction',items:[{autogenerate:{directory:'docs/product'}}],collapsed:true},
   {label:'Proposed features',items:[{autogenerate:{directory:'docs/prd'}}],collapsed:true},
   {label:'Architecture',items:[{autogenerate:{directory:'docs/architecture'}}],collapsed:true},
   {label:'Design',items:[{autogenerate:{directory:'docs/design'}}],collapsed:true},
   {label:'Engineering',items:[{autogenerate:{directory:'docs/engineering'}}],collapsed:true},
   {label:'Research',items:[{autogenerate:{directory:'docs/research'}}],collapsed:true},
   {label:'Documentation index',slug:'docs/documentation-index'},
   {label:'History and provenance',items:['extraction','canvas-owner-adapters','canvas-package-boundary','canvas-extraction-rehearsal','roadmap-and-references','release-checklist','public'].map(slug=>({slug:'docs/'+slug})),collapsed:true},
  ],
 })],
});
