import {inks} from './canvas-instance-stroke.js';
export const textFonts=Object.freeze({sans:'system-ui, sans-serif',serif:'Georgia, serif',mono:'ui-monospace, monospace'});
export const textWeights=Object.freeze([400,500,600,700]);
// Schema 5 (docs/prd/STYLING-EXPORT.md): ink is a semantic key from the Pencil inks, line height a multiplier or
// 'normal', letter spacing an em value. Records that keep the defaults are written exactly as before schema 5.
export const textInks=Object.freeze(Object.keys(inks));
export const lineHeights=Object.freeze({min:.8,max:3});
export const letterSpacings=Object.freeze({min:-.08,max:.3});
export const defaultTextStyle=Object.freeze({font:'original',size:null,weight:null,align:'original',wrap:'original',ink:'primary',lineHeight:'normal',letterSpacing:0});
const schema4Keys=['font','size','weight','align','wrap'];
// Older records (schema 2 to 4) carry only the first five keys; the new keys take their defaults. Unknown keys are refused.
export function validateTextStyle(value){
 if(!value||Object.getPrototypeOf(value)!==Object.prototype||Object.keys(value).some(key=>!Object.hasOwn(defaultTextStyle,key))||schema4Keys.some(key=>!Object.hasOwn(value,key))||!['original',...Object.keys(textFonts)].includes(value.font)||value.size!==null&&(!Number.isFinite(value.size)||value.size<8||value.size>320)||value.weight!==null&&!textWeights.includes(value.weight)||!['original','left','center','right'].includes(value.align)||!['original','auto','fixed'].includes(value.wrap))throw new TypeError('Invalid text formatting.');
 const ink=value.ink??'primary',lineHeight=value.lineHeight??'normal',letterSpacing=value.letterSpacing??0;
 if(!textInks.includes(ink)||lineHeight!=='normal'&&!(Number.isFinite(lineHeight)&&lineHeight>=lineHeights.min&&lineHeight<=lineHeights.max)||!(Number.isFinite(letterSpacing)&&letterSpacing>=letterSpacings.min&&letterSpacing<=letterSpacings.max))throw new TypeError('Invalid text formatting.');
 return Object.freeze({...defaultTextStyle,...value,ink,lineHeight,letterSpacing});
}
export function resolveTextStyle(current,field,value){
 if(field==='reset')return defaultTextStyle;
 if(!Object.hasOwn(defaultTextStyle,field)||value===undefined||value===null)throw new TypeError('Choose a supported text property.');
 return validateTextStyle({...current,[field]:value});
}
// Only the schema 5 keys make a record need schema 5 (see hasSchema5Style).
export const hasSchema5Style=value=>value.ink!==defaultTextStyle.ink||value.lineHeight!==defaultTextStyle.lineHeight||value.letterSpacing!==defaultTextStyle.letterSpacing;
export const hasTextStyle=value=>Object.keys(defaultTextStyle).some(key=>value[key]!==defaultTextStyle[key]);
