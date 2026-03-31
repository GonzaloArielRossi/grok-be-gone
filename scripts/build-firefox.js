#!/usr/bin/env node
/**
 * Copies extension assets into firefox/ next to firefox/manifest.json.
 * Run after sync:manifest-firefox. In Firefox: Temporary Add-on → firefox/manifest.json
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const firefoxDir = path.join(root, 'firefox');
const manifestInFirefox = path.join(firefoxDir, 'manifest.json');

if (!fs.existsSync(manifestInFirefox)) {
  console.error(
    'Missing firefox/manifest.json — run: npm run sync:manifest-firefox'
  );
  process.exit(1);
}

for (const name of ['scripts', 'assets']) {
  const dest = path.join(firefoxDir, name);
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true });
  }
  fs.cpSync(path.join(root, name), dest, { recursive: true });
}

for (const file of [
  'grok-be-gone-popup.html',
  'grok-be-gone.css',
  'grok-be-gone-popup.js',
  'grok-be-gone.png'
]) {
  fs.copyFileSync(path.join(root, file), path.join(firefoxDir, file));
}

console.log('Packed firefox/ — load Temporary Add-on: firefox/manifest.json');
