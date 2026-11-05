// Local HTTP QA only. Playwright and Chrome are supplied outside the app repo.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.COSMOS_PLAYWRIGHT_MODULE || 'playwright');

const appRoot = fs.realpathSync(path.resolve(process.cwd(), 'cosmos-explorer'));
const mime = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2'
};

function createServer() {
  return http.createServer((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname); }
    catch { res.writeHead(400).end('Bad request'); return; }
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const filename = path.resolve(appRoot, relative);
    if (filename !== appRoot && !filename.startsWith(appRoot + path.sep)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    let actualFilename;
    let stat;
    try {
      actualFilename = fs.realpathSync(filename);
      stat = fs.statSync(actualFilename);
    } catch { res.writeHead(404).end('Not found'); return; }
    if (actualFilename !== appRoot && !actualFilename.startsWith(appRoot + path.sep)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    if (!stat.isFile()) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, {
      'Content-Type': mime[path.extname(filename).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store'
    });
    if (req.method === 'HEAD') res.end();
    else fs.createReadStream(actualFilename).pipe(res);
  });
}

(async () => {
  let browser;
  let server;
  try {
    server = createServer();
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    assert(address && typeof address === 'object');
    const baseUrl = `http://127.0.0.1:${address.port}/`;
    browser = await chromium.launch({
      executablePath: process.env.COSMOS_CHROME || '/usr/bin/google-chrome',
      headless: true,
      args: ['--no-sandbox']
    });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(baseUrl + '#earth', { waitUntil: 'networkidle' });
    assert.equal(new URL(page.url()).hash, '#earth');
    assert.equal(await page.locator('#objectName').textContent(), 'Trái Đất');

    await page.locator('#modeLibrary').click();
    await page.locator('#libraryQuery').fill('trai dat');
    assert.equal(await page.locator('.library-card').count(), 1, 'Tìm kiếm không dấu phải tìm thấy Trái Đất');
    assert.match(await page.locator('.library-card h2').first().textContent(), /Trái Đất/);
    await page.locator('#clearLibraryFilters').click();

    const viewportResults = [];
    for (const width of [390, 820, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const mode of ['diagram', 'library']) {
        if (mode === 'diagram') await page.locator('#modeDiagram').click();
        else await page.locator('#modeLibrary').click();
        await page.waitForTimeout(100);
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        assert.equal(scrollWidth, width, `${mode}: tràn ngang ở viewport ${width}px (scrollWidth=${scrollWidth})`);
      }
      viewportResults.push(width);
    }

    // Open a real profile hash link in a fresh browser context.
    await page.locator('#modeLibrary').click();
    await page.locator('#collectionToggle').evaluate(element => { element.open = true; });
    const profileLink = page.locator('.collection-links a[href="#earth"]').first();
    await profileLink.waitFor({ state: 'visible' });
    const profileUrl = await profileLink.evaluate(link => link.href);
    const linkedContext = await browser.newContext();
    const linkedPage = await linkedContext.newPage();
    linkedPage.on('pageerror', error => errors.push(error.message));
    await linkedPage.goto(profileUrl, { waitUntil: 'networkidle' });
    assert.equal(new URL(linkedPage.url()).hash, '#earth');
    assert.equal(await linkedPage.locator('#objectName').textContent(), 'Trái Đất');

    assert.deepEqual(errors, [], 'Không được có pageerror');
    console.log(JSON.stringify({
      server: '127.0.0.1 (ephemeral port)',
      checks: ['HTTP startup at #earth', 'library navigation', 'accent-insensitive search', 'no horizontal overflow at 390/820/1440px in diagram and library', 'hash link opened in a new browser context at the correct profile', 'no pageerror'],
      viewports: viewportResults,
      pageErrors: errors,
      limitation: 'HTTP cục bộ không chứng minh HTTPS hoặc hosting thật.'
    }, null, 2));
  } finally {
    if (browser) await browser.close();
    if (server?.listening) await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
