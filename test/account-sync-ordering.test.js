const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const storage = new Map();
global.window = global;
global.addEventListener = () => {};
global.location = { protocol: 'http:', hostname: 'localhost' };
global.document = {
    hidden: false,
    addEventListener: () => {},
    getElementById: () => null
};
global.setInterval = () => ({ unref() {} });
global.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key)
};
global.authState = {
    user: { id: 42, username: 'Max', coins: 10000 },
    token: 'test-token',
    backendConnected: true,
    isSupabase: false
};
global.ownedShopItems = new Set(['face_classic']);
global.avatarOutfit = { shirt: null, pants: null, face: 'face_classic', hat: null };
global.avatarTorsoHex = '#0D69AC';
global.gamesPlayedCount = 0;
global.bobuxTransactions = [];
global.fetch = undefined;

const PortalStore = require('../src/state/PortalStore.js');

function jsonResponse(data) {
    return {
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => data
    };
}

describe('Account sync ordering after game and shop actions', () => {
    it('does not let an older sync restore the admin-set coins and previous inventory', async () => {
        const persistedRequests = [];
        let releaseFirstRequest;
        let requestCount = 0;
        global.fetch = async (_url, options) => {
            requestCount++;
            const body = JSON.parse(options.body);
            if (requestCount === 1) {
                return new Promise((resolve) => {
                    releaseFirstRequest = () => {
                        persistedRequests.push(body);
                        resolve(jsonResponse({ user: {} }));
                    };
                });
            }
            persistedRequests.push(body);
            return jsonResponse({ user: {} });
        };

        PortalStore.applyAuthenticatedUser({ id: 42, username: 'Max', coins: 10000 });
        const olderSync = PortalStore.syncAccountToServer();
        await new Promise((resolve) => setImmediate(resolve));

        PortalStore.applyAuthenticatedUser({ id: 42, username: 'Max', coins: 8200 });
        global.ownedShopItems = new Set(['face_classic', 'hat_crown']);
        global.avatarOutfit = { shirt: null, pants: null, face: 'face_classic', hat: 'hat_crown' };
        const newerSync = PortalStore.syncAccountToServer();

        releaseFirstRequest();
        await Promise.all([olderSync, newerSync]);

        const profileAfterReload = persistedRequests.at(-1);
        assert.equal(profileAfterReload.coins, 8200);
        assert.ok(profileAfterReload.owned.includes('hat_crown'));
        assert.equal(profileAfterReload.outfit.hat, 'hat_crown');
    });
});
