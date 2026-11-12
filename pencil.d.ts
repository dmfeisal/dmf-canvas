import type {CanvasInstance} from './index.js';
import type {DrawingInk,DrawingWidth,DrawingTool,HighlightInk,HighlightWidth} from './owners.js';
/** `width` and `color` report the current tool's own settings. */
export interface PencilState {readonly active:boolean;readonly tool:DrawingTool;readonly width:DrawingWidth|HighlightWidth;readonly color:DrawingInk|HighlightInk;readonly drawing:boolean;}
export interface PencilController {
  getState():Readonly<PencilState>;
  setActive(value:boolean):boolean;
  /** Switch between Pencil and Highlighter without arming either; rejected mid-stroke. */
  setTool(value:DrawingTool):boolean;
  cancel():void;
  /** Validated against the current tool: 2/4/8 for Pencil, 12/20/32 for Highlighter. */
  setWidth(value:DrawingWidth|HighlightWidth):boolean;
  /** Validated against the current tool: primary/blue/red for Pencil, yellow/pink/blue for Highlighter. */
  setColor(value:DrawingInk|HighlightInk):boolean;
  dispose():void;
}
export function createPencil(canvas:CanvasInstance,host:HTMLElement,onChange?:(state:Readonly<PencilState>)=>void):Readonly<PencilController>;
