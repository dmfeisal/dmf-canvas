export * from './js/canvas-instance-toolbar.js';
import type {CanvasInstance} from './index.js';
export function createCanvasInspector(container:HTMLElement,options:{canvas:CanvasInstance;trigger:HTMLButtonElement}):Readonly<{toggle():void;close():void;dispose():void}>;
