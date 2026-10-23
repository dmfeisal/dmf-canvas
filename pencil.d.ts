import type {CanvasInstance} from './index.js';
import type {DrawingInk,DrawingWidth} from './owners.js';
export interface PencilState {readonly active:boolean;readonly width:DrawingWidth;readonly color:DrawingInk;readonly drawing:boolean;}
export interface PencilController {getState():Readonly<PencilState>;setActive(value:boolean):boolean;cancel():void;setWidth(value:DrawingWidth):boolean;setColor(value:DrawingInk):boolean;dispose():void;}
export function createPencil(canvas:CanvasInstance,host:HTMLElement,onChange?:(state:Readonly<PencilState>)=>void):Readonly<PencilController>;
