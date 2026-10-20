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

const PortalStore = require('../src/state/PortalStore.js');

describe('Supabase Chat, Transactions & Friends Cache Synchronization (v6.5)', () => {
    beforeEach(() => {
        global.localStorage.clear();
        global.authState.user = { username: 'Vendeez', id: 'uuid-vendeez', coins: 1000 };
        global.authState.token = 'sb_jwt_uuid-vendeez';
        global.authState.backendConnected = true;
        global.authState.isSupabase = true;
    });

    it('handleSupabaseApiRequest saves and returns direct_messages in Supabase cloud', async () => {
        const storedRows = [];
        const mockSb = {
            auth: {
                getUser: async () => ({ data: { user: { id: 'uuid-vendeez', email: 'vendeez@boblox.local' } } })
            },
            from: (table) => {
                if (table === 'direct_messages') {
                    return {
                        insert: async (row) => {
                            storedRows.push(row);
                            return { data: row, error: null };
                        },
                        select: (cols) => ({
                            or: (condition) => ({
                                order: (col, opts) => ({
                                    limit: async (lim) => ({
                                        data: storedRows.filter(r =>
                                            r.sender_username.toLowerCase() === 'vendeez' ||
                                            r.recipient_username.toLowerCase() === 'vendeez'
                                        ),
                                        error: null
                                    })
                                })
                            })
                        })
                    };
                }
                if (table === 'profiles') {
                    return {
                        select: () => ({
                            eq: () => ({ maybeSingle: async () => ({ data: { id: 'uuid-vendeez', username: 'Vendeez' } }) }),
                            ilike: () => ({ maybeSingle: async () => ({ data: { id: 'uuid-vendeez', username: 'Vendeez' } }) })
                        })
                    };
                }
                return {};
            }
        };

        // 1. Post a new chat message
        const postRes = await PortalStore.handleSupabaseApiRequest(mockSb, '/api/chat/messages', {
            method: 'POST',
            body: {
                recipient: 'AgentTester_1',
                text: 'Ahoj z testu cloudu!',
                id: 'msg_test_123',
                timestamp: 1792442400000
            }
        });

        assert.strictEqual(postRes.ok, true);
        assert.strictEqual(postRes.data.message.text, 'Ahoj z testu cloudu!');
        assert.strictEqual(storedRows.length, 1);
        assert.strictEqual(storedRows[0].id, 'msg_test_123');
        assert.strictEqual(storedRows[0].content, 'Ahoj z testu cloudu!');

        // 2. Fetch chat history
        const getRes = await PortalStore.handleSupabaseApiRequest(mockSb, '/api/chat/messages?partner=AgentTester_1', {
            method: 'GET'
        });

        assert.strictEqual(getRes.ok, true);
        assert.strictEqual(getRes.data.messages.length, 1);
        assert.strictEqual(getRes.data.messages[0].text, 'Ahoj z testu cloudu!');
        assert.strictEqual(getRes.data.messages[0].isMe, true);
    });

    it('handleSupabaseApiRequest saves transactions on user sync and returns them via /api/transactions', async () => {
        const txRows = [];
        let profileUpdated = null;

        const mockSb = {
            auth: {
                getUser: async () => ({ data: { user: { id: 'uuid-vendeez', email: 'vendeez@boblox.local' } } })
            },
            from: (table) => {
                if (table === 'transactions') {
                    return {
                        upsert: async (row) => {
                            txRows.push(row);
                            return { error: null };
                        },
                        select: () => ({
                            or: () => ({
                                order: () => ({
                                    limit: async () => ({ data: txRows, error: null })
                                })
                            })
                        })
                    };
                }
                if (table === 'profiles') {
                    return {
                        select: () => ({
                            eq: () => ({ maybeSingle: async () => ({ data: { id: 'uuid-vendeez', username: 'Vendeez', inventory: {} } }) })
                        }),
                        update: (payload) => ({
                            eq: async () => {
                                profileUpdated = payload;
                                return { error: null };
                            }
                        })
                    };
                }
                return {};
            }
        };

        const syncRes = await PortalStore.handleSupabaseApiRequest(mockSb, '/api/user/sync', {
            method: 'POST',
            body: {
                coins: 950,
                transactions: [
                    { id: 'tx_buy_crown', amount: -50, game: 'Obchod', timestamp: 1792442000000 }
                ]
            }
        });

        assert.strictEqual(syncRes.ok, true);
        assert.ok(txRows.some(t => t.id === 'tx_buy_crown'), 'Transaction should be upserted to transactions table');
        assert.ok(profileUpdated?.inventory?.transactions?.some(t => t.id === 'tx_buy_crown'), 'Transaction should be stored in inventory.transactions');

        // Fetch via /api/transactions
        const getTxRes = await PortalStore.handleSupabaseApiRequest(mockSb, '/api/transactions', {
            method: 'GET'
        });

        assert.strictEqual(getTxRes.ok, true);
        assert.strictEqual(getTxRes.data.transactions.length, 1);
        assert.strictEqual(getTxRes.data.transactions[0].id, 'tx_buy_crown');
        assert.strictEqual(getTxRes.data.transactions[0].amount, -50);
    });

    it('handleSupabaseApiRequest invokes admin_give_coins RPC function for administrators', async () => {
        let rpcCalledWith = null;

        const mockSb = {
            auth: {
                getUser: async () => ({ data: { user: { id: 'uuid-vendeez', email: 'vendeez@boblox.local' } } })
            },
            rpc: async (fnName, params) => {
                if (fnName === 'admin_give_coins') {
                    rpcCalledWith = params;
                    return {
                        data: { ok: true, username: params.target_username, coins: 500, diff: 250 },
                        error: null
                    };
                }
                return { data: null, error: 'unknown function' };
            },
            from: (table) => ({
                select: () => ({
                    eq: () => ({ maybeSingle: async () => ({ data: { id: 'uuid-vendeez', username: 'Vendeez' } }) })
                })
            })
        };

        const res = await PortalStore.handleSupabaseApiRequest(mockSb, '/api/admin/give-coins', {
            method: 'POST',
            body: { username: 'AgentTester_1', amount: 250, action: 'add' }
        });

        assert.strictEqual(res.ok, true);
        assert.strictEqual(rpcCalledWith.target_username, 'AgentTester_1');
        assert.strictEqual(rpcCalledWith.amount, 250);
        assert.strictEqual(res.data.coins, 500);
    });

    it('uses keepalive for Supabase account writes triggered by pagehide', async () => {
        let requestOptions;
        let resolveRequestSeen;
        const requestSeen = new Promise((resolve) => {
            resolveRequestSeen = resolve;
        });
        const originalFetch = global.fetch;
        global.fetch = async (_input, options) => {
            requestOptions = options;
            resolveRequestSeen();
            return { ok: true, status: 204 };
        };
        global.ownedShopItems = new Set(['face_classic']);
        global.avatarOutfit = { shirt: null, pants: null, face: 'face_classic', hat: null };
        global.avatarTorsoHex = '#0D69AC';
        global.gamesPlayedCount = 0;
        global.window.supabase = {
            createClient(_url, _key, options) {
                const supabaseFetch = options.global.fetch;
                return {
                    auth: {
                        getUser: async () => ({ data: { user: { id: 'uuid-vendeez' } } })
                    },
                    from: (table) => {
                        if (table !== 'profiles') return {};
                        return {
                            select: () => ({
                                eq: () => ({
                                    maybeSingle: async () => ({
                                        data: {
                                            id: 'uuid-vendeez',
                                            username: 'Vendeez',
                                            coins: 1000,
                                            inventory: {}
                                        }
                                    })
                                })
                            }),
                            update: () => ({
                                eq: async () => {
                                    await supabaseFetch('https://example.test/rest/v1/profiles', {
                                        method: 'PATCH'
                                    });
                                    return { error: null };
                                }
                            })
                        };
                    }
                };
            }
        };

        try {
            for (const handler of windowListeners.get('pagehide') || []) handler();
            await requestSeen;
            assert.equal(requestOptions.keepalive, true);
        } finally {
            global.fetch = originalFetch;
            delete global.window.supabase;
        }
    });
});
