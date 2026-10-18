const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');

// Browser environment shims
global.window = global;
const storageStore = {};
global.localStorage = {
    getItem: (key) => storageStore[key] ?? null,
    setItem: (key, val) => { storageStore[key] = String(val); },
    removeItem: (key) => { delete storageStore[key]; },
    clear: () => { Object.keys(storageStore).forEach(k => delete storageStore[k]); }
};

function createMockElement(id) {
    return {
        id,
        className: '',
        textContent: '',
        innerHTML: '',
        value: '',
        classList: {
            contains: () => false,
            add: () => {},
            remove: () => {}
        }
    };
}

const elementsMap = {};
global.document = {
    readyState: 'complete',
    getElementById: (id) => elementsMap[id] || null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    createElement: () => ({ getContext: () => null })
};
global.setInterval = () => ({ unref: () => {} });
global.setTimeout = () => ({ unref: () => {} });

// Global app state shims
global.authState = {
    user: { username: 'Vendeez', id: 1, coins: 5000 },
    token: 'local_jwt_1',
    backendConnected: false
};
global.playerState = {
    hp: 100,
    maxHp: 100,
    godmode: false,
    superSpeed: false
};
global.bobuxBalance = 5000;
global.lastClaimTimestamp = 123456789;
global.updateBobuxUI = () => {};
global.updateDailyBonusUI = () => {};
global.showHudToast = () => {};

// Mock local user store
global.getLocalUsersDB = () => [
    { id: 1, username: 'Vendeez', coins: 5000 },
    { id: 2, username: 'NoobPlayer', coins: 250 }
];

const AdminUI = require('../src/ui/AdminUI.js');
const {
    loadAdminUsersList,
    renderAdminUsersList,
    submitAdminGiveCoins,
    submitAdminBroadcast
} = AdminUI;

describe('Seam: Admin Developer Menu Users Tab & Actions', () => {
    let mockUsersList;
    let mockSearchInput;

    beforeEach(() => {
        storageStore['boblox_jwt_token_v2'] = 'test_token_vendeez';
        mockUsersList = createMockElement('admin-users-list');
        mockSearchInput = createMockElement('admin-users-search');
        elementsMap['admin-users-list'] = mockUsersList;
        elementsMap['admin-users-search'] = mockSearchInput;
        global.authState.user = { username: 'Vendeez', id: 1, coins: 5000 };
    });

    it('successfully loads and renders users via apiRequest when available', async () => {
        global.apiRequest = async (path, options) => {
            if (path === '/api/admin/users') {
                return {
                    ok: true,
                    data: {
                        ok: true,
                        users: [
                            { id: 1, username: 'Vendeez', coins: 5000 },
                            { id: 2, username: 'NoobPlayer', coins: 350 }
                        ]
                    }
                };
            }
            return { ok: false, status: 404, data: {} };
        };

        await loadAdminUsersList();

        assert.strictEqual(mockUsersList.innerHTML.includes('Chyba připojení k serveru.'), false);
        assert.ok(mockUsersList.innerHTML.includes('Vendeez'), 'Should render Vendeez');
        assert.ok(mockUsersList.innerHTML.includes('NoobPlayer'), 'Should render NoobPlayer');
        assert.ok(mockUsersList.innerHTML.includes('5\u00A0000 B$') || mockUsersList.innerHTML.includes('5 000 B$') || mockUsersList.innerHTML.includes('5000 B$'), 'Should format Bobux balance');
    });

    it('falls back to local users DB if network fetch fails and avoids "Chyba připojení k serveru."', async () => {
        // Even if apiRequest rejects or fetch fails
        global.apiRequest = async () => {
            throw new Error('Network error');
        };
        global.fetch = async () => {
            throw new Error('Network error');
        };

        await loadAdminUsersList();

        assert.strictEqual(
            mockUsersList.innerHTML.includes('Chyba připojení k serveru.'),
            false,
            'Should gracefully render local users instead of crashing with connection error'
        );
        assert.ok(mockUsersList.innerHTML.includes('Vendeez'));
        assert.ok(mockUsersList.innerHTML.includes('NoobPlayer'));
    });

    it('synthesizes logged-in admin Vendeez profile when local users DB is empty and network fails', async () => {
        global.getLocalUsersDB = () => [];
        global.authState.user = { username: 'Vendeez', id: 99, coins: 7777 };
        global.apiRequest = async () => {
            throw new Error('Offline network error');
        };

        await loadAdminUsersList();

        assert.strictEqual(
            mockUsersList.innerHTML.includes('Chyba připojení k serveru.'),
            false,
            'Should not display server connection error when admin profile can be synthesized'
        );
        assert.ok(mockUsersList.innerHTML.includes('Vendeez'), 'Should render synthesized Vendeez');
        assert.ok(mockUsersList.innerHTML.includes('7\u00A0777 B$') || mockUsersList.innerHTML.includes('7 777 B$') || mockUsersList.innerHTML.includes('7777 B$'), 'Should display Vendeez coins');
    });

    it('uses apiRequest for submitAdminGiveCoins and updates balance cleanly', async () => {
        const calls = [];
        global.apiRequest = async (path, options) => {
            calls.push({ path, body: options?.body });
            return {
                ok: true,
                data: {
                    ok: true,
                    username: 'NoobPlayer',
                    coins: 1250,
                    users: []
                }
            };
        };

        await submitAdminGiveCoins(1000, 'add', 'NoobPlayer');
        const giveCoinsCall = calls.find(c => c.path === '/api/admin/give-coins');
        assert.ok(giveCoinsCall, 'Should have called /api/admin/give-coins');
        assert.strictEqual(giveCoinsCall.body.username, 'NoobPlayer');
        assert.strictEqual(giveCoinsCall.body.amount, 1000);
        assert.strictEqual(giveCoinsCall.body.action, 'add');
    });

    it('uses apiRequest for submitAdminBroadcast', async () => {
        let calledPath = null;
        let calledBody = null;
        const mockBroadcastInput = createMockElement('admin-broadcast-input');
        mockBroadcastInput.value = 'Pozor hráči!';
        elementsMap['admin-broadcast-input'] = mockBroadcastInput;

        global.apiRequest = async (path, options) => {
            calledPath = path;
            calledBody = options.body;
            return {
                ok: true,
                data: {
                    ok: true,
                    message: 'Pozor hráči!'
                }
            };
        };

        await submitAdminBroadcast();
        assert.strictEqual(calledPath, '/api/admin/broadcast');
        assert.strictEqual(calledBody.message, 'Pozor hráči!');
    });
});
