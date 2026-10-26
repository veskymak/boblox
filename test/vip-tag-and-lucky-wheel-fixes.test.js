const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Setup global browser shims for Node testing
global.window = global;
global.window.addEventListener = () => {};
const origSetInterval = global.setInterval;
global.setInterval = (...args) => {
    const id = origSetInterval(...args);
    if (id && typeof id.unref === 'function') id.unref();
    return id;
};
const origSetTimeout = global.setTimeout;
global.setTimeout = (...args) => {
    const id = origSetTimeout(...args);
    if (id && typeof id.unref === 'function') id.unref();
    return id;
};
global.sfx = { playCoin: () => {}, playJackpot: () => {}, playWinFanfare: () => {} };
global.showHudToast = () => {};
global.syncAccountToServer = async () => {};
global.localStorage = {
    _data: new Map(),
    getItem(k) { return this._data.get(k) || null; },
    setItem(k, v) { this._data.set(k, String(v)); },
    removeItem(k) { this._data.delete(k); },
    clear() { this._data.clear(); }
};
function createMockClassList(initialClasses = []) {
    const classes = new Set(initialClasses);
    return {
        classes,
        add(c) { classes.add(c); },
        remove(c) { classes.delete(c); },
        toggle(c, val) {
            if (val === undefined) val = !classes.has(c);
            if (val) classes.add(c); else classes.delete(c);
            return val;
        },
        contains(c) { return classes.has(c); },
        has(c) { return classes.has(c); }
    };
}

global.sessionStorage = global.localStorage;
global.document = {
    getElementById: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    createElement: () => ({ classList: createMockClassList(), appendChild() {} })
};

const repoRoot = path.resolve(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const gameWorldsSource = fs.readFileSync(path.join(repoRoot, 'src', 'games', 'GameWorlds.js'), 'utf8');
const serverJsSource = fs.readFileSync(path.join(repoRoot, 'server.js'), 'utf8');
const portalStoreSource = fs.readFileSync(path.join(repoRoot, 'src', 'state', 'PortalStore.js'), 'utf8');
const portalUiSource = fs.readFileSync(path.join(repoRoot, 'src', 'ui', 'PortalUI.js'), 'utf8');
const networkManagerSource = fs.readFileSync(path.join(repoRoot, 'src', 'network', 'NetworkManager.js'), 'utf8');

describe('Lucky Wheel Overhaul & Universal VIP Tag Mechanics', () => {

    describe('1. Lucky Wheel UI & DOM Integrity (No duplicate IDs, Accurate Bobux, Autospin)', () => {
        it('features lucky-wheel-canvas in lucky-wheel-modal distinct from casino-wheel-canvas', () => {
            assert.ok(indexHtml.includes('id="lucky-wheel-canvas"'), 'lucky-wheel-modal must have unique lucky-wheel-canvas');
            assert.ok(indexHtml.includes('id="casino-wheel-canvas"'), 'casino tab must retain casino-wheel-canvas');
            
            // Check that IDs are not duplicated in index.html
            const luckyCanvasCount = (indexHtml.match(/id="lucky-wheel-canvas"/g) || []).length;
            const casinoCanvasCount = (indexHtml.match(/id="casino-wheel-canvas"/g) || []).length;
            assert.equal(luckyCanvasCount, 1, 'lucky-wheel-canvas must appear exactly once');
            assert.equal(casinoCanvasCount, 1, 'casino-wheel-canvas must appear exactly once');
        });

        it('features dedicated lucky-wheel IDs avoiding DOM collisions with hidden tabs', () => {
            assert.ok(indexHtml.includes('id="lucky-wheel-daily-status"'), 'lucky-wheel-daily-status must exist');
            assert.ok(indexHtml.includes('id="lucky-wheel-status-msg"'), 'lucky-wheel-status-msg must exist');
            assert.ok(indexHtml.includes('id="lucky-wheel-spin-btn"'), 'lucky-wheel-spin-btn must exist');
            assert.ok(indexHtml.includes('id="lucky-wheel-btn-text"'), 'lucky-wheel-btn-text must exist');
            assert.ok(indexHtml.includes('id="wheel-autospin-toggle-btn"'), 'wheel-autospin-toggle-btn must exist');
            assert.ok(indexHtml.includes('id="wheel-autospin-label"'), 'wheel-autospin-label must exist');
            assert.ok(indexHtml.includes('id="wheel-modal-bobux-display"'), 'wheel-modal-bobux-display must exist');
        });

        it('has removed Podium Supercar and features VIP Tag in teaser texts', () => {
            assert.ok(!indexHtml.includes('Podium Supercar'), 'Podium Supercar must be removed from index.html');
            assert.ok(!gameWorldsSource.includes('Superkáru'), 'Superkáru must be removed from GameWorlds.js');
            assert.ok(indexHtml.includes('VIP Tag'), 'index.html must tease VIP Tag on the wheel');
        });

        it('configures WHEEL_PRIZES[0] as VIP TAG with 3 500 B$ jackpot payout', () => {
            const start = gameWorldsSource.indexOf('const WHEEL_PRIZES = [');
            const end = gameWorldsSource.indexOf('];', start);
            assert.notEqual(start, -1);
            const context = {};
            vm.runInNewContext(`${gameWorldsSource.slice(start, end + 2)}; globalThis.prizes = WHEEL_PRIZES;`, context);
            const jackpot = context.prizes[0];
            assert.equal(jackpot.label, 'VIP TAG');
            assert.equal(jackpot.icon, '👑');
            assert.equal(jackpot.isJackpot, true);
            assert.equal(jackpot.amount, 3500);
        });
    });

    describe('2. VIP Tag State, Persistence & Backend Synchronization', () => {
        it('exports isCurrentUserVip and grantCurrentUserVip in PortalStore', () => {
            const PortalStore = require('../src/state/PortalStore.js');
            assert.equal(typeof PortalStore.isCurrentUserVip, 'function');
            assert.equal(typeof PortalStore.grantCurrentUserVip, 'function');
        });

        it('grantCurrentUserVip sets local storage flag and updates user state', () => {
            const storage = new Map();
            global.localStorage = {
                getItem: (k) => storage.get(k) || null,
                setItem: (k, v) => storage.set(k, String(v)),
                removeItem: (k) => storage.delete(k)
            };
            global.sessionStorage = global.localStorage;
            global.authState = { user: { username: 'Tester', inventory: {} } };

            const PortalStore = require('../src/state/PortalStore.js');
            PortalStore.grantCurrentUserVip();

            assert.equal(PortalStore.isCurrentUserVip(), true);
            assert.equal(storage.get('boblox_is_vip_v1'), 'true');
            assert.equal(global.authState.user.is_vip, true);
            assert.equal(global.authState.user.inventory.is_vip, true);
        });

        it('persists is_vip in server.js /api/user/sync and serializes for client', () => {
            assert.match(serverJsSource, /is_vip:\s*\(typeof body\.is_vip === 'boolean'\s*\?\s*body\.is_vip/);
            assert.match(serverJsSource, /is_vip:\s*isVip/);
        });

        it('persists is_vip in Supabase and offline fallback handlers', () => {
            assert.match(portalStoreSource, /updatePayload\.inventory = \{\s*\.\.\.currentInv,\s*is_vip:/);
            assert.match(portalStoreSource, /currentUser\.inventory = \{\s*\.\.\.currentInv,\s*is_vip:/);
        });

        it('hydrates VIP status across devices upon login via applyAuthenticatedUser', () => {
            const storage = new Map();
            global.localStorage = {
                getItem: (k) => storage.get(k) || null,
                setItem: (k, v) => storage.set(k, String(v))
            };
            global.authState = { user: null };

            const PortalStore = require('../src/state/PortalStore.js');
            PortalStore.applyAuthenticatedUser({
                id: '123',
                username: 'CloudVipUser',
                is_vip: true,
                inventory: { is_vip: true }
            });

            assert.equal(PortalStore.isCurrentUserVip(), true);
            assert.equal(storage.get('boblox_is_vip_v1'), 'true');
        });
    });

    describe('3. Multiplayer Presence & Cross-Client Broadcast (Not Local Only)', () => {
        it('includes isVip in broadcastGameAnnounce and broadcastLocalPlayerState', () => {
            assert.match(networkManagerSource, /broadcastGameAnnounce[\s\S]*?isVip:\s*typeof isCurrentUserVip === 'function'/);
            assert.match(networkManagerSource, /broadcastLocalPlayerState[\s\S]*?isVip:\s*typeof isCurrentUserVip === 'function'/);
        });

        it('stores remote player isVip status when receiving peer announce and state packets', () => {
            assert.match(networkManagerSource, /handleRemotePlayerAnnounce[\s\S]*?isVip:\s*!!payload\.isVip/);
            assert.match(networkManagerSource, /if \(packet\.isVip !== undefined\)\s*rp\.isVip\s*=\s*!!packet\.isVip/);
        });

        it('renders golden VIP tag in 3D overhead nameplate sprite when isVip is true', () => {
            assert.match(networkManagerSource, /function createNameplateSprite\(nameText,\s*isVip\s*=\s*false\)/);
            assert.match(networkManagerSource, /ctx\.fillText\('VIP',/);
            assert.match(networkManagerSource, /isVip \? '#FFE066' : '#00A2FF'/);
        });

        it('propagates isVip in in-game chat messages across network', () => {
            assert.match(portalUiSource, /appendRobloxChatMessage\(senderName,\s*text,\s*isVip\s*=\s*false\)/);
            assert.match(portalUiSource, /sendMultiplayerPacket\(\{[\s\S]*?type:\s*'chatMessage'[\s\S]*?isVip:\s*myProfile\.isVip/);
            assert.match(networkManagerSource, /appendRobloxChatMessage\(cleanSender,\s*cleanMsg,\s*!!packet\.isVip\)/);
        });
    });

    describe('4. Universal UI Display: Player List, ESC Menu, & Boblox Lobby', () => {
        let mockElements;
        beforeEach(() => {
            mockElements = {};
            global.document = {
                addEventListener: () => {},
                removeEventListener: () => {},
                querySelectorAll: () => [],
                getElementById: (id) => {
                    if (!mockElements[id]) {
                        mockElements[id] = {
                            id,
                            textContent: '',
                            innerHTML: '',
                            classList: createMockClassList(['hidden']),
                            children: [],
                            appendChild(c) { this.children.push(c); return c; }
                        };
                    }
                    return mockElements[id];
                },
                createElement: (tag) => ({
                    tag,
                    className: '',
                    textContent: '',
                    innerHTML: '',
                    children: [],
                    appendChild(c) { this.children.push(c); return c; },
                    querySelector(selector) {
                        return this;
                    }
                })
            };
        });

        it('renders VIP tag in top-right player list (renderRobloxTopRightPlayerList)', () => {
            const PortalUI = require('../src/ui/PortalUI.js');
            global.activeGameMode = null;
            global.mpState = {
                remotePlayers: {
                    p1: { id: 'p1', nickname: 'NormalPlayer', isVip: false, lastSeen: performance.now() },
                    p2: { id: 'p2', nickname: 'VipLegend', isVip: true, lastSeen: performance.now() }
                }
            };

            PortalUI.renderRobloxTopRightPlayerList();

            const rowsEl = global.document.getElementById('roblox-playerlist-rows');
            assert.ok(rowsEl.children.length >= 2);
            
            // Player 1 should not have VIP badge
            const rowNormal = rowsEl.children.find(r => r.children[0]?.children[0]?.textContent === 'NormalPlayer');
            assert.ok(rowNormal, 'Normal player row should exist');
            const vip1 = rowNormal.children[0].children.find(c => c.textContent === 'VIP');
            assert.equal(vip1, undefined, 'Normal player must not have VIP badge');

            // Player 2 must have VIP badge
            const rowVip = rowsEl.children.find(r => r.children[0]?.children[0]?.textContent === 'VipLegend');
            assert.ok(rowVip, 'VIP player row should exist');
            const vip2 = rowVip.children[0].children.find(c => c.textContent === 'VIP');
            assert.ok(vip2, 'VIP player must have VIP badge rendered');
            assert.equal(vip2.textContent, 'VIP');
        });

        it('renders VIP badge in Boblox lobby (sidebar, nav, banner, profile)', () => {
            const PortalStore = require('../src/state/PortalStore.js');
            global.authState = { user: { username: 'VipHero', is_vip: true, inventory: { is_vip: true } } };
            global.bobuxBalance = 5000;
            global.ownedShopItems = new Set();
            global.gamesPlayedCount = 10;

            // Trigger updateAuthUI
            PortalStore.grantCurrentUserVip();

            const sidebarBadge = global.document.getElementById('sidebar-vip-badge');
            const navBadge = global.document.getElementById('nav-vip-badge');
            const bannerBadge = global.document.getElementById('banner-vip-badge');
            const profileBadge = global.document.getElementById('profile-vip-badge');

            assert.equal(sidebarBadge.classList.has('hidden'), false, 'Sidebar VIP badge must be visible');
            assert.equal(navBadge.classList.has('hidden'), false, 'Nav VIP badge must be visible');
            assert.equal(bannerBadge.classList.has('hidden'), false, 'Banner VIP badge must be visible');
            assert.equal(profileBadge.classList.has('hidden'), false, 'Profile VIP badge must be visible');
        });

        it('updates wheel-modal-bobux-display with accurate balance in updateBobuxUI', () => {
            const wheelBobuxEl = global.document.getElementById('wheel-modal-bobux-display');
            const PortalStore = require('../src/state/PortalStore.js');

            // Add bobux
            PortalStore.addBobux(12500, 'Balance check');

            assert.ok(wheelBobuxEl.textContent.includes('12'), 'wheel-modal-bobux-display must reflect accurate balance');
            assert.ok(wheelBobuxEl.textContent.includes('B$'));
        });
    });
});
