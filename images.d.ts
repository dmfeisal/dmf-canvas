import type {ImageData} from './owners.js';
export function validateImage(value:unknown):ImageData;
export function imageDimensions(bytes:Uint8Array,mime:string,complete?:boolean):{width:number;height:number};
export function encodeImage(image:HTMLImageElement,document:Document,options?:{active?:()=>boolean;onProgress?:(dimensions:{width:number;height:number})=>void}):Promise<{src:string;width:number;height:number;transparent:boolean}>;
