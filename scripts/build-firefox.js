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

const SCRIPT_FILES = ['background.js', 'content.js'];

const missing = SCRIPT_FILES.filter(
  (f) => !fs.existsSync(path.join(root, 'scripts', f))
);
if (missing.length) {
  console.error(
    'Missing required extension scripts:\n  ' +
      missing.map((f) => `scripts/${f}`).join('\n  ')
  );
  process.exit(1);
}

const scriptsDir = path.join(firefoxDir, 'scripts');
if (fs.existsSync(scriptsDir)) {
  fs.rmSync(scriptsDir, { recursive: true });
}
fs.mkdirSync(scriptsDir, { recursive: true });
for (const file of SCRIPT_FILES) {
  fs.copyFileSync(path.join(root, 'scripts', file), path.join(scriptsDir, file));
}

const assetsDir = path.join(firefoxDir, 'assets');
if (fs.existsSync(assetsDir)) {
  fs.rmSync(assetsDir, { recursive: true });
}
fs.cpSync(path.join(root, 'assets'), assetsDir, { recursive: true });

for (const file of [
  'grok-be-gone-popup.html',
  'grok-be-gone.css',
  'grok-be-gone-popup.js',
  'grok-be-gone.png'
]) {
  fs.copyFileSync(path.join(root, file), path.join(firefoxDir, file));
}

console.log('Packed firefox/ — load Temporary Add-on: firefox/manifest.json');
