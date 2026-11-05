'use strict';

// Execute only the repository's trusted catalog scripts in an isolated VM.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const inventory = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'cosmos-explorer', 'data', 'catalog-inventory.json'), 'utf8'));

const root = path.resolve(__dirname, '..');
const context = vm.createContext(Object.create(null), { name: 'cosmos-catalog-export' });

try {
  for (const filename of ['cosmos-explorer/catalog.js', 'cosmos-explorer/catalog-expanded.js']) {
    const fullPath = path.join(root, filename);
    const source = fs.readFileSync(fullPath, 'utf8');
    vm.runInContext(source, context, { filename: fullPath, timeout: 30000 });
  }

  const serializedObjects = vm.runInContext('JSON.stringify(data)', context, { timeout: 5000 });
  const objects = JSON.parse(serializedObjects);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'cosmos-explorer/data/image-manifest.json'), 'utf8'));
  if (!Array.isArray(manifest.images) || manifest.images.length !== inventory.expectedImages) {
    throw new Error(`Expected ${inventory.expectedImages} manifest images; got ${manifest.images?.length}`);
  }
  if (!Array.isArray(objects) || objects.length !== inventory.expectedCount) throw new Error(`Expected ${inventory.expectedCount} catalog objects; got ${objects?.length}`);
  if (!Array.isArray(manifest.images)) throw new Error('Image manifest must contain an images array');
  const ids = new Set(objects.map(object => object.id));
  if (ids.size !== objects.length || objects.some(object => typeof object.id !== 'string' || !object.id)) {
    throw new Error('Catalog IDs must be unique non-empty strings');
  }
  for (const id of inventory.baselineIds) if (!ids.has(id)) throw new Error(`Missing baseline catalog ID: ${id}`);
  for (const id of inventory.newIds) if (!ids.has(id)) throw new Error(`Missing Messier expansion ID: ${id}`);
  if (inventory.newIds.length !== 26 || objects.filter(object => !inventory.baselineIds.includes(object.id)).length !== 26) {
    throw new Error('Catalog must contain exactly the 138 baseline IDs plus 26 expected Messier IDs');
  }
  process.stdout.write(JSON.stringify({ objects, images: manifest.images }));
} catch (error) {
  process.stderr.write(`Catalog export failed: ${error.stack || error.message}\n`);
  process.exitCode = 1;
}
