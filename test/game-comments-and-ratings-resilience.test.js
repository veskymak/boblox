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

    it('handleSupabaseApiRequest gracefully recovers when Supabase comments table has RLS policy error', async () => {
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
        assert.strictEqual(res.ok, true, 'Should gracefully fall back to storing comment and return ok: true');
        assert.strictEqual(res.data.comment.content, 'Testovací komentář obby');
        assert.strictEqual(res.data.comment.username, 'Vendeez');
    });

    it('handleSupabaseApiRequest gracefully recovers when Supabase game_ratings table has RLS error', async () => {
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
        assert.strictEqual(res.ok, true, 'Should gracefully fall back and return ok: true for rating');
        assert.strictEqual(res.data.myVote, 'like');
    });
});
