'use strict';
// Practical browser checks for the static, offline Cosmos Explorer.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.COSMOS_PLAYWRIGHT_MODULE || 'playwright');

const root = fs.realpathSync(path.resolve(process.cwd(), 'cosmos-explorer'));
const artifactDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cosmos-security-'));
const mime = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff2':'font/woff2' };
function server() {
  return http.createServer((req,res)=>{
    if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{Allow:'GET, HEAD'}).end();return;}
    let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);}catch{res.writeHead(400).end();return;}
    const file=path.resolve(root,pathname.replace(/^\/+/, '')||'index.html');
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    let actual,stat;try{actual=fs.realpathSync(file);stat=fs.statSync(actual);}catch{res.writeHead(404).end();return;}
    if(actual!==root&&!actual.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    if(!stat.isFile()){res.writeHead(404).end();return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(file).toLowerCase()]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    if(req.method==='HEAD')res.end();else fs.createReadStream(actual).pipe(res);
  });
}
const listen=s=>new Promise((resolve,reject)=>{s.once('error',reject);s.listen(0,'127.0.0.1',resolve);});
async function main(){
  const report={task:'SEC-001',timestamp:new Date().toISOString(),cwd:process.cwd(),artifactDir,checks:[],limitations:['Loopback HTTP and file:// do not validate deployed TLS, hosting headers or CDN behavior.','CSP supplied by meta cannot enforce frame-ancestors; deployment must send it as an HTTP header.']};
  let browser,s;
  try{
    browser=await chromium.launch({executablePath:process.env.COSMOS_CHROME||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
    s=server();await listen(s);const url=`http://127.0.0.1:${s.address().port}/`;
    for(const [label,target,offline] of [['loopback',url+'?q=%3Cscript%3Ewindow.__xss=1%3C%2Fscript%3E#%3Cimg%20src=x%20onerror=window.__xss=2%3E',false],['file-offline',pathToFileURL(path.join(root,'index.html')).href+'?q=%3Cscript%3Ewindow.__xss=1%3C%2Fscript%3E#%3Cimg%20src=x%20onerror=window.__xss=2%3E',true]]){
      const context=await browser.newContext({viewport:{width:1440,height:1000},offline});const page=await context.newPage();const errors=[],external=[];
      page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(url))external.push(r.url());});
      await page.goto(target,{waitUntil:offline?'load':'networkidle'});
      assert.equal(await page.locator('#objectName').textContent(),'Sao Thổ');
      assert.equal(await page.evaluate(()=>window.__xss||0),0,'query/hash payload must not execute');
      const policy=await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
      for(const directive of ["default-src 'self'","script-src 'self'","object-src 'none'","base-uri 'none'"])assert(policy.includes(directive),`missing CSP ${directive}`);
      assert.equal(await page.locator('#modeLibrary').count(),1);await page.locator('#modeLibrary').click();
      await page.locator('#libraryQuery').fill('trai dat');assert.equal(await page.locator('.library-card').count(),1);
      await page.locator('#clearLibraryFilters').click();await page.locator('#modeDiagram').click();await page.locator('#objectList [data-object="earth"]').click();
      const source=await page.locator('#sourceLink').getAttribute('href');assert(/^https:\/\//.test(source),'scientific primary source link retained');
      const citations=await page.locator('#sourcePanel a[href^="https://"]').count();assert(citations>0,'profile source citations retained');
      assert.deepEqual(errors,[],`${label} page errors`);assert.deepEqual(external,[],`${label} made external requests`);
      const cspProbe=await page.evaluate(()=>new Promise(resolve=>{let violation=false;addEventListener('securitypolicyviolation',function handler(e){if(e.violatedDirective.startsWith('script-src')){violation=true;removeEventListener('securitypolicyviolation',handler);}}, {once:false});const s=document.createElement('script');s.textContent='window.__inlineCspProbe=1';document.head.append(s);setTimeout(()=>resolve({violation,executed:window.__inlineCspProbe===1}),100);}));
      assert.equal(cspProbe.executed,false,'inline script was executed');assert.equal(cspProbe.violation,true,'inline script CSP violation should be observable');
      report.checks.push(`${label}: enforced CSP blocks inline script; hostile query/hash inert; no external requests; library search and source links work`);
      await page.screenshot({path:path.join(artifactDir,`${label}.png`),fullPage:true});await context.close();
    }
    report.status='passed';
  }catch(error){report.status='failed';report.error={name:error.name,message:error.message,stack:error.stack};throw error;}
  finally{if(browser)await browser.close().catch(()=>{});if(s?.listening)await new Promise(resolve=>s.close(resolve));report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(artifactDir,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
}
main().catch(()=>{process.exitCode=1;});
