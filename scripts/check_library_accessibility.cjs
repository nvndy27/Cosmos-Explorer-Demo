'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.COSMOS_PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cosmos-library-a11y-'));
  const report = { kind: 'library-keyboard-return', checks: [], viewports: [], artifactDir: dir, realHumanParticipants: 0 };
  const browser = await chromium.launch({ executablePath: process.env.COSMOS_CHROME || '/usr/bin/google-chrome', headless: true, chromiumSandbox: true });
  try {
    for (const width of [390, 820, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, offline: true, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(pathToFileURL(path.resolve('cosmos-explorer/index.html')).href);
      await page.locator('#museumAll').click();
      await page.locator('#libraryQuery').fill('trai dat');
      await page.locator('#libraryQuery').dispatchEvent('input');
      const read = page.locator('.library-card[data-id="earth"] .card-actions button').first();
      for (const close of ['escape', 'button']) {
        await read.focus();
        await read.press('Enter');
        assert.equal(await page.evaluate(() => ExplorerUI.state.reading), true);
        if (close === 'escape') await page.keyboard.press('Escape');
        else await page.locator('#readWide').click();
        await page.locator('#libraryView').waitFor({ state: 'visible' });
        await page.waitForFunction(() => document.activeElement?.matches('.library-card[data-id="earth"] .card-read'));
        assert.equal(await page.evaluate(() => ExplorerUI.state.reading), false);
        assert.equal(await page.locator('#libraryQuery').inputValue(), 'trai dat');
        assert.equal(await read.evaluate(node => node === document.activeElement), true, `${width}: ${close} must restore the invoking card button`);
      }
      report.checks.push(`${width}: Escape and Back restore filtered library and invoking keyboard focus`);
      // Regenerate cards while reading; restoration must find the replacement action.
      await read.focus();
      await read.press('Enter');
      await page.evaluate(() => document.querySelector('#libraryQuery').dispatchEvent(new Event('input')));
      await page.keyboard.press('Escape');
      await page.locator('#libraryView').waitFor({ state: 'visible' });
      await page.waitForFunction(() => document.activeElement?.matches('.library-card[data-id="earth"] .card-read'));
      assert.equal(await read.evaluate(node => node === document.activeElement), true);
      report.checks.push(`${width}: reading return survives card DOM regeneration`);
      await page.locator('#clearLibraryFilters').click();
      await page.locator('#libraryNext').click();
      const pageLabel = await page.locator('#libraryPage').textContent();
      const nextRead = page.locator('.library-card .card-read').first();
      const nextId = await nextRead.evaluate(node => node.closest('.library-card').dataset.id);
      await nextRead.focus(); await nextRead.press('Enter'); await page.keyboard.press('Escape');
      await page.waitForFunction(id => document.activeElement?.closest('.library-card')?.dataset.id === id, nextId);
      assert.equal(await page.locator('#libraryPage').textContent(), pageLabel);
      await page.locator('#collectionToggle > summary').click();
      const link = page.locator('.collection-links a').first();
      await link.focus(); await link.press('Enter'); await page.keyboard.press('Escape');
      await page.waitForFunction(() => document.activeElement?.matches('.collection-links a'));
      assert.equal(await link.evaluate(node => node === document.activeElement), true);
      report.checks.push(`${width}: page and collection-link context survive profile reading`);
      await nextRead.focus(); await nextRead.press('Enter');
      await page.evaluate(() => { const query = document.querySelector('#libraryQuery'); query.value = 'no-such-cosmos-object'; query.dispatchEvent(new Event('input')); });
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => document.activeElement?.id === 'libraryCount');
      assert.equal(await page.locator('.library-card').count(), 0);
      report.checks.push(`${width}: removed invoking card falls back to visible result count`);
      await page.locator('#clearLibraryFilters').click();
      const targets = await page.locator('#clearLibraryFilters,#libraryPrev,#libraryNext,#collectionToggle > summary,.collection-title,.collection-links a,.card-credit summary').evaluateAll(nodes => nodes.filter(node => node.getClientRects().length).map(node => ({ text: node.textContent.trim(), width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height })));
      assert(targets.every(target => target.width >= 44 && target.height >= 44), JSON.stringify(targets.filter(target => target.width < 44 || target.height < 44)));
      await page.locator('#helpBtn').click();
      await page.locator('#helpOverlay .modal').evaluate(node => { node.scrollTop = node.scrollHeight; });
      const closeButton = page.locator('#closeHelp');
      if (width === 390) {
        const closeBox = await closeButton.boundingBox();
        const modalBox = await page.locator('#helpOverlay .modal').boundingBox();
        assert(closeBox.y >= modalBox.y && closeBox.y + closeBox.height <= modalBox.y + modalBox.height, 'Close remains reachable after scrolling help');
        await page.screenshot({ path: path.join(dir, 'help-scrolled-390.png') });
      }
      await closeButton.focus();
      await page.keyboard.press('Shift+Tab');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'gotIt');
      await page.keyboard.press('Escape');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'helpBtn');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
      assert.deepEqual(errors, []);
      await page.screenshot({ path: path.join(dir, `library-${width}.png`), fullPage: true });
      report.checks.push(`${width}: touch targets >=44px, help focus trap/return, no overflow or pageerror`);
      report.viewports.push(width);
      await context.close();
    }
    report.status = 'passed';
  } catch (error) {
    report.status = 'failed'; report.error = error.stack; throw error;
  } finally {
    await browser.close(); fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify(report, null, 2)); console.log(JSON.stringify(report, null, 2));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
