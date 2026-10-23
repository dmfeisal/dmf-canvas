// Embed configuration is host-owned, immutable, and never saved in board files.
export const canvasToolNames=Object.freeze(['text','sticky','image','pencil','clipboard','group','arrange','layers','lock','delete','duplicate','files','history','paperColor']);
const defaults=Object.freeze({readOnly:false,tools:Object.freeze(Object.fromEntries(canvasToolNames.map(name=>[name,true])))});
export function resolveSettings(patch={},previous=defaults) {
  if(!patch||Object.getPrototypeOf(patch)!==Object.prototype||Object.keys(patch).some(key=>!['readOnly','tools'].includes(key)))throw new TypeError('Invalid canvas settings.');
  if(patch.readOnly!==undefined&&typeof patch.readOnly!=='boolean')throw new TypeError('Read-only must be boolean.');
  if(patch.tools!==undefined&&(!patch.tools||Object.getPrototypeOf(patch.tools)!==Object.prototype||Object.entries(patch.tools).some(([key,value])=>!canvasToolNames.includes(key)||typeof value!=='boolean')))throw new TypeError('Invalid canvas tools.');
  return Object.freeze({readOnly:patch.readOnly??previous.readOnly,tools:Object.freeze({...previous.tools,...patch.tools})});
}
