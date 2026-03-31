#!/usr/bin/env node
/**
 * Creates Chrome and Firefox zip releases under releases/.
 */
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');

execFileSync(process.execPath, ['scripts/release-chrome.js'], { cwd: root, stdio: 'inherit' });
execFileSync(process.execPath, ['scripts/release-firefox.js'], { cwd: root, stdio: 'inherit' });
console.log('All releases built under releases/');
