const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const backend = require('../src/state/AccountBackend');
const { DatabaseSync } = require('node:sqlite');
const { installPrivacy } = require('../server/Privacy');

test('logout and account switches remove private browser caches', () => {
    const source = fs.readFileSync(require.resolve('../src/state/AccountSocial.js'), 'utf8');
    const start = source.indexOf('function resetAccountSocialCaches()');
    const end = source.indexOf('async function refreshAccountSocial()', start);
    const removed = [];
    const context = vm.createContext({
        STORAGE_KEYS: { CHAT_MESSAGES: 'messages', CHAT_UNREAD: 'unread', USER_CACHE: 'user' },
        localStorage: { removeItem: key => removed.push(key) }
    });
    vm.runInContext(source.slice(start, end), context);
    context.resetAccountSocialCaches();
    assert.deepEqual(removed, ['messages', 'unread', 'user']);
});

test('SQLite export persists on a fresh device and excludes another account and password hashes', () => {
    const db = new DatabaseSync(':memory:');
    try {
        db.exec(`
            create table account_consents(user_id integer, accepted_at integer);
            create table account_commands(user_id integer,request_id text,command text,payload text,result text);
            create table direct_messages(sender_id integer,recipient_id integer,recipient_username text,content text);
            create table comments(user_id integer,content text);
            create table game_ratings(user_id integer,vote text);
            create table account_ledger(user_id integer,amount integer);
            create table account_command_state(user_id integer,state text);
            insert into direct_messages values(1,2,'Bob','message for Alice'),(2,3,'Charlie','other conversation');
            insert into account_commands values(1,'request-a','profile','{}','NEVER_EXPORT_CACHED_RESULT');
            insert into account_consents values(1,123);
            insert into account_ledger values(1,25),(2,500);
        `);
        let handler;
        const auth = () => {};
        installPrivacy({ get(path, middleware, fn) { assert.equal(path, '/api/auth/privacy-export'); assert.equal(middleware, auth); handler = fn; } }, db, auth, row => ({ id: row.id, username: row.username }));
        const device = id => {
            let data;
            handler({ userRow: { id, username: id === 1 ? 'Alice' : 'Charlie', password_hash: 'NEVER_EXPORT_HASH' } }, {
                set(header, value) { assert.equal(header, 'Cache-Control'); assert.equal(value, 'no-store'); },
                json(value) { data = value; }
            });
            return data;
        };
        assert.equal(device(1).transactions[0].amount, 25);
        assert.deepEqual(device(1).messages.map(m => m.content), ['message for Alice']);
        assert.deepEqual(device(3).messages.map(m => m.content), ['other conversation']);
        assert.equal(device(1).ageConfirmation[0].accepted_at, 123);
        assert.doesNotMatch(JSON.stringify(device(1)), /NEVER_EXPORT|password_hash/);
    } finally { db.close(); }
});

test('export pins the verified account token and never exports a switched session', async () => {
    let calls = 0;
    let sessionId = 'a';
    const sb = {
        auth: {
            getUser: async () => ({ data: { user: { id: 'a' } } }),
            getSession: async () => ({ data: { session: { user: { id: sessionId }, access_token: 'captured-token' } } })
        },
        rpc(name) {
            calls++;
            assert.equal(name, 'privacy_export');
            return { setHeader: async (key, value) => {
                assert.equal(key, 'Authorization'); assert.equal(value, 'Bearer captured-token');
                return { data: { profile: { id: 'a' } } };
            } };
        }
    };
    assert.equal((await backend.request(sb, '/api/auth/privacy-export')).data.profile.id, 'a');
    sessionId = 'b';
    assert.equal((await backend.request(sb, '/api/auth/privacy-export')).status, 401);
    assert.equal(calls, 1);
    sb.auth.getUser = async () => ({ error: 'expired' });
    assert.equal((await backend.request(sb, '/api/auth/privacy-export')).status, 401);
});

test('privacy centre prepares mail without sending and guest exports stay disabled', () => {
    const elements = new Map();
    const el = id => { if (!elements.has(id)) elements.set(id, { showModal() { this.open = true; } }); return elements.get(id); };
    const context = vm.createContext({ authState: { user: { id: 'a', username: '<Player>' } }, document: { getElementById: el } });
    vm.runInContext(fs.readFileSync(require.resolve('../src/ui/PrivacyUI.js'), 'utf8'), context);
    context.openPrivacyCenter();
    assert.match(el('privacy-erasure').href, /^mailto:venda\.pekny@gmail\.com\?/);
    assert.match(el('privacy-erasure').href, /%3CPlayer%3E/);
    assert.equal(el('privacy-export').disabled, false);
    context.authState.user = null;
    context.openPrivacyCenter();
    assert.equal(el('privacy-export').disabled, true);
});

test('delayed export from a previous account never creates a download', async () => {
    let resolve;
    const status = {};
    const context = vm.createContext({ authState: { user: { id: 'a' } },
        document: { getElementById: () => status, createElement() { throw Error('must not download'); } },
        apiRequest: () => new Promise(done => { resolve = done; })
    });
    vm.runInContext(fs.readFileSync(require.resolve('../src/ui/PrivacyUI.js'), 'utf8'), context);
    const pending = context.exportPrivacyData();
    context.authState.user = { id: 'b' };
    resolve({ ok: true, data: { secret: 'a' } });
    await pending;
    assert.notEqual(status.textContent, 'secret');
});

test('privacy notice works without external scripts and is linked before registration', () => {
    const html = fs.readFileSync('privacy.html', 'utf8');
    assert.match(html, /Václav Pěkný/);
    assert.match(html, /venda\.pekny@gmail\.com/);
    assert.doesNotMatch(html, /<script|fonts\.googleapis|fonts\.gstatic/);
    assert.match(html, /Úřadu pro ochranu osobních údajů/);
    const index = fs.readFileSync('index.html', 'utf8');
    assert.match(index.slice(index.indexOf('id="auth-form-view"'), index.indexOf('id="auth-submit-btn"')), /href="privacy\.html"/);
});
