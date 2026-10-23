// Bounded embedded raster data only; no SVG, remote URLs or executable markup.
export const imageDataLimit=32768;
export function imageDimensions(bytes,mime,complete=true){
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let width=0,height=0;
  if(mime==='image/png'){
    if(bytes.length<33||[137,80,78,71,13,10,26,10].some((v,i)=>bytes[i]!==v)||view.getUint32(8)!==13||String.fromCharCode(...bytes.slice(12,16))!=='IHDR')throw new TypeError('Invalid PNG image.');
    width=view.getUint32(16);height=view.getUint32(20);let ended=false;
    for(let p=8,n=0;p+12<=bytes.length&&n<256;n++){
      const length=view.getUint32(p),type=String.fromCharCode(...bytes.slice(p+4,p+8));
      if(type==='acTL')throw new TypeError('Animated images are not supported.');
      if(!complete&&type==='IDAT')break;
      if(p+12+length>bytes.length)break;
      if(type==='IEND'){ended=length===0&&p+12===bytes.length;break;}p+=12+length;
    }
    if(complete&&!ended)throw new TypeError('Invalid PNG image data.');
  }else if(mime==='image/jpeg'){
    if(bytes[0]!==255||bytes[1]!==216||complete&&(bytes.at(-2)!==255||bytes.at(-1)!==217))throw new TypeError('Invalid JPEG image.');
    for(let p=2,n=0;p+4<bytes.length&&n<256;n++){
      if(bytes[p++]!==255)break;while(bytes[p]===255)p++;const marker=bytes[p++],length=bytes[p]*256+bytes[p+1];
      if(marker===218||marker===217||length<2||p+length>bytes.length)break;
      if([192,193,194].includes(marker)&&length>=8){height=bytes[p+3]*256+bytes[p+4];width=bytes[p+5]*256+bytes[p+6];break;}p+=length;
    }
  }else if(mime==='image/webp'&&bytes.length>=30&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP'){
    const type=String.fromCharCode(...bytes.slice(12,16));
    if(type==='VP8X'){if(bytes[20]&2)throw new TypeError('Animated images are not supported.');width=1+bytes[24]+bytes[25]*256+bytes[26]*65536;height=1+bytes[27]+bytes[28]*256+bytes[29]*65536;}
    else if(type==='VP8 '){width=(bytes[26]+bytes[27]*256)&16383;height=(bytes[28]+bytes[29]*256)&16383;}
    else if(type==='VP8L'){const bits=view.getUint32(21,true);width=(bits&16383)+1;height=((bits>>>14)&16383)+1;}
  }
  if(!width||!height)throw new TypeError('Image dimensions could not be read.');return {width,height};
}
export function validateDescription(value){return typeof value==='string'&&value.length<=120&&!/[\u0000-\u001f]/.test(value);}
export function validateImage(input){
  if(!input||typeof input.src!=='string'||input.src.length>imageDataLimit||!/^data:image\/(?:jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/.test(input.src)||!validateDescription(input.alt))throw new TypeError('Invalid embedded image.');
  let bytes;try{bytes=Uint8Array.from(atob(input.src.slice(input.src.indexOf(',')+1)),c=>c.charCodeAt(0));}catch{throw new TypeError('Invalid image encoding.');}
  const mime=input.src.slice(5,input.src.indexOf(';')),{width,height}=imageDimensions(bytes,mime);
  if(width>1024||height>1024||input.width!==width||input.height!==height)throw new TypeError('Invalid image dimensions.');
  return {src:input.src,alt:input.alt,width,height};
}
