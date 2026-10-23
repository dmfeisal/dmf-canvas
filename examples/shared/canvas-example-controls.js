import {createCanvasTheme} from '../../js/canvas-instance-theme.js';
import {resolveSettings} from '../../js/canvas-instance-settings.js';
const selectors={image:'[data-add-image]',sticky:'[data-add-note],[data-instance-add-note]',pencil:'[data-pencil],[data-instance-pencil],[data-stroke-width],[data-instance-stroke-width],[data-ink],[data-instance-ink]',clipboard:'[data-document-action=copy],[data-document-action=paste]',group:'[data-document-action=group],[data-document-action=ungroup]',arrange:'.canvas-instance-arrange',layers:'[data-document-action=bring-forward],[data-document-action=bring-front],[data-document-action=send-backward],[data-document-action=send-back]',lock:'[data-document-action=lock]',delete:'[data-document-action=delete]',duplicate:'[data-document-action=duplicate]',files:'[data-document-action=save],[data-document-action=open]',history:'[data-undo],[data-instance-undo],[data-redo],[data-instance-redo]',paperColor:'[data-color],[data-instance-color]'};
export function createEmbedControls(container,getCanvas,onError) {
  let settings=resolveSettings();const visibility=new Map();
  const theme=createCanvasTheme(container),themeMode=container.querySelector('[data-embed-theme]'),themeColors=[...container.querySelectorAll('[data-embed-color]')],themeReset=container.querySelector('[data-embed-theme-reset]');
  const renderTheme=()=>{const state=theme.getState();if(themeMode)themeMode.value=state.mode;for(const field of themeColors)field.value=state.colors[field.dataset.embedColor]??'';};
  const resetTheme=()=>{theme.configure({mode:'inherit',colors:Object.fromEntries(['surface','grid','selection','toolbar','ink','line'].map(key=>[key,null]))});renderTheme();};
  themeReset?.addEventListener('click',resetTheme);
  for(const [tool,selector]of Object.entries(selectors))for(const element of container.querySelectorAll(selector)){const target=element.matches('select')?element.closest('label')??element:element;visibility.set(target,{tool,hidden:target.hidden});}
  const fields=[...container.querySelectorAll('[data-embed-readonly],[data-embed-tool]')];
  const render=()=>{
    settings=getCanvas()?.getState().settings??settings;
    for(const [element,item]of visibility)element.hidden=item.hidden||!settings.tools[item.tool];
    for(const input of fields)input.checked=input.hasAttribute('data-embed-readonly')?settings.readOnly:settings.tools[input.dataset.embedTool];
  };
  const change=event=>{
    if(event.target===themeMode||themeColors.includes(event.target)){
      try{theme.configure(event.target===themeMode?{mode:themeMode.value}:{colors:{[event.target.dataset.embedColor]:event.target.value.trim()||null}});}catch(error){onError(error.message);}renderTheme();return;
    }
    if(!fields.includes(event.target))return;
    const input=event.target,patch=input.hasAttribute('data-embed-readonly')?{readOnly:input.checked}:{tools:{[input.dataset.embedTool]:input.checked}};
    try{const canvas=getCanvas();if(canvas)canvas.configure(patch);else settings=resolveSettings(patch,settings);}catch(error){onError(error.message);}render();
  };
  container.addEventListener('change',change);render();renderTheme();
  return {render,getSettings:()=>settings,dispose(){themeReset?.removeEventListener('click',resetTheme);theme.dispose();container.removeEventListener('change',change);for(const [element,item]of visibility)element.hidden=item.hidden;visibility.clear();fields.length=0;}};
}
