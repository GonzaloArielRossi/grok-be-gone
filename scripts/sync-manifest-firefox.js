#!/usr/bin/env node
/**
 * Writes firefox/manifest.json from manifest.json (same content).
 * Chrome uses background.service_worker; Firefox uses background.scripts (MV3).
 * Root manifest lists both per MDN cross-browser guidance.
 * Load Temporary Add-on in Firefox: firefox/manifest.json
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const manifestPath = path.join(root, 'manifest.json');
const firefoxDir = path.join(root, 'firefox');
const outPath = path.join(firefoxDir, 'manifest.json');

const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const sw = m.background?.service_worker;
if (!sw || typeof sw !== 'string') {
  console.error(
    'manifest.json must set background.service_worker to a string path'
  );
  process.exit(1);
}

if (!fs.existsSync(firefoxDir)) {
  fs.mkdirSync(firefoxDir, { recursive: true });
}

fs.writeFileSync(outPath, `${JSON.stringify(m, null, 2)}\n`);
console.log('Wrote firefox/manifest.json');
