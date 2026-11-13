import {validateObject} from './js/canvas-instance-document.js';
import {validatePortable} from './js/canvas-portable-data.js';
export const validatePortableDocument=input=>validatePortable(input,validateObject);
export function migrateLegacyDocument(input){
 const raw=JSON.stringify(input);if(!raw||new TextEncoder().encode(raw).byteLength>1048576)throw new RangeError('Board file exceeds 1 MiB.');
 const value=JSON.parse(raw);
 if(value?.format!=='dmf-canvas'||![1,2,3,4].includes(value.version)||!Array.isArray(value.originals)||!Array.isArray(value.objects)||value.originals.length+value.objects.length>50)throw new TypeError('Unsupported legacy board.');
 const originalIds=new Set();
 const nodes=[...value.originals.map(item=>{if(!Number.isSafeInteger(item?.id)||item.id<1||originalIds.has(item.id))throw new TypeError('Invalid legacy original identity.');originalIds.add(item.id);return {id:'legacy-original:'+item.id,data:item.data};}),...value.objects.map((data,index)=>({id:'legacy-object:'+index,data}))];
 if(value.version===1&&nodes.some(node=>node.data?.state?.typography!==undefined||node.data?.layout?.fontSize>200))throw new TypeError('Schema 1 cannot carry Text formatting.');
 if(value.version<3&&nodes.some(node=>node.data?.tool==='highlighter'))throw new TypeError('Schemas 1 and 2 cannot carry Highlighter strokes.');
 if(value.version<4&&nodes.some(node=>node.data?.type==='shape'))throw new TypeError('Schemas 1 to 3 cannot carry shapes.');
 return validatePortableDocument({format:'dmf-canvas-portable',version:nodes.some(node=>node.data?.type==='shape')?3:nodes.some(node=>node.data?.tool==='highlighter')?2:1,nodes});
}
export {importExcalidraw} from './js/canvas-import-excalidraw.js';
