import type { CanvasInstance } from './canvas-instance.js';
export interface LocalDraftState {
  readonly phase:'ready'|'pending'|'saving'|'saved'|'available'|'conflict'|'error'|'restored';
  readonly message:string;
  readonly hasDraft:boolean;
  readonly hasStored:boolean;
  readonly savedAt:number|null;
  readonly pending:boolean;
}
export interface LocalDraftOptions {
  /** Stable host/document identity, distinct for every embed. Namespaced by the adapter. */
  key:string;
  storage:Pick<Storage,'getItem'|'setItem'|'removeItem'>;
  delay?:number;
  onStatus?:(state:Readonly<LocalDraftState>)=>void;
  now?:()=>number;
  setTimer?:typeof setTimeout;
  clearTimer?:typeof clearTimeout;
}
/** Validates the draft envelope/size; core validates board records on Restore. */
export function parseLocalDraft(raw:string):{format:'dmf-canvas-draft';version:1;savedAt:number;document:unknown};
export function createLocalDraft(canvas:CanvasInstance,options:LocalDraftOptions):Readonly<{
  getState():Readonly<LocalDraftState>;
  flush():boolean;
  retry():boolean;
  restore():boolean;
  discard():boolean;
  dispose():void;
}>;
