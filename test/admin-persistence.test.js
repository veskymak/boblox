const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');

// Browser environment shims
global.window = global;
global.window.addEventListener = () => {};
const storageStore = {};
global.localStorage = {
    getItem: (key) => storageStore[key] ?? null,
    setItem: (key, val) => { storageStore[key] = String(val); },
    removeItem: (key) => { delete storageStore[key]; },
    clear: () => { Object.keys(storageStore).forEach(k => delete storageStore[k]); }
};

global.document = {
    readyState: 'complete',
    getElementById: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    createElement: () => ({ getContext: () => null })
};
global.setInterval = () => ({ unref: () => {} });
global.setTimeout = () => ({ unref: () => {} });

// Global state shims
global.STORAGE_KEYS = Object.freeze({
    BOBUX: 'boblox_bobux_balance_v1',
    USER_CACHE: 'boblox_auth_user_cache',
    LOCAL_USERS: 'boblox_local_db_users_v2',
    CLOUD_USERS: 'boblox_cloud_users_cache_v2'
});
global.authState = {
    user: { id: 1, username: 'Vendeez', coins: 250 },
    token: 'local_jwt_1',
    backendConnected: false
};
global.bobuxBalance = 250;
global.updateNickname = () => {};
global.updateBobuxUI = () => {};
global.updateAuthUI = () => {};
global.updateDailyBonusUI = () => {};
global.showHudToast = () => {};

const AdminUI = require('../src/ui/AdminUI.js');
const PortalStore = require('../src/state/PortalStore.js');

describe('Seam 1: Bobux balance persistence across session reload', () => {
    beforeEach(() => {
        global.localStorage.clear();
        global.authState.user = { id: 1, username: 'Vendeez', coins: 250 };
        global.bobuxBalance = 250;
        // User logged in earlier -> cached in localStorage
        global.localStorage.setItem(global.STORAGE_KEYS.USER_CACHE, JSON.stringify(global.authState.user));
        global.localStorage.setItem(global.STORAGE_KEYS.BOBUX, '250');
    });

    it('submitAdminGiveCoins updates USER_CACHE in localStorage and preserves balance on reload', async () => {
        global.apiRequest = async (path, options) => {
            if (path === '/api/admin/give-coins') {
                return {
                    ok: true,
                    data: {
                        ok: true,
                        username: 'Vendeez',
                        coins: 50000,
                        action: 'set'
                    }
                };
            }
            return { ok: false };
        };

        // Admin sets coins to 50000
        await AdminUI.submitAdminGiveCoins(50000, 'set', 'Vendeez');

        // Verify runtime state
        assert.strictEqual(global.bobuxBalance, 50000, 'bobuxBalance should be updated');
        assert.strictEqual(global.authState.user.coins, 50000, 'authState.user.coins should be updated');

        // Verify USER_CACHE in localStorage was updated so reload does not revert
        const cachedUserRaw = global.localStorage.getItem(global.STORAGE_KEYS.USER_CACHE);
        assert.ok(cachedUserRaw, 'USER_CACHE must exist in localStorage');
        const cachedUser = JSON.parse(cachedUserRaw);
        assert.strictEqual(cachedUser.coins, 50000, 'USER_CACHE coins must be updated to 50000');

        // Simulate page reload: initAuthSession restoring from USER_CACHE via applyAuthenticatedUser
        PortalStore.applyAuthenticatedUser(cachedUser);
        assert.strictEqual(global.bobuxBalance, 50000, 'bobuxBalance must remain 50000 after restoring session');
        assert.strictEqual(global.localStorage.getItem(global.STORAGE_KEYS.BOBUX), '50000');
    });
});

describe('Seam 2: Offline fallback local DB persistence for admin coin modification', () => {
    beforeEach(() => {
        global.localStorage.clear();
        global.authState.user = { id: 1, username: 'Vendeez', coins: 100 };
        global.authState.token = 'local_jwt_1';
        global.bobuxBalance = 100;
        global.localStorage.setItem(global.STORAGE_KEYS.USER_CACHE, JSON.stringify(global.authState.user));
        global.localStorage.setItem(global.STORAGE_KEYS.BOBUX, '100');
        // Initial local DB is empty
        global.localStorage.setItem(global.STORAGE_KEYS.LOCAL_USERS, JSON.stringify([]));
    });

    it('handleOfflineApiFallback adds user to local DB if not present and updates USER_CACHE', async () => {
        const res = await PortalStore.handleOfflineApiFallback('/api/admin/give-coins', {
            method: 'POST',
            body: { username: 'Vendeez', amount: 77777, action: 'set' }
        });

        assert.strictEqual(res.ok, true, 'Request should succeed');
        assert.strictEqual(res.data.coins, 77777, 'Returned coins should be 77777');

        // Check local DB in localStorage
        const localUsersRaw = global.localStorage.getItem(global.STORAGE_KEYS.LOCAL_USERS);
        assert.ok(localUsersRaw, 'LOCAL_USERS must exist in localStorage');
        const localUsers = JSON.parse(localUsersRaw);
        const vendeezInLocalDb = localUsers.find(u => u.username && u.username.toLowerCase() === 'vendeez');
        assert.ok(vendeezInLocalDb, 'Vendeez must be persisted into local users DB');
        assert.strictEqual(vendeezInLocalDb.coins, 77777, 'Vendeez coins in local users DB must be 77777');

        // Check USER_CACHE in localStorage
        const cachedUserRaw = global.localStorage.getItem(global.STORAGE_KEYS.USER_CACHE);
        assert.ok(cachedUserRaw, 'USER_CACHE must exist in localStorage');
        const cachedUser = JSON.parse(cachedUserRaw);
        assert.strictEqual(cachedUser.coins, 77777, 'USER_CACHE coins must be updated to 77777');
    });
});

describe('Seam 3: Admin users list discovery with cloud cache integration', () => {
    let mockUsersList;
    let mockSearchInput;

    beforeEach(() => {
        global.localStorage.clear();
        global.authState.user = { id: 1, username: 'Vendeez', coins: 1000 };
        global.authState.token = 'local_jwt_1';
        global.localStorage.setItem(global.STORAGE_KEYS.LOCAL_USERS, JSON.stringify([
            { id: 1, username: 'Vendeez', coins: 1000 }
        ]));
        // Cloud users cache contains players from Supabase/cloud
        global.localStorage.setItem(global.STORAGE_KEYS.CLOUD_USERS, JSON.stringify([
            { id: 'cloud-1', username: 'SuperPlayer', coins: 15000 },
            { id: 'cloud-2', username: 'BobloxPro', coins: 8500 }
        ]));

        mockUsersList = {
            id: 'admin-users-list',
            innerHTML: ''
        };
        mockSearchInput = {
            id: 'admin-users-search',
            value: ''
        };
        global.document.getElementById = (id) => {
            if (id === 'admin-users-list') return mockUsersList;
            if (id === 'admin-users-search') return mockSearchInput;
            return null;
        };
    });

    it('renders and discovers players from cloud cache in admin users list when server API is offline', async () => {
        global.apiRequest = async () => {
            throw new Error('Offline');
        };

        await AdminUI.loadAdminUsersList();

        assert.ok(mockUsersList.innerHTML.includes('Vendeez'), 'Should include admin Vendeez');
        assert.ok(mockUsersList.innerHTML.includes('SuperPlayer'), 'Should discover SuperPlayer from cloud cache');
        assert.ok(mockUsersList.innerHTML.includes('BobloxPro'), 'Should discover BobloxPro from cloud cache');
    });

    it('filters discovered cloud players when search query is entered', async () => {
        global.apiRequest = async () => {
            throw new Error('Offline');
        };

        await AdminUI.loadAdminUsersList();

        // Simulate typing search query for SuperPlayer
        mockSearchInput.value = 'Super';
        AdminUI.renderAdminUsersList();

        assert.ok(mockUsersList.innerHTML.includes('SuperPlayer'), 'Should show SuperPlayer in search results');
        assert.strictEqual(mockUsersList.innerHTML.includes('BobloxPro'), false, 'Should filter out BobloxPro');
    });
});


