import type {CanvasInstance} from './index.js';
import type {DrawingInk,DrawingWidth,DrawingTool,HighlightInk,HighlightWidth} from './owners.js';
/** Pencil, Highlighter or the stroke Eraser (which removes whole Drawings and needs the `delete` tool). */
export type PencilTool=DrawingTool|'eraser';
/** `width` and `color` report the current stroke tool's own settings, or null for the Eraser. `drawing` is true during a stroke or erase gesture. */
export interface PencilState {readonly active:boolean;readonly tool:PencilTool;readonly width:DrawingWidth|HighlightWidth|null;readonly color:DrawingInk|HighlightInk|null;readonly drawing:boolean;}
export interface PencilController {
  getState():Readonly<PencilState>;
  setActive(value:boolean):boolean;
  /** Switch between Pencil, Highlighter and Eraser without arming; rejected mid-gesture. */
  setTool(value:PencilTool):boolean;
  cancel():void;
  /** Validated against the current tool: 2/4/8 for Pencil, 12/20/32 for Highlighter; false for the Eraser. */
  setWidth(value:DrawingWidth|HighlightWidth):boolean;
  /** Validated against the current tool: primary/blue/red for Pencil, yellow/pink/blue for Highlighter. */
  setColor(value:DrawingInk|HighlightInk):boolean;
  dispose():void;
}
export function createPencil(canvas:CanvasInstance,host:HTMLElement,onChange?:(state:Readonly<PencilState>)=>void):Readonly<PencilController>;
/** Display colours keyed by the semantic ink names that boards store, plus each tool's thin/medium/bold widths. Pencil `primary` is a CSS variable expression. */
export const drawingPalettes:Readonly<{
  pencil:Readonly<{inks:Readonly<Record<DrawingInk,string>>;widths:readonly DrawingWidth[]}>;
  highlighter:Readonly<{inks:Readonly<Record<HighlightInk,string>>;widths:readonly HighlightWidth[];opacity:number}>;
}>;
