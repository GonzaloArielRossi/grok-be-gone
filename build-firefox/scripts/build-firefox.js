#!/usr/bin/env node
/**
 * Packs build-firefox/ with manifest.json using background.scripts (Firefox MV3).
 * Firefox ignores alternate manifest filenames — point Temporary Add-on at
 * build-firefox/manifest.json. Chrome keeps using repo-root manifest.json.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'build-firefox');
const firefoxManifest = path.join(root, 'manifest-firefox.json');

if (!fs.existsSync(firefoxManifest)) {
  console.error('Run: npm run sync:manifest-firefox');
  process.exit(1);
}

if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true });
}
fs.mkdirSync(outDir, { recursive: true });

fs.copyFileSync(firefoxManifest, path.join(outDir, 'manifest.json'));

for (const dir of ['scripts', 'assets']) {
  fs.cpSync(path.join(root, dir), path.join(outDir, dir), { recursive: true });
}

for (const file of [
  'grok-be-gone-popup.html',
  'grok-be-gone.css',
  'grok-be-gone-popup.js',
  'grok-be-gone.png'
]) {
  fs.copyFileSync(path.join(root, file), path.join(outDir, file));
}

console.log('Packed', outDir, '— load build-firefox/manifest.json in Firefox');
