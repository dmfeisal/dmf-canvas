export interface ToolbarAction {
  id:string; label:string; icon:string; group?:string;
  /** Canvas-context key hint. Z/G/C/V etc use the platform command modifier; P/V tool hints are unmodified. */
  shortcut?:string;
  run():void;
  disabled?:boolean; hidden?:boolean; pressed?:boolean|'mixed';
}
export function createCanvasToolbar(container:HTMLElement,options?:{actions?:ToolbarAction[]|null;label?:string;onSelect?:()=>void}):Readonly<{
  render():void;
  update(id:string,patch:{label?:string;disabled?:boolean;hidden?:boolean;pressed?:boolean|'mixed'}):void;
  dispose():void;
}>;
