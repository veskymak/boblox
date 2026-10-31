const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function setup(username = 'Vendeez') {
    const elements = {};
    const element = id => elements[id] ||= {
        value: '', textContent: '', innerHTML: '', disabled: false,
        classList: { add() {}, remove() {}, contains() { return true; } },
        setAttribute(key, value) { this[key] = value; }
    };
    const calls = [];
    const context = vm.createContext({
        module: { exports: {} }, console,
        document: { getElementById: element, querySelectorAll: () => [] },
        authState: { user: { username, coins: 250 }, token: 'jwt' },
        playerState: { godmode: false, superSpeed: false },
        apiRequest: async (url, options) => {
            calls.push({ url, options });
            return { ok: true, data: { ok: true, users: [], daily_claim_date: 0 } };
        },
        lastClaimTimestamp: 123,
        STORAGE_KEYS: { DAILY_TS: 'daily' },
        localStorage: { setItem() {} }, showHudToast() {}, updateDailyBonusUI() {}
    });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/ui/AdminUI.js'), 'utf8'), context);
    return { ui: context.module.exports, context, calls, element };
}

test('only Vendeez can access admin tools or toggle cheats', () => {
    for (const name of ['admin', 'Player']) {
        const { ui, context } = setup(name);
        assert.equal(ui.isCurrentUserAdmin(), false);
        ui.toggleAdminGodmode(true);
        ui.toggleAdminSuperSpeed(true);
        assert.equal(context.playerState.godmode, false);
        assert.equal(context.playerState.superSpeed, false);
    }
});

test('economy rejects partial numbers, fractions, infinity and invalid actions', async () => {
    const { ui, calls, element } = setup();
    for (const value of ['12oops', '1.5', '', 'Infinity']) {
        element('admin-custom-coins-input').value = value;
        await ui.submitAdminGiveCoins();
    }
    await ui.submitAdminGiveCoins(10, 'other');
    assert.equal(calls.length, 0);
});

test('cheat status stays synchronized between admin panel and ESC menu', () => {
    const { ui, element, context } = setup();
    ui.toggleAdminGodmode(true);
    assert.equal(context.playerState.godmode, true);
    assert.equal(element('admin-godmode-status').textContent, element('esc-admin-godmode-status').textContent);
    assert.equal(element('esc-admin-godmode-toggle')['aria-pressed'], 'true');
    context.authState.user = { username: 'Other' };
    ui.updateAdminUI();
    assert.equal(context.playerState.godmode, false);
});

test('daily bonus reset is confirmed by the backend before changing local state', async () => {
    const { ui, calls, context } = setup();
    await ui.resetAdminDailyCooldown();
    assert.equal(calls[0].url, '/api/admin/reset-daily');
    assert.equal(context.lastClaimTimestamp, 0);
});

test('failed reset leaves the daily bonus timestamp unchanged', async () => {
    const { ui, context } = setup();
    context.apiRequest = async () => ({ ok: false, data: { error: 'Rejected' } });
    await ui.resetAdminDailyCooldown();
    assert.equal(context.lastClaimTimestamp, 123);
});

test('player names and action arguments are escaped in the admin list', () => {
    const { ui, element } = setup();
    ui.renderAdminUsersList([{ username: `<img src=x onerror="alert('x')">`, coins: 0 }]);
    const html = element('admin-users-list').innerHTML;
    assert.ok(!html.includes('<img'));
    assert.ok(html.includes('&lt;img'));
    assert.ok(html.includes('&quot;'));
});

test('broadcast prevents duplicate sends while the first request is pending', async () => {
    const { ui, context, calls, element } = setup();
    let finish;
    context.apiRequest = async url => { calls.push(url); return new Promise(resolve => { finish = resolve; }); };
    element('admin-broadcast-input').value = 'Hello';
    const pending = ui.submitAdminBroadcast();
    await ui.submitAdminBroadcast();
    assert.equal(calls.length, 1);
    finish({ ok: true, data: { ok: true } });
    await pending;
    assert.equal(element('admin-broadcast-send-btn').disabled, false);
});
