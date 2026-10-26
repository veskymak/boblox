#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const versionJsonPath = path.join(__dirname, '..', 'version.json');
const indexHtmlPath = path.join(__dirname, '..', 'index.html');

if (!fs.existsSync(versionJsonPath) || !fs.existsSync(indexHtmlPath)) {
    console.error('Error: version.json or index.html not found.');
    process.exit(1);
}

const versionData = JSON.parse(fs.readFileSync(versionJsonPath, 'utf8'));
const currentVersion = versionData.version;

let targetVersion = process.argv[2];

if (!targetVersion) {
    const parts = currentVersion.split('.').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        parts[1] += 1;
        targetVersion = `${parts[0]}.${parts[1]}`;
    } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        parts[2] += 1;
        targetVersion = `${parts[0]}.${parts[1]}.${parts[2]}`;
    } else {
        console.error(`Cannot automatically increment version: "${currentVersion}". Provide target version as argument: node scripts/bump-version.js <version>`);
        process.exit(1);
    }
}

const now = new Date();
versionData.version = targetVersion;
versionData.buildTime = now.getTime();
versionData.updatedAt = now.toISOString();
versionData.title = `Boblox Aktualizace v${targetVersion}`;

if (process.argv[3]) {
    versionData.message = process.argv[3];
}

fs.writeFileSync(versionJsonPath, JSON.stringify(versionData, null, 2) + '\n', 'utf8');

let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
const scriptTagRegex = new RegExp(`(\\?v=)${currentVersion.replace(/\./g, '\\.')}`, 'g');
indexHtml = indexHtml.replace(scriptTagRegex, `$1${targetVersion}`);

fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');

console.log(`[bump-version] Version bumped: v${currentVersion} -> v${targetVersion}`);
console.log(`[bump-version] Updated version.json and index.html successfully.`);
