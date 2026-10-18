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
});

