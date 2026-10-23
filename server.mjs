import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
export async function serve(root,port=0){
 const requests=[],mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.txt':'text/plain'};let writes=0;
 const server=createServer(async(req,res)=>{res.setHeader('Cache-Control','no-store');if(!['GET','HEAD'].includes(req.method)){writes++;res.writeHead(405);res.end();return;}let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}requests.push(pathname);const path=resolve(root,'.'+pathname,pathname.endsWith('/')?'index.html':'');if(!path.startsWith(resolve(root)+sep)){res.writeHead(403);res.end();return;}try{const data=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]??'application/octet-stream'});res.end(req.method==='HEAD'?undefined:data);}catch{res.writeHead(404);res.end();}});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});return {url:'http://127.0.0.1:'+server.address().port,requests,get writes(){return writes;},close:()=>new Promise(resolve=>{server.closeAllConnections();server.close(resolve);})};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const fixture=await serve(fileURLToPath(new URL('.',import.meta.url)),Number(process.env.PORT??8000));console.log(fixture.url);process.once('SIGINT',async()=>{await fixture.close();});process.once('SIGTERM',async()=>{await fixture.close();});}
