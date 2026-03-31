#!/usr/bin/env node
/**
 * Writes manifest-firefox.json from manifest.json (Firefox MV3 uses
 * background.scripts; Chrome rejects scripts in MV3 — keep one canonical manifest).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const manifestPath = path.join(root, 'manifest.json');
const outPath = path.join(root, 'manifest-firefox.json');

const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const sw = m.background?.service_worker;
if (!sw || typeof sw !== 'string') {
  console.error(
    'manifest.json must set background.service_worker to a string path'
  );
  process.exit(1);
}

const firefox = { ...m, background: { scripts: [sw] } };
fs.writeFileSync(outPath, `${JSON.stringify(firefox, null, 2)}\n`);
console.log('Wrote manifest-firefox.json');
