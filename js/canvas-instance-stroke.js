const ns='http://www.w3.org/2000/svg';
export const inks={primary:'var(--dmf-color-text, CanvasText)',blue:'#1677ff',red:'#e5484d'};
export const widths=[2,4,8];
export const svgNode=(doc,name)=>doc.createElementNS(ns,name);
export function makePath(doc,points,width,color){
  const path=svgNode(doc,'path');path.setAttribute('d',pathFor(points));path.setAttribute('fill','none');
  path.setAttribute('stroke',inks[color]);path.setAttribute('stroke-width',width);path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');return path;
}

export function pathFor(points, scale=1) {
    if(!points.length)return '';
    const xy=p=>`${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
    if(points.length===1)return `M${xy(points[0])}l.01 .01`;
    // Keep deliberate turns and endpoints; filter only small screen-space jitter.
    const corners=new Set(),limit=1/scale;
    const filtered=points.map((p,index)=>{
      if(!index || index===points.length-1)return p;
      const a=points[index-1],b=points[index+1],dx=p.x-a.x,dy=p.y-a.y,ex=b.x-p.x,ey=b.y-p.y;
      const lengths=Math.hypot(dx,dy)*Math.hypot(ex,ey);
      if(!lengths || (dx*ex+dy*ey)/lengths<.5){corners.add(index);return p;}
      const x=(a.x+2*p.x+b.x)/4,y=(a.y+2*p.y+b.y)/4,distance=Math.hypot(x-p.x,y-p.y),factor=distance?Math.min(1,limit/distance):0;
      return {x:p.x+(x-p.x)*factor,y:p.y+(y-p.y)*factor};
    });
    const commands=[`M${xy(filtered[0])}`];
    for(let index=1;index<filtered.length-1;index++) {
      const p=filtered[index],a=filtered[index-1],b=filtered[index+1],before=Math.hypot(p.x-a.x,p.y-a.y),after=Math.hypot(b.x-p.x,b.y-p.y);
      const cut=Math.min(before/2,after/2,2/scale);
      if(corners.has(index)||cut<.01){commands.push(`L${xy(p)}`);continue;}
      const entry={x:p.x+(a.x-p.x)*cut/before,y:p.y+(a.y-p.y)*cut/before},end={x:p.x+(b.x-p.x)*cut/after,y:p.y+(b.y-p.y)*cut/after};
      commands.push(`L${xy(entry)}Q${xy(p)} ${xy(end)}`);
    }
    commands.push(`L${xy(filtered.at(-1))}`);return commands.join(' ');
  }
