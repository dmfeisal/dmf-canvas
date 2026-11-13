// Embed configuration is host-owned, immutable, and never saved in board files.
export const canvasToolNames=Object.freeze(['text','sticky','image','pencil','shapes','clipboard','group','arrange','layers','lock','delete','duplicate','files','history','paperColor']);
// Snapping (docs/prd/EDITING-PRECISION.md): Align to other objects is on and the 24px grid is off by default.
const snapKeys=['align','grid'];
const defaults=Object.freeze({readOnly:false,tools:Object.freeze(Object.fromEntries(canvasToolNames.map(name=>[name,true]))),snapping:Object.freeze({align:true,grid:false})});
export function resolveSettings(patch={},previous=defaults) {
  if(!patch||Object.getPrototypeOf(patch)!==Object.prototype||Object.keys(patch).some(key=>!['readOnly','tools','snapping'].includes(key)))throw new TypeError('Invalid canvas settings.');
  if(patch.readOnly!==undefined&&typeof patch.readOnly!=='boolean')throw new TypeError('Read-only must be boolean.');
  if(patch.tools!==undefined&&(!patch.tools||Object.getPrototypeOf(patch.tools)!==Object.prototype||Object.entries(patch.tools).some(([key,value])=>!canvasToolNames.includes(key)||typeof value!=='boolean')))throw new TypeError('Invalid canvas tools.');
  if(patch.snapping!==undefined&&(!patch.snapping||Object.getPrototypeOf(patch.snapping)!==Object.prototype||Object.entries(patch.snapping).some(([key,value])=>!snapKeys.includes(key)||typeof value!=='boolean')))throw new TypeError('Invalid canvas snapping.');
  return Object.freeze({readOnly:patch.readOnly??previous.readOnly,tools:Object.freeze({...previous.tools,...patch.tools}),snapping:Object.freeze({...(previous.snapping??defaults.snapping),...patch.snapping})});
}
