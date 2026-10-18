const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// Setup minimal DOM shims for Node test environment before importing PortalUI
global.window = global;
const storageStore = {};
global.localStorage = {
    getItem: (key) => storageStore[key] ?? null,
    setItem: (key, val) => { storageStore[key] = String(val); },
    removeItem: (key) => { delete storageStore[key]; }
};

function createMockElement(id, initialClasses = []) {
    const classSet = new Set(initialClasses);
    return {
        id,
        className: initialClasses.join(' '),
        textContent: '',
        innerHTML: '',
        style: {},
        classList: {
            contains: (c) => classSet.has(c),
            add: (...classes) => {
                classes.forEach(c => classSet.add(c));
                this.className = Array.from(classSet).join(' ');
            },
            remove: (...classes) => {
                classes.forEach(c => classSet.delete(c));
                this.className = Array.from(classSet).join(' ');
            }
        },
        _classes: classSet
    };
}

let mockElementsMap = {};
let mockScriptElements = [];

global.document = {
    readyState: 'complete',
    getElementById: (id) => mockElementsMap[id] || null,
    querySelectorAll: (sel) => {
        if (sel.includes('script[src*="?v="]')) {
            return mockScriptElements;
        }
        return [];
    },
    addEventListener: () => {},
    createElement: () => ({ getContext: () => null })
};
global.setInterval = () => ({ unref: () => {} });
global.setTimeout = () => ({ unref: () => {} });
global.clearInterval = () => {};
global.sfx = {
    playDerbyHorn: () => {},
    playWinFanfare: () => {}
};

const PortalUI = require('../src/ui/PortalUI.js');
const { getAppClientVersion, showUpdateNotificationModal } = PortalUI;

describe('Update Detection & Version Synchronization (Cache-Busting Integrity)', () => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    const versionPath = path.join(__dirname, '..', 'version.json');
    const portalStorePath = path.join(__dirname, '..', 'src', 'state', 'PortalStore.js');

    const indexHtml = fs.readFileSync(indexPath, 'utf8');
    const versionJson = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
    const portalStoreJs = fs.readFileSync(portalStorePath, 'utf8');

    beforeEach(() => {
        mockElementsMap = {
            'update-modal': createMockElement('update-modal', ['hidden']),
            'update-new-version-tag': createMockElement('update-new-version-tag', []),
            'update-countdown-text': createMockElement('update-countdown-text', []),
            'update-countdown-bar': createMockElement('update-countdown-bar', []),
            'update-floating-bar': createMockElement('update-floating-bar', ['hidden']),
            'update-float-secs': createMockElement('update-float-secs', [])
        };
        mockScriptElements = [
            {
                getAttribute: (attr) => (attr === 'src' ? `src/core/SoundEngine.js?v=${versionJson.version}` : null),
                src: `http://localhost:3000/src/core/SoundEngine.js?v=${versionJson.version}`
            }
        ];
    });

    it('verifies PortalStore.js does not contain hardcoded obsolete BOBLOX_CLIENT_VERSION', () => {
        assert.strictEqual(
            portalStoreJs.includes('BOBLOX_CLIENT_VERSION'),
            false,
            'PortalStore.js must not contain any BOBLOX_CLIENT_VERSION constant'
        );
    });

    it('verifies all modular scripts in index.html share the same ?v= version query parameter matching version.json', () => {
        const scriptMatches = [...indexHtml.matchAll(/<script\s+src="src\/[^"]+\?v=([^"]+)"/g)];
        assert.ok(scriptMatches.length >= 9, 'Must find at least 9 modular scripts with ?v= in index.html');

        const detectedVersions = new Set(scriptMatches.map(m => m[1]));
        assert.strictEqual(
            detectedVersions.size,
            1,
            `All modular scripts must have identical ?v= version, but found: ${[...detectedVersions].join(', ')}`
        );

        const currentHtmlVersion = scriptMatches[0][1];
        assert.strictEqual(
            currentHtmlVersion,
            versionJson.version,
            `index.html script version (?v=${currentHtmlVersion}) must match version.json (${versionJson.version})`
        );
    });

    it('verifies exported getAppClientVersion() reads version dynamically from DOM and returns null on absent scripts', () => {
        // 1. With scripts present
        assert.strictEqual(typeof getAppClientVersion, 'function', 'getAppClientVersion must be exported as a function');
        const ver = getAppClientVersion();
        assert.strictEqual(ver, versionJson.version, 'getAppClientVersion must return the version from the script tag');

        // 2. When no scripts match ?v=, returns null (not a hardcoded stale string)
        const oldScripts = mockScriptElements;
        mockScriptElements = [];
        assert.strictEqual(getAppClientVersion(), null, 'getAppClientVersion must return null when no script tags are present');
        mockScriptElements = oldScripts;
    });

    it('verifies showUpdateNotificationModal does not display modal when version matches current client version', () => {
        const updateModal = mockElementsMap['update-modal'];
        assert.ok(updateModal.classList.contains('hidden'), 'Modal starts hidden');

        // Invoke showUpdateNotificationModal with the exact same version as client
        showUpdateNotificationModal(versionJson.version, 1792368000000, false);

        assert.ok(
            updateModal.classList.contains('hidden'),
            'Modal must remain hidden when updated version matches current client version'
        );
        assert.strictEqual(
            updateModal.classList.contains('flex'),
            false,
            'Modal must not gain .flex class'
        );
    });

    it('verifies no script in src/ contains hardcoded client version declarations (SSOT guardrail)', () => {
        const srcDir = path.join(__dirname, '..', 'src');
        function getAllJsFiles(dir) {
            let files = [];
            const items = fs.readdirSync(dir, { withFileTypes: true });
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                if (item.isDirectory()) {
                    files = files.concat(getAllJsFiles(fullPath));
                } else if (item.isFile() && item.name.endsWith('.js')) {
                    files.push(fullPath);
                }
            }
            return files;
        }

        const jsFiles = getAllJsFiles(srcDir);
        assert.ok(jsFiles.length >= 8, 'Must verify all src/ scripts');

        const forbiddenPattern = /(const|let|var)\s+[A-Za-z0-9_]*VERSION\s*=\s*['"]\d+(\.\d+)*['"]/i;
        for (const filePath of jsFiles) {
            const content = fs.readFileSync(filePath, 'utf8');
            const match = content.match(forbiddenPattern);
            assert.strictEqual(
                match,
                null,
                `File ${path.relative(path.join(__dirname, '..'), filePath)} violates SSOT by defining a hardcoded version constant: "${match?.[0]}"`
            );
        }
    });
});
