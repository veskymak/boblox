const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const crypto = require('node:crypto');
function harness(request) {
    const context = vm.createContext({
        crypto,
        Promise,
        Date,
        authState: { user: { id: 'alice' }, token: 'session' },
        apiRequest: request,
        localStorage: { setItem() {} },
        applyAuthenticatedUser(user) {
            context.authState.user = user;
        },
        STORAGE_KEYS: { WHEEL: 'wheel' }
    });
    vm.runInContext(fs.readFileSync(require.resolve('../src/state/AccountCommands'), 'utf8'), context);
    return context;
}
test('commands serialize and apply confirmed balances before the next command', async () => {
    let release;
    let calls = 0;
    const context = harness(async () => {
        calls++;
        if (calls === 1) await new Promise((resolve) => (release = resolve));
        return { ok: true, data: { user: { id: 'alice', coins: calls * 100 } } };
    });
    const first = context.accountCommand('slots', { bet: 25 });
    const second = context.accountCommand('purchase', { itemId: 'shirt_logo' });
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(calls, 1);
    release();
    await Promise.all([first, second]);
    assert.equal(calls, 2);
    assert.equal(context.authState.user.coins, 200);
});
test('a response from the previous account cannot overwrite the new account', async () => {
    let release;
    const context = harness(async () => {
        await new Promise((resolve) => (release = resolve));
        return { ok: true, data: { user: { id: 'alice', coins: 9000 } } };
    });
    const pending = context.accountCommand('wheel');
    await new Promise((resolve) => setImmediate(resolve));
    context.authState.user = { id: 'bob', coins: 250 };
    release();
    await assert.rejects(pending);
    assert.equal(context.authState.user.id, 'bob');
    assert.equal(context.authState.user.coins, 250);
});
