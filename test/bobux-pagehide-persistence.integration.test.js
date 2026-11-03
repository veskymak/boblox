const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const server = require('./helpers/account-server.cjs');
test('settlement is already persisted before a refreshed device reads the account', async () => {
    const ctx = await server();
    try {
        const { token } = await ctx.register('FreshWallet');
        const body = { command: 'wheel', payload: {}, requestId: randomUUID() };
        const spin = await ctx.request('/api/account/command', token, body);
        assert.equal(spin.status, 200);
        const fresh = await ctx.request('/api/auth/me', token);
        assert.equal(fresh.data.user.coins, spin.data.user.coins);
        const again = await ctx.request('/api/account/command', token, body);
        assert.equal(again.data.user.coins, fresh.data.user.coins);
    } finally {
        await ctx.close();
    }
});
