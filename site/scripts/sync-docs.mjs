import {readdir, readFile, writeFile, mkdir, rm} from 'node:fs/promises';
import {resolve, relative, dirname, basename, extname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const repo=fileURLToPath(new URL('../../',import.meta.url));
const content=resolve(repo,'site/src/content/docs');
const github='https://github.com/dmfeisal/dmf-canvas/blob/main/';
async function walk(dir){const found=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,entry.name);if(entry.isDirectory())found.push(...await walk(path));else if(entry.name.endsWith('.md'))found.push(path);}return found.sort();}
const files=[resolve(repo,'README.md'),resolve(repo,'CHANGELOG.md'),...await walk(resolve(repo,'docs')),...['astro','react','vue','configurator'].map(name=>resolve(repo,'examples',name,'README.md'))];
function route(file){const path=relative(repo,file).split(sep).join('/');if(path==='README.md')return 'getting-started';if(path==='CHANGELOG.md')return 'changelog';if(path==='docs/README.md')return 'documentation-index';if(path.startsWith('examples/'))return path.replace('/README.md','').toLowerCase();return path.replace(/^docs\//,'').replace(/\.md$/,'').replace(/\/README$/,'').toLowerCase();}
const routes=new Map(files.map(file=>[file,route(file)]));
await rm(content,{recursive:true,force:true});await mkdir(content,{recursive:true});
const manifest=[];
for(const file of files){
 const source=await readFile(file,'utf8'),match=source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
 let body=match?source.slice(match[0].length):source;
 const metadata=match?.[1]??'';
 const rawTitle=metadata.match(/^title:\s*(.+)$/m)?.[1];
 const title=rawTitle?.replace(/^(["'])(.*)\1$/,'$2')??body.match(/^# (.+)$/m)?.[1]??basename(file,extname(file));
 const status=metadata.match(/^status:\s*(.+)$/m)?.[1]??null;
 body=body.replace(/^\s*# [^\n]+\n/,'');
 body=body.split(/(```[\s\S]*?```)/g).map((chunk,index)=>index%2?chunk:chunk.replace(/\]\(([^\s)]+)\)/g,(whole,target)=>{
  if(/^(?:[a-z]+:|#|\/)/i.test(target))return whole;
  const [path,hash]=target.split('#');const linked=resolve(dirname(file),decodeURIComponent(path));
  if(routes.has(linked))return `](/${routes.get(linked)}/${hash?'#'+hash:''})`;
  const relativePath=relative(repo,linked).split(sep).join('/');
  if(relativePath.startsWith('../'))throw new Error(`Link escapes repository: ${file}: ${target}`);
  if(['CANVAS-ROADMAP.md','CANVAS-PRD.md'].includes(basename(linked)))return `](https://github.com/dmfeisal/dmf-web/blob/main/docs/${basename(linked)}${hash?'#'+hash:''})`;
  return `](${github}${relativePath}${hash?'#'+hash:''})`;
 })).join('');
 let notice='';
 if(route(file).startsWith('research/'))notice='> **Research, not verified product claims.** This material includes supplied synthesis and unvalidated hypotheses. Prices, financials and capabilities require source verification before external decisions. [Research provenance](/research/provenance/).\n\n';
 else if(status==='proposed'||relative(repo,file).startsWith('docs/prd/'))notice='> **Proposed direction.** This page describes planned requirements or decisions. It is not a claim that these capabilities are available. [Current feature inventory](/product/feature-inventory/).\n\n';
 else if(status==='draft')notice='> **Working documentation.** Status and test results apply to the dated assessment on this page. [Latest change review](/engineering/preexisting-change-review/).\n\n';
 const slug=route(file),output=resolve(content,slug+'.md');await mkdir(dirname(output),{recursive:true});
 const url=github+relative(repo,file).split(sep).join('/');
 await writeFile(output,`---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(title+' — DMF Canvas documentation')}\neditUrl: ${JSON.stringify(url)}\n---\n\n${notice}${body.trim()}\n`);
 manifest.push({source:relative(repo,file).split(sep).join('/'),slug,title});
}
await writeFile(resolve(content,'index.md'),`---
title: DMF Canvas documentation
description: Build with the private Canvas editor and follow the interactive publishing roadmap.
---

Make your ideas interactive on the web.

DMF Canvas is a framework-free, embeddable editor for Text, Sticky Notes, Drawings and raster Images. It runs locally in your site, with explicit object owners, editing history and host-owned files.

**Current state: private 0.2.0 development preview.** The package is not published to a public registry. Excalidraw import, an independent visitor viewer and interactive storytelling are proposed milestones.

## Build with Canvas

[Try the live Canvas](/playground/) to edit Text, add notes, draw, and save a local board in your browser.

Start with the [integration guide](/getting-started/), then use the [API contract](/api/) and your host's recipe: [Astro](/examples/astro/), [React](/examples/react/), [Vue](/examples/vue/) or the [embed configurator](/examples/configurator/).

The [Selection inspector](/inspector/) and [Text formatting guide](/text-formatting/) explain the current authoring controls. The [compatibility baseline](/compatibility/) records known limits.

## Follow development

The [feature inventory](/product/feature-inventory/) separates implemented work from planned capabilities. Read the [product vision](/product/product-vision/), [roadmap](/product/product-roadmap/) and [architecture](/architecture/architecture/) for the proposed import → edit → interact → publish workflow.

## Explore the research

The [25-product benchmark](/research/competitor-benchmark/) is a supplied research synthesis, with unverified pricing and market claims clearly identified. Start with its [provenance and verification notes](/research/provenance/).

## Source and evidence

Documentation is generated from the repository's Markdown sources. [Browse the full index](/documentation-index/), [review the latest validation](/engineering/preexisting-change-review/) or [view the changelog](/changelog/).
`);
await mkdir(resolve(repo,'site/.generated'),{recursive:true});
await writeFile(resolve(repo,'site/.generated/docs.json'),JSON.stringify(manifest,null,2));
console.log(`Prepared ${manifest.length+1} documentation pages from canonical Markdown.`);
