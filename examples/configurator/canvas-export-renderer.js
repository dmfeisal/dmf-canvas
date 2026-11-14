// Example host renderer for dmf-canvas/export (docs/prd/STYLING-EXPORT.md). Consumer-owned example code, not a package
// entry point. It draws the host through an SVG foreignObject: the host is cloned into a sized wrapper, the page's
// stylesheets are embedded so the clone looks the same, and the SVG is drawn into a canvas. Fonts and images that the
// page loads from other origins are not embedded, so the PNG can differ from the screen for those.
const svgNS='http://www.w3.org/2000/svg';

function pageCss(){
  const parts=[];
  for(const sheet of document.styleSheets){
    try{for(const rule of sheet.cssRules)parts.push(rule.cssText);}catch{/* cross-origin sheets are skipped */}
  }
  return parts.join('\n');
}

// Returns a render function for createCanvasExport({host, render}). The host is the editable surface.
export function createHostRenderer(host){
  const view=host.ownerDocument.defaultView;
  return async function renderPng({bounds,width,height,scale,signal}){
    if(signal?.aborted)throw new DOMException('Export was cancelled.','AbortError');
    const wrapper=host.ownerDocument.createElement('div');
    // Keep the theme attributes of the nearest themed ancestor so the clone picks up the same variables and colours.
    const themed=host.closest('[data-canvas-embed-theme]');
    if(themed)for(const attribute of themed.attributes)if(attribute.name.startsWith('data-canvas-embed')||attribute.name==='class')wrapper.setAttribute(attribute.name,attribute.value);
    wrapper.setAttribute('xmlns','http://www.w3.org/1999/xhtml');
    wrapper.style.cssText=`position:absolute;left:${-bounds.left}px;top:${-bounds.top}px;width:${host.clientWidth}px;height:${host.clientHeight}px;overflow:visible;margin:0`;
    const clone=host.cloneNode(true);
    clone.style.height=`${host.clientHeight}px`;clone.style.width=`${host.clientWidth}px`;
    wrapper.append(clone);
    const style=host.ownerDocument.createElementNS('http://www.w3.org/1999/xhtml','style');style.textContent=pageCss();
    const body=host.ownerDocument.createElementNS('http://www.w3.org/1999/xhtml','div');
    body.setAttribute('xmlns','http://www.w3.org/1999/xhtml');body.style.cssText='position:relative;width:100%;height:100%;overflow:hidden';
    body.append(style,wrapper);
    const serializer=new view.XMLSerializer();
    const svg=`<svg xmlns="${svgNS}" width="${bounds.width}" height="${bounds.height}" viewBox="0 0 ${bounds.width} ${bounds.height}"><foreignObject width="100%" height="100%">${serializer.serializeToString(body)}</foreignObject></svg>`;
    const image=new view.Image();
    image.decoding='sync';
    const loaded=new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('The host could not be drawn for export.'));});
    image.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await loaded;
    if(signal?.aborted)throw new DOMException('Export was cancelled.','AbortError');
    const canvas=host.ownerDocument.createElement('canvas');canvas.width=width;canvas.height=height;
    const context=canvas.getContext('2d');
    context.fillStyle=getComputedStyle(host).backgroundColor||'#ffffff';context.fillRect(0,0,width,height);
    context.drawImage(image,0,0,width,height);
    return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('The PNG could not be encoded.')),'image/png'));
  };
}
