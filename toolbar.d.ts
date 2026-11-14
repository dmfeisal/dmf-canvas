export * from './js/canvas-instance-toolbar.js';
import type {CanvasInstance} from './index.js';
export function createCanvasInspector(container:HTMLElement,options:{canvas:CanvasInstance;trigger:HTMLButtonElement}):Readonly<{toggle():void;close():void;dispose():void}>;
/** Full screen for a canvas's chrome container (docs/API.md). `supported` is false without the Fullscreen API or in an iframe without permission: hide the action then. */
export interface CanvasFullscreenState { readonly supported:boolean; readonly active:boolean; readonly pending:boolean; }
export function createCanvasFullscreen(target:HTMLElement,options?:{canvas?:CanvasInstance;onChange?:(state:CanvasFullscreenState)=>void}):Readonly<{getState():CanvasFullscreenState;enter():Promise<boolean>;exit():Promise<boolean>;toggle():Promise<boolean>;dispose():void}>;
