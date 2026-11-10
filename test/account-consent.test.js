const { test } = require('node:test');
const assert = require('node:assert/strict');
const backend = require('../src/state/AccountBackend');
const vm = require('node:vm');
const fs = require('node:fs');

test('persisted consent never opens the dialog, including while loading', async () => {
    let resolveStatus;
    let opens = 0;
    const modal = { open: false, addEventListener() {}, showModal() { opens++; this.open = true; }, close() { this.open = false; } };
    const context = vm.createContext({
        authState: { user: { id: 'a' } },
        document: { getElementById: () => modal, addEventListener() {} },
        setInterval() {},
        apiRequest: () => new Promise(resolve => { resolveStatus = resolve; })
    });
    vm.runInContext(fs.readFileSync(require.resolve('../src/ui/AccountConsentUI.js'), 'utf8'), context);
    const pending = context.refreshAccountConsent();
    assert.equal(opens, 0);
    resolveStatus({ ok: true, data: { accepted: true } });
    await pending;
    await context.refreshAccountConsent();
    assert.equal(opens, 0);
    assert.equal(context.hasAccountConsent(), true);
});

test('mandatory dialog blocks cancellation and stays open after storage failure', async () => {
    const elements = new Map();
    const element = id => {
        if (!elements.has(id)) elements.set(id, { open: false, checked: false, addEventListener(type, fn) { this[type] = fn; }, showModal() { this.open = true; }, close() { this.open = false; } });
        return elements.get(id);
    };
    let accepted = false;
    const context = vm.createContext({
        authState: { user: { id: 'a' } },
        document: { getElementById: element, addEventListener() {} },
        setInterval() {},
        apiRequest: async (path, options) => options ? { ok: accepted, data: { accepted } } : { ok: true, data: { accepted: false } }
    });
    vm.runInContext(fs.readFileSync(require.resolve('../src/ui/AccountConsentUI.js'), 'utf8'), context);
    await context.refreshAccountConsent();
    const modal = element('account-consent-modal');
    assert.equal(modal.open, true);
    let prevented = false;
    modal.cancel({ preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
    element('consent-age').checked = true;
    await context.submitAccountConsent({ preventDefault() {} });
    assert.equal(modal.open, true);
    assert.equal(context.hasAccountConsent(), false);
    accepted = true;
    await context.submitAccountConsent({ preventDefault() {} });
    assert.equal(modal.open, false);
    assert.equal(context.hasAccountConsent(), true);
});

test('registration rejects missing and non-boolean age confirmations before Auth', async () => {
    const sb = { auth: { signUp() { throw Error('must not register'); } } };
    for (const flags of [{}, { ageOver15: false }, { activityConsent: true }, { ageOver15: 'true' }]) {
        const result = await backend.request(sb, '/api/auth/register', { body: { username: 'Player', email: 'a@example.com', password: 'secret123', ...flags } });
        assert.equal(result.status, 400);
    }
});

test('consent survives a fresh device, stays account-scoped and rejects missing age confirmation', async () => {
    const records = new Map();
    const device = id => ({
        auth: { getUser: async () => ({ data: { user: { id } } }) },
        from(table) {
            assert.equal(table, 'account_consents');
            return {
                async insert(row) { assert.equal(row.user_id, id); records.set(id, row); return {}; },
                select() { return { eq(column, value) {
                    assert.equal(column, 'user_id'); assert.equal(value, id);
                    return { maybeSingle: async () => ({ data: records.has(id) ? { version: 1 } : null }) };
                } }; }
            };
        }
    });
    assert.equal((await backend.request(device('a'), '/api/auth/consent')).data.accepted, false);
    assert.equal((await backend.request(device('a'), '/api/auth/consent', { method: 'POST', body: {} })).status, 400);
    assert.equal((await backend.request(device('a'), '/api/auth/consent', { method: 'POST', body: { ageOver15: true } })).data.accepted, true);
    assert.equal((await backend.request(device('a'), '/api/auth/consent')).data.accepted, true);
    assert.equal((await backend.request(device('b'), '/api/auth/consent')).data.accepted, false);
});

test('consent storage errors never become success', async () => {
    const sb = { auth: { getUser: async () => ({ data: { user: { id: 'a' } } }) }, from: () => ({ insert: async () => ({ error: { message: 'unavailable' } }) }) };
    assert.equal((await backend.request(sb, '/api/auth/consent', { method: 'POST', body: { ageOver15: true } })).ok, false);
});
