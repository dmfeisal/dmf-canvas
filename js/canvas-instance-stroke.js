const ns='http://www.w3.org/2000/svg';
export const inks={primary:'var(--dmf-color-text,var(--foreground,CanvasText))',blue:'#1677ff',red:'#e5484d'};
export const widths=[2,4,8];
// Highlighter matches feisal.id: 12/20/32px translucent strokes in fixed marker colours.
export const highlightInks={yellow:'#ffd84d',pink:'#ff79b0',blue:'#70c9ff'};
export const highlightWidths=[12,20,32];
export const highlightOpacity=.32;
export const strokeTools=Object.freeze({pencil:{inks,widths},highlighter:{inks:highlightInks,widths:highlightWidths}});
// Host-facing palettes: semantic ink keys with their display colours, and the allowed widths (thin, medium, bold).
export const drawingPalettes=Object.freeze({pencil:Object.freeze({inks:Object.freeze({...inks}),widths:Object.freeze([...widths])}),highlighter:Object.freeze({inks:Object.freeze({...highlightInks}),widths:Object.freeze([...highlightWidths]),opacity:highlightOpacity})});
export const validStroke=(tool,width,color)=>Object.hasOwn(strokeTools,tool)&&strokeTools[tool].widths.includes(width)&&Object.hasOwn(strokeTools[tool].inks,color);
export const svgNode=(doc,name)=>doc.createElementNS(ns,name);
export function makePath(doc,points,width,color,tool='pencil'){
  const path=svgNode(doc,'path');path.setAttribute('d',pathFor(points));path.setAttribute('fill','none');
  path.setAttribute('stroke',strokeTools[tool].inks[color]);path.setAttribute('stroke-width',width);if(tool==='highlighter')path.setAttribute('stroke-opacity',String(highlightOpacity));path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');return path;
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
