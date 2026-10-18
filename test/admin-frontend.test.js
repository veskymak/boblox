const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');

// Setup minimal browser shims for Node test environment
global.window = global;
const storageStore = {};
global.localStorage = {
    getItem: (key) => storageStore[key] ?? null,
    setItem: (key, val) => { storageStore[key] = String(val); },
    removeItem: (key) => { delete storageStore[key]; }
};

function createMockElement(id, initialClasses = []) {
    const classSet = new Set(initialClasses);
    return {
        id,
        className: initialClasses.join(' '),
        textContent: '',
        innerHTML: '',
        value: '',
        classList: {
            contains: (c) => classSet.has(c),
            add: (...classes) => {
                classes.forEach(c => classSet.add(c));
                this.className = Array.from(classSet).join(' ');
            },
            remove: (...classes) => {
                classes.forEach(c => classSet.delete(c));
                this.className = Array.from(classSet).join(' ');
            },
            toggle: (c, force) => {
                const shouldAdd = typeof force === 'boolean' ? force : !classSet.has(c);
                if (shouldAdd) classSet.add(c);
                else classSet.delete(c);
                this.className = Array.from(classSet).join(' ');
                return shouldAdd;
            }
        },
        _classes: classSet,
        listeners: {},
        addEventListener(event, fn) {
            this.listeners[event] = this.listeners[event] || [];
            this.listeners[event].push(fn);
        },
        dispatchEvent(eventObj) {
            const list = this.listeners[eventObj.type] || [];
            list.forEach(fn => fn(eventObj));
        }
    };
}

const elementsMap = {};
global.document = {
    readyState: 'complete',
    getElementById: (id) => elementsMap[id] || null,
    querySelectorAll: (sel) => [],
    addEventListener: () => {},
    createElement: () => ({ getContext: () => null })
};
global.setInterval = () => ({ unref: () => {} });
global.setTimeout = () => ({ unref: () => {} });

// Global app state shims
global.authState = {
    user: null,
    token: null
};
global.playerState = {
    hp: 100,
    maxHp: 100,
    godmode: false,
    superSpeed: false
};
global.bobuxBalance = 250;
global.lastClaimTimestamp = 123456789;
global.updateBobuxUI = () => {};
global.updateDailyBonusUI = () => {};
global.showHudToast = () => {};

const PortalUI = require('../src/ui/PortalUI.js');
const {
    isCurrentUserAdmin,
    updateAdminUI,
    openAdminModal,
    closeAdminModal,
    switchAdminTab,
    toggleAdminGodmode,
    toggleAdminSuperSpeed,
    resetAdminDailyCooldown
} = PortalUI;

describe('Seam 2: Frontend Admin State & UI Controls', () => {
    let mockSidebarAdminBtn;
    let mockMobileAdminBtn;
    let mockAdminModal;
    let mockTabEconomy;
    let mockTabUsers;
    let mockTabBroadcast;
    let mockTabCheats;
    let mockPanelEconomy;
    let mockPanelUsers;
    let mockPanelBroadcast;
    let mockPanelCheats;

    beforeEach(() => {
        mockSidebarAdminBtn = createMockElement('sidebar-admin-btn', ['hidden']);
        mockMobileAdminBtn = createMockElement('quick-action-admin', ['hidden']);
        mockAdminModal = createMockElement('admin-modal', ['hidden']);

        mockTabEconomy = createMockElement('admin-tab-btn-economy', []);
        mockTabUsers = createMockElement('admin-tab-btn-users', []);
        mockTabBroadcast = createMockElement('admin-tab-btn-broadcast', []);
        mockTabCheats = createMockElement('admin-tab-btn-cheats', []);

        mockPanelEconomy = createMockElement('admin-panel-economy', []);
        mockPanelUsers = createMockElement('admin-panel-users', ['hidden']);
        mockPanelBroadcast = createMockElement('admin-panel-broadcast', ['hidden']);
        mockPanelCheats = createMockElement('admin-panel-cheats', ['hidden']);

        elementsMap['sidebar-admin-btn'] = mockSidebarAdminBtn;
        elementsMap['quick-action-admin'] = mockMobileAdminBtn;
        elementsMap['admin-modal'] = mockAdminModal;

        elementsMap['admin-tab-btn-economy'] = mockTabEconomy;
        elementsMap['admin-tab-btn-users'] = mockTabUsers;
        elementsMap['admin-tab-btn-broadcast'] = mockTabBroadcast;
        elementsMap['admin-tab-btn-cheats'] = mockTabCheats;

        elementsMap['admin-panel-economy'] = mockPanelEconomy;
        elementsMap['admin-panel-users'] = mockPanelUsers;
        elementsMap['admin-panel-broadcast'] = mockPanelBroadcast;
        elementsMap['admin-panel-cheats'] = mockPanelCheats;

        global.authState.user = null;
        global.playerState.godmode = false;
        global.playerState.superSpeed = false;
    });

    it('exports all admin helper and UI functions', () => {
        assert.strictEqual(typeof isCurrentUserAdmin, 'function');
        assert.strictEqual(typeof updateAdminUI, 'function');
        assert.strictEqual(typeof openAdminModal, 'function');
        assert.strictEqual(typeof closeAdminModal, 'function');
        assert.strictEqual(typeof switchAdminTab, 'function');
        assert.strictEqual(typeof toggleAdminGodmode, 'function');
        assert.strictEqual(typeof toggleAdminSuperSpeed, 'function');
        assert.strictEqual(typeof resetAdminDailyCooldown, 'function');
    });

    it('isCurrentUserAdmin verifies case-insensitive username Vendeez', () => {
        global.authState.user = null;
        assert.strictEqual(isCurrentUserAdmin(), false);

        global.authState.user = { username: 'Noob_CZ' };
        assert.strictEqual(isCurrentUserAdmin(), false);

        global.authState.user = { username: 'Vendeez' };
        assert.strictEqual(isCurrentUserAdmin(), true);

        global.authState.user = { username: 'vendeez' };
        assert.strictEqual(isCurrentUserAdmin(), true);

        global.authState.user = { username: 'VENDEEZ' };
        assert.strictEqual(isCurrentUserAdmin(), true);
    });

    it('updateAdminUI reveals buttons only when admin is logged in', () => {
        global.authState.user = { username: 'Noob_CZ' };
        updateAdminUI();
        assert.strictEqual(mockSidebarAdminBtn.classList.contains('hidden'), true);
        assert.strictEqual(mockMobileAdminBtn.classList.contains('hidden'), true);

        global.authState.user = { username: 'Vendeez' };
        updateAdminUI();
        assert.strictEqual(mockSidebarAdminBtn.classList.contains('hidden'), false);
        assert.strictEqual(mockSidebarAdminBtn.classList.contains('flex'), true);
        assert.strictEqual(mockMobileAdminBtn.classList.contains('hidden'), false);
        assert.strictEqual(mockMobileAdminBtn.classList.contains('flex'), true);

        // Upon logout
        global.authState.user = null;
        updateAdminUI();
        assert.strictEqual(mockSidebarAdminBtn.classList.contains('hidden'), true);
        assert.strictEqual(mockMobileAdminBtn.classList.contains('hidden'), true);
    });

    it('openAdminModal opens modal for Vendeez and rejects non-admin', () => {
        global.authState.user = { username: 'Noob_CZ' };
        openAdminModal();
        assert.strictEqual(mockAdminModal.classList.contains('flex'), false);

        global.authState.user = { username: 'Vendeez' };
        openAdminModal();
        assert.strictEqual(mockAdminModal.classList.contains('flex'), true);
        assert.strictEqual(mockAdminModal.classList.contains('hidden'), false);

        closeAdminModal();
        assert.strictEqual(mockAdminModal.classList.contains('hidden'), true);
        assert.strictEqual(mockAdminModal.classList.contains('flex'), false);
    });

    it('switchAdminTab toggles panel visibility', () => {
        switchAdminTab('users');
        assert.strictEqual(mockPanelUsers.classList.contains('hidden'), false);
        assert.strictEqual(mockPanelEconomy.classList.contains('hidden'), true);
        assert.strictEqual(mockPanelBroadcast.classList.contains('hidden'), true);
        assert.strictEqual(mockPanelCheats.classList.contains('hidden'), true);

        switchAdminTab('cheats');
        assert.strictEqual(mockPanelCheats.classList.contains('hidden'), false);
        assert.strictEqual(mockPanelUsers.classList.contains('hidden'), true);
    });

    it('cheats toggles update playerState and reset daily bonus timestamp', () => {
        toggleAdminGodmode(true);
        assert.strictEqual(global.playerState.godmode, true);
        toggleAdminGodmode(false);
        assert.strictEqual(global.playerState.godmode, false);

        toggleAdminSuperSpeed(true);
        assert.strictEqual(global.playerState.superSpeed, true);
        toggleAdminSuperSpeed(false);
        assert.strictEqual(global.playerState.superSpeed, false);

        global.lastClaimTimestamp = 99999999;
        resetAdminDailyCooldown();
        assert.strictEqual(global.lastClaimTimestamp, 0);
    });
});

