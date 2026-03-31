#!/usr/bin/env node
/**
 * Builds releases/grok-be-gone-chrome-<version>.zip for Chrome Web Store / sideload.
 * Strips browser_specific_settings (Gecko) from manifest.json for a Chrome-only package.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const manifestPath = path.join(root, 'manifest.json');
const releasesDir = path.join(root, 'releases');
const stagingDir = path.join(releasesDir, '.staging-chrome');

const COPY_DIRS = ['assets'];
const SCRIPT_FILES = ['background.js', 'content.js'];
const COPY_FILES = [
  'grok-be-gone-popup.html',
  'grok-be-gone.css',
  'grok-be-gone-popup.js',
  'grok-be-gone.png'
];

function requirePaths() {
  const missing = [];
  for (const name of COPY_DIRS) {
    if (!fs.existsSync(path.join(root, name))) {
      missing.push(name);
    }
  }
  for (const file of SCRIPT_FILES) {
    if (!fs.existsSync(path.join(root, 'scripts', file))) {
      missing.push(`scripts/${file}`);
    }
  }
  for (const file of COPY_FILES) {
    if (!fs.existsSync(path.join(root, file))) {
      missing.push(file);
    }
  }
  if (missing.length) {
    console.error(
      'Missing required paths for Chrome release:\n  ' + missing.join('\n  ')
    );
    process.exit(1);
  }
}

function zipDir(sourceDir, outZip) {
  const absZip = path.resolve(outZip);
  if (fs.existsSync(absZip)) {
    fs.unlinkSync(absZip);
  }
  execFileSync('zip', ['-r', absZip, '.'], {
    cwd: sourceDir,
    stdio: 'inherit'
  });
}

requirePaths();

const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const version = String(m.version ?? '0.0.0').replace(/[/\\]/g, '-');
const outName = `grok-be-gone-chrome-${version}.zip`;
const outZip = path.join(releasesDir, outName);

if (!fs.existsSync(releasesDir)) {
  fs.mkdirSync(releasesDir, { recursive: true });
}
if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true });
}
fs.mkdirSync(stagingDir, { recursive: true });

const chromeManifest = { ...m };
delete chromeManifest.browser_specific_settings;
fs.writeFileSync(
  path.join(stagingDir, 'manifest.json'),
  `${JSON.stringify(chromeManifest, null, 2)}\n`
);

const scriptsStaging = path.join(stagingDir, 'scripts');
fs.mkdirSync(scriptsStaging, { recursive: true });
for (const file of SCRIPT_FILES) {
  fs.copyFileSync(
    path.join(root, 'scripts', file),
    path.join(scriptsStaging, file)
  );
}
for (const name of COPY_DIRS) {
  fs.cpSync(path.join(root, name), path.join(stagingDir, name), {
    recursive: true
  });
}
for (const file of COPY_FILES) {
  fs.copyFileSync(path.join(root, file), path.join(stagingDir, file));
}

zipDir(stagingDir, outZip);
fs.rmSync(stagingDir, { recursive: true });

console.log(`Chrome release: ${outZip}`);
