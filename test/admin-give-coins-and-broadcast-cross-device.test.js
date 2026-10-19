const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');

// Global browser shims
global.window = global;
global.window.addEventListener = () => {};
global.window.location = { protocol: 'https:', hostname: 'veskymak.github.io' };
const storageStore = {};
global.localStorage = {
    getItem: (key) => storageStore[key] ?? null,
    setItem: (key, val) => { storageStore[key] = String(val); },
    removeItem: (key) => { delete storageStore[key]; },
    clear: () => { Object.keys(storageStore).forEach(k => delete storageStore[k]); }
};

const elementsMap = {};
function createMockElement(id, initialVal = '') {
    return {
        id,
        className: '',
        textContent: '',
        innerHTML: '',
        value: initialVal,
        classList: {
            contains: () => false,
            add: () => {},
            remove: () => {}
        }
    };
}

global.document = {
    readyState: 'complete',
    getElementById: (id) => elementsMap[id] || null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    createElement: () => ({ getContext: () => null })
};
global.setInterval = () => ({ unref: () => {} });
global.setTimeout = () => ({ unref: () => {} });

// Shims for PortalStore & AdminUI
global.authState = {
    user: { username: 'Vendeez', id: 1, coins: 5000 },
    token: 'sb_jwt_user_vendeez_1',
    backendConnected: true,
    isSupabase: true
};
global.bobuxBalance = 5000;
global.lastClaimTimestamp = 123456789;
global.updateBobuxUI = () => {};
global.updateDailyBonusUI = () => {};

let hudToastMessages = [];
global.showHudToast = (msg, color) => {
    hudToastMessages.push({ msg, color });
};

const AdminUI = require('../src/ui/AdminUI.js');
const PortalStore = require('../src/state/PortalStore.js');

describe('Seam 1: Admin Bobux Management & Supabase Cloud Integration', () => {
    beforeEach(() => {
        hudToastMessages = [];
        elementsMap['admin-target-user-input'] = createMockElement('admin-target-user-input', '');
        elementsMap['admin-custom-coins-input'] = createMockElement('admin-custom-coins-input', '');
        elementsMap['admin-users-list'] = createMockElement('admin-users-list', '');
        global.authState.user = { username: 'Vendeez', id: 1, coins: 5000 };
        global.authState.token = 'sb_jwt_user_vendeez_1';
    });

    it('submitAdminGiveCoins gives user warning toast when custom coins input is empty instead of doing nothing', async () => {
        elementsMap['admin-custom-coins-input'].value = '';
        await AdminUI.submitAdminGiveCoins(undefined, 'add');

        assert.strictEqual(hudToastMessages.length > 0, true, 'Should trigger a toast notification when amount is missing');
        assert.match(hudToastMessages[0].msg, /zadej.*bobux/i, 'Toast should instruct user to enter a Bobux amount');
    });

    it('isCurrentUserAdmin recognizes both vendeez and admin accounts as administrators', () => {
        assert.strictEqual(AdminUI.isCurrentUserAdmin({ username: 'Vendeez' }), true);
        assert.strictEqual(AdminUI.isCurrentUserAdmin({ username: 'vendeez' }), true);
        assert.strictEqual(AdminUI.isCurrentUserAdmin({ username: 'admin' }), true);
        assert.strictEqual(AdminUI.isCurrentUserAdmin({ username: 'Admin' }), true);
        assert.strictEqual(AdminUI.isCurrentUserAdmin({ username: 'Max' }), false);
    });

    it('handleSupabaseApiRequest handles POST /api/admin/give-coins and updates target profile coins', async () => {
        let updatedProfileId = null;
        let updatedPayload = null;

        const fakeProfiles = [
            { id: 'uuid-max-1', username: 'Max', coins: 250, inventory: {} },
            { id: 'uuid-vendeez-1', username: 'Vendeez', coins: 5000, inventory: {} }
        ];

        const mockSb = {
            auth: {
                getUser: async () => ({ data: { user: { id: 'uuid-vendeez-1' } } })
            },
            from: (table) => {
                if (table === 'profiles') {
                    return {
                        select: () => ({
                            eq: (col, val) => ({
                                maybeSingle: async () => {
                                    const found = fakeProfiles.find(p => p[col] === val);
                                    return { data: found || null, error: null };
                                }
                            }),
                            ilike: (col, val) => ({
                                maybeSingle: async () => {
                                    const found = fakeProfiles.find(p => String(p[col]).toLowerCase() === String(val).toLowerCase());
                                    return { data: found || null, error: null };
                                }
                            })
                        }),
                        update: (payload) => ({
                            eq: (col, val) => {
                                updatedProfileId = val;
                                updatedPayload = payload;
                                const target = fakeProfiles.find(p => p[col] === val);
                                if (target && typeof payload.coins === 'number') {
                                    target.coins = payload.coins;
                                }
                                return Promise.resolve({ data: target, error: null });
                            }
                        })
                    };
                }
                return {};
            }
        };

        const res = await PortalStore.handleSupabaseApiRequest(mockSb, '/api/admin/give-coins', {
            method: 'POST',
            body: { username: 'Max', amount: 1000, action: 'add' }
        });

        assert.strictEqual(res !== null && typeof res === 'object', true, 'Should handle /api/admin/give-coins');
        assert.strictEqual(res.ok, true, 'Result ok should be true');
        assert.strictEqual(res.data.coins, 1250, 'Max should now have 1250 coins (250 + 1000)');
        assert.strictEqual(updatedProfileId, 'uuid-max-1', 'Should update the target profile in Supabase');
    });

    it('handleSupabaseApiRequest handles GET /api/admin/users and returns list of all cloud profiles', async () => {
        const fakeProfiles = [
            { id: 'uuid-1', username: 'Vendeez', coins: 5000, inventory: { gamesPlayed: 10 } },
            { id: 'uuid-2', username: 'Max', coins: 1250, inventory: { gamesPlayed: 3 } }
        ];

        const mockSb = {
            auth: {
                getUser: async () => ({ data: { user: { id: 'uuid-1' } } })
            },
            from: (table) => {
                if (table === 'profiles') {
                    return {
                        select: () => ({
                            eq: () => ({
                                maybeSingle: async () => ({ data: fakeProfiles[0], error: null })
                            }),
                            ilike: () => ({
                                maybeSingle: async () => ({ data: fakeProfiles[0], error: null })
                            }),
                            order: () => ({
                                limit: async () => ({ data: fakeProfiles, error: null })
                            })
                        })
                    };
                }
                return {};
            }
        };

        const res = await PortalStore.handleSupabaseApiRequest(mockSb, '/api/admin/users', {
            method: 'GET'
        });

        assert.strictEqual(res !== null && typeof res === 'object', true, 'Should handle /api/admin/users');
        assert.strictEqual(res.ok, true);
        assert.strictEqual(Array.isArray(res.data.users), true);
        assert.strictEqual(res.data.users.length, 2);
        assert.strictEqual(res.data.users[1].username, 'Max');
    });
});
