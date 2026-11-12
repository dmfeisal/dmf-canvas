/** Extraction preview contracts. No compatibility promise before the first release. */
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export interface MoveSession {
  /** Screen-pixel deltas from gesture start; bounds may be infinite. */
  limits: { left: number; right: number; top: number; bottom: number };
  move(dx: number, dy: number): void;
  finish?(): void;
}
export type TransformHandle = 'nw' | 'ne' | 'sw' | 'se' | 'w' | 'e' | 'rotate';
/** Single-handle prototype session, not yet the production group-transform API. */
export interface TransformSession {
  pointer(dx: number, dy: number, shift: boolean): void;
  step(direction: number, shift: boolean): void;
  finish?(): void;
}
export interface EditSession {
  editor: HTMLElement;
  finish(): void;
  focus?(): void;
}
export interface CanvasOwner<T extends JsonValue = JsonValue> {
  name?: string;
  /** Finite JSON, at most 64 KiB. No DOM or shared mutable references. */
  capture(): T;
  /** Does not select globally, save or publish. */
  restore(state: T): void;
  beginMove?(): MoveSession | null;
  beginTransform?(kind: TransformHandle, point: { clientX: number; clientY: number } | null): TransformSession | null;
  beginEdit?(): EditSession | null;
  /** Required only for visit-local created registrations. */
  setPresent?(present: boolean): void;
  paperColor?: { read(): string; set(value: string): boolean };
  description?: {read():string;set(value:string):boolean};
  imageSize?:Readonly<{width:number;height:number}>;
  geometry?:{read():CanvasGeometry|null;prepare(target:CanvasGeometry):(()=>void)|null};
  textStyle?:{read():(Omit<CanvasTextStyleView,'editable'>&{family?:string})|null;prepare(field:CanvasTextStyleField,value?:string|number):{apply():void;finish():void}|null};
  serialize?(): CanvasObjectDocument;
  dispose(): void;
}
export type CanvasTool = 'text' | 'sticky' | 'image' | 'pencil' | 'clipboard' | 'group' | 'arrange' | 'layers' | 'lock' | 'delete' | 'duplicate' | 'files' | 'history' | 'paperColor';
export interface CanvasEmbedSettings { readonly readOnly:boolean; readonly tools:Readonly<Record<CanvasTool,boolean>>; }
export interface CanvasSettingsPatch { readOnly?:boolean; tools?:Partial<Record<CanvasTool,boolean>>; }
export type CanvasChangeSource = 'text' | 'text-style' | 'move' | 'transform' | 'create' | 'duplicate' | 'delete' | 'erase' | 'paste' | 'lock' | 'paper-color' | 'image-description' | 'group' | 'ungroup' | 'bring-forward' | 'bring-front' | 'send-backward' | 'send-back' | 'align-left' | 'align-center' | 'align-right' | 'align-top' | 'align-middle' | 'align-bottom' | 'distribute-horizontal' | 'distribute-vertical' | 'undo' | 'redo' | 'open';
export interface CanvasChange { readonly revision:number; readonly dirty:boolean; readonly source:CanvasChangeSource; }
export interface CanvasState {
  readonly imageDescription:string|null;
  readonly canDescribeImage:boolean;
  readonly imageDimensions:Readonly<{width:number;height:number}>|null;
  readonly revision:number;
  readonly dirty:boolean;
  readonly settings:CanvasEmbedSettings;
  readonly mounted: boolean;
  readonly focused: boolean;
  readonly objects: number;
  readonly selection: number | null;
  readonly selectionIds: readonly number[];
  readonly selectionCount: number;
  readonly multiple: boolean;
  readonly editing: boolean;
  readonly creating: boolean;
  readonly selectionName: string | null;
  readonly paperColor: string | null;
  readonly canCreate: boolean;
  readonly canDelete: boolean;
  readonly canDuplicate: boolean;
  readonly canCopy: boolean;
  readonly canPaste: boolean;
  readonly canGroup: boolean;
  readonly canUngroup: boolean;
  readonly selectionGroups: number;
  readonly canAlign: boolean;
  readonly canDistribute: boolean;
  readonly canSave: boolean;
  readonly canBringForward: boolean;
  readonly canSendBackward: boolean;
  readonly canLock: boolean;
  readonly selectionLocked: boolean | null;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
}
export interface CommandResult {
  readonly ok: boolean;
  readonly reason: 'stale-revision' | 'read-only' | 'disabled' | 'destroyed' | 'busy' | 'invalid-delta' | 'invalid-color' | 'invalid-description' | 'invalid-style' | 'unsupported' | 'empty-history' | 'resource-limit' | 'bounds' | 'overlap' | null;
}
/** Portable version 2 adds Highlighter strokes; highlight-free documents stay version 1. */
export interface CanvasPortableDocument {format: "dmf-canvas-portable";version:1|2;nodes:{id:string;data:CanvasObjectDocument;source?:{format:"excalidraw";id:string}}[];}
export interface CanvasInstance {
  savePortableDocument():CanvasPortableDocument;
  loadPortableDocument(input:unknown):CommandResult;
  getTextStyle():Readonly<CanvasTextStyleView>|null;
  execute(command:'text-style',value:CanvasTextStyleCommand):CommandResult;
  getInspector():Readonly<{x:number;y:number;width:number;height:number;rotation:number;relativeRotation:boolean;editable:boolean}>|null;
  execute(command:'inspect',value:{field:'x'|'y'|'width'|'height'|'rotation';value:number}):CommandResult;
  /** One provisional creation at a time; cancellation owns preview cleanup. */
  beginCreation(cancel: () => void, kind?: 'text' | 'sticky' | 'image' | 'pencil'): Readonly<{ cancel(): void; commit<T extends JsonValue>(element: HTMLElement, owner: CanvasOwner<T>): Readonly<{ dispose(): void }> | null }> | null;
  /** Observational events delivered in order after the current JavaScript stack. No initial event. */
  subscribeChanges(listener:(change:Readonly<CanvasChange>)=>void):()=>boolean;
  /** Acknowledge only the revision actually persisted by the host. */
  markSaved(revision?:number):CommandResult;
  configure(patch:CanvasSettingsPatch):CommandResult;
  getState(): Readonly<CanvasState>;
  saveDocument(): CanvasDocument;
  loadDocument(document: unknown): CommandResult;
  focus(): boolean;
  select(element: HTMLElement | null): boolean;
  selectMany(elements: HTMLElement[]): boolean;
  setMultiple(value: boolean): boolean;
  execute(command: 'lock', value?: boolean): CommandResult;
  execute(command: 'move', value: { dx: number; dy: number }): CommandResult;
  execute(command: 'image-description', value: string): CommandResult;
  execute(command: 'paper-color', value: string): CommandResult;
  /** Stroke eraser: of 1-50 elements, removes the created, unlocked, ungrouped Drawings as one history action and keeps the rest; fails only when none qualify. Needs the `delete` tool. */
  execute(command: 'erase', value: HTMLElement[]): CommandResult;
  execute(command: 'copy' | 'paste' | 'group' | 'ungroup' | 'align-left' | 'align-center' | 'align-right' | 'align-top' | 'align-middle' | 'align-bottom' | 'distribute-horizontal' | 'distribute-vertical' | 'bring-forward' | 'send-backward' | 'bring-front' | 'send-back' | 'undo' | 'redo' | 'cancel' | 'edit' | 'finish-edit' | 'contain' | 'select-all' | 'delete' | 'duplicate'): CommandResult;
  register<T extends JsonValue>(element: HTMLElement, owner: CanvasOwner<T>, options?: { created?: boolean; locked?:boolean }): Readonly<{ dispose(): void }>;
  subscribe(listener: (state: Readonly<CanvasState>) => void): () => boolean;
  destroy(): void;
}
export interface CanvasGeometry {
  centerX:number;centerY:number;localWidth:number;localHeight:number;scale:number;angle:number;minScale:number;maxScale:number;
  bounds:{left:number;right:number;top:number;bottom:number};
}
export type CanvasTextFont='original'|'sans'|'serif'|'mono';
export type CanvasTextStyleField='font'|'size'|'weight'|'align'|'wrap'|'reset';
export type CanvasTextStyleCommand={field:'font';value:CanvasTextFont}|{field:'size';value:number}|{field:'weight';value:400|500|600|700}|{field:'align';value:'original'|'left'|'center'|'right'}|{field:'wrap';value:'auto'|'fixed'}|{field:'reset'};
export interface CanvasTextStyleSnapshot {font:CanvasTextFont;size:number|null;weight:400|500|600|700|null;align:'original'|'left'|'center'|'right';wrap:'original'|'auto'|'fixed';}
export interface CanvasTextStyleView {font:CanvasTextFont|null;size:number|null;weight:number|null;align:CanvasTextStyleSnapshot['align']|null;wrap:'auto'|'fixed'|null;weights:readonly number[];editable:boolean;}
export interface CanvasObjectDocument {
  type: 'text' | 'sticky' | 'drawing' | 'image';
  locked?:boolean;
  layer?:number;
  group?:number;
  layout: {left:number;top:number;width:number;height:number;fontSize:number;lineHeight?:number|'normal';fontWeight?:number};
  state: {x:number;y:number;scale:number;angle:number;width:string;content:string|null;alt?:string;paperColor?:string;typography?:CanvasTextStyleSnapshot};
  text?:string;
  image?:{src:string;alt:string;width:number;height:number};
  points?:{x:number;y:number}[];
  strokeWidth?:number;
  ink?:string;
  /** Drawing records only: omitted for Pencil; `highlighter` requires schema 3. */
  tool?:'highlighter';
}
export interface CanvasDocument {
  /** 1 plain records, 2 adds Text formatting, 3 adds Highlighter strokes. */
  format:'dmf-canvas';version:1|2|3;
  originals:{id:number;data:CanvasObjectDocument}[];
  objects:CanvasObjectDocument[];
}
export interface CanvasDocumentAdapter {
  validate(value:unknown):CanvasObjectDocument;
  create(host:HTMLElement,value:CanvasObjectDocument):{element:HTMLElement;owner:CanvasOwner};
}
export function createCanvas(host: HTMLElement, options?:CanvasSettingsPatch & {documents?:CanvasDocumentAdapter;clipboard?:CanvasObjectClipboard}): CanvasInstance;

export interface CanvasObjectTransfer {
  format:'dmf-canvas-clipboard';version:1|2|3;
  objects:{data:CanvasObjectDocument;bounds:{left:number;top:number;width:number;height:number}}[];
}
export interface CanvasObjectClipboard {
  readonly count:number;
  read():CanvasObjectTransfer|null;
  write(value:CanvasObjectTransfer):void;
  clear():void;
  subscribe(listener:()=>void):()=>void;
}
