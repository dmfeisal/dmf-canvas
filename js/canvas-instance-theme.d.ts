/** Host-owned appearance, excluded from board files, history and drafts. */
export type CanvasThemeMode = 'inherit' | 'light' | 'dark' | 'system';
export type CanvasThemeColor = 'surface' | 'grid' | 'selection' | 'toolbar' | 'ink' | 'line';
export interface CanvasThemePatch { mode?:CanvasThemeMode; /** Six-digit hex; null removes an override. */ colors?:Partial<Record<CanvasThemeColor,string|null>>; }
export interface CanvasThemeState { readonly mode:CanvasThemeMode; readonly colors:Readonly<Partial<Record<CanvasThemeColor,string>>>; }
export function resolveTheme(patch?:CanvasThemePatch,previous?:CanvasThemeState):CanvasThemeState;
export function createCanvasTheme(container:HTMLElement,options?:CanvasThemePatch):{
 getState():CanvasThemeState;
 configure(patch:CanvasThemePatch):boolean;
 dispose():void;
};
