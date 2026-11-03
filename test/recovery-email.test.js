const { test } = require('node:test');
const assert = require('node:assert/strict');
const backend = require('../src/state/AccountBackend');

function client(overrides = {}) {
    return { auth: {
        getUser: async () => ({ data: { user: { id: 'account-a' } } }),
        ...overrides
    } };
}

test('registration requires a real email before contacting Auth', async () => {
    let calls = 0;
    const sb = client({ signUp: async () => { calls++; } });
    for (const email of ['', 'invalid', 'person@boblox.cz']) {
        const response = await backend.request(sb, '/api/auth/register', { body: { username: 'Player', password: 'secret123', email } });
        assert.equal(response.status, 400);
    }
    assert.equal(calls, 0);
});

test('signup awaiting email confirmation is successful without a profile or session', async () => {
    const sb = client({ signUp: async credentials => {
        assert.equal(credentials.email, 'player@example.com');
        assert.equal(credentials.options.data.username, 'Player');
        return { data: { user: { id: 'new-account' }, session: null } };
    } });
    const response = await backend.request(sb, '/api/auth/register', { body: { username: 'Player', password: 'secret123', email: 'Player@example.com' } });
    assert.equal(response.ok, true);
    assert.equal(response.data.confirmationRequired, true);
    assert.equal(response.data.token, undefined);
});

test('email changes use Auth confirmation and preserve failures', async () => {
    let calls = 0;
    const sb = client({ updateUser: async (attributes, options) => {
        calls++;
        assert.deepEqual(attributes, { email: 'recovery@example.com' });
        assert.equal(options.emailRedirectTo, 'https://example.com/boblox/');
        return { error: { message: 'Mail delivery failed' } };
    } });
    const response = await backend.request(sb, '/api/auth/email', { body: { email: 'Recovery@example.com', redirectTo: 'https://example.com/boblox/' } });
    assert.equal(calls, 1);
    assert.equal(response.ok, false);
    assert.equal(response.data.error, 'Mail delivery failed');
});

test('email enrollment requires a verified user', async () => {
    const sb = client({ getUser: async () => ({ data: {}, error: new Error('expired') }) });
    assert.equal((await backend.request(sb, '/api/auth/email', { body: { email: 'test@example.com' } })).status, 401);
});

test('dismissal is read from shared backend on a fresh device', async () => {
    let dismissed = false;
    const newDevice = () => ({ ...client(), rpc: async (name, body) => {
        assert.equal(name, 'recovery_email_status');
        if (body.dismiss) dismissed = true;
        return { data: { showPrompt: !dismissed } };
    } });
    assert.equal((await backend.request(newDevice(), '/api/auth/email-status')).data.showPrompt, true);
    await backend.request(newDevice(), '/api/auth/email-dismiss', { method: 'POST' });
    assert.equal((await backend.request(newDevice(), '/api/auth/email-status')).data.showPrompt, false);
});

test('password recovery does not require an existing browser session', async () => {
    const sb = client({ getUser: async () => { throw new Error('must not need session'); }, resetPasswordForEmail: async () => ({}) });
    const response = await backend.request(sb, '/api/auth/reset-password', { body: { email: 'player@example.com' } });
    assert.equal(response.ok, true);
});
