import {useEffect,useRef} from 'react';
import {mountFrameworkHost} from './lib/framework-session.js';

export function CanvasEmbed({name}){
  const host=useRef(null);
  // The returned cleanup releases the entire imperative subtree before setup
  // runs again. Strict Mode deliberately exercises this pair in development.
  useEffect(()=>mountFrameworkHost(host.current,name),[name]);
  return <div ref={host} className="framework-host" data-framework-host={name}/>;
}
