const finite=value=>Number.isFinite(value)&&Math.abs(value)<=1e7;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const normalize=angle=>((angle+180)%360+360)%360-180;
export function geometryRect(item){
 const r=item.angle*Math.PI/180,c=Math.abs(Math.cos(r)),s=Math.abs(Math.sin(r));
 const width=(item.localWidth*c+item.localHeight*s)*item.scale,height=(item.localWidth*s+item.localHeight*c)*item.scale;
 return {x:item.centerX-width/2,y:item.centerY-height/2,width,height};
}
export function combinedGeometry(items){
 const rects=items.map(geometryRect),x=Math.min(...rects.map(r=>r.x)),y=Math.min(...rects.map(r=>r.y));
 return {x,y,width:Math.max(...rects.map(r=>r.x+r.width))-x,height:Math.max(...rects.map(r=>r.y+r.height))-y};
}
export function validGeometry(item){
 return item&&['centerX','centerY','localWidth','localHeight','scale','angle','minScale','maxScale'].every(key=>finite(item[key]))&&item.localWidth>0&&item.localHeight>0&&item.minScale>0&&item.minScale<=item.scale&&item.maxScale>=item.scale&&item.bounds&&['left','right','top','bottom'].every(key=>finite(item.bounds[key]))&&item.bounds.left<item.bounds.right&&item.bounds.top<item.bounds.bottom;
}
export function planInspector(items,field,value){
 if(!['x','y','width','height','rotation'].includes(field)||!finite(value)||!items.length||items.length>50||!items.every(validGeometry)||['width','height'].includes(field)&&value<=0)return null;
 const box=combinedGeometry(items),cx=box.x+box.width/2,cy=box.y+box.height/2;
 let factor=1,turn=0,dx=0,dy=0;
 if(field==='x')dx=value-box.x;
 if(field==='y')dy=value-box.y;
 if(field==='rotation')turn=items.length===1?normalize(value-items[0].angle):normalize(value);
 if(field==='width'||field==='height'){
  const low=Math.max(...items.map(i=>i.minScale/i.scale)),high=Math.min(...items.map(i=>i.maxScale/i.scale));
  if(low>high)return null;
  factor=clamp(value/box[field],low,high);
  // Scaling keeps the visible top-left fixed. Intersect every owner's bounds first.
  let fit=high;
  for(const item of items){const rect=geometryRect(item);fit=Math.min(fit,(item.bounds.right-box.x)/Math.max(.001,rect.x+rect.width-box.x),(item.bounds.bottom-box.y)/Math.max(.001,rect.y+rect.height-box.y));}
  if(fit<low)return null;factor=Math.min(factor,fit);
 }
 const r=turn*Math.PI/180,c=Math.cos(r),s=Math.sin(r);
 const targets=items.map(item=>{
  const ox=item.centerX-cx,oy=item.centerY-cy;
  return {...item,scale:item.scale*factor,angle:field==='rotation'?normalize(item.angle+turn):item.angle,centerX:turn?cx+ox*c-oy*s:box.x+(item.centerX-box.x)*factor,centerY:turn?cy+ox*s+oy*c:box.y+(item.centerY-box.y)*factor};
 });
 let left=-Infinity,right=Infinity,top=-Infinity,bottom=Infinity;
 for(const item of targets){const rect=geometryRect(item);left=Math.max(left,item.bounds.left-rect.x);right=Math.min(right,item.bounds.right-rect.x-rect.width);top=Math.max(top,item.bounds.top-rect.y);bottom=Math.min(bottom,item.bounds.bottom-rect.y-rect.height);}
 if(left>right+.001||top>bottom+.001)return null;
 dx=clamp(dx,left,right);dy=clamp(dy,top,bottom);
 return targets.map(item=>Object.freeze({...item,centerX:item.centerX+dx,centerY:item.centerY+dy}));
}
