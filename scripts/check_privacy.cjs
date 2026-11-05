'use strict';
// Browser checks for device-local favorites deletion. Playwright/Chrome are external.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const os=require('node:os');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require(process.env.COSMOS_PLAYWRIGHT_MODULE||'playwright');
const root=fs.realpathSync(path.resolve(process.cwd(),'cosmos-explorer'));
const artifacts=fs.mkdtempSync(path.join(os.tmpdir(),'cosmos-privacy-'));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff2':'font/woff2'};
function makeServer(){return http.createServer((req,res)=>{if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{Allow:'GET, HEAD'}).end();return}let p;try{p=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname)}catch{res.writeHead(400).end();return}const f=path.resolve(root,p.replace(/^\/+/, '')||'index.html');if(f!==root&&!f.startsWith(root+path.sep)){res.writeHead(403).end();return}let real,st;try{real=fs.realpathSync(f);st=fs.statSync(real)}catch{res.writeHead(404).end();return}if(real!==root&&!real.startsWith(root+path.sep)){res.writeHead(403).end();return}if(!st.isFile()){res.writeHead(404).end();return}res.writeHead(200,{'Content-Type':mime[path.extname(f).toLowerCase()]||'application/octet-stream','Content-Length':st.size,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});if(req.method==='HEAD')res.end();else fs.createReadStream(real).pipe(res)})}
const listen=s=>new Promise((ok,no)=>{s.once('error',no);s.listen(0,'127.0.0.1',ok)});
async function openHelp(page){await page.locator('#helpBtn').click();await page.locator('#clearSavedOnDevice').waitFor({state:'visible'});}
async function run(){
 const report={task:'UX-PRIVACY-001',timestamp:new Date().toISOString(),cwd:process.cwd(),artifactDir:artifacts,checks:[],limitations:['Loopback and file:// tests do not establish behavior on every browser or OS.']};let browser,server;
 try{
  browser=await chromium.launch({executablePath:process.env.COSMOS_CHROME||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
  server=makeServer();await listen(server);const base=`http://127.0.0.1:${server.address().port}/`;
  const context=await browser.newContext({viewport:{width:390,height:900}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'#earth',{waitUntil:'networkidle'});await page.evaluate(()=>{localStorage.setItem('cosmos_favorites',JSON.stringify(['earth','mars']));localStorage.setItem('unrelated_app_key','keep-me')});await page.reload();
  await page.locator('#compareBtn').click();const cancelProfile=await page.locator('#objectName').textContent(),cancelCompare=await page.locator('#multiCompare').textContent();
  // Confirm cancellation leaves stored and visible favorites unchanged.
  await openHelp(page);page.once('dialog',d=>d.dismiss());await page.locator('#clearSavedOnDevice').click();
  assert.deepEqual(await page.evaluate(()=>favorites),['earth','mars']);assert.equal(await page.evaluate(()=>localStorage.getItem('cosmos_favorites')),'["earth","mars"]');assert.equal(await page.locator('#objectName').textContent(),cancelProfile);assert.equal(await page.locator('#multiCompare').textContent(),cancelCompare);
  assert.equal(await page.locator('#uiNotice').getAttribute('role'),'status');assert.match(await page.locator('#uiNotice').textContent(),/Đã hủy/);await page.locator('#closeHelp').click();
  report.checks.push('cancel keeps stored and in-session favorites unchanged');
  await page.locator('#modeDiagram').click();await page.locator('#objectList [data-object="earth"]').click();await page.locator('#favBtn').click();
  await page.locator('#compareBtn').click();const compareBefore=await page.locator('#multiCompare').textContent();
  await openHelp(page);page.once('dialog',d=>d.accept());await page.locator('#clearSavedOnDevice').click();
  assert.deepEqual(await page.evaluate(()=>favorites),[]);assert.equal(await page.evaluate(()=>localStorage.getItem('cosmos_favorites')),null);assert.equal(await page.evaluate(()=>localStorage.getItem('unrelated_app_key')),'keep-me');
  assert.equal(await page.locator('#objectName').textContent(),'Trái Đất');assert.equal(await page.locator('#favBtn').getAttribute('aria-pressed'),'false');assert.equal(await page.locator('#multiCompare').textContent(),compareBefore);
  assert.match(await page.locator('#uiNotice').textContent(),/Đã xóa/);await page.locator('#closeHelp').click();await page.reload();assert.deepEqual(await page.evaluate(()=>favorites),[]);
  report.checks.push('confirm removes only cosmos_favorites, updates current favorite/list state, preserves comparison/profile and remains empty after reload');
  await context.close();

  // Offline file:// with storage shim, including a denied removeItem case.
  const fileUrl=pathToFileURL(path.join(root,'index.html')).href;
  for(const denied of [false,true]){
   const c=await browser.newContext({viewport:{width:390,height:900},offline:true});
   await c.addInitScript(shouldDeny=>{const values=new Map([['cosmos_favorites','["saturn"]'],['unrelated_app_key','keep-me']]);const storage={getItem:k=>values.get(String(k))??null,setItem:(k,v)=>values.set(String(k),String(v)),removeItem(k){if(shouldDeny&&k==='cosmos_favorites')throw new DOMException('blocked','SecurityError');values.delete(String(k))},key:i=>[...values.keys()][i]??null,clear:()=>values.clear(),get length(){return values.size}};Object.defineProperty(window,'localStorage',{configurable:true,get:()=>storage});},denied);
   const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(fileUrl+'#saturn',{waitUntil:'load'});assert.equal(await p.locator('#objectName').textContent(),'Sao Thổ');await openHelp(p);
   const target=await p.locator('#clearSavedOnDevice').evaluate(el=>({fontSize:parseFloat(getComputedStyle(el).fontSize),height:el.getBoundingClientRect().height}));
   assert(target.fontSize>=14,`clear button font must be >=14px at 390px, received ${target.fontSize}`);assert(target.height>=42,`clear button hit target must be >=42px at 390px, received ${target.height}`);
   p.once('dialog',d=>d.accept());await p.locator('#clearSavedOnDevice').click();
   assert.deepEqual(await p.evaluate(()=>favorites),[]);assert.equal(await p.evaluate(()=>localStorage.getItem('unrelated_app_key')),'keep-me');
   if(denied)assert.match(await p.locator('#uiNotice').textContent(),/không thể bảo đảm xóa dữ liệu lưu lâu dài.*cài đặt trình duyệt/i);else assert.match(await p.locator('#uiNotice').textContent(),/Đã xóa/);
   const width=await p.evaluate(()=>document.documentElement.scrollWidth);assert.equal(width,390,'mobile overflow');await p.screenshot({path:path.join(artifacts,`file-${denied?'storage-error':'offline'}-390.png`),fullPage:true});
   await c.close();report.checks.push(`file:// offline 390px ${denied?'removeItem failure falls back to session-only clear and warns':'confirm clears target key and preserves unrelated key'}`);
  }
  assert.deepEqual(errors,[],'pageerror');report.pageErrors=errors;report.status='passed';
 }catch(e){report.status='failed';report.error={name:e.name,message:e.message,stack:e.stack};try{if(browser){const p=browser.contexts().flatMap(c=>c.pages())[0];if(p)await p.screenshot({path:path.join(artifacts,'failure.png'),fullPage:true})}}catch(x){report.screenshotError=x.message}throw e}
 finally{if(browser)await browser.close().catch(()=>{});if(server?.listening)await new Promise(r=>server.close(r));report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(artifacts,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
}
run().catch(()=>{process.exitCode=1});
