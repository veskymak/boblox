const { test } = require('node:test');
const assert = require('node:assert/strict');
const adapter = require('./helpers/account-adapter.cjs');
function client(rpc) {
    return { auth: { getUser: async () => ({ data: { user: { id: 'actor-id' } } }) }, rpc };
}

test('an account switch before sending a command prevents the write', async () => {
    let called = false;
    const actual = require('../src/state/AccountBackend');
    const response = await actual.request(
        {
            auth: {
                getUser: async () => ({ data: { user: { id: 'first-account' } } }),
                getSession: async () => ({
                    data: { session: { user: { id: 'second-account' }, access_token: 'second-token' } }
                })
            },
            rpc() {
                called = true;
            }
        },
        '/api/account/command',
        { method: 'POST', body: { command: 'purchase', payload: { itemId: 'shirt_logo' } } }
    );
    assert.equal(response.ok, false);
    assert.equal(called, false);
});

test('an authenticated command pins its original token instead of following a later SDK session', async () => {
    const actual = require('../src/state/AccountBackend');
    let authorization;
    const response = await actual.request(
        {
            auth: {
                getUser: async () => ({ data: { user: { id: 'actor' } } }),
                getSession: async () => ({
                    data: { session: { user: { id: 'actor' }, access_token: 'original-token' } }
                })
            },
            rpc() {
                return {
                    setHeader(key, value) {
                        authorization = [key, value];
                        return Promise.resolve({ data: { user: { id: 'actor' } } });
                    }
                };
            }
        },
        '/api/auth/me'
    );
    assert.equal(response.ok, true);
    assert.deepEqual(authorization, ['Authorization', 'Bearer original-token']);
});

test('account sync uses profile command, never administrator coin RPC', async () => {
    let called;
    const result = await adapter.request(
        client(async (name, args) => {
            called = { name, args };
            return { data: { user: { id: 'actor-id', coins: 250 } }, error: null };
        }),
        '/api/user/sync',
        { method: 'POST', body: JSON.stringify({ bio: 'hello', revision: 2 }) }
    );
    assert.equal(result.ok, true);
    assert.equal(called.name, 'account_command');
    assert.equal(called.args.command, 'profile');
    assert.equal(called.args.payload.bio, 'hello');
});
test('casino sends the action and displays only the confirmed result', async () => {
    const result = await adapter.request(
        client(async (name, args) => {
            assert.equal(name, 'account_command');
            assert.equal(args.command, 'blackjack');
            assert.equal(args.payload.action, 'hit');
            return { data: { hand: [{ val: 'A' }], user: { coins: 300 } } };
        }),
        '/api/account/command',
        { method: 'POST', body: { command: 'blackjack', payload: { action: 'hit' } } }
    );
    assert.equal(result.data.user.coins, 300);
    assert.equal(result.data.hand[0].val, 'A');
});
test('a rejected settlement is not acknowledged as a local success', async () => {
    const result = await adapter.request(
        client(async () => ({ error: { code: '42501', message: 'denied' } })),
        '/api/account/command',
        { method: 'POST', body: { command: 'wheel' } }
    );
    assert.equal(result.ok, false);
    assert.equal(result.status, 403);
});
test('a local account marker cannot replace verified Supabase authentication', async () => {
    let called = false;
    const sb = {
        auth: { getUser: async () => ({ data: { user: null } }) },
        rpc: async () => {
            called = true;
        }
    };
    assert.equal((await adapter.request(sb, '/api/auth/me')).status, 401);
    assert.equal(called, false);
});
