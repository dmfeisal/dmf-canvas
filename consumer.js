import {mountConsumer} from './examples/shared/custom-host.js';
export {mountConsumer};
export const consumers=['A','B'].map(name=>mountConsumer(document.querySelector('.consumers'),name));
const hide=()=>{consumers.forEach(item=>item.dispose());window.removeEventListener('pagehide',hide);};window.addEventListener('pagehide',hide);
