#!/usr/bin/env node
/**
 * Creates Chrome and Firefox zip releases under releases/.
 */
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');

execSync('node scripts/release-chrome.js', { cwd: root, stdio: 'inherit' });
execSync('node scripts/release-firefox.js', { cwd: root, stdio: 'inherit' });
console.log('All releases built under releases/');
