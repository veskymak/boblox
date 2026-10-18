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
        classList: {
            contains: (c) => classSet.has(c),
            add: (...classes) => { classes.forEach(c => classSet.add(c)); },
            remove: (...classes) => { classes.forEach(c => classSet.delete(c)); },
            toggle: (c, force) => {
                const shouldAdd = typeof force === 'boolean' ? force : !classSet.has(c);
                if (shouldAdd) classSet.add(c);
                else classSet.delete(c);
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

const PortalUI = require('../src/ui/PortalUI.js');
const { toggleMobileSidebar, switchPortalSection } = PortalUI;

describe('Seam 1: toggleMobileSidebar & backdrop state management', () => {
    let mockSidebar;
    let mockBackdrop;

    beforeEach(() => {
        mockSidebar = createMockElement('portal-sidebar', ['hidden']);
        mockBackdrop = createMockElement('portal-sidebar-backdrop', ['hidden']);
        elementsMap['portal-sidebar'] = mockSidebar;
        elementsMap['portal-sidebar-backdrop'] = mockBackdrop;
    });

    it('exports toggleMobileSidebar as a function', () => {
        assert.strictEqual(typeof toggleMobileSidebar, 'function', 'toggleMobileSidebar must be exported from PortalUI.js');
    });

    it('opens mobile sidebar and shows backdrop when sidebar was hidden', () => {
        toggleMobileSidebar();

        assert.strictEqual(mockSidebar.classList.contains('hidden'), false, 'sidebar hidden class must be removed');
        assert.strictEqual(mockSidebar.classList.contains('fixed'), true, 'sidebar fixed class must be added');
        assert.strictEqual(mockSidebar.classList.contains('top-12'), true, 'sidebar top-12 class must be added');
        assert.strictEqual(mockSidebar.classList.contains('left-0'), true, 'sidebar left-0 class must be added');
        assert.strictEqual(mockSidebar.classList.contains('shadow-2xl'), true, 'sidebar shadow-2xl class must be added');
        assert.strictEqual(mockBackdrop.classList.contains('hidden'), false, 'backdrop hidden class must be removed when open');
    });

    it('closes mobile sidebar and hides backdrop when toggled again or called with false', () => {
        // First open
        toggleMobileSidebar(true);
        assert.strictEqual(mockSidebar.classList.contains('hidden'), false);
        assert.strictEqual(mockBackdrop.classList.contains('hidden'), false);

        // Then close explicitly
        toggleMobileSidebar(false);
        assert.strictEqual(mockSidebar.classList.contains('hidden'), true, 'sidebar hidden class must be added on close');
        assert.strictEqual(mockSidebar.classList.contains('fixed'), false, 'sidebar fixed class must be removed on close');
        assert.strictEqual(mockBackdrop.classList.contains('hidden'), true, 'backdrop hidden class must be added on close');
    });
});

describe('Seam 2: Mobile sidebar navigation links auto-close behavior & switchPortalSection', () => {
    let mockSidebar;
    let mockBackdrop;
    let mockNavHome;
    let mockNavFriends;
    let mockHomeView;
    let mockProfileView;
    let mockPeopleView;

    beforeEach(() => {
        mockSidebar = createMockElement('portal-sidebar', ['fixed', 'flex', 'top-12', 'bottom-0', 'left-0', 'z-40', 'shadow-2xl']);
        mockBackdrop = createMockElement('portal-sidebar-backdrop', []);
        mockNavHome = createMockElement('mobile-nav-home', ['text-gray-400']);
        mockNavFriends = createMockElement('mobile-nav-friends', ['text-gray-400']);
        mockHomeView = createMockElement('portal-home-view', ['hidden']);
        mockProfileView = createMockElement('portal-profile-view', ['hidden']);
        mockPeopleView = createMockElement('portal-people-results-view', ['hidden']);

        elementsMap['portal-sidebar'] = mockSidebar;
        elementsMap['portal-sidebar-backdrop'] = mockBackdrop;
        elementsMap['mobile-nav-home'] = mockNavHome;
        elementsMap['mobile-nav-friends'] = mockNavFriends;
        elementsMap['portal-home-view'] = mockHomeView;
        elementsMap['portal-profile-view'] = mockProfileView;
        elementsMap['portal-people-results-view'] = mockPeopleView;

        global.activePortalSection = 'none';
        global.profileShowcase3DState = { rafId: null };
        global.refreshPortalAvatarVisuals = () => {};
        global.renderHomeFriendsStrip = () => {};
        global.renderGameCatalog = () => {};
    });

    it('switchPortalSection closes mobile sidebar and hides backdrop', () => {
        switchPortalSection('home');

        assert.strictEqual(mockSidebar.classList.contains('hidden'), true, 'sidebar must be closed after switchPortalSection');
        assert.strictEqual(mockSidebar.classList.contains('fixed'), false, 'sidebar fixed class must be removed');
        assert.strictEqual(mockBackdrop.classList.contains('hidden'), true, 'backdrop must be hidden after switchPortalSection');
        assert.strictEqual(mockNavHome.classList.contains('text-white'), true, 'home nav button must be active');
        assert.strictEqual(mockNavFriends.classList.contains('text-white'), false, 'friends nav button must not be active');
    });

    it('auto-closes mobile sidebar when clicking a button or link inside portal-sidebar', () => {
        const { initPortalSidebarMobileEvents } = PortalUI;
        assert.strictEqual(typeof initPortalSidebarMobileEvents, 'function', 'initPortalSidebarMobileEvents must be exported');

        initPortalSidebarMobileEvents();

        // Simulate click event bubbling from an inside button
        const fakeButton = { nodeName: 'BUTTON', closest: (sel) => fakeButton };
        mockSidebar.dispatchEvent({
            type: 'click',
            target: fakeButton
        });

        assert.strictEqual(mockSidebar.classList.contains('hidden'), true, 'sidebar must auto-close upon clicking button');
        assert.strictEqual(mockBackdrop.classList.contains('hidden'), true, 'backdrop must hide upon clicking button in sidebar');
    });
});

describe('Seam 3: DOM integrity & Responsive Elements (index.html verification)', () => {
    const fs = require('node:fs');
    const path = require('node:path');
    const htmlPath = path.join(__dirname, '..', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    it('verifies #mobile-bottom-nav exists with all 5 required buttons', () => {
        assert.ok(html.includes('id="mobile-bottom-nav"'), 'index.html must contain #mobile-bottom-nav');
        assert.ok(html.includes("switchPortalSection('home')"), 'Mobile bottom nav must contain home button');
        assert.ok(html.includes("openShopModal('all')"), 'Mobile bottom nav must contain shop button');
        assert.ok(html.includes("openMultiplayerModal()"), 'Mobile bottom nav must contain multiplayer button');
        assert.ok(html.includes("openPeopleSearchResults('')"), 'Mobile bottom nav must contain friends button');
        assert.ok(html.includes("toggleMobileSidebar()"), 'Mobile bottom nav must contain menu toggle button');
    });

    it('verifies #home-mobile-quick-actions exists in portal-home-view with required quick buttons', () => {
        assert.ok(html.includes('id="home-mobile-quick-actions"'), 'index.html must contain #home-mobile-quick-actions in portal-home-view');
        // Check presence of Obchod, Inventář, Multiplayer, Transakce, Casino
        assert.ok(html.includes("openShopModal('all')"), 'Quick actions must contain Obchod button');
        assert.ok(html.includes("openShopModal('owned')"), 'Quick actions must contain Inventář button');
        assert.ok(html.includes("openMultiplayerModal()"), 'Quick actions must contain Multiplayer button');
        assert.ok(html.includes("openBobuxTransactionsModal()"), 'Quick actions must contain Transakce button');
        assert.ok(html.includes("openCasinoModal("), 'Quick actions must contain Casino button');
    });

    it('verifies #portal-sidebar-backdrop exists with click-to-close behavior', () => {
        assert.ok(html.includes('id="portal-sidebar-backdrop"'), 'index.html must contain #portal-sidebar-backdrop');
        assert.ok(html.includes('toggleMobileSidebar(false)'), 'Backdrop must close sidebar on click');
    });

    it('verifies main container padding and lobby chat widget positioning', () => {
        assert.ok(html.includes('pb-24'), 'Main content container must have pb-24 padding');
        assert.ok(html.includes('bottom-16 md:bottom-0'), 'Lobby chat widget must be elevated on mobile (bottom-16 md:bottom-0)');
    });
});


