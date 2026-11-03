const { test } = require('node:test');
const assert = require('node:assert/strict');
const adapter = require('./helpers/account-adapter.cjs');
function client(rpc) {
    return { auth: { getUser: async () => ({ data: { user: { id: 'actor-id' } } }) }, rpc };
}

test('messages are sent through a private persisted command', async () => {
    let request;
    const result = await adapter.request(
        client(async (name, args) => {
            request = args;
            return { data: { message: { id: 'server-message', text: 'hello' } } };
        }),
        '/api/chat/messages',
        { method: 'POST', body: { recipient: 'Alice', text: 'hello', fromUsername: 'Forged' } }
    );
    assert.equal(result.ok, true);
    assert.equal(request.command, 'message_send');
    assert.equal(result.data.message.id, 'server-message');
});
test('transaction history is read from the server ledger', async () => {
    const result = await adapter.request(
        client(async (name, args) => {
            assert.equal(args.command, 'transactions');
            return { data: { transactions: [{ amount: 50 }] } };
        }),
        '/api/transactions'
    );
    assert.equal(result.data.transactions[0].amount, 50);
});
test('friend acceptance uses an authenticated targeted command', async () => {
    const result = await adapter.request(
        client(async (name, args) => {
            assert.equal(args.command, 'friend_accept');
            assert.equal(args.payload.targetUsername, 'Alice');
            return { data: { user: { id: 'actor-id' } } };
        }),
        '/api/friends/accept',
        { method: 'POST', body: { targetUsername: 'Alice' } }
    );
    assert.equal(result.ok, true);
});
test('failed private persistence remains a failure', async () => {
    const result = await adapter.request(
        client(async () => ({ error: { message: 'network unavailable' } })),
        '/api/chat/messages',
        { method: 'POST', body: { recipient: 'Alice', text: 'hello' } }
    );
    assert.equal(result.ok, false);
});
