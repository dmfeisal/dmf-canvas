// Embed configuration is host-owned, immutable, and never saved in board files.
export const canvasToolNames=Object.freeze(['text','sticky','image','pencil','shapes','clipboard','group','arrange','layers','lock','delete','duplicate','files','history','paperColor']);
// Snapping (docs/prd/EDITING-PRECISION.md): Align to other objects is on and the 24px grid is off by default.
const snapKeys=['align','grid'];
// Camera (docs/prd/NAVIGATION.md): off by default. When a host enables it, explicit zoom stays within these limits,
// which always include 100%. The world element itself is held by the canvas, never reported here.
const cameraKeys=['minScale','maxScale'],cameraDefaults=Object.freeze({minScale:.2,maxScale:4});
const defaults=Object.freeze({readOnly:false,tools:Object.freeze(Object.fromEntries(canvasToolNames.map(name=>[name,true]))),snapping:Object.freeze({align:true,grid:false}),labels:true,camera:false});
function resolveCamera(patch,previous){
  if(patch===undefined)return previous;
  if(patch===false)return false;
  if(!patch||Object.getPrototypeOf(patch)!==Object.prototype||Object.keys(patch).some(key=>!cameraKeys.includes(key)))throw new TypeError('Invalid canvas camera.');
  const next={...(previous||cameraDefaults),...patch};
  if(!Number.isFinite(next.minScale)||!Number.isFinite(next.maxScale)||next.minScale<.05||next.minScale>1||next.maxScale<1||next.maxScale>8)throw new TypeError('Camera limits must keep 100% between 0.05 and 8.');
  return Object.freeze(next);
}
export function resolveSettings(patch={},previous=defaults) {
  if(!patch||Object.getPrototypeOf(patch)!==Object.prototype||Object.keys(patch).some(key=>!['readOnly','tools','snapping','labels','camera'].includes(key)))throw new TypeError('Invalid canvas settings.');
  if(patch.readOnly!==undefined&&typeof patch.readOnly!=='boolean')throw new TypeError('Read-only must be boolean.');
  if(patch.tools!==undefined&&(!patch.tools||Object.getPrototypeOf(patch.tools)!==Object.prototype||Object.entries(patch.tools).some(([key,value])=>!canvasToolNames.includes(key)||typeof value!=='boolean')))throw new TypeError('Invalid canvas tools.');
  if(patch.snapping!==undefined&&(!patch.snapping||Object.getPrototypeOf(patch.snapping)!==Object.prototype||Object.entries(patch.snapping).some(([key,value])=>!snapKeys.includes(key)||typeof value!=='boolean')))throw new TypeError('Invalid canvas snapping.');
  if(patch.labels!==undefined&&typeof patch.labels!=='boolean')throw new TypeError('Selection labels must be boolean.');
  return Object.freeze({camera:resolveCamera(patch.camera,previous.camera??defaults.camera),readOnly:patch.readOnly??previous.readOnly,labels:patch.labels??previous.labels??defaults.labels,tools:Object.freeze({...previous.tools,...patch.tools}),snapping:Object.freeze({...(previous.snapping??defaults.snapping),...patch.snapping})});
}
