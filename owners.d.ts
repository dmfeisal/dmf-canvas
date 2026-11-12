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
export function createTextOwner(element:HTMLElement,host:HTMLElement,options?:{name?:string;widthHandles?:boolean;editable?:boolean}):CanvasOwner;
export const stickyColors:readonly ('yellow'|'blue'|'pink')[];
export function createStickyNote(host:HTMLElement):CanvasObjectHandle;
export function createImageObject(host:HTMLElement,input:ImageData,layout?:ObjectLayout|null):CanvasObjectHandle;
export function createDrawing(host:HTMLElement,points:DrawingPoint[],options?:{width?:DrawingWidth;color?:DrawingInk;layout?:ObjectLayout|null;tool?:'pencil'}|{tool:'highlighter';width?:HighlightWidth;color?:HighlightInk;layout?:ObjectLayout|null}):CanvasObjectHandle;
export function validateObject(value:unknown):CanvasObjectDocument;
export const canvasDocuments:Readonly<CanvasDocumentAdapter>;
