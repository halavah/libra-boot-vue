import http from 'node:http';import {readFile,lstat,realpath} from 'node:fs/promises';import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
export const root=fileURLToPath(new URL('../',import.meta.url));
const top=new Set(['index.html','runtime','catalog','examples','public','README.md','README_EN.md','THIRD_PARTY_NOTICES.md']);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.vue':'text/plain; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.eot':'application/vnd.ms-fontobject','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8'};
export async function resolveStaticPath(raw,base=root){
 const encoded=raw.split('?')[0];if(/%2f|%5c|%00|%25/i.test(encoded))throw new Error('forbidden');
 let decoded;try{decoded=decodeURIComponent(encoded)}catch{throw new Error('forbidden')}
 if(decoded.includes('\\')||decoded.includes('\0')||decoded.split('/').some(x=>x==='.'||x==='..'||x.startsWith('.')))throw new Error('forbidden');
 const relative=decoded==='/'?'index.html':decoded.replace(/^\//,'').replace(/\/$/,'/index.html');
 if(!top.has(relative.split('/')[0]))throw new Error('forbidden');
 const parts=relative.split('/');let current=base;
 for(const part of parts){if(!part)throw new Error('forbidden');current=path.join(current,part);if((await lstat(current)).isSymbolicLink())throw new Error('forbidden')}
 const final=await realpath(current),realBase=await realpath(base);if(!final.startsWith(realBase+path.sep)||!(await lstat(final)).isFile())throw new Error('forbidden');return final;
}
export function createStaticServer(base=root){return http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Cache-Control','no-store');
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'");
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end('Method not allowed');return}
 try{const file=await resolveStaticPath(req.url,base);res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');const data=await readFile(file);res.setHeader('Content-Length',data.length);res.writeHead(200);res.end(req.method==='HEAD'?undefined:data)}catch(error){res.writeHead(error.message==='forbidden'?403:404);res.end('File unavailable')}
})}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url){const index=process.argv.indexOf('--port');const port=index<0?8080:Number(process.argv[index+1]);if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Use a port between 1024 and 65535.');const server=createStaticServer();server.on('error',()=>{console.error('Cannot start local server. Check the port and directory permissions.');process.exitCode=1});server.listen(port,'127.0.0.1',()=>console.log(`Open http://127.0.0.1:${port}/`))}
