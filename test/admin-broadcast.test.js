const { describe, it, beforeEach, after } = require('node:test');
const assert = require('node:assert');

// Setup minimal browser shims for Node test environment
global.window = global;
global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};

const elementsMap = {};
global.document = {
    readyState: 'complete',
    getElementById: (id) => elementsMap[id] || null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    createElement: () => ({ getContext: () => null })
};
global.setInterval = () => ({ unref: () => {} });

let lastToast = null;
global.showHudToast = (text, theme) => {
    lastToast = { text, theme };
};

let fanfarePlayed = false;
global.sfx = {
    playWinFanfare: () => { fanfarePlayed = true; }
};

const NetworkManager = require('../src/network/NetworkManager.js');
const { handleIncomingAdminBroadcast } = NetworkManager;

describe('Seam 3: WebSocket Admin Broadcast & Notification Reception', () => {
    after(() => {
        if (NetworkManager.mpState && NetworkManager.mpState.bc) {
            NetworkManager.mpState.bc.close();
        }
    });

    beforeEach(() => {
        lastToast = null;
        fanfarePlayed = false;
        elementsMap['admin-broadcast-banner'] = {
            id: 'admin-broadcast-banner',
            textContent: '',
            classList: {
                classes: new Set(['hidden']),
                remove: function(...c) { c.forEach(x => this.classes.delete(x)); },
                add: function(...c) { c.forEach(x => this.classes.add(x)); },
                contains: function(x) { return this.classes.has(x); }
            }
        };
    });

    it('exports handleIncomingAdminBroadcast as a function', () => {
        assert.strictEqual(typeof handleIncomingAdminBroadcast, 'function');
    });

    it('displays golden toast and plays fanfare when admin_broadcast arrives', () => {
        const payload = {
            type: 'admin_broadcast',
            message: 'Server údržba za 10 minut!',
            sender: 'Vendeez'
        };

        handleIncomingAdminBroadcast(payload);

        assert.strictEqual(fanfarePlayed, true);
        assert.ok(lastToast, 'Toast must be triggered');
        assert.strictEqual(lastToast.theme, 'gold', 'Must use golden theme');
        assert.match(lastToast.text, /Server údržba za 10 minut!/);

        const banner = elementsMap['admin-broadcast-banner'];
        assert.strictEqual(banner.classList.contains('hidden'), false);
        assert.match(banner.textContent, /Vendeez/);
        assert.match(banner.textContent, /Server údržba/);
    });

    it('handles missing banner element or sound effects gracefully without error', () => {
        elementsMap['admin-broadcast-banner'] = null;
        const prevSfx = global.sfx;
        delete global.sfx;

        assert.doesNotThrow(() => {
            handleIncomingAdminBroadcast({
                type: 'admin_broadcast',
                message: 'Test bezpečí',
                sender: 'Vendeez'
            });
        });

        assert.strictEqual(lastToast.theme, 'gold');
        global.sfx = prevSfx;
    });
});
