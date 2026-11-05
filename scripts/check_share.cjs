'use strict';
// QA-005 share-link checks; Playwright and Chrome are external to the app.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.COSMOS_PLAYWRIGHT_MODULE || 'playwright');

const appRoot = fs.realpathSync(path.resolve(process.cwd(), 'cosmos-explorer'));
const htmlFile = path.join(appRoot, 'index.html');
const artifacts = fs.mkdtempSync(path.join(os.tmpdir(), 'cosmos-qa005-share-'));
const mime = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff2':'font/woff2' };
function createServer() {
  return http.createServer((req,res)=>{
    if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{Allow:'GET, HEAD'}).end();return;}
    let pathname; try{pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);}catch{res.writeHead(400).end('Bad request');return;}
    const filename=path.resolve(appRoot,pathname.replace(/^\/+/, '')||'index.html');
    if(filename!==appRoot&&!filename.startsWith(appRoot+path.sep)){res.writeHead(403).end('Forbidden');return;}
    let actual,stat;try{actual=fs.realpathSync(filename);stat=fs.statSync(actual);}catch{res.writeHead(404).end('Not found');return;}
    if(actual!==appRoot&&!actual.startsWith(appRoot+path.sep)){res.writeHead(403).end('Forbidden');return;}
    if(!stat.isFile()){res.writeHead(404).end('Not found');return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(filename).toLowerCase()]||'application/octet-stream','Content-Length':stat.size,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});
    if(req.method==='HEAD')res.end();else fs.createReadStream(actual).pipe(res);
  });
}
function listen(server){return new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});}
async function shareButton(page){
  const button=page.locator('#copyProfileLink');
  await button.waitFor({state:'visible'});
  await button.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.activeElement?.id),'copyProfileLink','Tab/focus phải tới nút chia sẻ');
  await page.keyboard.press('Enter');
  assert.equal((await page.locator('#uiNotice').textContent()).trim(),'Đã sao chép liên kết hồ sơ.','phải báo đã sao chép qua vùng trạng thái');
}
async function run(){
  const report={task:'QA-005 share links',timestamp:new Date().toISOString(),cwd:process.cwd(),artifactDir:artifacts,selector:'#copyProfileLink',selectorConnection:'Dùng selector đề xuất; nếu implementation đổi selector, coordinator cần nối selector tại helper shareButton.',checks:[],limitation:'Loopback HTTP và file:// offline không kiểm chứng TLS, chứng chỉ hoặc hosting công khai.'};
  let browser,server;
  try{
    browser=await chromium.launch({executablePath:process.env.COSMOS_CHROME||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
    const pageErrors=[];
    const httpContext=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
    const page=await httpContext.newPage();page.on('pageerror',e=>pageErrors.push(e.message));
    server=createServer();await listen(server);const addr=server.address();assert(addr&&typeof addr==='object');
    const base=`http://127.0.0.1:${addr.port}/`;
    await page.goto(base+'?lesson=share#earth',{waitUntil:'networkidle'});
    assert.equal(await page.locator('#objectName').textContent(),'Trái Đất');
    await shareButton(page);
    const copied=await page.evaluate(()=>navigator.clipboard.readText());
    assert.equal(copied,base+'?lesson=share#earth','Clipboard cần giữ query và đúng hash hồ sơ');report.checks.push('localhost Clipboard API retained query and copied the exact #earth URL');

    const linked=await browser.newContext();const linkedPage=await linked.newPage();linkedPage.on('pageerror',e=>pageErrors.push(e.message));
    await linkedPage.goto(copied,{waitUntil:'networkidle'});assert.equal(await linkedPage.locator('#objectName').textContent(),'Trái Đất');
    await linkedPage.goto(base+'#mars',{waitUntil:'networkidle'});assert.equal(await linkedPage.locator('#objectName').textContent(),'Sao Hỏa');
    const unknown=await linked.newPage();unknown.on('pageerror',e=>pageErrors.push(e.message));await unknown.goto(base+'#not-a-cosmos-id',{waitUntil:'networkidle'});
    assert.equal(await unknown.locator('#objectName').textContent(),'Sao Thổ');
    assert.equal(new URL(unknown.url()).hash,'#saturn');report.checks.push('new context links #earth/#mars and unknown hash falls back/canonicalizes to #saturn');
    for(const width of [390,820,1440]){await page.setViewportSize({width,height:900});const sw=await page.evaluate(()=>document.documentElement.scrollWidth);assert.equal(sw,width,`overflow ${width}: ${sw}`);}
    report.checks.push('no horizontal overflow at 390/820/1440');await linked.close();await httpContext.close();

    const fileContext=await browser.newContext({viewport:{width:390,height:900},offline:true});
    await fileContext.addInitScript(()=>{
      Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined});
      const original=document.execCommand.bind(document);window.__qaCopy={calls:[],original};
      document.execCommand=(command)=>{window.__qaCopy.calls.push({command,value:document.activeElement?.value||'',selected:document.activeElement?.value?.slice(document.activeElement.selectionStart,document.activeElement.selectionEnd)||''});return true;};
    });
    const fp=await fileContext.newPage();fp.on('pageerror',e=>pageErrors.push(e.message));
    await fp.goto(pathToFileURL(htmlFile).href+'#mars',{waitUntil:'load'});assert.equal(await fp.locator('#objectName').textContent(),'Sao Hỏa');
    await shareButton(fp);
    const fallback=await fp.evaluate(()=>window.__qaCopy.calls.at(-1));
    assert(fallback&&/copy/i.test(fallback.command),'fallback phải gọi execCommand copy');
    assert.equal(fallback.value,pathToFileURL(htmlFile).href+'#mars','textarea fallback cần URL hồ sơ đang xem');
    assert.equal(fallback.selected,fallback.value,'nội dung URL phải được chọn để sao chép');
    report.checks.push('offline file:// fallback intercepted execCommand and selected exact #mars URL');
    assert.deepEqual(pageErrors,[],'pageerror');report.pageErrors=pageErrors;report.status='passed';
    fs.writeFileSync(path.join(artifacts,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
  }catch(error){report.status='failed';report.error={name:error.name,message:error.message,stack:error.stack};
    try{if(browser){const pages=browser.contexts().flatMap(c=>c.pages());if(pages[0])await pages[0].screenshot({path:path.join(artifacts,'failure.png'),fullPage:true});}}catch(e){report.screenshotError=e.message;}
    fs.writeFileSync(path.join(artifacts,'report.json'),JSON.stringify(report,null,2));console.error(JSON.stringify(report,null,2));throw error;
  }finally{if(browser)await browser.close().catch(()=>{});if(server?.listening)await new Promise(resolve=>server.close(resolve));}
}
run().catch(()=>{process.exitCode=1;});
