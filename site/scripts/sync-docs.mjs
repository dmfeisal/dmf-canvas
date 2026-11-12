import {readdir, readFile, writeFile, mkdir, rm} from 'node:fs/promises';
import {resolve, relative, dirname, basename, extname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const repo=fileURLToPath(new URL('../../',import.meta.url));
const content=resolve(repo,'site/src/content/docs');
const github='https://github.com/dmfeisal/dmf-canvas/blob/main/';
async function walk(dir){const found=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,entry.name);if(entry.isDirectory())found.push(...await walk(path));else if(entry.name.endsWith('.md'))found.push(path);}return found.sort();}
const files=[resolve(repo,'README.md'),resolve(repo,'CHANGELOG.md'),...await walk(resolve(repo,'docs')),...['astro','react','vue','configurator'].map(name=>resolve(repo,'examples',name,'README.md'))];
// Documentation is served under /docs/; the site root is the editor playground.
function page(path){if(path==='README.md')return 'getting-started';if(path==='CHANGELOG.md')return 'changelog';if(path==='docs/README.md')return 'documentation-index';if(path.startsWith('examples/'))return path.replace('/README.md','').toLowerCase();return path.replace(/^docs\//,'').replace(/\.md$/,'').replace(/\/README$/,'').toLowerCase();}
function route(file){return 'docs/'+page(relative(repo,file).split(sep).join('/'));}
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
 if(route(file).startsWith('docs/research/'))notice='> **Research, not verified product claims.** This material includes supplied synthesis and unvalidated hypotheses. Prices, financials and capabilities require source verification before external decisions. [Research provenance](/docs/research/provenance/).\n\n';
 else if(status==='proposed'||relative(repo,file).startsWith('docs/prd/'))notice='> **Proposed direction.** This page describes planned requirements or decisions. It is not a claim that these capabilities are available. [Current feature inventory](/docs/product/feature-inventory/).\n\n';
 else if(status==='draft')notice='> **Working documentation.** Status and test results apply to the dated assessment on this page. [Latest change review](/docs/engineering/preexisting-change-review/).\n\n';
 const slug=route(file),output=resolve(content,slug+'.md');await mkdir(dirname(output),{recursive:true});
 const url=github+relative(repo,file).split(sep).join('/');
 await writeFile(output,`---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(title+' — DMF Canvas documentation')}\neditUrl: ${JSON.stringify(url)}\n---\n\n${notice}${body.trim()}\n`);
 manifest.push({source:relative(repo,file).split(sep).join('/'),slug,title});
}
await writeFile(resolve(content,'docs/index.md'),`---
title: DMF Canvas documentation
description: Build with the private Canvas editor and follow the interactive publishing roadmap.
---

Make your ideas interactive on the web.

DMF Canvas is a framework-free, embeddable editor for Text, Sticky Notes, Drawings and raster Images. It runs locally in your site, with explicit object owners, editing history and host-owned files.

**Current state: private 0.3.0-alpha.1 development preview.** The package is not published to a public registry. Excalidraw Text/freehand import is experimental; broader import fidelity, an independent visitor viewer and interactive storytelling are proposed milestones.

## Build with Canvas

[Try the live Canvas](/) to edit Text, add notes, draw, and save a local board in your browser.

Start with the [integration guide](/docs/getting-started/), then use the [API contract](/docs/api/) and your host's recipe: [Astro](/docs/examples/astro/), [React](/docs/examples/react/), [Vue](/docs/examples/vue/) or the [embed configurator](/docs/examples/configurator/).

The [Selection inspector](/docs/inspector/) and [Text formatting guide](/docs/text-formatting/) explain the current authoring controls. The [compatibility baseline](/docs/compatibility/) records known limits.

## Follow development

The [feature inventory](/docs/product/feature-inventory/) separates implemented work from planned capabilities. Read the [product vision](/docs/product/product-vision/), [roadmap](/docs/product/product-roadmap/) and [architecture](/docs/architecture/architecture/) for the proposed import → edit → interact → publish workflow.

## Explore the research

The [25-product benchmark](/docs/research/competitor-benchmark/) is a supplied research synthesis, with unverified pricing and market claims clearly identified. Start with its [provenance and verification notes](/docs/research/provenance/).

## Source and evidence

Documentation is generated from the repository's Markdown sources. [Browse the full index](/docs/documentation-index/), [review the latest validation](/docs/engineering/preexisting-change-review/) or [view the changelog](/docs/changelog/).
`);
const redirects=['# Generated by scripts/sync-docs.mjs. Documentation moved under /docs/ on 12 November 2026.','/playground/ / 301',...manifest.map(({slug})=>`/${slug.slice(5)}/ /${slug}/ 301`)];
await writeFile(resolve(repo,'site/public/_redirects'),redirects.join('\n')+'\n');
await mkdir(resolve(repo,'site/.generated'),{recursive:true});
await writeFile(resolve(repo,'site/.generated/docs.json'),JSON.stringify(manifest,null,2));
console.log(`Prepared ${manifest.length+1} documentation pages from canonical Markdown.`);
