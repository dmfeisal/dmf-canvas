import {canvasToolNames} from 'dmf-canvas';
import {mountEmbed,normalizeConfig} from './canvas-embed.js';
import {generateFiles} from './generate.js';
const form=document.getElementById('settings'),error=document.getElementById('settings-error'),format=document.getElementById('format'),file=document.getElementById('file'),code=document.getElementById('code'),status=document.getElementById('code-status');
const labels={text:'Text editing',sticky:'Sticky notes',image:'Images',pencil:'Pencil',clipboard:'Copy / paste',group:'Grouping',arrange:'Arrangement',layers:'Layer order',lock:'Locking',delete:'Delete',duplicate:'Duplicate',files:'Board files',history:'Undo / redo',paperColor:'Note colors'};
for(const tool of canvasToolNames){const label=document.createElement('label');label.className='check';const input=document.createElement('input');input.type='checkbox';input.dataset.tool=tool;label.append(input,document.createTextNode(labels[tool]));document.getElementById('tools').append(label);}
const initial={A:normalizeConfig(),B:normalizeConfig({readOnly:true,theme:'dark',height:240})},previews={A:mountEmbed(document.querySelector('[data-preview-host=A]'),initial.A),B:mountEmbed(document.querySelector('[data-preview-host=B]'),initial.B)};
let active='A',sources=null,files={},url=null,timer=null,alive=true,copyGeneration=0;
const release=()=>{clearTimeout(timer);timer=null;if(url)URL.revokeObjectURL(url);url=null;};
function renderCode(){
 copyGeneration++;release();document.getElementById('code-title').textContent='Use preview '+active+' on your website';
 if(!sources)return;
 files=generateFiles(previews[active].getConfig(),format.value,sources);const previous=file.value;file.replaceChildren(...Object.keys(files).map(name=>new Option(name,name)));const entry={html:'index.html',astro:'CanvasEmbed.astro',react:'CanvasEmbed.jsx',vue:'CanvasEmbed.vue'}[format.value];file.value=Object.hasOwn(files,previous)?previous:entry;code.value=files[file.value];document.getElementById('copy').disabled=false;document.getElementById('download').disabled=false;
 document.getElementById('setup').textContent=format.value==='html'?'Serve this folder over HTTP with node_modules available at ./node_modules/. Opening index.html directly will not load ES modules.':'Place these files together in your '+({astro:'Astro',react:'React',vue:'Vue'}[format.value])+' app, import CanvasEmbed and render it. The host handles mount, unmount and page lifecycle cleanup.';
 status.textContent='Code for preview '+active+'. Copy each file to use this example.';
}
function renderSettings(){
 const c=previews[active].getConfig();form.elements.readOnly.checked=c.readOnly;form.elements.theme.value=c.theme;form.elements.width.value=c.width;form.elements.height.value=c.height;for(const input of form.querySelectorAll('[data-tool]'))input.checked=c.tools[input.dataset.tool];error.textContent='';for(const field of [form.elements.width,form.elements.height])field.removeAttribute('aria-invalid');
 document.getElementById('settings-title').textContent='Preview '+active+' settings';for(const button of document.querySelectorAll('[data-preview-select]'))button.setAttribute('aria-pressed',String(button.dataset.previewSelect===active));
 for(const [name,preview]of Object.entries(previews)){const c=preview.getConfig();document.querySelector('[data-preview-summary='+name+']').textContent=(c.readOnly?'Read-only':'Editable')+' · '+c.width+' × '+c.height+' px maximum';}
 renderCode();
}
form.addEventListener('submit',event=>event.preventDefault());
form.addEventListener('change',event=>{
 const previous=previews[active].getConfig(),field=event.target;let patch;
 if(field.dataset.tool)patch={tools:{...previous.tools,[field.dataset.tool]:field.checked}};
 else if(field.name==='readOnly')patch={readOnly:field.checked};
 else if(field.name==='theme')patch={theme:field.value};
 else if(['width','height'].includes(field.name))patch={[field.name]:Number(field.value)};
 else return;
 try{previews[active].update(normalizeConfig({...previous,...patch}));renderSettings();}
 catch(cause){error.textContent=cause.message;for(const input of [form.elements.width,form.elements.height])input.setAttribute('aria-invalid',String(!input.validity.valid));}
});
for(const button of document.querySelectorAll('[data-preview-select]'))button.addEventListener('click',()=>{active=button.dataset.previewSelect;renderSettings();});
document.getElementById('reset').addEventListener('click',()=>{previews[active].update(initial[active]);renderSettings();});
format.addEventListener('change',()=>{file.value='';renderCode();});
file.addEventListener('change',()=>{copyGeneration++;release();code.value=files[file.value]??'';status.textContent='Code for preview '+active+'.';});
document.getElementById('copy').addEventListener('click',async()=>{const id=++copyGeneration,text=code.value,name=file.value;try{await navigator.clipboard.writeText(text);if(alive&&id===copyGeneration)status.textContent='Copied '+name+'.';}catch{if(!alive||id!==copyGeneration)return;code.focus();code.select();status.textContent='Copy is unavailable. Copy the selected text instead.';}});
document.getElementById('download').addEventListener('click',()=>{release();url=URL.createObjectURL(new Blob([code.value],{type:file.value.endsWith('.css')?'text/css':file.value.endsWith('.html')?'text/html':'text/plain'}));const a=document.createElement('a');a.href=url;a.download=file.value;a.click();timer=setTimeout(release,1000);status.textContent='Downloaded '+file.value+'.';});
renderSettings();
try{const names=['canvas-embed.js','canvas-embed.css','image-controls.js'];sources=Object.fromEntries(await Promise.all(names.map(async name=>{const response=await fetch('./'+name);if(!response.ok)throw new Error('Source unavailable');return [name,await response.text()];})));if(alive)renderCode();}catch{status.textContent='Example files could not be loaded. Reload to try again.';}
window.addEventListener('pagehide',()=>{copyGeneration++;release();});
// Bounded fixture access for integration checks; no core globals or storage.
Object.defineProperty(document.querySelector('main'),'configurator',{value:Object.freeze({previews,get active(){return active;},get files(){return {...files};},dispose(){if(!alive)return;alive=false;copyGeneration++;release();for(const preview of Object.values(previews))preview.dispose();}})});
