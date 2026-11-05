'use strict';

// Execute only the repository's trusted catalog scripts in an isolated VM.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

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
  if (!Array.isArray(objects) || objects.length !== 138) throw new Error(`Expected 138 catalog objects; got ${objects?.length}`);
  if (!Array.isArray(manifest.images)) throw new Error('Image manifest must contain an images array');
  const ids = new Set(objects.map(object => object.id));
  if (ids.size !== objects.length || objects.some(object => typeof object.id !== 'string' || !object.id)) {
    throw new Error('Catalog IDs must be unique non-empty strings');
  }
  process.stdout.write(JSON.stringify({ objects, images: manifest.images }));
} catch (error) {
  process.stderr.write(`Catalog export failed: ${error.stack || error.message}\n`);
  process.exitCode = 1;
}
