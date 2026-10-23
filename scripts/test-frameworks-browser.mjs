import {prepareFramework,frameworks} from './test-frameworks.mjs';
import {serve} from '../server.mjs';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {readFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
const spaceId=Number(process.env.CANVAS_TEST_SPACE_ID);if(!Number.isSafeInteger(spaceId)||spaceId<1)throw new Error('Supply an existing agent-owned CANVAS_TEST_SPACE_ID.');
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
 const source='const frameworkTest='+JSON.stringify({spaceId,targets,temporary:tmpdir()})+';\n'+await readFile(new URL('../tests/frameworks-browser.mjs',import.meta.url),'utf8');
 const child=spawn('ego-browser',['nodejs','-e',source],{stdio:'inherit'});
 const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',code=>resolve(code??1));});
 if(code!==0)throw new Error('Framework browser checks failed; resume the same test space.');
}finally{
 for(const close of servers.reverse())await close();
 for(const directory of directories)await rm(directory,{recursive:true,force:true});
}
if(blockedWrites)throw new Error('Framework browser attempted writes: '+blockedWrites);
console.log('PASS React/Vue development and production; server writes: 0');
