export interface ToolbarAction {
  /** Unique per toolbar. `more` is reserved for the generated More menu trigger. */
  id:string; label:string;
  /** A Lucide name from the bundled sprite; see docs/design/TOOLBAR.md for the canonical action-to-icon table. */
  icon:string;
  /** Group label: a bar group, or a menu section when `menu` is true. */
  group?:string;
  /** Place this action in the toolbar's More menu instead of on the bar. */
  menu?:boolean;
  /** Canvas-context key hint. Z/G/C/V etc use the platform command modifier; P/V tool hints are unmodified. */
  shortcut?:string;
  run():void;
  disabled?:boolean; hidden?:boolean; pressed?:boolean|'mixed';
}
export function createCanvasToolbar(container:HTMLElement,options?:{
  actions?:ToolbarAction[]|null;label?:string;onSelect?:()=>void;
  /** Default `horizontal`. `vertical` renders a tool rail with Up/Down roving focus. */
  orientation?:'horizontal'|'vertical';
  /** Accessible name and tooltip of the More menu trigger. Default `More actions`. */
  moreLabel?:string;
}):Readonly<{
  render():void;
  update(id:string,patch:{label?:string;disabled?:boolean;hidden?:boolean;pressed?:boolean|'mixed'}):void;
  dispose():void;
}>;
