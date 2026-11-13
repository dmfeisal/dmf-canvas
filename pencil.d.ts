import type {CanvasInstance} from './index.js';
import type {DrawingInk,DrawingWidth,DrawingTool,HighlightInk,HighlightWidth,ShapeKind,ShapeFill,ShapeCorners} from './owners.js';
/** Pencil, Highlighter, the stroke Eraser (which removes whole Drawings and needs the `delete` tool) or Shapes (which needs the `shapes` tool). */
export type PencilTool=DrawingTool|'eraser'|'shape';
/** `width` and `color` report the current tool's own settings, or null for the Eraser. `shape`, `fill` and `corners` are the Shapes tool's settings, null for other tools. `drawing` is true during a stroke, erase or shape gesture. */
export interface PencilState {readonly active:boolean;readonly tool:PencilTool;readonly width:DrawingWidth|HighlightWidth|null;readonly color:DrawingInk|HighlightInk|null;readonly shape:ShapeKind|null;readonly fill:ShapeFill|null;readonly corners:ShapeCorners|null;readonly drawing:boolean;}
export interface PencilController {
  getState():Readonly<PencilState>;
  setActive(value:boolean):boolean;
  /** Switch between Pencil, Highlighter, Eraser and Shapes without arming; rejected mid-gesture. */
  setTool(value:PencilTool):boolean;
  cancel():void;
  /** Validated against the current tool: 2/4/8 for Pencil and Shapes, 12/20/32 for Highlighter; false for the Eraser. */
  setWidth(value:DrawingWidth|HighlightWidth):boolean;
  /** Validated against the current tool: primary/blue/red for Pencil and Shapes, yellow/pink/blue for Highlighter. */
  setColor(value:DrawingInk|HighlightInk):boolean;
  /** Shapes tool only (false otherwise or mid-gesture): the kind the next drag or Enter places. */
  setShape(value:ShapeKind):boolean;
  /** Shapes tool only: `tint` applies to rectangles, ellipses and diamonds; lines and arrows are always unfilled. */
  setFill(value:ShapeFill):boolean;
  /** Shapes tool only: corners for new rectangles. */
  setCorners(value:ShapeCorners):boolean;
  dispose():void;
}
export function createPencil(canvas:CanvasInstance,host:HTMLElement,onChange?:(state:Readonly<PencilState>)=>void):Readonly<PencilController>;
/** Display colours keyed by the semantic ink names that boards store, plus each tool's thin/medium/bold widths. Pencil `primary` is a CSS variable expression. */
export const drawingPalettes:Readonly<{
  pencil:Readonly<{inks:Readonly<Record<DrawingInk,string>>;widths:readonly DrawingWidth[]}>;
  highlighter:Readonly<{inks:Readonly<Record<HighlightInk,string>>;widths:readonly HighlightWidth[];opacity:number}>;
}>;
