const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');

// Global browser shims
global.window = global;
const windowListeners = new Map();
global.window.addEventListener = (event, handler) => {
    const handlers = windowListeners.get(event) || [];
    handlers.push(handler);
    windowListeners.set(event, handlers);
};
global.window.location = { protocol: 'https:', hostname: 'veskymak.github.io' };
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
    createElement: () => ({
        getContext: () => null,
        appendChild: () => {},
        style: {},
        classList: { add: () => {}, remove: () => {}, toggle: () => {} }
    })
};
global.setInterval = () => ({ unref: () => {} });
global.setTimeout = () => ({ unref: () => {} });

global.authState = {
    user: { username: 'Vendeez', id: 'uuid-vendeez', coins: 1000 },
    token: 'sb_jwt_uuid-vendeez',
    backendConnected: true,
    isSupabase: true
};
global.bobuxBalance = 1000;
global.ownedShopItems = new Set(['face_classic']);
global.avatarOutfit = { shirt: null, pants: null, face: 'face_classic', hat: null };
global.avatarTorsoHex = '#0D69AC';
global.gamesPlayedCount = 5;
global.lastClaimTimestamp = 0;

global.sfx = { playCoin: () => {}, playWinFanfare: () => {}, playOof: () => {} };
global.showHudToast = () => {};

const PortalStore = require('../src/state/PortalStore.js');

describe('Supabase RPC Coins Sync for Blackjack & Economy (v8.5)', () => {
    beforeEach(() => {
        global.localStorage.clear();
        global.authState.user = { username: 'Vendeez', id: 'uuid-vendeez', coins: 1000 };
        global.authState.token = 'sb_jwt_uuid-vendeez';
        global.authState.backendConnected = true;
        global.authState.isSupabase = true;
    });

    it('handleSupabaseApiRequest calls admin_give_coins RPC with action: set on /api/user/sync', async () => {
        let rpcCalledWith = null;
        let updateCalledWith = null;

        const mockSb = {
            auth: {
                getUser: async () => ({ data: { user: { id: 'uuid-vendeez' } } })
            },
            rpc: async (funcName, args) => {
                if (funcName === 'admin_give_coins') {
                    rpcCalledWith = args;
                    return { data: { ok: true, coins: args.amount, action: args.action, username: args.target_username }, error: null };
                }
                return { data: null, error: new Error('Unknown RPC') };
            },
            from: (table) => {
                if (table === 'profiles') {
                    return {
                        select: () => ({
                            eq: () => ({ maybeSingle: async () => ({ data: { id: 'uuid-vendeez', username: 'Vendeez', coins: 1000 } }) }),
                            ilike: () => ({ maybeSingle: async () => ({ data: { id: 'uuid-vendeez', username: 'Vendeez', coins: 1000 } }) })
                        }),
                        update: (payload) => {
                            updateCalledWith = payload;
                            return {
                                eq: async () => ({ data: [], error: null })
                            };
                        }
                    };
                }
                return {};
            }
        };

        const syncRes = await PortalStore.handleSupabaseApiRequest(mockSb, '/api/user/sync', {
            method: 'POST',
            body: {
                coins: 1500,
                bio: 'Winning at Blackjack!'
            }
        });

        assert.strictEqual(syncRes.ok, true, 'Sync should respond ok: true');
        assert.ok(rpcCalledWith, 'admin_give_coins RPC must be called');
        assert.strictEqual(rpcCalledWith.target_username, 'Vendeez');
        assert.strictEqual(rpcCalledWith.amount, 1500);
        assert.strictEqual(rpcCalledWith.action, 'set');
        assert.strictEqual(syncRes.data.user.coins, 1500);
        assert.strictEqual(global.authState.user.coins, 1500);
    });

    it('handles JSON string stringified body in /api/user/sync properly', async () => {
        let rpcCalled = false;

        const mockSb = {
            auth: {
                getUser: async () => ({ data: { user: { id: 'uuid-vendeez' } } })
            },
            rpc: async (funcName, args) => {
                if (funcName === 'admin_give_coins') {
                    rpcCalled = true;
                    return { data: { ok: true, coins: args.amount, action: args.action, username: args.target_username }, error: null };
                }
                return { data: null, error: new Error('Unknown RPC') };
            },
            from: (table) => ({
                select: () => ({
                    eq: () => ({ maybeSingle: async () => ({ data: { id: 'uuid-vendeez', username: 'Vendeez', coins: 1000 } }) }),
                    ilike: () => ({ maybeSingle: async () => ({ data: { id: 'uuid-vendeez', username: 'Vendeez', coins: 1000 } }) })
                }),
                update: () => ({ eq: async () => ({ data: [], error: null }) })
            })
        };

        const syncRes = await PortalStore.handleSupabaseApiRequest(mockSb, '/api/user/sync', {
            method: 'POST',
            body: JSON.stringify({ coins: 2500 })
        });

        assert.strictEqual(syncRes.ok, true);
        assert.strictEqual(rpcCalled, true);
        assert.strictEqual(syncRes.data.user.coins, 2500);
    });

    it('syncAccountToServer persists Bobux balance to Supabase and updates USER_CACHE', async () => {
        let capturedCoins = null;

        const mockSb = {
            auth: {
                getUser: async () => ({ data: { user: { id: 'uuid-vendeez' } } })
            },
            rpc: async (funcName, args) => {
                if (funcName === 'admin_give_coins') {
                    capturedCoins = args.amount;
                    return { data: { ok: true, coins: args.amount, action: args.action, username: args.target_username }, error: null };
                }
                return { data: null, error: null };
            },
            from: () => ({
                select: () => ({
                    eq: () => ({ maybeSingle: async () => ({ data: { id: 'uuid-vendeez', username: 'Vendeez', coins: 1000 } }) }),
                    ilike: () => ({ maybeSingle: async () => ({ data: { id: 'uuid-vendeez', username: 'Vendeez', coins: 1000 } }) })
                }),
                update: () => ({ eq: async () => ({ data: [], error: null }) })
            })
        };

        // Attach mockSb to window.supabase so getSupabaseClient() finds it
        global.window.supabase = {
            createClient: () => mockSb
        };

        // Simulate winning in blackjack: addBobux changes balance
        PortalStore.addBobux(2950, 'Blackjack výhra');
        await PortalStore.syncAccountToServer({ bypassQueue: true });

        assert.strictEqual(capturedCoins, 3200, 'Supabase RPC should receive the new 3200 Bobux balance');
        const userCache = JSON.parse(global.localStorage.getItem(PortalStore.STORAGE_KEYS.USER_CACHE));
        assert.strictEqual(userCache.coins, 3200, 'USER_CACHE in localStorage must reflect 3200 coins');
    });
});
