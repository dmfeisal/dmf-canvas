import type {CanvasOwner,CanvasObjectDocument,CanvasDocumentAdapter} from './index.js';
export interface CanvasObjectHandle { readonly element:HTMLElement; readonly owner:CanvasOwner; }
export interface ObjectLayout {left:number;top:number;width:number;height:number;}
export interface ImageData {src:string;alt:string;width:number;height:number;}
export interface DrawingPoint {x:number;y:number;}
export type DrawingInk='primary'|'blue'|'red';
export type DrawingWidth=2|4|8;
export type HighlightInk='yellow'|'pink'|'blue';
export type HighlightWidth=12|20|32;
export type DrawingTool='pencil'|'highlighter';
export type ShapeKind='rectangle'|'ellipse'|'diamond'|'line'|'arrow';
export type ShapeFill='none'|'tint';
export type ShapeCorners='sharp'|'round';
/** Semantic shape style. Closed shapes may use `tint`; rectangles may set `corners`; lines and arrows need two box-local `points` and fill `none`. */
export type ShapeStyle={shape:'rectangle';ink:DrawingInk;strokeWidth:DrawingWidth;fill?:ShapeFill;corners?:ShapeCorners}|{shape:'ellipse'|'diamond';ink:DrawingInk;strokeWidth:DrawingWidth;fill?:ShapeFill}|{shape:'line'|'arrow';ink:DrawingInk;strokeWidth:DrawingWidth;fill?:'none';points:[DrawingPoint,DrawingPoint]};
export function createTextOwner(element:HTMLElement,host:HTMLElement,options?:{name?:string;widthHandles?:boolean;editable?:boolean}):CanvasOwner;
export const stickyColors:readonly ('yellow'|'blue'|'pink')[];
export function createStickyNote(host:HTMLElement):CanvasObjectHandle;
export function createImageObject(host:HTMLElement,input:ImageData,layout?:ObjectLayout|null):CanvasObjectHandle;
export function createDrawing(host:HTMLElement,points:DrawingPoint[],options?:{width?:DrawingWidth;color?:DrawingInk;layout?:ObjectLayout|null;tool?:'pencil'}|{tool:'highlighter';width?:HighlightWidth;color?:HighlightInk;layout?:ObjectLayout|null}):CanvasObjectHandle;
export const shapeKinds:readonly ShapeKind[];
/** Creates a geometry-only shape owner; boards containing shapes save as schema 4. */
export function createShape(host:HTMLElement,style:ShapeStyle,layout:ObjectLayout):CanvasObjectHandle;
export function validateObject(value:unknown):CanvasObjectDocument;
export const canvasDocuments:Readonly<CanvasDocumentAdapter>;
