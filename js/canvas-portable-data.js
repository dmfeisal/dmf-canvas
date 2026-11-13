const limit=1048576;
export function validatePortable(input,validate){
 if(typeof validate!=='function')throw new TypeError('A document record validator is required.');
 const raw=JSON.stringify(input);if(!raw||new TextEncoder().encode(raw).byteLength>limit)throw new RangeError('Portable document exceeds 1 MiB.');
 const value=JSON.parse(raw);
 if(value?.format!=='dmf-canvas-portable'||![1,2,3].includes(value.version)||!Array.isArray(value.nodes)||value.nodes.length>50)throw new TypeError('Unsupported portable document.');
 const ids=new Set(),groups=new Map();
 const nodes=value.nodes.map(node=>{
  if(typeof node?.id!=='string'||! /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(node.id)||ids.has(node.id))throw new TypeError('Portable node IDs must be unique bounded identifiers.');
  ids.add(node.id);const data=validate(node.data);if(data.group!==undefined)groups.set(data.group,(groups.get(data.group)??0)+1);
  let source;
  if(node.source!==undefined){if(node.source?.format!=='excalidraw'||typeof node.source.id!=='string'||! /^[A-Za-z0-9_-]{1,100}$/.test(node.source.id))throw new TypeError('Invalid node provenance.');source={format:'excalidraw',id:node.source.id};}
  return {id:node.id,data,...(source?{source}:{})};
 });
 if([...groups.values()].some(count=>count<2))throw new TypeError('Portable groups need at least two members.');
 const layers=nodes.map(node=>node.data.layer);if(layers.some(layer=>layer!==undefined)&&(layers.some(layer=>layer===undefined)||new Set(layers).size!==layers.length||layers.some(layer=>layer>=nodes.length)))throw new TypeError('Invalid portable layer order.');
 // Portable version 2 adds Highlighter strokes and version 3 adds shapes; older readers reject them instead of losing data.
 if(value.version===1&&nodes.some(node=>node.data.tool==='highlighter'))throw new TypeError('Portable version 1 cannot carry Highlighter strokes.');
 if(value.version<3&&nodes.some(node=>node.data.type==='shape'))throw new TypeError('Portable versions 1 and 2 cannot carry shapes.');
 return {format:'dmf-canvas-portable',version:nodes.some(node=>node.data.type==='shape')?3:nodes.some(node=>node.data.tool==='highlighter')?2:1,nodes};
}
