import {prepareFramework,frameworks} from './test-frameworks.mjs';
import {serve} from '../server.mjs';
import {createRequire} from 'node:module';
import {readFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {browserSpaceId,runBrowserSuite} from './browser-driver.mjs';
const spaceId=browserSpaceId();
const supplied=process.env.CANVAS_FRAMEWORK_FIXTURES?JSON.parse(await readFile(process.env.CANVAS_FRAMEWORK_FIXTURES,'utf8')):null;
const directories=[],servers=[],targets=[];let blockedWrites=0;
try{
 for(const framework of frameworks){
  const directory=supplied?.find(item=>item.framework===framework)?.directory||await prepareFramework(framework);
  if(!supplied?.some(item=>item.framework===framework))directories.push(directory);
  const provenance=JSON.parse(await readFile(join(directory,'INSTALL-PROVENANCE.json'),'utf8'));if(provenance.framework!==framework)throw new Error('Wrong prepared fixture.');
  const require=createRequire(join(directory,'package.json'));
  const {createServer}=await import(pathToFileURL(require.resolve('vite')).href);
  const development=await createServer({root:directory,mode:'development',server:{host:'127.0.0.1',port:0,strictPort:true,cors:false,fs:{strict:true,allow:[directory]}},plugins:[{name:'read-only-browser-fixture',configureServer(server){server.middlewares.use((request,response,next)=>{if(!['GET','HEAD'].includes(request.method)){blockedWrites++;response.writeHead(405);response.end();}else next();});}}]});
  servers.push(()=>development.close());await development.listen();
  targets.push({framework,mode:'development',base:'http://127.0.0.1:'+development.httpServer.address().port});
  const production=await serve(join(directory,'dist'));servers.push(async()=>{blockedWrites+=production.writes;await production.close();});
  targets.push({framework,mode:'production',base:production.url});
 }
 const code=await runBrowserSuite({suite:'frameworks-browser.mjs',name:'frameworkTest',config:{spaceId,targets,temporary:tmpdir()}});
 if(code!==0)throw new Error('Framework browser checks failed'+(spaceId?'; resume the same test space.':'.'));
}finally{
 for(const close of servers.reverse())await close();
 for(const directory of directories)await rm(directory,{recursive:true,force:true});
}
if(blockedWrites)throw new Error('Framework browser attempted writes: '+blockedWrites);
console.log('PASS React/Vue development and production; server writes: 0');
