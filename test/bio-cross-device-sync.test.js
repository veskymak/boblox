const { describe, it, before, after, beforeEach } = require('node:test');
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

// Shims for storage and DOM
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

global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.window.location = { origin: 'http://localhost:3000', pathname: '/', search: '' };
global.document = {
    readyState: 'complete',
    getElementById: (id) => elementsMap[id] || null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    createElement: () => ({
        className: '',
        textContent: '',
        appendChild: () => {},
        style: {},
        classList: { add: () => {}, remove: () => {}, toggle: () => {} }
    })
};

global.authState = {
    user: null,
    token: null,
    backendConnected: true,
    isSupabase: false
};

global.sfx = {
    playCoin: () => {},
    playWinFanfare: () => {}
};

const serverModule = require('../server.js');
const PortalUI = require('../src/ui/PortalUI.js');
const PortalStore = require('../src/state/PortalStore.js');

describe('Bio Cross-Device Synchronization', () => {
    let app;
    let db;
    let httpServer;
    let baseUrl;
    let userToken;
    let userId;
    const JWT_SECRET = process.env.JWT_SECRET || 'boblox_super_secret_jwt_key_2026_v2';

    before(async () => {
        app = serverModule.app;
        db = serverModule.db;

        const now = Date.now();
        const dummyHash = 'dummy_hash';

        const userRow = db.prepare('SELECT id, username FROM users WHERE username = ? COLLATE NOCASE').get('BioUserTest');
        if (!userRow) {
            const info = db.prepare(`
                INSERT INTO users (username, password_hash, coins, created_at, last_login_at, last_active_at)
                VALUES ('BioUserTest', ?, 250, ?, ?, ?)
            `).run(dummyHash, now, now, now);
            userId = Number(info.lastInsertRowid);
        } else {
            userId = userRow.id;
        }

        userToken = jwt.sign({ id: userId, username: 'BioUserTest' }, JWT_SECRET, { expiresIn: '7d' });

        httpServer = http.createServer(app);
        await new Promise((resolve) => {
            httpServer.listen(0, '127.0.0.1', () => {
                const port = httpServer.address().port;
                baseUrl = `http://127.0.0.1:${port}`;
                resolve();
            });
        });
    });

    after(async () => {
        if (httpServer) {
            await new Promise((resolve) => httpServer.close(resolve));
        }
    });

    beforeEach(() => {
        global.localStorage.clear();
        global.authState.user = null;
        global.authState.token = null;
    });

    it('Seam 1 (Backend SQLite): syncs bio via /api/user/sync and retrieves updated bio via /api/auth/me on another device', async () => {
        const testBio = 'Ahoj, toto je moje nove bio z pocitace!';

        // 1. Device 1 (PC) syncs bio
        const syncRes = await fetch(`${baseUrl}/api/user/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
                bio: testBio,
                coins: 300
            })
        });

        assert.strictEqual(syncRes.status, 200, 'Sync should succeed');
        const syncData = await syncRes.json();
        assert.strictEqual(syncData.user.bio, testBio, 'Returned user in sync response must include updated bio');

        // 2. Device 2 (Phone) logs in / loads profile via /api/auth/me
        const meRes = await fetch(`${baseUrl}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });
        assert.strictEqual(meRes.status, 200);
        const meData = await meRes.json();
        assert.strictEqual(meData.user.bio, testBio, 'Device 2 (Phone) must receive the synced bio from /api/auth/me');

        // 3. Search also returns user bio
        const searchRes = await fetch(`${baseUrl}/api/users/search?q=BioUserTest`);
        assert.strictEqual(searchRes.status, 200);
        const searchData = await searchRes.json();
        const found = searchData.find(u => u.username.toLowerCase() === 'biousertest');
        assert.ok(found, 'Should find user in search');
        assert.strictEqual(found.bio, testBio, 'Search results must include bio');
    });

    it('Seam 2 (Client UI & Sync): saveEditedProfile triggers syncAccountToServer and applyAuthenticatedUser hydrates Phone profile', async () => {
        const phoneBio = 'Jsem hrac na mobilu i PC';

        elementsMap['edit-profile-bio'] = createMockElement('edit-profile-bio', phoneBio);
        elementsMap['edit-profile-modal'] = createMockElement('edit-profile-modal');
        elementsMap['profile-bio-text'] = createMockElement('profile-bio-text');

        global.authState.user = {
            id: userId,
            username: 'BioUserTest',
            coins: 300,
            bio: 'Old bio'
        };

        let syncCalled = false;
        global.syncAccountToServer = async () => {
            syncCalled = true;
        };

        // User edits bio and clicks "Uložit"
        PortalUI.saveEditedProfile();

        assert.strictEqual(global.localStorage.getItem('boblox_custom_bio_v1'), phoneBio, 'Must save bio to localStorage');
        assert.strictEqual(syncCalled, true, 'saveEditedProfile must trigger syncAccountToServer() to persist to cloud');
        assert.strictEqual(global.authState.user.bio, phoneBio, 'authState.user.bio must be updated immediately');

        // Now simulate Device 2 (Phone) opening with empty localStorage
        global.localStorage.clear();
        global.authState.user = null;

        // Phone receives authenticated user from backend
        PortalStore.applyAuthenticatedUser({
            id: userId,
            username: 'BioUserTest',
            coins: 300,
            bio: phoneBio,
            inventory: {}
        });

        assert.strictEqual(global.localStorage.getItem('boblox_custom_bio_v1'), phoneBio, 'Phone localStorage must be hydrated with synced bio');
        assert.strictEqual(global.authState.user.bio, phoneBio, 'Phone authState.user.bio must be set');

        // Profile display on Phone
        const inspectedProfile = PortalUI.getLocalRobloxPlayerProfile();
        assert.strictEqual(inspectedProfile.bio, phoneBio, 'Phone getLocalRobloxPlayerProfile() must return the synced bio');
    });

    it('Seam 3 (Supabase & Mock API): persists bio in handleSupabaseApiRequest and handleMockApiRequest', async () => {
        const cloudBio = 'Bio v Supabase cloudu';

        let updatedProfilePayload = null;
        const currentProfile = {
            id: 'uuid-cloud-user',
            username: 'CloudUser',
            coins: 500,
            inventory: {}
        };

        const mockSb = {
            auth: {
                getUser: async () => ({ data: { user: { id: 'uuid-cloud-user', email: 'clouduser@boblox.local' } } })
            },
            from: (table) => ({
                select: (cols) => ({
                    eq: (col, val) => ({
                        maybeSingle: async () => ({ data: currentProfile, error: null })
                    })
                }),
                update: (payload) => ({
                    eq: (col, val) => {
                        updatedProfilePayload = payload;
                        return Promise.resolve({ error: null });
                    }
                })
            })
        };

        global.authState.token = 'sb_jwt_mock_token_123';
        global.authState.user = { id: 'uuid-cloud-user', username: 'CloudUser' };

        const res = await PortalStore.handleSupabaseApiRequest(mockSb, '/api/user/sync', {
            method: 'POST',
            body: {
                bio: cloudBio,
                coins: 500
            }
        });

        assert.strictEqual(res.status, 200, 'Supabase sync must return 200');
        assert.strictEqual(res.data.user.bio, cloudBio, 'Supabase user must have bio');
        assert.strictEqual(updatedProfilePayload.bio, cloudBio, 'Supabase update payload must include bio');

        // Test handleOfflineApiFallback sync
        const usersDb = [
            { id: 99, username: 'MockUser', bio: 'Old' }
        ];
        PortalStore.saveLocalUsersDB(usersDb);
        global.authState.user = { id: 99, username: 'MockUser' };
        const mockRes = await PortalStore.handleOfflineApiFallback('/api/user/sync', {
            method: 'POST',
            body: { bio: 'Mock bio updated', coins: 100 }
        });
        assert.strictEqual(mockRes.ok, true);
        assert.strictEqual(mockRes.data.user.bio, 'Mock bio updated');
    });
});
