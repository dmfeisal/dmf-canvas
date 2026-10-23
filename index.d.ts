export * from './js/canvas-instance.js';
import type {CanvasSettingsPatch,CanvasEmbedSettings,CanvasTool} from './js/canvas-instance.js';
export const canvasToolNames:readonly CanvasTool[];
export function resolveSettings(patch?:CanvasSettingsPatch,previous?:CanvasEmbedSettings):CanvasEmbedSettings;
