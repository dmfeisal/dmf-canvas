import type {CanvasInstance} from './index.js';
/** Export limits (docs/prd/STYLING-EXPORT.md): at most 2x, 4096px per side, 12 megapixels, 1200 objects, 64 images, 25 seconds. */
export declare const exportLimits: Readonly<{maxScale:number;maxSide:number;maxPixels:number;maxElements:number;maxImages:number;timeoutMs:number}>;
export interface ExportPlan { readonly scale:number; readonly width:number; readonly height:number; readonly reduced:boolean; }
/** The scale that keeps a width, height and pixel count within the limits. Reduces the scale rather than failing. */
export declare function planExport(input:{width:number;height:number;scale?:number;maxScale?:number;maxSide?:number;maxPixels?:number}):ExportPlan;
export interface ExportRenderRequest {
  readonly elements:readonly HTMLElement[];
  readonly bounds:Readonly<{left:number;top:number;width:number;height:number}>;
  readonly width:number;readonly height:number;readonly scale:number;readonly signal:AbortSignal;
}
export interface CanvasExportOptions {
  /** The canvas host, used to measure the export area. */
  host:HTMLElement;
  /** The host's renderer. Return a PNG Blob of the requested size; the package never downloads anything. */
  render(request:ExportRenderRequest):Blob|Promise<Blob>;
  /** Overrides the 25 second limit. Mostly for tests. */
  timeoutMs?:number;
}
export interface CanvasExportResult { readonly blob:Blob; readonly width:number; readonly height:number; readonly scale:number; readonly reduced:boolean; }
/** Read-only PNG export. One export runs at a time; cancelling, timing out or destroying the export rejects it. */
export declare function createCanvasExport(canvas:CanvasInstance,options:CanvasExportOptions):Readonly<{
  exportPng(options?:{scope?:'selection'|'visible';scale?:number;signal?:AbortSignal}):Promise<CanvasExportResult>;
  isBusy():boolean;
  dispose():void;
}>;
