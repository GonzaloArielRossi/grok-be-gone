#!/usr/bin/env node
/**
 * Runs Firefox manifest sync + copy, then zips firefox/ to
 * releases/grok-be-gone-firefox-<version>.zip.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync, execSync } = require('child_process');

const root = path.join(__dirname, '..');
const firefoxDir = path.join(root, 'firefox');
const releasesDir = path.join(root, 'releases');

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

execSync('node scripts/sync-manifest-firefox.js', {
  cwd: root,
  stdio: 'inherit'
});
execSync('node scripts/build-firefox.js', { cwd: root, stdio: 'inherit' });

const manifestPath = path.join(firefoxDir, 'manifest.json');
const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const version = String(m.version ?? '0.0.0').replace(/[/\\]/g, '-');
const outName = `grok-be-gone-firefox-${version}.zip`;
const outZip = path.join(releasesDir, outName);

if (!fs.existsSync(releasesDir)) {
  fs.mkdirSync(releasesDir, { recursive: true });
}

zipDir(firefoxDir, outZip);
console.log(`Firefox release: ${outZip}`);
