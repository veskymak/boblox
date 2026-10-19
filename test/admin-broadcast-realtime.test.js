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

// Shims for state
global.authState = {
    user: { username: 'Vendeez', id: 1, coins: 5000 },
    token: 'sb_jwt_user_vendeez_1',
    backendConnected: true,
    isSupabase: true
};

let hudToastMessages = [];
global.showHudToast = (msg, color) => {
    hudToastMessages.push({ msg, color });
};

let socialBroadcasts = [];
global.sendSocialBroadcast = (event, payload) => {
    socialBroadcasts.push({ event, payload });
};

let handledBroadcasts = [];
global.handleIncomingAdminBroadcast = (payload) => {
    handledBroadcasts.push(payload);
};

const AdminUI = require('../src/ui/AdminUI.js');
const PortalStore = require('../src/state/PortalStore.js');

describe('Seam 4: Realtime Admin Broadcast Across Static Devices', () => {
    beforeEach(() => {
        hudToastMessages = [];
        socialBroadcasts = [];
        handledBroadcasts = [];
        elementsMap['admin-broadcast-input'] = createMockElement('admin-broadcast-input', 'Pozor, turnaj za 5 minut!');
        global.authState.user = { username: 'Vendeez', id: 1, coins: 5000 };
    });

    it('submitAdminBroadcast broadcasts message to all players via sendSocialBroadcast on static hosting', async () => {
        global.apiRequest = async (path, options) => {
            return PortalStore.handleOfflineApiFallback(path, options);
        };

        await AdminUI.submitAdminBroadcast();

        assert.strictEqual(socialBroadcasts.length > 0, true, 'Should broadcast through sendSocialBroadcast');
        assert.strictEqual(socialBroadcasts[0].event, 'admin_broadcast');
        assert.strictEqual(socialBroadcasts[0].payload.message, 'Pozor, turnaj za 5 minut!');
        assert.strictEqual(socialBroadcasts[0].payload.sender, 'Vendeez');
        assert.strictEqual(handledBroadcasts.length > 0, true, 'Admin should also see their own broadcast locally');
    });

    it('handleSupabaseApiRequest broadcasts admin_broadcast to Supabase channel when executed', async () => {
        const mockSb = {
            auth: {
                getUser: async () => ({ data: { user: { id: 'uuid-vendeez-1' } } })
            },
            from: (table) => ({
                select: () => ({
                    eq: () => ({
                        maybeSingle: async () => ({ data: { id: 'uuid-vendeez-1', username: 'Vendeez' }, error: null })
                    }),
                    ilike: () => ({
                        maybeSingle: async () => ({ data: { id: 'uuid-vendeez-1', username: 'Vendeez' }, error: null })
                    })
                })
            })
        };

        const res = await PortalStore.handleSupabaseApiRequest(mockSb, '/api/admin/broadcast', {
            method: 'POST',
            body: { message: 'Cloud broadcast message!' }
        });

        assert.strictEqual(res !== null && typeof res === 'object', true);
        assert.strictEqual(res.ok, true);
        assert.strictEqual(socialBroadcasts.some(b => b.event === 'admin_broadcast' && b.payload.message === 'Cloud broadcast message!'), true);
    });
});
