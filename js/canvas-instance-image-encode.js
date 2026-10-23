import { imageDataLimit } from './canvas-instance-image-data.js';
// At most seven dimensions and four quality attempts. Yield between encodes.
export async function encodeImage(image,doc,{active=()=>true,onProgress=()=>{}}={}){
  const raster=doc.createElement('canvas'),context=raster.getContext('2d',{willReadFrequently:true}),seen=new Set();let transparent=false,first=true;
  try{
    for(const size of [512,384,256,192,128,64,32]){
      if(!active())throw new Error('Image import cancelled.');
      const scale=Math.min(1,size/image.naturalWidth,size/image.naturalHeight),width=Math.max(1,Math.round(image.naturalWidth*scale)),height=Math.max(1,Math.round(image.naturalHeight*scale)),key=width+'x'+height;if(seen.has(key))continue;seen.add(key);
      raster.width=width;raster.height=height;context.clearRect(0,0,width,height);context.drawImage(image,0,0,width,height);
      if(first){const pixels=context.getImageData(0,0,width,height).data;for(let i=3;i<pixels.length;i+=4)if(pixels[i]!==255){transparent=true;break;}first=false;}
      onProgress({width,height});
      for(const quality of transparent?[null]:[.85,.65,.45,.25]){
        await new Promise(resolve=>doc.defaultView.setTimeout(resolve,0));if(!active())throw new Error('Image import cancelled.');
        const src=raster.toDataURL(transparent?'image/png':'image/jpeg',quality??undefined);
        if(src.length<=imageDataLimit)return {src,width,height,transparent};
      }
    }
    throw new Error('Image cannot fit the 32 KiB limit. Choose a simpler image.');
  }finally{raster.width=raster.height=0;}
}
