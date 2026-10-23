import { createImageObject } from 'dmf-canvas/owners';
import { validateImage,imageDimensions } from 'dmf-canvas/images';
import { encodeImage } from 'dmf-canvas/images';
// Optional host importer. One image/job; no remote fetch, retained blobs or writes.
export function createImageControls(container,getCanvas,onImported=()=>{}){
  const host=container.querySelector('[data-host],[data-instance-host]'),button=container.querySelector('[data-add-image]'),input=container.querySelector('[data-image-file]'),output=container.querySelector('[data-document-message]');
  const progress=container.querySelector('[data-image-progress]'),cancelButton=container.querySelector('[data-image-cancel]'),details=container.querySelector('[data-image-details]'),description=container.querySelector('[data-image-description]'),saveDescription=container.querySelector('[data-image-description-save]'),dimensions=container.querySelector('[data-image-dimensions]');
  let selectedId=null;
  let alive=true,generation=0,busy=false,pending=null;
  const eligible=()=>{const s=getCanvas()?.getState();return !!s?.canCreate&&!s.settings.readOnly&&s.settings.tools.image;};
  function render(){
    const state=getCanvas()?.getState();if(button){button.disabled=busy||!eligible();button.hidden=state?.settings.tools.image===false;}
    if(progress)progress.hidden=!busy;if(cancelButton)cancelButton.hidden=!busy;
    if(details){const show=!!state?.imageDimensions;details.hidden=!show;description.readOnly=!state?.canDescribeImage;saveDescription.disabled=!state?.canDescribeImage;const changed=selectedId!==state?.selection;selectedId=state?.selection;if(changed||!state?.canDescribeImage||container.ownerDocument.activeElement!==description)description.value=state?.imageDescription??'';dimensions.textContent=show?`${state.imageDimensions.width} × ${state.imageDimensions.height} px`:'';}
  }
  const cancel=()=>{generation++;pending?.();pending=null;busy=false;render();};
  async function importFile(file){
    const canvas=getCanvas();if(busy||!eligible())return;
    busy=true;output.textContent='Reading image…';const revision=canvas.getState().revision,id=++generation;render();let url=null,img=null;
    try{
      if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>10*1024*1024||!file.size)throw new Error('Choose one PNG, JPEG or WebP image up to 10 MiB.');
      const head=new Uint8Array(await file.slice(0,262144).arrayBuffer()),{width,height}=imageDimensions(head,file.type,false);
      if(!width||!height||width>8192||height>8192||width*height>16777216)throw new Error('Image dimensions must fit 8192px per side and 16 megapixels.');
      if(!alive||id!==generation||getCanvas()!==canvas)return;
      output.textContent=`Decoding ${width} × ${height} px…`;
      img=container.ownerDocument.createElement('img');url=URL.createObjectURL(file);
      await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>done(new Error('Image decoding timed out.')),8000);function done(error){clearTimeout(timeout);img.onload=img.onerror=null;pending=null;error?reject(error):resolve();}pending=()=>done(new Error('Image import cancelled.'));img.onload=()=>done();img.onerror=()=>done(new Error('This image could not be decoded.'));img.src=url;});
      if(img.naturalWidth!==width||img.naturalHeight!==height)throw new Error('Image dimensions did not match its header.');
      const encoded=await encodeImage(img,container.ownerDocument,{active:()=>alive&&id===generation&&getCanvas()===canvas,onProgress:({width,height})=>{output.textContent=`Optimizing ${width} × ${height} px…`;}});
      if(!alive||id!==generation||getCanvas()!==canvas||!eligible())return;
      if(canvas.getState().revision!==revision)throw new Error('Canvas changed during import. Choose the image again.');
      const alt=file.name.replace(/\.[^.]+$/,'').replace(/[\u0000-\u001f]/g,'').slice(0,120)||'Image',item=createImageObject(host,validateImage({...encoded,alt}));
      try{canvas.register(item.element,item.owner,{created:true});}catch(error){item.owner.dispose();throw error;}onImported();canvas.select(item.element);item.element.focus({preventScroll:true});output.textContent=`Image added: ${width} × ${height} → ${encoded.width} × ${encoded.height} px · ${(encoded.src.length/1024).toFixed(1)} KiB. ${encoded.transparent?'Transparency preserved.':'JPEG image.'}`;
    }catch(error){if(alive&&id===generation)output.textContent=error.message;}
    finally{if(img)img.removeAttribute('src');if(url)URL.revokeObjectURL(url);if(id===generation){pending=null;busy=false;render();}}
  }
  const focusImage=()=>host.querySelector('[data-canvas-instance-selected]')?.focus({preventScroll:true});
  const commitDescription=()=>{const result=getCanvas()?.execute('image-description',description.value);if(result?.ok){output.textContent='Image description saved.';focusImage();}else output.textContent='Select one unlocked image to change its description.';render();};
  const descriptionKey=event=>{if(event.isComposing||event.keyCode===229)return;if(event.key==='Enter'&&!description.readOnly){event.preventDefault();commitDescription();}else if(event.key==='Escape'){event.preventDefault();description.value=getCanvas()?.getState().imageDescription??'';focusImage();}};
  const cancelImport=()=>{cancel();output.textContent='Image import cancelled.';button?.focus({preventScroll:true});};
  const choose=()=>input?.click(),change=()=>{const file=input.files?.[0];input.value='';if(file)void importFile(file);};
  const drag=event=>{if([...event.dataTransfer?.types??[]].includes('Files')){event.preventDefault();event.dataTransfer.dropEffect=eligible()?'copy':'none';}};
  const drop=event=>{if(![...event.dataTransfer?.types??[]].includes('Files'))return;event.preventDefault();if(event.dataTransfer.files.length!==1){output.textContent='Drop one image at a time.';return;}void importFile(event.dataTransfer.files[0]);};
  cancelButton?.addEventListener('click',cancelImport);saveDescription?.addEventListener('click',commitDescription);description?.addEventListener('keydown',descriptionKey);
  button?.addEventListener('click',choose);input?.addEventListener('change',change);host.addEventListener('dragover',drag);host.addEventListener('drop',drop);render();
  return {render,cancel,dispose(){if(!alive)return;alive=false;cancel();cancelButton?.removeEventListener('click',cancelImport);saveDescription?.removeEventListener('click',commitDescription);description?.removeEventListener('keydown',descriptionKey);button?.removeEventListener('click',choose);input?.removeEventListener('change',change);host.removeEventListener('dragover',drag);host.removeEventListener('drop',drop);}};
}
