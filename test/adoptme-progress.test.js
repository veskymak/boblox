const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const server = require('./helpers/account-server.cjs');
test('Adopt Me persists server-validated progress on a fresh device', async () => {
    const ctx = await server();
    try {
        const { token } = await ctx.register('AdoptTester');
        const command = (name, payload = {}) =>
            ctx.request('/api/account/command', token, { command: name, payload, requestId: randomUUID() });
        assert.equal((await command('adopt_need', { needId: 'hungry', petIndex: 0 })).status, 200);
        const fresh = (await ctx.request('/api/auth/me', token)).data.user;
        assert.equal(fresh.adoptme_bucks, 150);
        assert.equal(fresh.adoptme_pets[0].tasksDone, 1);
        assert.equal((await command('adopt_need', { needId: 'hungry', petIndex: 0 })).status, 400);
        assert.equal((await ctx.request('/api/user/sync', token, { adoptme_bucks: 999999 })).status, 403);
    } finally {
        await ctx.close();
    }
});
