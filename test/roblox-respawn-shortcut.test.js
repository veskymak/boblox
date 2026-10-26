const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('Roblox Respawn [R] Shortcut Integrity', () => {
    let keydownHandler = null;
    let respawnManualCalled = false;
    let respawnFromMenuCalled = false;
    let reloadWeaponCalled = false;

    beforeEach(() => {
        respawnManualCalled = false;
        respawnFromMenuCalled = false;
        reloadWeaponCalled = false;

        // Minimal browser globals
        const canvasEl = {
            addEventListener: () => {},
            removeEventListener: () => {},
            focus: () => {}
        };

        global.document = {
            readyState: 'loading',
            activeElement: null,
            getElementById: (id) => {
                if (id === 'three-canvas') return canvasEl;
                return null;
            },
            pointerLockElement: null,
            addEventListener: () => {},
            removeEventListener: () => {}
        };
        global.window = {
            addEventListener: (evt, handler) => {
                if (evt === 'keydown') keydownHandler = handler;
            },
            removeEventListener: () => {}
        };
        global.navigator = { maxTouchPoints: 0 };
        global.updateNickname = () => {};
        global.mpState = { nick: 'Player' };
        global.STORAGE_KEY_NICK = 'nick';
        global.localStorage = { getItem: () => null, setItem: () => {} };
        global.touchState = {};
        global.keysPressed = {};
        global.camState = { yaw: 0, pitch: 0, distance: 12 };
        global.playerState = { weaponLoadout: [] };
        global.activeGameMode = 'obby';
        global.robloxUiState = {
            isMenuOpen: false,
            isChatOpen: false,
            shiftLockEnabled: true,
            isShiftLocked: false,
            isPerfStatsOpen: false
        };

        global.toggleRobloxEscMenu = () => {};
        global.leaveFromRobloxMenu = () => {};
        global.respawnFromRobloxMenu = () => {
            respawnFromMenuCalled = true;
        };
        global.respawnPlayerManual = () => {
            respawnManualCalled = true;
        };
        global.reloadCurrentWeapon = () => {
            reloadWeaponCalled = true;
        };
        global.triggerPrimaryAction = () => {};

        // Load InputManager.js
        const inputMgrCode = fs.readFileSync(path.join(__dirname, '../src/core/InputManager.js'), 'utf8');
        eval(inputMgrCode);
    });

    function dispatchKeydown(eventProps) {
        let defaultPrevented = false;
        const event = {
            preventDefault: () => { defaultPrevented = true; },
            stopPropagation: () => {},
            repeat: false,
            ...eventProps
        };
        keydownHandler(event);
        return { defaultPrevented };
    }

    it('does NOT trigger respawnPlayerManual when pressing KeyR during active gameplay (menu closed)', () => {
        global.robloxUiState.isMenuOpen = false;

        dispatchKeydown({ code: 'KeyR', key: 'r' });

        assert.strictEqual(respawnManualCalled, false, 'KeyR during gameplay must not respawn player');
        assert.strictEqual(respawnFromMenuCalled, false);
    });

    it('triggers respawnFromRobloxMenu when pressing KeyR while Roblox ESC menu is open', () => {
        global.robloxUiState.isMenuOpen = true;

        const res = dispatchKeydown({ code: 'KeyR', key: 'r' });

        assert.strictEqual(respawnFromMenuCalled, true, 'KeyR when menu is open must trigger respawnFromRobloxMenu');
        assert.strictEqual(res.defaultPrevented, true, 'KeyR shortcut should preventDefault when menu is open');
    });

    it('still allows reloading weapon with KeyF during active gameplay', () => {
        global.robloxUiState.isMenuOpen = false;

        dispatchKeydown({ code: 'KeyF', key: 'f' });

        assert.strictEqual(reloadWeaponCalled, true, 'KeyF must trigger reloadCurrentWeapon');
    });
});
