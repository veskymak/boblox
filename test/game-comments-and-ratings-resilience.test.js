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
    createElement: () => ({
        className: '',
        textContent: '',
        appendChild: () => {}
    })
};
global.setInterval = () => ({ unref: () => {} });
global.setTimeout = () => ({ unref: () => {} });

// Shims for user state
global.authState = {
    user: { username: 'Vendeez', id: 1, coins: 5000 },
    token: 'sb_jwt_user_vendeez_1',
    lastCommentTime: 0,
    backendConnected: true,
    isSupabase: true
};

global.liveSocialState = {
    ratingsByGame: {},
    commentsByGame: {},
    totalOnline: 1
};

global.sfx = {
    playCoin: () => {},
    playWinFanfare: () => {}
};

let commentStatusMsg = '';
let commentStatusIsError = false;
global.showCommentStatus = (msg, isError) => {
    commentStatusMsg = msg;
    commentStatusIsError = isError;
};

const PortalStore = require('../src/state/PortalStore.js');

describe('Seam 3: Game Comments & Like/Dislike Resilience', () => {
    beforeEach(() => {
        commentStatusMsg = '';
        commentStatusIsError = false;
        elementsMap['comment-input'] = createMockElement('comment-input', 'Super hra, baví mě to!');
        elementsMap['modal-comments-list'] = createMockElement('modal-comments-list');
        elementsMap['modal-comment-count'] = createMockElement('modal-comment-count');
        elementsMap['modal-likes-count'] = createMockElement('modal-likes-count');
        elementsMap['modal-dislikes-count'] = createMockElement('modal-dislikes-count');
        elementsMap['btn-rate-like'] = createMockElement('btn-rate-like');
        elementsMap['btn-rate-dislike'] = createMockElement('btn-rate-dislike');
        elementsMap['comment-char-count'] = createMockElement('comment-char-count');
        global.authState.user = { username: 'Vendeez', id: 1, coins: 5000 };
        global.authState.lastCommentTime = 0;
    });

    it('does not acknowledge device-only writes when the shared backend is unavailable', async () => {
        for (const path of ['/api/games/obby/comments', '/api/games/obby/rate', '/api/games/obby/social', '/api/games/summary']) {
            const result = await PortalStore.apiRequest(path, { method: path.endsWith('/rate') || path.endsWith('/comments') ? 'POST' : 'GET', body: { content: 'Shared comment', vote: 'like' } });
            assert.equal(result.ok, false);
            assert.equal(result.status, 503);
        }
    });

    it('reports comment read errors instead of returning an empty shared discussion', async () => {
        const failure = { data: null, error: { code: '42501' } };
        const mockSb = {
            from(table) {
                return {
                    select() {
                        const result = table === 'comments' ? failure : { data: [], error: null };
                        return { ...result, eq() { return this; }, order() { return this; }, limit() { return result; } };
                    }
                };
            }
        };
        const result = await PortalStore.handleSupabaseApiRequest(mockSb, '/api/games/summary');
        assert.equal(result.ok, false);
        assert.equal(result.status, 503);
    });

    it('handleSupabaseApiRequest reports failure when Supabase rejects a shared comment', async () => {
        // Mock Supabase client where insert into comments fails with RLS code 42501
        const mockSb = {
            auth: {
                getUser: async () => ({ data: { user: { id: 'uuid-vendeez-1' } } })
            },
            from: (table) => {
                if (table === 'profiles') {
                    return {
                        select: () => ({
                            eq: () => ({ maybeSingle: async () => ({ data: { id: 'uuid-vendeez-1', username: 'Vendeez' }, error: null }) }),
                            ilike: () => ({ maybeSingle: async () => ({ data: { id: 'uuid-vendeez-1', username: 'Vendeez' }, error: null }) })
                        }),
                        update: () => ({
                            eq: () => Promise.resolve({ error: null })
                        })
                    };
                }
                if (table === 'comments') {
                    return {
                        insert: () => ({
                            select: () => ({
                                single: async () => ({ data: null, error: { code: '42501', message: 'new row violates row-level security policy' } })
                            })
                        })
                    };
                }
                return {};
            }
        };

        const res = await PortalStore.handleSupabaseApiRequest(mockSb, '/api/games/obby/comments', {
            method: 'POST',
            body: { content: 'Testovací komentář obby' }
        });

        assert.strictEqual(res !== null && typeof res === 'object', true);
        assert.strictEqual(res.ok, false, 'Rejected cloud writes must never report a globally saved comment');
        assert.ok(res.data.error);
        assert.strictEqual(res.data.comment, undefined);
    });

    it('handleSupabaseApiRequest reports failure when Supabase rejects a shared vote', async () => {
        // Mock Supabase client where upsert into game_ratings fails with RLS code 42501
        const mockSb = {
            auth: {
                getUser: async () => ({ data: { user: { id: 'uuid-vendeez-1' } } })
            },
            from: (table) => {
                if (table === 'profiles') {
                    return {
                        select: () => ({
                            eq: () => ({ maybeSingle: async () => ({ data: { id: 'uuid-vendeez-1', username: 'Vendeez' }, error: null }) }),
                            ilike: () => ({ maybeSingle: async () => ({ data: { id: 'uuid-vendeez-1', username: 'Vendeez' }, error: null }) })
                        }),
                        update: () => ({
                            eq: () => Promise.resolve({ error: null })
                        })
                    };
                }
                if (table === 'game_ratings') {
                    return {
                        upsert: async () => ({ data: null, error: { code: '42501', message: 'new row violates row-level security policy' } }),
                        select: () => ({
                            eq: async () => ({ data: [{ vote: 'like' }], error: null })
                        })
                    };
                }
                return {};
            }
        };

        const res = await PortalStore.handleSupabaseApiRequest(mockSb, '/api/games/obby/rate', {
            method: 'POST',
            body: { vote: 'like' }
        });

        assert.strictEqual(res !== null && typeof res === 'object', true);
        assert.strictEqual(res.ok, false, 'Rejected cloud votes must never report success');
        assert.ok(res.data.error);
    });
});

describe('cloud rating removal and casino moderation', () => {
    function client(options = {}) {
        const filters = [];
        return {
            filters,
            auth: { getUser: async () => ({ data: { user: { id: 'player-id' } } }) },
            from(table) {
                if (table === 'profiles') return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: 'player-id', username: options.username || 'Vendeez' } }) }) }) };
                assert.equal(table, 'game_ratings');
                return {
                    delete() { return { eq(key, value) { filters.push([key, value]); return this; }, then(resolve) { resolve({ error: options.deleteError || null }); } }; },
                    select() { return { eq: async () => ({ data: options.remaining || [], error: null }) }; }
                };
            },
            rpc: async (name, args) => {
                assert.equal(name, 'admin_game_social');
                assert.equal(args.target_game, 'casino');
                return options.rpcError ? { error: options.rpcError } : { data: { ratings: [], comments: [] } };
            }
        };
    }
    it('deletes only the authenticated player vote and confirms persisted removal', async () => {
        const sb = client();
        const res = await PortalStore.handleSupabaseApiRequest(sb, '/api/games/casino/rate', { method: 'POST', body: { vote: null } });
        assert.equal(res.ok, true);
        assert.equal(res.data.myVote, null);
        assert.deepEqual(sb.filters, [['game_id', 'casino'], ['username', 'Vendeez']]);
        for (const bad of [{ deleteError: { code: '42501' } }, { remaining: [{ username: 'Vendeez', vote: 'like' }] }]) {
            assert.equal((await PortalStore.handleSupabaseApiRequest(client(bad), '/api/games/casino/rate', { method: 'POST', body: { vote: null } })).ok, false);
        }
    });
    it('loads casino moderation and explains missing database migrations', async () => {
        assert.equal((await PortalStore.handleSupabaseApiRequest(client(), '/api/admin/games/casino/social')).ok, true);
        const missing = await PortalStore.handleSupabaseApiRequest(client({ rpcError: { code: 'PGRST202' } }), '/api/admin/games/casino/social');
        assert.equal(missing.ok, false);
        assert.match(missing.data.error, /schema_update_v9.2.sql/);
        assert.equal((await PortalStore.handleSupabaseApiRequest(client({ username: 'OtherPlayer' }), '/api/admin/games/casino/social')).status, 403);
    });
});
