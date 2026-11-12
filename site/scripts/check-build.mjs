import {readFile,stat} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),dist=join(root,'dist');
const manifest=JSON.parse(await readFile(join(root,'.generated/docs.json'),'utf8'));
const errors=[];
let links=0;
for(const slug of ['','docs','labs/import',...manifest.map(page=>page.slug)]){
 const path=join(dist,slug,'index.html'),html=await readFile(path,'utf8');
 if(!html.includes('<h1'))errors.push(`${slug}: missing heading`);
 for(const match of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)){
  const target=match[1].replaceAll('&amp;','&');
  if(/^(?:[a-z]+:|\/\/)/i.test(target))continue;
  const base=target.split(/[?#]/)[0];if(!base)continue;
  const destination=base.startsWith('/')?resolve(dist,'.'+decodeURIComponent(base)):resolve(dirname(path),decodeURIComponent(base));
  if(!destination.startsWith(dist+'/')&&destination!==dist){errors.push(`${slug}: outside publish directory ${base}`);continue;}
  try{const s=await stat(destination);if(s.isDirectory())await stat(join(destination,'index.html'));links++;}catch{errors.push(`${slug}: missing ${base}`);}
 }
}
await stat(join(dist,'pagefind/pagefind.js'));
// Old root-level documentation URLs and /playground/ redirect permanently; every target must exist.
const redirects=(await readFile(join(dist,'_redirects'),'utf8')).split('\n').filter(line=>line&&!line.startsWith('#')).map(line=>line.split(/\s+/));
const moved=new Set(redirects.map(([from])=>from));
for(const [from,to,status]of redirects){if(status!=='301'||!from.startsWith('/')||!to.startsWith('/'))errors.push(`redirect: malformed ${from} ${to} ${status}`);try{await stat(join(dist,to,'index.html'));}catch{errors.push(`redirect: missing target ${to}`);}try{await stat(join(dist,from,'index.html'));errors.push(`redirect: ${from} still exists and would shadow its redirect`);}catch{}}
for(const {slug}of manifest)if(!moved.has('/'+slug.slice(5)+'/'))errors.push(`redirect: missing old URL for ${slug}`);
if(!moved.has('/playground/'))errors.push('redirect: missing /playground/');
if(errors.length)throw new Error(errors.join('\n'));
console.log(`PASS ${manifest.length+3} pages, ${links} local links/assets, ${redirects.length} redirects and Pagefind search output.`);
