const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

describe('Seam 4: DOM Integrity & Roblox Developer Admin Modal in index.html', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

    it('contains sidebar-admin-btn in portal-sidebar', () => {
        assert.ok(html.includes('id="sidebar-admin-btn"'), '#sidebar-admin-btn must exist');
        assert.ok(html.includes('openAdminModal()'), 'Must have openAdminModal click handler');
        assert.ok(html.includes('⚡ Admin Menu') || (html.includes('⚡') && html.includes('Admin Menu')), 'Must contain ⚡ Admin Menu');
    });

    it('contains quick-action-admin in home-mobile-quick-actions', () => {
        assert.ok(html.includes('id="quick-action-admin"'), '#quick-action-admin must exist');
        assert.ok(html.includes('home-mobile-quick-actions'), 'Must be in home-mobile-quick-actions section');
    });

    it('contains admin-broadcast-banner for global announcement display outside game-viewport', () => {
        assert.ok(html.includes('id="admin-broadcast-banner"'), '#admin-broadcast-banner must exist');
        const gameViewportIdx = html.indexOf('id="game-viewport"');
        const bannerIdx = html.indexOf('id="admin-broadcast-banner"');
        // Banner should not be inside game-viewport (so it displays in lobby too)
        const gameViewportEnd = html.indexOf('<!-- CASINO MODAL', gameViewportIdx);
        const isInsideGameViewport = bannerIdx > gameViewportIdx && bannerIdx < gameViewportEnd;
        assert.strictEqual(isInsideGameViewport, false, 'admin-broadcast-banner must be at root level, not inside game-viewport');
    });

    it('contains admin-modal with all 4 tabs and panels', () => {
        assert.ok(html.includes('id="admin-modal"'), '#admin-modal must exist');

        // 4 tabs
        assert.ok(html.includes('id="admin-tab-btn-economy"'), '#admin-tab-btn-economy must exist');
        assert.ok(html.includes('id="admin-tab-btn-users"'), '#admin-tab-btn-users must exist');
        assert.ok(html.includes('id="admin-tab-btn-broadcast"'), '#admin-tab-btn-broadcast must exist');
        assert.ok(html.includes('id="admin-tab-btn-cheats"'), '#admin-tab-btn-cheats must exist');

        // 4 panels
        assert.ok(html.includes('id="admin-panel-economy"'), '#admin-panel-economy must exist');
        assert.ok(html.includes('id="admin-panel-users"'), '#admin-panel-users must exist');
        assert.ok(html.includes('id="admin-panel-broadcast"'), '#admin-panel-broadcast must exist');
        assert.ok(html.includes('id="admin-panel-cheats"'), '#admin-panel-cheats must exist');
    });

    it('contains interactive controls for economy, users, broadcast and cheats', () => {
        // Economy controls
        assert.ok(html.includes('id="admin-custom-coins-input"'), '#admin-custom-coins-input must exist');
        assert.ok(html.includes('submitAdminGiveCoins'), 'submitAdminGiveCoins handler must exist');

        // Users controls
        assert.ok(html.includes('id="admin-users-list"'), '#admin-users-list must exist');
        assert.ok(html.includes('id="admin-users-search"'), '#admin-users-search must exist');

        // Broadcast controls
        assert.ok(html.includes('id="admin-broadcast-input"'), '#admin-broadcast-input must exist');
        assert.ok(html.includes('submitAdminBroadcast()'), 'submitAdminBroadcast handler must exist');

        // Cheats controls
        assert.ok(html.includes('id="admin-godmode-status"'), '#admin-godmode-status must exist');
        assert.ok(html.includes('id="admin-superspeed-status"'), '#admin-superspeed-status must exist');
        assert.ok(html.includes('toggleAdminGodmode('), 'toggleAdminGodmode handler must exist');
        assert.ok(html.includes('toggleAdminSuperSpeed('), 'toggleAdminSuperSpeed handler must exist');
        assert.ok(html.includes('resetAdminDailyCooldown()'), 'resetAdminDailyCooldown handler must exist');
    });

    it('complies with touch target guidelines (min 44px) and Bobux color standard', () => {
        const closeBtnMatch = html.match(/<button[^>]*onclick="closeAdminModal\(\)"[^>]*>/);
        assert.ok(closeBtnMatch, 'closeAdminModal button must exist');
        assert.ok(closeBtnMatch[0].includes('w-11') || closeBtnMatch[0].includes('min-h-[44px]'), 'Modal close button must satisfy min 44px touch target');

        const cheatToggleMatch = html.match(/<button[^>]*onclick="toggleAdminGodmode\(\)"[^>]*>/);
        assert.ok(cheatToggleMatch, 'toggleAdminGodmode button must exist');
        assert.ok(cheatToggleMatch[0].includes('min-h-[44px]') || cheatToggleMatch[0].includes('h-11'), 'Godmode cheat button must satisfy min 44px touch target');

        const portalUiCode = fs.readFileSync(path.join(__dirname, '..', 'src', 'ui', 'PortalUI.js'), 'utf8');
        assert.strictEqual(portalUiCode.includes('text-[11px] text-yellow-400 font-semibold'), false, 'Should not use text-yellow-400 for Bobux currency');
        assert.ok(portalUiCode.includes('text-[#FFE066]'), 'Should use official text-[#FFE066] Bobux Gold');
        assert.ok(portalUiCode.includes("submitAdminGiveCoins(1000, 'add'") && portalUiCode.includes('min-h-[44px]'), 'Quick user actions must satisfy min 44px touch target');

        // Tabs in index.html must have min 44px height
        ['admin-tab-btn-economy', 'admin-tab-btn-users', 'admin-tab-btn-broadcast', 'admin-tab-btn-cheats'].forEach(tabId => {
            const tabMatch = html.match(new RegExp(`<button[^>]*id="${tabId}"[^>]*>`));
            assert.ok(tabMatch, `${tabId} must exist`);
            assert.ok(tabMatch[0].includes('min-h-[44px]'), `${tabId} must have min-h-[44px]`);
        });

        // Trigger buttons and preset buttons
        const sidebarBtnMatch = html.match(/<button[^>]*id="sidebar-admin-btn"[^>]*>/);
        assert.ok(sidebarBtnMatch[0].includes('min-h-[44px]'), '#sidebar-admin-btn must have min-h-[44px]');
        const quickActionMatch = html.match(/<button[^>]*id="quick-action-admin"[^>]*>/);
        assert.ok(quickActionMatch[0].includes('min-h-[44px]'), '#quick-action-admin must have min-h-[44px]');

        // Bobux presets in index.html must use text-[#FFE066]
        const economyPanel = html.substring(html.indexOf('id="admin-panel-economy"'), html.indexOf('id="admin-panel-users"'));
        assert.strictEqual(economyPanel.includes('text-yellow-400'), false, 'Bobux currency in economy panel should not use text-yellow-400');
        assert.ok(economyPanel.includes('text-[#FFE066]'), 'Bobux currency in economy panel should use text-[#FFE066]');
    });
});


