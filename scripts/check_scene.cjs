'use strict';
// User workflows and rendering lifecycle; no fixed screenshot pixel snapshots.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.COSMOS_PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cosmos-scene-'));
  const report = { kind: 'illustrative-planet-scene', artifactDir: dir, checks: [], viewports: [], realHumanParticipants: 0 };
  const browser = await chromium.launch({ executablePath: process.env.COSMOS_CHROME || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
  try {
    for (const width of [390, 820, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, offline: true, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(pathToFileURL(path.resolve('cosmos-explorer/index.html')).href + '#earth');
      await page.locator('#diagramView').waitFor({ state: 'visible' });
      await page.waitForFunction(() => overviewHits.length === 8);
      assert.equal(await page.evaluate(() => playing), false);
      assert.match(await page.locator('#scaleLabel').textContent(), /minh họa/);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
      assert.equal(await page.locator('#sceneTargets [data-scene]').count(), 8);
      // Track paints, not RAF callbacks: paused and hidden modes must not redraw.
      await page.evaluate(() => {
        window.scenePaints = 0;
        const original = drawOverview;
        drawOverview = function () { window.scenePaints++; return original(); };
      });
      for (const id of ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']) {
        // Labels are also keyboard targets; Enter must open the actual profile.
        const button = page.locator(`#sceneTargets [data-scene="${id}"]`);
        await button.focus();
        await button.press('Enter');
        await page.waitForFunction(selected => current === selected && document.querySelector(`#sceneTargets [data-scene="${selected}"]`)?.getAttribute('aria-pressed') === 'true', id);
        assert.equal(await page.evaluate(() => location.hash), '#' + id);
        assert.equal(await button.getAttribute('aria-pressed'), 'true');
      }
      report.checks.push(`${width}: eight keyboard targets select real profiles`);
      await page.locator('#sceneTargets [data-scene="earth"]').focus();
      await page.keyboard.press('Enter');
      const dimensions = await page.evaluate(() => ({ width: W, height: H, earth: overviewHits.find(hit => hit.id === 'earth') }));
      assert(dimensions.earth.r < Math.min(dimensions.width, dimensions.height) * .08, JSON.stringify(dimensions));
      assert.equal(await page.locator('#sceneTargets [data-scene]').count(), 8);
      await page.locator('#zoomIn').click();
      await page.waitForFunction(() => zoom > 1);
      await page.locator('#resetView').click();
      await page.waitForFunction(() => zoom === 1 && dragX === 0 && dragY === 0);
      // Wait for a settled frame, then observe across an interval without changing state.
      await page.waitForFunction(() => lastRenderKey === [current, W, H, dragX, dragY, zoom].join('|'));
      const paused = await page.evaluate(() => window.scenePaints);
      await page.waitForTimeout(160);
      assert.equal(await page.evaluate(() => window.scenePaints), paused);
      await page.locator('#playBtn').click();
      await page.waitForFunction(before => window.scenePaints > before + 2, paused);
      await page.locator('#playBtn').click();
      assert.equal(await page.evaluate(() => playing), false);
      report.checks.push(`${width}: Earth stays small, zoom/reset and pause/play work`);
      await page.locator('#spaceWrap').screenshot({ path: path.join(dir, `diagram-${width}.png`) });
      await page.locator('#planetArtToggle').click();
      assert.equal(await page.locator('#planetArtToggle').getAttribute('aria-pressed'), 'true');
      await page.locator('#planetArtCaption').waitFor({ state: 'visible' });
      assert.match(await page.locator('#planetArtCaption').textContent(), /không phải ảnh quan sát/);
      assert.equal(await page.locator('#objectImage').isVisible(), false);
      await page.locator('#details').screenshot({ path: path.join(dir, `illustration-${width}.png`) });
      await page.locator('#planetArtToggle').click();
      assert.equal(await page.locator('#planetArtToggle').getAttribute('aria-pressed'), 'false');
      assert.equal(await page.locator('#objectImage').isVisible(), true);
      await page.locator('#planetArtToggle').click();
      await page.locator('#sceneTargets [data-scene="mars"]').focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('#planetArtToggle').getAttribute('aria-pressed'), 'false');
      report.checks.push(`${width}: explicit profile illustration preserves original photo and resets on selection`);
      await page.locator('#modeLibrary').click();
      await page.locator('#libraryView').waitFor({ state: 'visible' });
      const offscreen = await page.evaluate(() => window.scenePaints);
      await page.waitForTimeout(160);
      assert.equal(await page.evaluate(() => window.scenePaints), offscreen);
      assert.deepEqual(errors, []);
      report.viewports.push({ width, pageErrors: errors, earthRadius: dimensions.earth.r });
      await context.close();
    }
    report.status = 'passed';
  } catch (error) {
    report.status = 'failed';
    report.error = error.stack;
    throw error;
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
