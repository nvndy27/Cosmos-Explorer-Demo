// QA-003: exercise browser storage security failures in isolated contexts.
// Playwright and Chrome are supplied outside the application repository.
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.COSMOS_PLAYWRIGHT_MODULE || 'playwright');

const appRoot = fs.realpathSync(path.resolve(process.cwd(), 'cosmos-explorer'));
const htmlFile = path.join(appRoot, 'index.html');
const stamp = new Date().toISOString().replace(/[-:.]/g, '').replace('T', '-').replace('Z', 'Z');
const artifactDir = fs.mkdtempSync(path.join(os.tmpdir(), `cosmos-qa003-${stamp}-`));
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
      res.writeHead(403).end('Forbidden'); return;
    }
    let actual;
    let stat;
    try { actual = fs.realpathSync(filename); stat = fs.statSync(actual); }
    catch { res.writeHead(404).end('Not found'); return; }
    if (actual !== appRoot && !actual.startsWith(appRoot + path.sep)) {
      res.writeHead(403).end('Forbidden'); return;
    }
    if (!stat.isFile()) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, {
      'Content-Type': mime[path.extname(filename).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store'
    });
    if (req.method === 'HEAD') res.end();
    else fs.createReadStream(actual).pipe(res);
  });
}

function storageInitScript(mode) {
  return `(() => {
    const securityError = () => new DOMException('Storage blocked for QA', 'SecurityError');
    const values = new Map();
    const storage = {
      getItem(key) {
        if (${JSON.stringify(mode)} === 'getItem') throw securityError();
        return values.has(String(key)) ? values.get(String(key)) : null;
      },
      setItem(key, value) {
        if (${JSON.stringify(mode)} === 'setItem') throw securityError();
        values.set(String(key), String(value));
      },
      removeItem(key) { values.delete(String(key)); },
      clear() { values.clear(); },
      key(index) { return [...values.keys()][index] ?? null; },
      get length() { return values.size; }
    };
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() { if (${JSON.stringify(mode)} === 'getter') throw securityError(); return storage; }
    });
    const probe = { mode: ${JSON.stringify(mode)}, getter: null, getItem: null, setItem: null };
    try {
      const candidate = window.localStorage;
      probe.getter = 'ok';
      for (const method of ['getItem', 'setItem']) {
        try {
          if (method === 'getItem') candidate.getItem('__qa_probe__');
          else candidate.setItem('__qa_probe__', '1');
          probe[method] = 'ok';
        } catch (error) { probe[method] = error.name; }
      }
    } catch (error) { probe.getter = error.name; }
    window.__cosmosStorageProbe = probe;
  })();`;
}

function assertInjection(probe, mode) {
  assert.equal(probe.mode, mode, 'init script phải chạy trước mã ứng dụng');
  if (mode === 'getter') {
    assert.equal(probe.getter, 'SecurityError', 'getter localStorage phải ném SecurityError');
  } else {
    assert.equal(probe.getter, 'ok', 'getter localStorage phải được cài đặt');
    assert.equal(probe[mode], 'SecurityError', `${mode} phải ném SecurityError`);
  }
}

async function runCase(browser, protocol, mode, baseUrl, report) {
  const name = `${protocol}-${mode}`;
  const result = { name, protocol, storageFailure: mode, status: 'running', assertions: [], pageErrors: [] };
  report.cases.push(result);
  let context;
  try {
    context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: 'reduce',
      offline: protocol === 'file'
    });
    await context.addInitScript({ content: storageInitScript(mode) });
    const page = await context.newPage();
    page.on('pageerror', error => result.pageErrors.push(error.message));
    await page.goto(`${baseUrl}#earth`, { waitUntil: 'networkidle' });

    const probe = await page.evaluate(() => window.__cosmosStorageProbe);
    assertInjection(probe, mode);
    result.assertions.push('init script ran before app and injected SecurityError');
    assert.equal(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), true,
      'context phải bật reduced motion');
    assert.equal(await page.evaluate(() => playing), false, 'hoạt ảnh phải dừng khi khởi động');
    assert.equal(await page.locator('#objectName').textContent(), 'Trái Đất', 'hash #earth phải mở đúng hồ sơ');
    result.assertions.push('reduced motion and #earth startup');

    await page.locator('#objectList [data-object="mars"]').click();
    assert.equal(await page.locator('#objectName').textContent(), 'Sao Hỏa', 'đổi hồ sơ phải hoạt động');
    await page.locator('#favBtn').click();
    assert.deepEqual(await page.evaluate(() => favorites), ['mars'], 'lưu phải cập nhật danh sách trong phiên');
    await page.locator('#objectList [data-object="earth"]').click();
    await page.locator('#favBtn').click();
    assert.deepEqual(await page.evaluate(() => favorites), ['mars', 'earth'], 'lưu hồ sơ thứ hai phải giữ lựa chọn trước');
    await page.locator('#favBtn').click();
    assert.deepEqual(await page.evaluate(() => favorites), ['mars'], 'bỏ lưu phải giữ hồ sơ còn lại');
    assert.equal(await page.locator('#savedCount').textContent(), '1', 'số mục đã lưu phải khớp phiên hiện tại');
    result.assertions.push('profile changes and in-session save/remove with storage blocked');

    await page.locator('#modeLibrary').click();
    await page.locator('#libraryQuery').fill('trai dat');
    assert.equal(await page.locator('.library-card').count(), 1, 'tìm không dấu phải tìm thấy Trái Đất');
    assert.match(await page.locator('.library-card h2').first().textContent(), /Trái Đất/);
    result.assertions.push('library search remains usable');

    const overflow = [];
    for (const width of [390, 820, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      assert.equal(scrollWidth, width, `tràn ngang tại ${width}px: scrollWidth=${scrollWidth}`);
      overflow.push({ viewport: width, scrollWidth });
      await page.screenshot({ path: path.join(artifactDir, `${name}-${width}.png`), fullPage: true });
    }
    result.overflow = overflow;
    result.assertions.push('no horizontal overflow at 390/820/1440px');
    assert.deepEqual(result.pageErrors, [], 'không được có pageerror');
    result.assertions.push('no pageerror');
    result.status = 'passed';
  } catch (error) {
    result.status = 'failed';
    result.error = { name: error.name, message: error.message, stack: error.stack };
    try {
      const pages = context?.pages() || [];
      if (pages[0]) await pages[0].screenshot({ path: path.join(artifactDir, `${name}-failure.png`), fullPage: true });
    } catch (screenshotError) { result.screenshotError = screenshotError.message; }
  } finally {
    if (context) await context.close().catch(error => { result.closeError = error.message; });
  }
  return result;
}

(async () => {
  const report = {
    task: 'QA-003 localStorage SecurityError resilience',
    timestamp: new Date().toISOString(),
    cwd: process.cwd(),
    artifactDir,
    browser: process.env.COSMOS_CHROME || '/usr/bin/google-chrome',
    playwright: process.env.COSMOS_PLAYWRIGHT_MODULE || 'playwright',
    cases: [],
    runtime: { browser: 'not-started', socket: 'not-started' }
  };
  let browser;
  let server;
  try {
    try {
      browser = await chromium.launch({
        executablePath: process.env.COSMOS_CHROME || '/usr/bin/google-chrome',
        headless: true,
        args: ['--no-sandbox']
      });
      report.runtime.browser = 'started';
    } catch (error) {
      report.runtime.browser = 'failed';
      report.runtime.browserError = `${error.name}: ${error.message}`;
      throw error;
    }

    const fileBase = pathToFileURL(htmlFile).href;
    for (const mode of ['getter', 'getItem', 'setItem']) {
      await runCase(browser, 'file', mode, fileBase, report);
    }

    server = createServer();
    let httpBase;
    try {
      await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
      });
      const address = server.address();
      assert(address && typeof address === 'object', 'server phải bind cổng ngẫu nhiên');
      httpBase = `http://127.0.0.1:${address.port}/`;
      report.runtime.socket = 'started';
      report.httpBase = httpBase;
      for (const mode of ['getter', 'getItem', 'setItem']) {
        await runCase(browser, 'http', mode, httpBase, report);
      }
    } catch (error) {
      report.runtime.socket = 'failed';
      report.runtime.socketError = `${error.name}: ${error.message}`;
    }
  } catch (error) {
    report.fatal = { name: error.name, message: error.message };
  } finally {
    if (browser) await browser.close().catch(error => { report.browserCloseError = error.message; });
    if (server?.listening) {
      await new Promise(resolve => server.close(resolve)).catch(error => { report.serverCloseError = error.message; });
    }
    report.finishedAt = new Date().toISOString();
    report.summary = {
      passed: report.cases.filter(test => test.status === 'passed').length,
      failed: report.cases.filter(test => test.status === 'failed').length,
      runtimeIncomplete: report.runtime.browser !== 'started' || report.runtime.socket !== 'started'
    };
    fs.writeFileSync(path.join(artifactDir, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    if (report.summary.failed || report.summary.runtimeIncomplete) process.exitCode = 1;
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
