// Local HTTP/HTTPS QA. Playwright and Chrome are supplied outside the app repo.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const https = require('node:https');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { chromium } = require(process.env.COSMOS_PLAYWRIGHT_MODULE || 'playwright');

const appRoot = fs.realpathSync(path.resolve(process.cwd(), 'cosmos-explorer'));
const mime = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2'
};
const mount = '/cosmos/';

function createServer(protocol, tls) {
  const handler = (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return;
    }
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname); }
    catch { res.writeHead(400).end('Bad request'); return; }
    let relative;
    if (pathname === '/') relative = 'index.html';
    else if (pathname.startsWith(mount)) relative = pathname.slice(mount.length) || 'index.html';
    else relative = pathname.replace(/^\/+/, '');
    const filename = path.resolve(appRoot, relative);
    if (filename !== appRoot && !filename.startsWith(appRoot + path.sep)) { res.writeHead(403).end('Forbidden'); return; }
    let actualFilename, stat;
    try { actualFilename = fs.realpathSync(filename); stat = fs.statSync(actualFilename); }
    catch { res.writeHead(404).end('Not found'); return; }
    if (actualFilename !== appRoot && !actualFilename.startsWith(appRoot + path.sep)) { res.writeHead(403).end('Forbidden'); return; }
    if (!stat.isFile()) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(filename).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' });
    if (req.method === 'HEAD') res.end(); else fs.createReadStream(actualFilename).pipe(res);
  };
  return protocol === 'https' ? https.createServer(tls, handler) : http.createServer(handler);
}

function listen(server) {
  return new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
}
async function exercise(browser, baseUrl, prefix = mount, contextOptions = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ...contextOptions });
  const errors = [], failedAssets = [];
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('requestfailed', r => { if (new URL(r.url()).origin === new URL(baseUrl).origin) failedAssets.push(`${r.url()}: ${r.failure()?.errorText}`); });
  page.on('response', r => {
    const u = new URL(r.url()), origin = new URL(baseUrl).origin;
    const internalAsset = u.origin === origin && /\.(?:js|css|json|svg|webp|png|jpe?g|woff2)$/i.test(u.pathname);
    if (internalAsset && r.status() >= 400) failedAssets.push(`${r.url()}: HTTP ${r.status()}`);
  });
  const response = await page.goto(baseUrl + prefix + '#earth', { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200);
  assert.equal(await page.locator('#objectName').textContent(), 'Trái Đất');
  const assets = await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource');
    const images = [...document.images].map(i => ({ src: i.currentSrc, ok: i.complete && i.naturalWidth > 0 }));
    return { js: resources.some(x => x.name.endsWith('/app.js')),
      css: resources.some(x => x.name.endsWith('/styles.css')),
      images, imageSrc: document.querySelector('#objectImage')?.currentSrc || '' };
  });
  assert(assets.js && assets.css, 'JS/CSS không được tải qua mount /cosmos/');
  assert(assets.imageSrc.includes(prefix), 'Ảnh hồ sơ không dùng tiền tố URL mong đợi');
  assert(assets.images.some(x => x.ok), 'Không có ảnh đang dùng nào tải/giải mã được');
  assert(assets.images.filter(x => x.src === assets.imageSrc).every(x => x.ok), 'Ảnh hồ sơ không giải mã được');
  const imageResponse = await context.request.get(assets.imageSrc);
  assert.equal(imageResponse.status(), 200);
  assert.match(imageResponse.headers()['content-type'], /^image\//);
  const jsResponse = await context.request.get(baseUrl + prefix + 'app.js');
  const cssResponse = await context.request.get(baseUrl + prefix + 'styles.css');
  assert.equal(jsResponse.status(), 200); assert.match(jsResponse.headers()['content-type'], /^text\/javascript/);
  assert.equal(cssResponse.status(), 200); assert.match(cssResponse.headers()['content-type'], /^text\/css/);
  await page.locator('#modeLibrary').click();
  await page.locator('#libraryQuery').fill('trai dat');
  assert.equal(await page.locator('.library-card').count(), 1);
  assert.match(await page.locator('.library-card h2').first().textContent(), /Trái Đất/);
  await page.locator('#clearLibraryFilters').click();
  const viewports = [];
  for (const width of [390, 820, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const mode of ['diagram', 'library']) {
      await page.locator(mode === 'diagram' ? '#modeDiagram' : '#modeLibrary').click();
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      assert.equal(scrollWidth, width, `${mode} overflow at ${width}px`);
    }
    viewports.push(width);
  }
  const linkContext = await browser.newContext(contextOptions);
  const linkPage = await linkContext.newPage(); linkPage.on('pageerror', e => errors.push(e.message));
  for (const [id, name] of [['earth', 'Trái Đất'], ['mars', 'Sao Hỏa']]) {
    await linkPage.goto(baseUrl + prefix + '#' + id, { waitUntil: 'networkidle' });
    assert.equal(new URL(linkPage.url()).hash, '#' + id);
    assert.equal(await linkPage.locator('#objectName').textContent(), name);
  }
  assert.deepEqual(errors, [], 'pageerror');
  assert.deepEqual(failedAssets, [], 'Lỗi tải asset nội bộ');
  await linkContext.close(); await context.close();
  return { viewports, pageErrors: errors, failedAssets, assets: { js: true, css: true, imageMime: imageResponse.headers()['content-type'] } };
}

(async () => {
  let browser, httpServer, httpsServer, tempDir;
  try {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cosmos-qa004-'));
    const keyPath = path.join(tempDir, 'key.pem'), certPath = path.join(tempDir, 'cert.pem');
    const openssl = spawnSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', keyPath,
      '-out', certPath, '-days', '1', '-subj', '/CN=127.0.0.1', '-addext', 'subjectAltName=IP:127.0.0.1'],
      { encoding: 'utf8', timeout: 30000 });
    if (openssl.error || openssl.status !== 0) throw new Error(`Không tạo được chứng chỉ tạm bằng openssl: ${openssl.error?.message || openssl.stderr || `exit ${openssl.status}`}`);
    const tls = { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) };
    httpServer = createServer('http'); httpsServer = createServer('https', tls);
    await listen(httpServer); await listen(httpsServer);
    browser = await chromium.launch({ executablePath: process.env.COSMOS_CHROME || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
    const httpUrl = `http://127.0.0.1:${httpServer.address().port}`;
    const httpsUrl = `https://127.0.0.1:${httpsServer.address().port}`;
    const httpRoot = await exercise(browser, `http://127.0.0.1:${httpServer.address().port}`, '/', {});
    const httpMount = await exercise(browser, httpUrl, mount, {});
    const httpsMount = await exercise(browser, httpsUrl, mount, { ignoreHTTPSErrors: true });
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), servers: ['HTTP root', 'HTTP /cosmos/', 'HTTPS /cosmos/'], httpRoot, httpMount, httpsMount,
      limitation: 'HTTPS dùng chứng chỉ self-signed và ignoreHTTPSErrors chỉ trong context HTTPS này; không kiểm chứng TLS trust hoặc public hosting.' }, null, 2));
  } finally {
    if (browser) await browser.close();
    for (const server of [httpServer, httpsServer]) if (server?.listening) await new Promise(resolve => server.close(resolve));
    if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
