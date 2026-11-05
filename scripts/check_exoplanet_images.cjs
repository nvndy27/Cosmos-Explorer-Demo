// Optional QA: external Playwright and system Chrome, no app dependencies.
const {chromium}=require(process.env.COSMOS_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.COSMOS_CHROME||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
 try{
  const context=await browser.newContext({offline:true,viewport:{width:1440,height:1000}}),p=await context.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto('file://'+path.resolve('cosmos-explorer/index.html')+'#exo-kepler-22-b');
  const exos=await p.evaluate(()=>data.filter(o=>o.classification==='exoplanet').map(o=>({id:o.id,kind:o.imageKind,scope:o.imageScope})));
  assert.equal(exos.length,37);
  for(const o of exos){
   await p.evaluate(id=>select(id),o.id);
   await p.waitForFunction(()=>{const i=document.querySelector('#objectImage');return i.complete&&i.naturalWidth>0&&i.style.opacity==='1'});
   assert.match(await p.locator('#dataTypeBadge').textContent(),o.kind==='illustration'?/minh họa/:/quan sát/);
   assert.match(await p.locator('.photo-corner').textContent(),o.kind==='illustration'?/Minh họa/:/quan sát/);
   if(o.scope==='generic')assert.match(await p.locator('#photoCaption').textContent(),/đại diện chung/);
  }
  const out=process.env.COSMOS_QA_OUTPUT?path.resolve(process.env.COSMOS_QA_OUTPUT):fs.mkdtempSync(path.join(os.tmpdir(),'cosmos-exoplanet-qa-'));fs.mkdirSync(out,{recursive:true});
  for(const width of [390,820,1440]){
   await p.setViewportSize({width,height:1000});await p.evaluate(()=>{ExplorerUI.setMode('diagram');select('exo-kepler-22-b')});
   await p.waitForFunction(()=>document.querySelector('#objectImage').naturalWidth>0&&document.querySelector('#objectImage').style.opacity==='1');
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth),width);
   await p.locator('#details').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,'kepler-'+width+'.png'),fullPage:true});
   await p.locator('#modeLibrary').click();await p.locator('#clearLibraryFilters').click();await p.selectOption('#libraryType','exoplanet');
   assert.match(await p.locator('#libraryCount').textContent(),/^37 hồ sơ/);
   await p.locator('#libraryQuery').fill('Kepler');assert.equal(await p.locator('.library-card').count(),2);
   for(const img of await p.locator('.library-card img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode())}
   assert.equal(await p.locator('.visual-label').filter({hasText:'Minh họa nghệ thuật'}).count(),2);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth),width);
   await p.screenshot({path:path.join(out,'library-kepler-'+width+'.png'),fullPage:true});
   await p.locator('#libraryObserved').check();assert.equal(await p.locator('.library-card').count(),0);
   await p.locator('#libraryQuery').fill('');assert.equal(await p.locator('.library-card').count(),1);
   assert.match(await p.locator('.library-card h2').textContent(),/Pic/);
  }
  // Real failure of an illustration must switch attribution to the app fallback.
  await p.evaluate(()=>{ExplorerUI.setMode('diagram');select('exo-kepler-16-b');document.querySelector('#objectImage').src='assets/illustrations/missing.webp'});
  await p.waitForFunction(()=>document.querySelector('#objectImage').classList.contains('broken'));
  assert.equal(await p.locator('#dataTypeBadge').textContent(),'Minh họa đồ họa');
  assert.match(await p.locator('#photoCaption').textContent(),/Cosmos Explorer/);
  assert.deepEqual(errors,[]);
  const report={date:new Date().toISOString(),outputDirectory:out,profiles:37,artwork:exos.filter(o=>o.kind==='illustration').length,generic:exos.filter(o=>o.scope==='generic').length,observations:exos.filter(o=>o.kind==='observation').length,viewports:[390,820,1440],checks:['fresh offline file context','all 37 profile images decoded and labelled','Kepler library images and artwork labels','generic illustration disclosure','observed-only filter excludes all art','real missing artwork fallback','no horizontal page overflow'],errors};
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
