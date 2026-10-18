const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// Setup minimal DOM shims
global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
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

// Global app state shims
global.authState = { user: null, token: null };
global.playerState = { hp: 100, maxHp: 100, godmode: false, superSpeed: false };
global.bobuxBalance = 250;
global.lastClaimTimestamp = 0;
global.updateBobuxUI = () => {};
global.updateDailyBonusUI = () => {};
global.showHudToast = () => {};

const PortalStore = require('../src/state/PortalStore.js');
const PortalUI = require('../src/ui/PortalUI.js');
const AdminUI = require('../src/ui/AdminUI.js');

describe('Architectural Guardrails (Retrospective Enforcement)', () => {
    beforeEach(() => {
        global.localStorage.clear();
        global.authState.user = null;
        global.authState.token = null;
    });

    it('enforces STORAGE_KEYS in PortalStore as Single Source of Truth for storage keys', () => {
        const { STORAGE_KEYS } = PortalStore;
        assert.ok(STORAGE_KEYS, 'STORAGE_KEYS must be exported by PortalStore');
        assert.ok(Object.isFrozen(STORAGE_KEYS), 'STORAGE_KEYS must be Object.freeze-d');
        assert.strictEqual(global.window.STORAGE_KEYS, STORAGE_KEYS, 'STORAGE_KEYS must be available on window');
        assert.strictEqual(STORAGE_KEYS.JWT, 'boblox_jwt_token_v2', 'JWT key must be boblox_jwt_token_v2');
        assert.strictEqual(STORAGE_KEYS.BOBUX, 'boblox_bobux_balance_v1', 'BOBUX key must be boblox_bobux_balance_v1');
        assert.strictEqual(STORAGE_KEYS.DAILY_TS, 'boblox_daily_claim_ts_v2', 'DAILY_TS key must be boblox_daily_claim_ts_v2');
        assert.strictEqual(STORAGE_KEYS.TORSO, 'boblox_avatar_torso_v1', 'TORSO key must be boblox_avatar_torso_v1');
        assert.strictEqual(STORAGE_KEYS.PLAYED, 'boblox_games_played_v1', 'PLAYED key must be boblox_games_played_v1');
        assert.strictEqual(STORAGE_KEYS.TRANSACTIONS, 'boblox_bobux_transactions_v2', 'TRANSACTIONS key must be boblox_bobux_transactions_v2');
        assert.strictEqual(STORAGE_KEYS.CLOUD_USERS, 'boblox_cloud_users_cache_v2', 'CLOUD_USERS key must be boblox_cloud_users_cache_v2');
        assert.strictEqual(STORAGE_KEYS.USER_CACHE, 'boblox_auth_user_cache', 'USER_CACHE key must be boblox_auth_user_cache');
        assert.strictEqual(STORAGE_KEYS.LOCAL_USERS, 'boblox_local_db_users_v2', 'LOCAL_USERS key must be boblox_local_db_users_v2');
        assert.strictEqual(STORAGE_KEYS.LOCAL_SOCIAL, 'boblox_local_db_social_v2', 'LOCAL_SOCIAL key must be boblox_local_db_social_v2');
        assert.strictEqual(STORAGE_KEYS.ADOPTME_BUCKS, 'boblox_adoptme_bucks_v1', 'ADOPTME_BUCKS key must be boblox_adoptme_bucks_v1');
        assert.strictEqual(STORAGE_KEYS.ADOPTME_PETS, 'boblox_adoptme_pets_v1', 'ADOPTME_PETS key must be boblox_adoptme_pets_v1');
        assert.strictEqual(STORAGE_KEYS.GUEST_NUM, 'boblox_guest_num', 'GUEST_NUM key must be boblox_guest_num');
        assert.strictEqual(STORAGE_KEYS.MP_NICK, 'boblox_mp_nick', 'MP_NICK key must be boblox_mp_nick');
        assert.strictEqual(STORAGE_KEYS.API_BASE, 'boblox_api_base', 'API_BASE key must be boblox_api_base');

        const portalStoreCode = fs.readFileSync(path.join(__dirname, '..', 'src', 'state', 'PortalStore.js'), 'utf8');
        assert.ok(portalStoreCode.includes('STORAGE_KEY_TRANSACTIONS = STORAGE_KEYS.TRANSACTIONS'), 'STORAGE_KEY_TRANSACTIONS must derive from STORAGE_KEYS');
        assert.ok(portalStoreCode.includes('STORAGE_KEY_CLOUD_USERS = STORAGE_KEYS.CLOUD_USERS'), 'STORAGE_KEY_CLOUD_USERS must derive from STORAGE_KEYS');
        assert.ok(portalStoreCode.includes('LOCAL_DB_USERS_KEY = STORAGE_KEYS.LOCAL_USERS'), 'LOCAL_DB_USERS_KEY must derive from STORAGE_KEYS');
        assert.ok(portalStoreCode.includes('LOCAL_DB_SOCIAL_KEY = STORAGE_KEYS.LOCAL_SOCIAL'), 'LOCAL_DB_SOCIAL_KEY must derive from STORAGE_KEYS');
        assert.ok(portalStoreCode.includes('STORAGE_KEY_ADOPTME_BUCKS = STORAGE_KEYS.ADOPTME_BUCKS'), 'STORAGE_KEY_ADOPTME_BUCKS must derive from STORAGE_KEYS');
        assert.ok(portalStoreCode.includes('STORAGE_KEY_ADOPTME_PETS = STORAGE_KEYS.ADOPTME_PETS'), 'STORAGE_KEY_ADOPTME_PETS must derive from STORAGE_KEYS');
    });

    it('enforces getAuthTokenSafe reads from authState or STORAGE_KEYS.JWT', () => {
        const { getAuthTokenSafe } = PortalUI;
        assert.strictEqual(typeof getAuthTokenSafe, 'function', 'getAuthTokenSafe must be exported');

        // 1. When authState.token is present
        global.authState.token = 'jwt_live_state';
        assert.strictEqual(getAuthTokenSafe(), 'jwt_live_state');

        // 2. When authState.token is null, reads from STORAGE_KEYS.JWT
        global.authState.token = null;
        global.localStorage.setItem('boblox_jwt_token_v2', 'jwt_stored_v2');
        assert.strictEqual(getAuthTokenSafe(), 'jwt_stored_v2');

        // 3. Fallback for legacy key
        global.localStorage.clear();
        global.localStorage.setItem('boblox_auth_jwt_token', 'jwt_legacy');
        assert.strictEqual(getAuthTokenSafe(), 'jwt_legacy');
    });

    it('guards that UI scripts route all /api calls through apiRequest as primary transport', () => {
        const adminUiCode = fs.readFileSync(path.join(__dirname, '..', 'src', 'ui', 'AdminUI.js'), 'utf8');

        // Admin actions in AdminUI.js must route exclusively through apiRequest without duplicate fetch branches
        const rawApiFetchMatches = adminUiCode.match(/fetch\s*\(\s*['"`]\/api\/[^'"`]+['"`]/g) || [];
        assert.strictEqual(rawApiFetchMatches.length, 0, 'AdminUI must NOT have raw fetch fallback branches');

        // Verify that apiRequest is used for all admin API endpoints in AdminUI.js
        assert.ok(adminUiCode.includes("apiRequest('/api/admin/users')"), 'Must use apiRequest for /api/admin/users');
        assert.ok(adminUiCode.includes("apiRequest('/api/admin/give-coins'"), 'Must use apiRequest for /api/admin/give-coins');
        assert.ok(adminUiCode.includes("apiRequest('/api/admin/broadcast'"), 'Must use apiRequest for /api/admin/broadcast');
    });

    it('guards that loadAdminUsersList outputs diagnostic console.warn on network error', async () => {
        const warnings = [];
        const originalWarn = console.warn;
        console.warn = (...args) => warnings.push(args.join(' '));

        const mockListEl = { innerHTML: '' };
        global.document.getElementById = (id) => (id === 'admin-users-list' ? mockListEl : null);

        global.apiRequest = async () => {
            throw new Error('Connection refused simulation');
        };

        try {
            await AdminUI.loadAdminUsersList();
            const hasAdminWarn = warnings.some(w => w.includes('[AdminUI]'));
            assert.strictEqual(hasAdminWarn, true, 'Must log diagnostic console warning with [AdminUI] prefix');
        } finally {
            console.warn = originalWarn;
        }
    });
});
