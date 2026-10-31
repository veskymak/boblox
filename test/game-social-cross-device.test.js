const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Module = require('node:module');

test('game votes and comments are shared across accounts and fresh devices', async () => {
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
        for (const token of [undefined, alice, bob]) {
            const social = await request('/api/games/obby/social', token);
            assert.equal(social.status, 200);
            assert.equal(social.data.likes, 1);
            assert.equal(social.data.dislikes, 1);
            assert.equal(social.data.ratingPct, 50);
            assert.equal(social.data.comments[0].content, posted.data.comment.content);
            assert.equal(social.data.comments[0].username, 'SocialAlice');
            assert.equal(social.data.myVote, token === alice ? 'like' : token === bob ? 'dislike' : null);
        }
        // A new login has no cookies or browser storage from the authoring device.
        const fresh = await request('/api/auth/login', null, { username: 'SocialAlice', password });
        assert.equal(fresh.status, 200);
        assert.equal((await request('/api/games/obby/social', fresh.data.token)).data.myVote, 'like');
        assert.equal((await request('/api/games/obby/comments', fresh.data.token, { content: 'Too soon' })).status, 429);
        assert.equal((await request('/api/games/obby/rate', fresh.data.token, { vote: 'dislike' })).status, 200);
        const summary = (await request('/api/games/summary')).data.games.obby;
        assert.equal(summary.likes, 0);
        assert.equal(summary.dislikes, 2);
        assert.equal(summary.commentCount, 1);
        assert.equal((await request('/api/games/obby/rate', null, { vote: 'like' })).status, 401);
        assert.equal((await request('/api/games/obby/comments', null, { content: 'Anonymous' })).status, 401);
        assert.equal((await request('/api/games/obby/rate', alice, { vote: 'invalid' })).status, 400);
        assert.equal((await request('/api/games/unknown/rate', alice, { vote: 'like' })).status, 404);
    } finally {
        await new Promise(resolve => wss.close(resolve));
        await new Promise(resolve => server.close(resolve));
        db.close();
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
