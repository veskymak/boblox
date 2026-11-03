const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const accountServer = require('./helpers/account-server.cjs');

test('server commands settle atomically, persist on a fresh device and reject replay abuse', async () => {
    const ctx = await accountServer();
    try {
        const { token } = await ctx.register('WalletTester');
        const command = (name, payload = {}, requestId = randomUUID()) =>
            ctx.request('/api/account/command', token, { command: name, payload, requestId });
        const id = randomUUID();
        const first = await command('slots', { bet: 25 }, id);
        assert.equal(first.status, 200);
        assert.equal(first.data.user.coins, 250 - 25 + first.data.payout);
        const repeated = await command('slots', { bet: 25 }, id);
        assert.deepEqual(repeated.data.reels, first.data.reels);
        assert.equal(repeated.data.user.coins, first.data.user.coins);
        assert.equal((await command('slots', { bet: 50 }, id)).status, 400);
        const fresh = await ctx.request('/api/auth/me', token);
        assert.equal(fresh.data.user.coins, first.data.user.coins);
        assert.equal(
            (await ctx.request('/api/user/sync', token, { coins: 999999, is_vip: true })).status,
            403
        );
        assert.equal(
            (
                await ctx.request('/api/account/command', null, {
                    command: 'wheel',
                    payload: {},
                    requestId: randomUUID()
                })
            ).status,
            401
        );
        const before = (await ctx.request('/api/auth/me', token)).data.user.coins;
        assert.equal((await command('slots', { bet: 10001 })).status, 400);
        assert.equal((await ctx.request('/api/auth/me', token)).data.user.coins, before);
    } finally {
        await ctx.close();
    }
});

test('concurrent purchase requests charge once and grant only server-priced items', async () => {
    const ctx = await accountServer();
    try {
        const { token } = await ctx.register('ShopTester');
        const item = require('../data/shop-catalog.json').find((i) => i.id === 'shirt_logo');
        const requestId = randomUUID();
        const body = { command: 'purchase', payload: { itemId: item.id, price: 0 }, requestId };
        const responses = await Promise.all([
            ctx.request('/api/account/command', token, body),
            ctx.request('/api/account/command', token, body)
        ]);
        assert.ok(responses.every((r) => r.status === 200));
        const fresh = (await ctx.request('/api/auth/me', token)).data.user;
        assert.equal(fresh.coins, 250 - item.price);
        assert.equal(fresh.inventory.owned.filter((id) => id === item.id).length, 1);
        assert.equal(fresh.inventory.outfit[item.slot], item.id);
    } finally {
        await ctx.close();
    }
});

test('static hosting exposes frontend assets but never the server or database', async () => {
    const ctx = await accountServer();
    try {
        for (const path of [
            '/server.js',
            '/boblox.db',
            '/package.json',
            '/docs/supabase/account_commands.sql'
        ])
            assert.equal((await fetch(ctx.base + path)).status, 404);
        assert.equal((await fetch(ctx.base + '/index.html')).status, 200);
        assert.equal((await fetch(ctx.base + '/src/state/AccountBackend.js')).status, 200);
    } finally {
        await ctx.close();
    }
});
