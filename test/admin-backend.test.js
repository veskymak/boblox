const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const jwt = require('jsonwebtoken');

describe('Seam 1: Backend requireAdmin Middleware & Admin API Endpoints', () => {
    let serverModule;
    let app;
    let db;
    let httpServer;
    let baseUrl;
    let vendeezToken;
    let normalUserToken;
    const JWT_SECRET = process.env.JWT_SECRET || 'boblox_super_secret_jwt_key_2026_v2';

    before(async () => {
        // Set test port to 0 so OS assigns random open port
        process.env.PORT = '0';
        serverModule = require('../server.js');
        app = serverModule.app;
        db = serverModule.db;

        // Ensure Vendeez and a regular player exist in the DB
        const now = Date.now();
        const dummyHash = 'dummy_hash';
        
        // Upsert vendeez
        const vendeezExists = db.prepare('SELECT id, username FROM users WHERE username = ? COLLATE NOCASE').get('Vendeez');
        let vendeezId;
        if (!vendeezExists) {
            const info = db.prepare(`
                INSERT INTO users (username, password_hash, coins, created_at, last_login_at, last_active_at)
                VALUES ('Vendeez', ?, 1000, ?, ?, ?)
            `).run(dummyHash, now, now, now);
            vendeezId = Number(info.lastInsertRowid);
        } else {
            vendeezId = vendeezExists.id;
        }

        // Upsert regular player NoobPlayer
        const playerExists = db.prepare('SELECT id, username FROM users WHERE username = ? COLLATE NOCASE').get('NoobPlayer');
        let playerId;
        if (!playerExists) {
            const info = db.prepare(`
                INSERT INTO users (username, password_hash, coins, created_at, last_login_at, last_active_at)
                VALUES ('NoobPlayer', ?, 250, ?, ?, ?)
            `).run(dummyHash, now, now, now);
            playerId = Number(info.lastInsertRowid);
        } else {
            playerId = playerExists.id;
        }

        vendeezToken = jwt.sign({ id: vendeezId, username: 'Vendeez' }, JWT_SECRET);
        normalUserToken = jwt.sign({ id: playerId, username: 'NoobPlayer' }, JWT_SECRET);

        httpServer = http.createServer(app);
        await new Promise((resolve) => httpServer.listen(0, resolve));
        const addr = httpServer.address();
        baseUrl = `http://127.0.0.1:${addr.port}`;
    });

    after(async () => {
        if (httpServer) {
            await new Promise((resolve) => httpServer.close(resolve));
        }
    });

    it('rejects unauthenticated requests to /api/admin/users with 401', async () => {
        const res = await fetch(`${baseUrl}/api/admin/users`);
        assert.strictEqual(res.status, 401);
        const data = await res.json();
        assert.match(data.error, /přihlásit/i);
    });

    it('rejects authenticated non-admin users with 403 Forbidden', async () => {
        const res = await fetch(`${baseUrl}/api/admin/users`, {
            headers: { 'Authorization': `Bearer ${normalUserToken}` }
        });
        assert.strictEqual(res.status, 403);
        const data = await res.json();
        assert.match(data.error, /administrátorská práva/i);
    });

    it('allows Vendeez (case-insensitive) to GET /api/admin/users and returns user list', async () => {
        const res = await fetch(`${baseUrl}/api/admin/users`, {
            headers: { 'Authorization': `Bearer ${vendeezToken}` }
        });
        assert.strictEqual(res.status, 200);
        const data = await res.json();
        assert.strictEqual(data.ok, true);
        assert.ok(Array.isArray(data.users));
        assert.ok(data.users.length >= 2);

        const vendeezUser = data.users.find(u => u.username.toLowerCase() === 'vendeez');
        const noobUser = data.users.find(u => u.username.toLowerCase() === 'noobplayer');
        assert.ok(vendeezUser, 'Vendeez user should be in returned list');
        assert.ok(noobUser, 'NoobPlayer user should be in returned list');
        assert.strictEqual(vendeezUser.password_hash, undefined, 'password_hash must never be leaked');
    });

    it('allows Vendeez to give coins to a player via POST /api/admin/give-coins', async () => {
        // Give 500 coins to NoobPlayer
        const res = await fetch(`${baseUrl}/api/admin/give-coins`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${vendeezToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'NoobPlayer',
                amount: 500,
                action: 'add'
            })
        });

        assert.strictEqual(res.status, 200);
        const data = await res.json();
        assert.strictEqual(data.ok, true);
        assert.strictEqual(data.username, 'NoobPlayer');
        assert.ok(typeof data.coins === 'number');

        // Check in DB
        const userInDb = db.prepare('SELECT coins FROM users WHERE username = ? COLLATE NOCASE').get('NoobPlayer');
        assert.strictEqual(userInDb.coins, data.coins);
    });

    it('allows Vendeez to set exact coin balance via POST /api/admin/give-coins with action: set', async () => {
        const res = await fetch(`${baseUrl}/api/admin/give-coins`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${vendeezToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'Vendeez',
                amount: 99999,
                action: 'set'
            })
        });

        assert.strictEqual(res.status, 200);
        const data = await res.json();
        assert.strictEqual(data.ok, true);
        assert.strictEqual(data.coins, 99999);

        const userInDb = db.prepare('SELECT coins FROM users WHERE username = ? COLLATE NOCASE').get('Vendeez');
        assert.strictEqual(userInDb.coins, 99999);
    });

    it('allows Vendeez to broadcast a message via POST /api/admin/broadcast', async () => {
        const res = await fetch(`${baseUrl}/api/admin/broadcast`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${vendeezToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Vítejte na serveru Boblox!'
            })
        });

        assert.strictEqual(res.status, 200);
        const data = await res.json();
        assert.strictEqual(data.ok, true);
        assert.strictEqual(data.message, 'Vítejte na serveru Boblox!');
        assert.strictEqual(data.sender, 'Vendeez');
    });
});

