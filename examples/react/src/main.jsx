import {StrictMode,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {CanvasEmbed} from './CanvasEmbed.jsx';
import 'dmf-canvas/canvas.css';
import 'dmf-canvas/toolbar.css';
import './lib/custom-host.css';
import './style.css';

function App(){
  const [visible,setVisible]=useState({A:true,B:true});
  const [renders,setRenders]=useState(0);
  return <main data-framework="react" data-development={String(import.meta.env.DEV)}>
    <h1>Canvas in React</h1>
    <p>Two canvases installed from the packed library. Save a board file before hiding its canvas; showing it creates a fresh instance.</p>
    <p>Strict Mode is enabled. Its extra setup and cleanup run in development.</p>
    <div className="example-actions">
      {['A','B'].map(name=><button key={name} data-toggle={name} onClick={()=>setVisible(current=>({...current,[name]:!current[name]}))}>{visible[name]?'Hide':'Show'} canvas {name}</button>)}
      <button data-rerender onClick={()=>setRenders(value=>value+1)}>Update parent</button>
    </div>
    <output className="framework-state" data-renders>Parent updates: {renders}</output>
    <div className="consumers">{['A','B'].map(name=>visible[name]&&<CanvasEmbed key={name} name={name}/>)}</div>
  </main>;
}

createRoot(document.getElementById('app')).render(<StrictMode><App/></StrictMode>);
