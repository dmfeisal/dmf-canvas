// Explicitly shared by an embed host. Plain data only; never the OS clipboard.
export function validateTransfer(input) {
  const text=JSON.stringify(input);
  if(!text||new TextEncoder().encode(text).byteLength>131072)throw new RangeError('Object clipboard exceeds 128 KiB.');
  const value=JSON.parse(text);
  if(value?.format!=='dmf-canvas-clipboard'||value.version!==1||!Array.isArray(value.objects)||!value.objects.length||value.objects.length>50)throw new TypeError('Invalid object clipboard.');
  return {format:value.format,version:1,objects:value.objects.map(({data,bounds:b})=>{
    if(!data||!b||!['left','top','width','height'].every(key=>typeof b[key]==='number'&&Number.isFinite(b[key])&&Math.abs(b[key])<=100000)||b.width<=0||b.height<=0)throw new TypeError('Invalid clipboard geometry.');
    return {data,bounds:{left:b.left,top:b.top,width:b.width,height:b.height}};
  })};
}
export function createObjectClipboard() {
  let value=null;const listeners=new Set();
  const emit=()=>{for(const listener of [...listeners])try{listener();}catch(error){globalThis.reportError?.(error);}};
  return Object.freeze({
    get count(){return value?.objects.length??0;},
    read(){return value?validateTransfer(value):null;},
    write(input){value=validateTransfer(input);emit();},
    clear(){value=null;emit();},
    subscribe(listener){
      if(typeof listener!=='function'||listeners.size>=50)throw new Error('Object clipboard subscription unavailable.');
      listeners.add(listener);return ()=>{listeners.delete(listener);if(!listeners.size)value=null;};
    },
  });
}
