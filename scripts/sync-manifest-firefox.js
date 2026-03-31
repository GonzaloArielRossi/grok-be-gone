#!/usr/bin/env node
/**
 * Writes firefox/manifest.json from manifest.json (background.scripts only).
 * Load Temporary Add-on in Firefox by selecting firefox/manifest.json — not the
 * repo-root manifest.json (that one is Chrome MV3: service_worker only).
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

const firefox = { ...m, background: { scripts: [sw] } };
fs.writeFileSync(outPath, `${JSON.stringify(firefox, null, 2)}\n`);
console.log('Wrote firefox/manifest.json');
