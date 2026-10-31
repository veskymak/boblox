const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Module = require('node:module');

test('admin moderation persists resets and comment removal across devices', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'boblox-social-'));
    const filename = path.resolve(__dirname, '../server.js');
    const source = fs.readFileSync(filename, 'utf8').replace("path.join(__dirname, 'boblox.db')", JSON.stringify(path.join(dir, 'test.db')));
    const mod = new Module(filename, module);
    mod.filename = filename;
    mod.paths = module.paths;
    mod._compile(source, filename);
    const { server, db, wss } = mod.exports;
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    async function request(route, token, body) {
        const res = await fetch(base + route, {
            method: body ? 'POST' : 'GET',
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            ...(body ? { body: JSON.stringify(body) } : {})
        });
        return { status: res.status, data: await res.json() };
    }
    try {
        const password = 'TestPassword123!';
        const first = await request('/api/auth/register', null, { username: 'SocialAlice', password });
        const second = await request('/api/auth/register', null, { username: 'SocialBob', password });
        assert.equal(first.status, 201);
        assert.equal(second.status, 201);
        const alice = first.data.token;
        const bob = second.data.token;
        assert.equal((await request('/api/games/obby/rate', alice, { vote: 'like' })).status, 200);
        assert.equal((await request('/api/games/obby/rate', bob, { vote: 'dislike' })).status, 200);
        const posted = await request('/api/games/obby/comments', alice, { content: 'Skvělá hra z mobilu!' });
        assert.equal(posted.status, 201);
        const admin = (await request('/api/auth/register', null, { username: 'Vendeez', password })).data.token;
        const route = '/api/admin/games/obby/';
        assert.equal((await request(route + 'social')).status, 401);
        assert.equal((await request(route + 'social', alice)).status, 403);
        assert.equal((await request(route + 'reset-ratings', bob, {})).status, 403);
        assert.equal((await request(route + 'delete-comment', bob, { commentId: posted.data.comment.id })).status, 403);
        const overview = await request(route + 'social', admin);
        assert.equal(overview.status, 200);
        assert.deepEqual(overview.data.ratings.map(r => r.username).sort(), ['SocialAlice', 'SocialBob']);
        assert.equal(overview.data.comments[0].username, 'SocialAlice');
        assert.equal((await request('/api/games/lava/rate', alice, { vote: 'like' })).status, 200);
        assert.equal((await request(route + 'reset-ratings', admin, {})).status, 200);
        assert.equal(db.prepare("SELECT COUNT(*) AS n FROM game_ratings WHERE game_id = 'obby'").get().n, 0);
        for (const row of db.prepare('SELECT game_ratings FROM users').all()) assert.equal(JSON.parse(row.game_ratings).obby, undefined);
        const fresh = (await request('/api/auth/login', null, { username: 'SocialAlice', password })).data.token;
        const social = (await request('/api/games/obby/social', fresh)).data;
        assert.equal(social.likes, 0);
        assert.equal(social.dislikes, 0);
        assert.equal(social.myVote, null);
        assert.equal(social.comments.length, 1);
        const summary = (await request('/api/games/summary', fresh)).data.games;
        assert.equal(summary.obby.myVote, null);
        assert.equal(summary.lava.likes, 1);
        assert.equal((await request('/api/games/obby/rate', fresh, { vote: 'like' })).status, 200);
        assert.equal((await request(route + 'delete-comment', admin, { commentId: posted.data.comment.id })).status, 200);
        assert.equal((await request('/api/games/obby/social', fresh)).data.comments.length, 0);
        for (const row of db.prepare('SELECT comments FROM users').all()) assert.equal(JSON.parse(row.comments).length, 0);
        assert.equal((await request('/api/admin/games/unknown/reset-ratings', admin, {})).status, 404);
    } finally {
        await new Promise(resolve => wss.close(resolve));
        await new Promise(resolve => server.close(resolve));
        db.close();
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
