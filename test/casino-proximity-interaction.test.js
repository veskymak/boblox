const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('Casino Proximity Interaction & Hotbar Cleanup', () => {
    const enginePath = path.resolve(__dirname, '../src/core/Engine.js');
    const gameWorldsPath = path.resolve(__dirname, '../src/games/GameWorlds.js');
    const physicsPath = path.resolve(__dirname, '../src/core/PhysicsAndLoop.js');
    const inputPath = path.resolve(__dirname, '../src/core/InputManager.js');
    const indexPath = path.resolve(__dirname, '../index.html');

    const engineCode = fs.readFileSync(enginePath, 'utf8');
    const gameWorldsCode = fs.readFileSync(gameWorldsPath, 'utf8');
    const physicsCode = fs.readFileSync(physicsPath, 'utf8');
    const inputCode = fs.readFileSync(inputPath, 'utf8');
    const indexCode = fs.readFileSync(indexPath, 'utf8');

    it('1. GAME_LOADOUTS in Engine.js has an empty loadout for casino', () => {
        // Assert casino loadout is empty array
        assert.match(engineCode, /casino:\s*\[\s*\]/, 'GAME_LOADOUTS.casino must be an empty array []');
        // Assert casino items are removed from WEAPON_DEFINITIONS
        assert.doesNotMatch(engineCode, /casino_blackjack:\s*\{/, 'casino_blackjack must not be in WEAPON_DEFINITIONS');
        assert.doesNotMatch(engineCode, /casino_slots:\s*\{/, 'casino_slots must not be in WEAPON_DEFINITIONS');
        assert.doesNotMatch(engineCode, /casino_wheel:\s*\{/, 'casino_wheel must not be in WEAPON_DEFINITIONS');
        assert.doesNotMatch(engineCode, /casino_derby:\s*\{/, 'casino_derby must not be in WEAPON_DEFINITIONS');
        assert.doesNotMatch(engineCode, /casino_cashier:\s*\{/, 'casino_cashier must not be in WEAPON_DEFINITIONS');
    });

    it('2. GameWorlds.js defines triggerCasinoProximityAction for stations', () => {
        assert.ok(gameWorldsCode.includes('function triggerCasinoProximityAction()'), 'Must define triggerCasinoProximityAction');
        // Test execution behavior of triggerCasinoProximityAction in simulated sandbox
        let seatedTable = false;
        let openedWheel = false;
        let openedModalTab = null;

        global.activeGameMode = 'casino';
        global.gameSpecificData = {
            activeProximityStation: { id: 'blackjack', name: 'Blackjack (21)' },
            isPlayerSeatedAtBj: false
        };
        global.sitAt3DBlackjackTable = () => { seatedTable = true; };
        global.openLuckyWheelModal = () => { openedWheel = true; };
        global.openCasinoModal = (tab) => { openedModalTab = tab; };

        // Evaluate triggerCasinoProximityAction
        const fnDef = gameWorldsCode.match(/function triggerCasinoProximityAction\(\)\s*\{[\s\S]*?\n\}/)[0];
        const triggerCasinoProximityAction = new Function('sitAt3DBlackjackTable', 'openLuckyWheelModal', 'openCasinoModal', `
            ${fnDef}
            return triggerCasinoProximityAction;
        `)(global.sitAt3DBlackjackTable, global.openLuckyWheelModal, global.openCasinoModal);

        // Test blackjack station
        triggerCasinoProximityAction();
        assert.strictEqual(seatedTable, true, 'Blackjack station must invoke sitAt3DBlackjackTable');

        // Test wheel station
        global.gameSpecificData.activeProximityStation = { id: 'wheel' };
        triggerCasinoProximityAction();
        assert.strictEqual(openedWheel, true, 'Wheel station must invoke openLuckyWheelModal');

        // Test slots station
        global.gameSpecificData.activeProximityStation = { id: 'slots' };
        triggerCasinoProximityAction();
        assert.strictEqual(openedModalTab, 'slots', 'Slots station must invoke openCasinoModal("slots")');

        // Test derby station
        global.gameSpecificData.activeProximityStation = { id: 'derby' };
        triggerCasinoProximityAction();
        assert.strictEqual(openedModalTab, 'derby', 'Derby station must invoke openCasinoModal("derby")');

        // Test cashier station
        global.gameSpecificData.activeProximityStation = { id: 'cashier' };
        triggerCasinoProximityAction();
        assert.strictEqual(openedModalTab, 'cashier', 'Cashier station must invoke openCasinoModal("cashier")');

        // Test when player is already seated at blackjack table (should not re-trigger)
        openedModalTab = null;
        global.gameSpecificData.isPlayerSeatedAtBj = true;
        triggerCasinoProximityAction();
        assert.strictEqual(openedModalTab, null, 'Must do nothing if player is already seated at table');

        // Test when activeProximityStation is null (should not trigger any action)
        global.gameSpecificData.isPlayerSeatedAtBj = false;
        global.gameSpecificData.activeProximityStation = null;
        seatedTable = false;
        openedWheel = false;
        openedModalTab = null;
        triggerCasinoProximityAction();
        assert.strictEqual(seatedTable, false);
        assert.strictEqual(openedWheel, false);
        assert.strictEqual(openedModalTab, null);
    });

    it('3. PhysicsAndLoop.js connects triggerPrimaryAction with triggerCasinoProximityAction and displays prompt [E]', () => {
        assert.ok(physicsCode.includes('triggerCasinoProximityAction'), 'PhysicsAndLoop.js must call triggerCasinoProximityAction in casino mode');
        assert.ok(physicsCode.includes('Stiskni [E] pro usednutí ke stolu!'), 'Must display Blackjack [E] prompt');
        assert.ok(physicsCode.includes('Stiskni [E] pro roztočení Kola štěstí!'), 'Must display Wheel [E] prompt');
        assert.ok(physicsCode.includes('Stiskni [E] pro otevření automatů!'), 'Must display Slots [E] prompt');
        assert.ok(physicsCode.includes('Stiskni [E] pro sázky na dostihy!'), 'Must display Derby [E] prompt');
        assert.ok(physicsCode.includes('Stiskni [E] pro pokladnu a info!'), 'Must display Cashier [E] prompt');
        // Ensure old hotbar references in casino objective text are removed
        assert.doesNotMatch(physicsCode, /vyber hru z lišty/, 'Must not mention selecting from hotbar in casino');
        assert.doesNotMatch(gameWorldsCode, /vyber hru z lišty/, 'GameWorlds must not mention selecting from hotbar in casino');
    });

    it('4. InputManager.js handles KeyE for casino and suppresses Left-Click weapon attacks', () => {
        assert.ok(inputCode.includes('KeyE'), 'InputManager must listen for KeyE');
        assert.match(inputCode, /if\s*\(activeGameMode\s*===\s*['"]casino['"]\)\s*\{\s*if\s*\(typeof triggerCasinoProximityAction/, 'KeyE must trigger triggerCasinoProximityAction in casino');
        assert.match(inputCode, /if\s*\(e\.button === 0\)\s*\{\s*\/\/[^\n]*\s*if\s*\(activeGameMode\s*===\s*['"]casino['"]\)\s*\{\s*return;/, 'LMB must return early in casino without triggering weapon actions');
    });

    it('5. index.html objective banner triggers proximity action instead of defaulting to blackjack', () => {
        assert.ok(indexCode.includes('id="hud-objective-banner"'), 'hud-objective-banner must exist');
        assert.ok(indexCode.includes('triggerCasinoProximityAction()'), 'hud-objective-banner must call triggerCasinoProximityAction');
        assert.doesNotMatch(indexCode, /openCasinoModal\(gameSpecificData\?\.activeProximityStation\?\.id\s*\|\|\s*['"]blackjack['"]\)/, 'Must not default to blackjack when clicking banner away from stations');
    });
});
