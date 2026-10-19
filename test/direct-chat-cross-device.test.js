const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const jwt = require('jsonwebtoken');

// Ensure background timers in required client modules do not hold event loop open
const origSetInterval = global.setInterval;
const origSetTimeout = global.setTimeout;
global.setInterval = (fn, ms) => {
    const t = origSetInterval(fn, ms);
    if (t && typeof t.unref === 'function') t.unref();
    return t;
};
global.setTimeout = (fn, ms) => {
    const t = origSetTimeout(fn, ms);
    if (t && typeof t.unref === 'function') t.unref();
    return t;
};

// Minimal DOM and browser shims
global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.document = {
    readyState: 'complete',
    getElementById: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    createElement: () => ({ getContext: () => null, appendChild: () => {}, style: {}, classList: { add: () => {}, remove: () => {}, toggle: () => {} } })
};

describe('Direct Chat Cross-Device Synchronization', () => {
    let serverModule;
    let app;
    let db;
    let httpServer;
    let baseUrl;
    let userAToken;
    let userBToken;
    let userAId;
    let userBId;
    const JWT_SECRET = process.env.JWT_SECRET || 'boblox_super_secret_jwt_key_2026_v2';

    before(async () => {
        process.env.PORT = '0';
        serverModule = require('../server.js');
        app = serverModule.app;
        db = serverModule.db;

        const now = Date.now();
        const dummyHash = 'dummy_hash';

        // Upsert User A (Device 1 & Device 2)
        const userAExists = db.prepare('SELECT id, username FROM users WHERE username = ? COLLATE NOCASE').get('ChatUserA');
        if (!userAExists) {
            const info = db.prepare(`
                INSERT INTO users (username, password_hash, coins, created_at, last_login_at, last_active_at)
                VALUES ('ChatUserA', ?, 250, ?, ?, ?)
            `).run(dummyHash, now, now, now);
            userAId = Number(info.lastInsertRowid);
        } else {
            userAId = userAExists.id;
        }

        // Upsert User B
        const userBExists = db.prepare('SELECT id, username FROM users WHERE username = ? COLLATE NOCASE').get('ChatUserB');
        if (!userBExists) {
            const info = db.prepare(`
                INSERT INTO users (username, password_hash, coins, created_at, last_login_at, last_active_at)
                VALUES ('ChatUserB', ?, 250, ?, ?, ?)
            `).run(dummyHash, now, now, now);
            userBId = Number(info.lastInsertRowid);
        } else {
            userBId = userBExists.id;
        }

        userAToken = jwt.sign({ id: userAId, username: 'ChatUserA' }, JWT_SECRET);
        userBToken = jwt.sign({ id: userBId, username: 'ChatUserB' }, JWT_SECRET);

        httpServer = serverModule.server;
        if (!httpServer.listening) {
            await new Promise((resolve) => httpServer.listen(0, resolve));
        }
        const addr = httpServer.address();
        baseUrl = `http://127.0.0.1:${addr.port}`;
    });

    after(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        if (httpServer && httpServer.listening) {
            await new Promise((resolve) => httpServer.close(resolve));
        }
    });

    it('Seam 1 (Backend): persists sent direct chat messages and allows retrieving conversation history across devices', async () => {
        // User A sends message to User B from Device 1 (phone)
        const sendRes = await fetch(`${baseUrl}/api/chat/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userAToken}`
            },
            body: JSON.stringify({
                recipient: 'ChatUserB',
                text: 'Ahoj z telefonu'
            })
        });

        assert.strictEqual(sendRes.status, 200, 'POST /api/chat/messages should return 200 OK');
        const sendData = await sendRes.json();
        assert.ok(sendData.message, 'Response should return created message object');
        assert.strictEqual(sendData.message.text, 'Ahoj z telefonu');

        // User A switches to Device 2 (computer). Device 2 has empty localStorage and fetches messages from server
        const getRes = await fetch(`${baseUrl}/api/chat/messages?partner=ChatUserB`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userAToken}`
            }
        });

        assert.strictEqual(getRes.status, 200, 'GET /api/chat/messages should return 200 OK on Device 2');
        const getData = await getRes.json();
        assert.ok(Array.isArray(getData.messages), 'Messages should be an array');
        assert.ok(
            getData.messages.some(m => m.text === 'Ahoj z telefonu' && m.from === 'ChatUserA'),
            'Device 2 must retrieve the message sent from Device 1'
        );

        // User B also logs in on their device and retrieves conversation with User A
        const getResB = await fetch(`${baseUrl}/api/chat/messages?partner=ChatUserA`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userBToken}`
            }
        });

        assert.strictEqual(getResB.status, 200, 'User B should also retrieve messages');
        const getDataB = await getResB.json();
        assert.ok(
            getDataB.messages.some(m => m.text === 'Ahoj z telefonu'),
            'User B should see message from User A'
        );
    });

    it('Seam 2 (Client Sync): syncDirectChatMessages pulls cross-device messages and integrates into local chat state', async () => {
        // Setup shims for client-side test
        const storage = {};
        global.localStorage = {
            getItem: (k) => storage[k] ?? null,
            setItem: (k, v) => { storage[k] = String(v); },
            removeItem: (k) => { delete storage[k]; }
        };
        global.authState = {
            user: { id: userAId, username: 'ChatUserA' },
            token: userAToken
        };
        global.apiRequest = async (path, options = {}) => {
            const url = `${baseUrl}${path}`;
            const headers = options.headers || {};
            if (global.authState.token) {
                headers['Authorization'] = `Bearer ${global.authState.token}`;
            }
            if (options.body) {
                headers['Content-Type'] = 'application/json';
            }
            const res = await fetch(url, {
                method: options.method || 'GET',
                headers,
                body: options.body ? JSON.stringify(options.body) : undefined
            });
            const data = await res.json().catch(() => ({}));
            return { ok: res.ok, status: res.status, data };
        };

        const PortalUI = require('../src/ui/PortalUI.js');
        assert.strictEqual(typeof PortalUI.syncDirectChatMessages, 'function', 'syncDirectChatMessages must be implemented and exported');

        // On fresh Device 2, local storage is empty
        assert.strictEqual(global.localStorage.getItem('boblox_direct_messages_v2'), null);

        // Call syncDirectChatMessages() on Device 2
        await PortalUI.syncDirectChatMessages();

        // Verify that Device 2 local chat state now has the message
        const messages = PortalUI.getLobbyDirectMessages();
        assert.ok(messages['chatuserb'], 'Conversation with chatuserb must exist on Device 2');
        assert.ok(
            messages['chatuserb'].some(m => m.text === 'Ahoj z telefonu'),
            'Device 2 must have the conversation synced from server'
        );
    });

    it('Seam 3 (Offline Delivery): User B sends a message to User A while User A is offline, then User A receives it upon login on PC', async () => {
        // User B sends message to User A via POST /api/chat/messages
        const sendRes = await fetch(`${baseUrl}/api/chat/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userBToken}`
            },
            body: JSON.stringify({
                recipient: 'ChatUserA',
                text: 'Kámo, jsi tu? Pojď hrát Adopt Me!'
            })
        });
        assert.strictEqual(sendRes.status, 200);

        // User A opens Boblox on PC (Device 2) and syncs
        const PortalUI = require('../src/ui/PortalUI.js');
        await PortalUI.syncDirectChatMessages('ChatUserB');

        const messages = PortalUI.getLobbyDirectMessages();
        assert.ok(
            messages['chatuserb'].some(m => m.text === 'Kámo, jsi tu? Pojď hrát Adopt Me!' && !m.isMe),
            'User A must receive the offline message from User B upon sync'
        );
    });

    it('Seam 4 (Offline Fallback & PortalStore): handleOfflineApiFallback handles /api/chat/messages cleanly', async () => {
        const PortalStore = require('../src/state/PortalStore.js');
        assert.ok(PortalStore.STORAGE_KEYS.CHAT_MESSAGES, 'STORAGE_KEYS.CHAT_MESSAGES must exist');
        assert.ok(PortalStore.STORAGE_KEYS.CHAT_UNREAD, 'STORAGE_KEYS.CHAT_UNREAD must exist');
        assert.strictEqual(PortalStore.STORAGE_KEYS.CHAT_MESSAGES, 'boblox_direct_messages_v2');
        assert.strictEqual(PortalStore.STORAGE_KEYS.CHAT_UNREAD, 'boblox_unread_messages_v2');

        // Test fallback when backend is unreachable
        PortalStore.applyAuthenticatedUser({ id: 99, username: 'OfflineUser' });

        const postRes = await PortalStore.handleOfflineApiFallback('/api/chat/messages', {
            method: 'POST',
            body: {
                recipient: 'OfflineFriend',
                text: 'Offline test zpráva'
            }
        });
        assert.strictEqual(postRes.ok, true, 'Offline POST /api/chat/messages should succeed');
        assert.strictEqual(postRes.data.message.text, 'Offline test zpráva');

        const getRes = await PortalStore.handleOfflineApiFallback('/api/chat/messages?partner=OfflineFriend', {
            method: 'GET'
        });
        assert.strictEqual(getRes.ok, true, 'Offline GET /api/chat/messages should succeed');
        assert.ok(
            getRes.data.messages.some(m => m.text === 'Offline test zpráva'),
            'Offline GET must return saved message'
        );
    });
});
