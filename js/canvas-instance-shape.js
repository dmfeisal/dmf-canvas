import { createTextOwner } from './canvas-instance-text.js';
import {inks,widths,svgNode} from './canvas-instance-stroke.js';

// Shapes (0.3.0, docs/prd/SHAPES.md): geometry-only owners drawn as local SVG from semantic keys.
// Records persist kind, ink, width, fill and corners as keys; never SVG, CSS or resolved colours.
export const shapeKinds=Object.freeze(['rectangle','ellipse','diamond','line','arrow']);
export const shapeFills=Object.freeze(['none','tint']);
export const shapeCorners=Object.freeze(['sharp','round']);
export const shapeTintOpacity=.12;
const names={rectangle:'Rectangle',ellipse:'Ellipse',diamond:'Diamond',line:'Line',arrow:'Arrow'};
const open=kind=>kind==='line'||kind==='arrow';
const finite=(value,min,max)=>typeof value==='number'&&Number.isFinite(value)&&value>=min&&value<=max;

/** Validates and normalizes a shape's style and points; layout bounds the points. Throws TypeError. */
export function validShape(input,layout){
  const {shape,ink,strokeWidth}=input??{};
  if(!shapeKinds.includes(shape)||!Object.hasOwn(inks,ink)||!widths.includes(strokeWidth))throw new TypeError('Invalid shape style.');
  const fill=input.fill??'none';
  if(!shapeFills.includes(fill)||open(shape)&&fill!=='none')throw new TypeError('Invalid shape fill.');
  if(input.corners!==undefined&&shape!=='rectangle')throw new TypeError('Only rectangles have corners.');
  const corners=shape==='rectangle'?input.corners??'sharp':undefined;
  if(corners!==undefined&&!shapeCorners.includes(corners))throw new TypeError('Invalid rectangle corners.');
  if(open(shape)!==(input.points!==undefined))throw new TypeError(open(shape)?'Lines and arrows need two points.':'Only lines and arrows have points.');
  let points;
  if(open(shape)){
    if(!Array.isArray(input.points)||input.points.length!==2||input.points.some(p=>!finite(p?.x,0,layout.width)||!finite(p?.y,0,layout.height)))throw new TypeError('Lines and arrows need two points inside their box.');
    points=input.points.map(({x,y})=>({x,y}));
    if(points[0].x===points[1].x&&points[0].y===points[1].y)throw new TypeError('Line endpoints must differ.');
  }
  return {shape,ink,strokeWidth,fill,...(corners?{corners}:{}),...(points?{points}:{})};
}

function draw(doc,style,width,height){
  const svg=svgNode(doc,'svg');svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');
  const color=inks[style.ink],inset=style.strokeWidth/2,paint=node=>{
    node.setAttribute('stroke',color);node.setAttribute('stroke-width',style.strokeWidth);node.setAttribute('stroke-linecap','round');node.setAttribute('stroke-linejoin','round');
    node.setAttribute('fill',style.fill==='tint'?color:'none');if(style.fill==='tint')node.setAttribute('fill-opacity',String(shapeTintOpacity));svg.append(node);return node;
  };
  const w=Math.max(0,width-style.strokeWidth),h=Math.max(0,height-style.strokeWidth);
  if(style.shape==='rectangle'){
    const rect=paint(svgNode(doc,'rect'));for(const [name,value]of Object.entries({x:inset,y:inset,width:w,height:h}))rect.setAttribute(name,value);
    if(style.corners==='round'){const radius=Math.min(12,w/4,h/4);rect.setAttribute('rx',radius);rect.setAttribute('ry',radius);}
  }else if(style.shape==='ellipse'){
    const ellipse=paint(svgNode(doc,'ellipse'));for(const [name,value]of Object.entries({cx:width/2,cy:height/2,rx:w/2,ry:h/2}))ellipse.setAttribute(name,value);
  }else if(style.shape==='diamond'){
    paint(svgNode(doc,'polygon')).setAttribute('points',`${width/2},${inset} ${width-inset},${height/2} ${width/2},${height-inset} ${inset},${height/2}`);
  }else{
    const [a,b]=style.points,line=paint(svgNode(doc,'line'));for(const [name,value]of Object.entries({x1:a.x,y1:a.y,x2:b.x,y2:b.y}))line.setAttribute(name,value);
    if(style.shape==='arrow'){
      // Arrowhead at the end point, sized from the stroke so Bold arrows stay legible.
      const angle=Math.atan2(b.y-a.y,b.x-a.x),size=Math.max(10,style.strokeWidth*3),spread=Math.PI/7;
      const wing=sign=>`${b.x-size*Math.cos(angle+sign*spread)},${b.y-size*Math.sin(angle+sign*spread)}`;
      paint(svgNode(doc,'polyline')).setAttribute('points',`${wing(1)} ${b.x},${b.y} ${wing(-1)}`);
    }
  }
  return svg;
}

/**
 * Creates a shape owner on `host`. `layout` places the box in host pixels; line and arrow points are box-local.
 * Shapes expose geometry only: no editing, text or paper colour.
 */
export function createShape(host,style,layout){
  if(!host?.isConnected||host.clientWidth<80||host.clientHeight<100)throw new TypeError('Shapes need a connected host.');
  if(!layout||!finite(layout.left,-100000,100000)||!finite(layout.top,-100000,100000)||!finite(layout.width,1,100000)||!finite(layout.height,1,100000))throw new TypeError('Invalid shape layout.');
  const data=validShape(style,layout),name=names[data.shape];
  let root=host,node=host.ownerDocument.createElement('div');
  node.className='canvas-instance-shape';node.dataset.canvasInstanceShape=data.shape;node.setAttribute('aria-label',name);
  if(host.getAttribute('aria-describedby'))node.setAttribute('aria-describedby',host.getAttribute('aria-describedby'));
  Object.assign(node.style,{width:layout.width+'px',height:layout.height+'px',left:layout.left+'px',top:layout.top+'px'});root.append(node);
  let base;try{base=createTextOwner(node,root,{name,widthHandles:false,editable:false});}catch(error){node.remove();throw error;}
  node.prepend(draw(host.ownerDocument,data,layout.width,layout.height));
  const {beginEdit,...geometry}=base;
  base.restore(base.capture());
  const owner=Object.freeze({...geometry,
    serialize:()=>({type:'shape',layout:{left:node.offsetLeft,top:node.offsetTop,width:layout.width,height:layout.height,fontSize:18},...data,...(data.points?{points:data.points.map(p=>({...p}))}:{}),state:base.capture()}),
    setPresent(present){if(!node)return;if(present){root.append(node);base.restore(base.capture());}else node.remove();},
    dispose(){if(!node)return;base.dispose();node.remove();node=root=null;},
  });
  return Object.freeze({element:node,owner});
}
