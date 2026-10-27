export const textFonts=Object.freeze({sans:'system-ui, sans-serif',serif:'Georgia, serif',mono:'ui-monospace, monospace'});
export const textWeights=Object.freeze([400,500,600,700]);
export const defaultTextStyle=Object.freeze({font:'original',size:null,weight:null,align:'original',wrap:'original'});
export function validateTextStyle(value){
 if(!value||Object.getPrototypeOf(value)!==Object.prototype||Object.keys(value).some(key=>!Object.hasOwn(defaultTextStyle,key))||Object.keys(defaultTextStyle).some(key=>!Object.hasOwn(value,key))||!['original',...Object.keys(textFonts)].includes(value.font)||value.size!==null&&(!Number.isFinite(value.size)||value.size<8||value.size>320)||value.weight!==null&&!textWeights.includes(value.weight)||!['original','left','center','right'].includes(value.align)||!['original','auto','fixed'].includes(value.wrap))throw new TypeError('Invalid text formatting.');
 return Object.freeze({...value});
}
export function resolveTextStyle(current,field,value){
 if(field==='reset')return defaultTextStyle;
 if(!Object.hasOwn(defaultTextStyle,field)||value===undefined||value===null)throw new TypeError('Choose a supported text property.');
 return validateTextStyle({...current,[field]:value});
}
export const hasTextStyle=value=>Object.keys(defaultTextStyle).some(key=>value[key]!==defaultTextStyle[key]);
