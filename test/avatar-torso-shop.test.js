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
global.document = {
    getElementById: (id) => null,
    querySelectorAll: (sel) => [],
    addEventListener: () => {},
    createElement: () => ({ getContext: () => null })
};
global.setInterval = () => ({ unref: () => {} });
global.setTimeout = () => ({ unref: () => {} });
global.STORAGE_KEY_TORSO = 'boblox_avatar_torso_hex_v1';
global.sfx = { playCoin: () => {} };

const PortalUI = require('../src/ui/PortalUI.js');
const { setAvatarTorsoColor } = PortalUI;

describe('Seam 1: setAvatarTorsoColor (State & 3D Preview Rebuild)', () => {
    beforeEach(() => {
        global.avatarTorsoHex = '#0D69AC';
        storageStore['boblox_avatar_torso_hex_v1'] = '#0D69AC';
    });

    it('updates avatarTorsoHex, persists to localStorage, and invokes rebuildShopPreviewAvatar and syncAccountToServer', () => {
        assert.strictEqual(typeof setAvatarTorsoColor, 'function', 'setAvatarTorsoColor must be exported from PortalUI.js');

        let rebuildCalled = false;
        let syncCalled = false;
        let renderShopCalled = false;

        global.rebuildShopPreviewAvatar = () => { rebuildCalled = true; };
        global.syncAccountToServer = async () => { syncCalled = true; };
        global.renderShop = () => { renderShopCalled = true; };

        setAvatarTorsoColor('#DC2626');

        assert.strictEqual(global.avatarTorsoHex, '#DC2626', 'avatarTorsoHex must be updated to red');
        assert.strictEqual(global.localStorage.getItem('boblox_avatar_torso_hex_v1'), '#DC2626', 'Must save new torso hex in localStorage');
        assert.strictEqual(rebuildCalled, true, 'rebuildShopPreviewAvatar() must be called to immediately update 3D preview');
        assert.strictEqual(syncCalled, true, 'syncAccountToServer() must be called to persist on server');
        assert.strictEqual(renderShopCalled, true, 'renderShop() must be called to update shop UI');
    });
});

describe('Seam 2: Shop Torso Tab & Palette UI (renderShop & updateTorsoColorUI)', () => {
    it('renders torso color tiles in shop grid when category is torso', () => {
        const AvatarAndShop = require('../src/core/AvatarAndShop.js');
        const { renderShop, shopState, TORSO_COLORS, updateTorsoColorUI } = AvatarAndShop;

        assert.ok(Array.isArray(TORSO_COLORS), 'TORSO_COLORS array must be exported');
        assert.ok(TORSO_COLORS.length >= 5, 'Must provide at least 5 torso colors');
        assert.strictEqual(typeof renderShop, 'function', 'renderShop must be exported');
        assert.strictEqual(typeof updateTorsoColorUI, 'function', 'updateTorsoColorUI must be exported');

        // Setup mock DOM elements for shop
        const elements = {
            'shop-grid': { innerHTML: '' },
            'shop-action-panel': { innerHTML: '' },
            'shop-worn-list': { innerHTML: '' },
            'shop-bobux-count': { textContent: '' },
            'shop-torso-name-indicator': { textContent: '' }
        };

        const tabElements = [
            { cat: 'all', className: '', getAttribute: () => 'all' },
            { cat: 'torso', className: '', getAttribute: () => 'torso' }
        ];

        const paletteButtons = TORSO_COLORS.map(c => ({
            hex: c.hex,
            className: '',
            style: {},
            getAttribute: (attr) => attr === 'data-torso-hex' ? c.hex : null
        }));

        global.document = {
            getElementById: (id) => elements[id] || null,
            querySelectorAll: (sel) => {
                if (sel === '.shop-tab') return tabElements;
                if (sel.includes('data-torso-hex')) return paletteButtons;
                return [];
            },
            createElement: () => ({ getContext: () => null })
        };

        global.avatarTorsoHex = '#DC2626';
        global.bobuxBalance = 250;
        shopState.category = 'torso';

        renderShop();

        // Check that shop-grid contains tiles for each torso color
        const gridHtml = elements['shop-grid'].innerHTML;
        assert.ok(gridHtml.includes('setAvatarTorsoColor'), 'Tiles must have onclick to setAvatarTorsoColor');
        assert.ok(gridHtml.includes('#DC2626'), 'Grid must contain #DC2626');
        assert.ok(gridHtml.includes('Vybráno'), 'Selected color tile must show Vybráno');
        assert.ok(gridHtml.includes('ZDARMA'), 'Unselected torso colors must show ZDARMA');

        // Test updateTorsoColorUI
        updateTorsoColorUI();
        const activePaletteBtn = paletteButtons.find(b => b.hex === '#DC2626');
        assert.ok(activePaletteBtn.className.includes('border-white') || activePaletteBtn.className.includes('ring-2'), 'Active palette button must have active selection style');
        assert.strictEqual(activePaletteBtn.style.backgroundColor, '#DC2626', 'Active palette button must retain its background color');
        assert.strictEqual(elements['shop-torso-name-indicator'].textContent, 'Crimson Červená');
    });
});

describe('Seam 3: Navigation Redirection & DOM Backward Compatibility', () => {
    it('redirects openAvatarPreviewModal() to openShopModal()', () => {
        const { openAvatarPreviewModal } = require('../src/ui/PortalUI.js');
        let shopOpened = false;
        let shopCat = null;
        global.openShopModal = (cat) => {
            shopOpened = true;
            shopCat = cat;
        };

        openAvatarPreviewModal();
        assert.strictEqual(shopOpened, true, 'openAvatarPreviewModal must redirect to openShopModal()');
    });

    it('verifies index.html preserves #avatar-modal while redirecting buttons to openShopModal()', () => {
        const fs = require('node:fs');
        const path = require('node:path');
        const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

        // Requirement 5: avatar-modal preserved in DOM as hidden
        assert.ok(html.includes('id="avatar-modal"'), 'Must keep #avatar-modal in DOM for compatibility');
        assert.ok(/id="avatar-modal"[^>]*hidden/.test(html), '#avatar-modal must have hidden class');

        // Requirement 4: sidebar and auth buttons call openShopModal()
        assert.ok(html.includes('onclick="openShopModal()" class="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-[#232527] text-gray-300 hover:text-white transition">\n                    <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">\n                        <circle cx="12" cy="6" r="3"/>\n                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 11h12M9 11v9m6-9v9"/>\n                    </svg>\n                    <span>Avatar</span>') ||
                  html.includes('onclick="openShopModal()') && html.includes('<span>Avatar</span>'),
                  'Sidebar Avatar button must redirect to openShopModal()');

        assert.ok(html.includes('closeAuthModal(); openShopModal();'), 'Auth modal button must redirect to openShopModal()');

        // Requirement 1: left panel palette in shop-modal
        assert.ok(html.includes('id="shop-torso-palette"'), 'Shop modal left panel must have #shop-torso-palette');
        assert.ok(html.includes('data-torso-hex="#0D69AC"'), 'Palette must have buttons with data-torso-hex');

        // Requirement 2: torso category tab in shop-modal
        assert.ok(html.includes('data-cat="torso"'), 'Shop modal catalog must have tab with data-cat="torso"');
    });
});


