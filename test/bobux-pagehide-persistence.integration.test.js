const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const http = require('node:http');

const serverModule = require('../server.js');
const nativeFetch = global.fetch;
const storage = new Map();
const listeners = new Map();
let httpServer;
let baseUrl;
let username;
let authToken;
let pendingNormalSyncs = [];
let pagehideSyncs = [];
let PortalStore;

global.window = global;
global.location = { protocol: 'http:', hostname: '127.0.0.1' };
global.document = {
    readyState: 'loading',
    hidden: false,
    addEventListener() {},
    getElementById: () => null
};
global.addEventListener = () => {};
global.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear()
};
global.sessionStorage = {
    getItem: () => null,
    setItem() {},
    removeItem() {}
};
global.setInterval = () => ({ unref() {} });
global.sfx = { playCoin() {} };
global.showHudToast = () => {};
global.ownedShopItems = new Set(['face_classic']);
global.avatarOutfit = { shirt: null, pants: null, face: 'face_classic', hat: null };
global.avatarTorsoHex = '#0D69AC';
global.gamesPlayedCount = 0;

describe('Bobux pagehide persistence with a local test account', () => {
    before(async () => {
        httpServer = http.createServer(serverModule.app);
        await new Promise((resolve) => httpServer.listen(0, '127.0.0.1', resolve));
        baseUrl = `http://127.0.0.1:${httpServer.address().port}`;

        username = `Sync_${crypto.randomBytes(5).toString('hex')}`;
        const registerResponse = await nativeFetch(`${baseUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password: 'LocalTestAccount123' })
        });
        assert.equal(registerResponse.status, 201);
        const registration = await registerResponse.json();
        authToken = registration.token;
        global.authState = {
            user: registration.user,
            token: registration.token,
            backendConnected: true,
            isSupabase: false
        };

        global.addEventListener = (event, handler) => {
            const registered = listeners.get(event) || [];
            registered.push(handler);
            listeners.set(event, registered);
        };
        global.fetch = (input, options = {}) => {
            const url = new URL(input, baseUrl);
            if (url.pathname === '/api/user/sync' && options.keepalive !== true) {
                return new Promise((resolve) => pendingNormalSyncs.push(resolve));
            }
            const request = nativeFetch(url, options);
            if (url.pathname === '/api/user/sync' && options.keepalive === true) {
                pagehideSyncs.push(request);
            }
            return request;
        };
        PortalStore = require('../src/state/PortalStore.js');
    });

    after(async () => {
        global.fetch = nativeFetch;
        if (username) {
            serverModule.db.prepare('DELETE FROM users WHERE username = ?').run(username);
        }
        if (httpServer) {
            await new Promise((resolve) => httpServer.close(resolve));
        }
    });

    it('restores the winning balance after the latest sync is queued and the page is refreshed', async () => {
        PortalStore.spendBobux(100, 'Test casino bet');
        PortalStore.addBobux(200, 'Test casino win');

        assert.equal(pendingNormalSyncs.length, 1);
        assert.equal(pagehideSyncs.length, 0);

        for (const handler of listeners.get('pagehide') || []) handler();
        assert.equal(pagehideSyncs.length, 1);

        const syncResponse = await pagehideSyncs[0];
        assert.equal(syncResponse.status, 200);

        const reloadResponse = await nativeFetch(`${baseUrl}/api/auth/me`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        assert.equal(reloadResponse.status, 200);
        const reloadData = await reloadResponse.json();
        assert.equal(reloadData.user.coins, 350);
    });
});
