const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('Blackjack Table Geometry, Game Loop Freeze & Nearest Chair First-Person Camera', () => {
    const gameWorldsPath = path.resolve(__dirname, '../src/games/GameWorlds.js');
    const physicsPath = path.resolve(__dirname, '../src/core/PhysicsAndLoop.js');
    const inputPath = path.resolve(__dirname, '../src/core/InputManager.js');

    const gameWorldsCode = fs.readFileSync(gameWorldsPath, 'utf8');
    const physicsCode = fs.readFileSync(physicsPath, 'utf8');
    const inputCode = fs.readFileSync(inputPath, 'utf8');

    it('1. PhysicsAndLoop.js does NOT reference undefined seat.worldPos (which freezes gameLoop)', () => {
        // Assert that seat.worldPos is not read in PhysicsAndLoop.js
        const matches = physicsCode.match(/seat\.worldPos/g);
        assert.strictEqual(matches, null, 'PhysicsAndLoop.js must not reference seat.worldPos because BJ_TABLE_SEATS only defines pos and chairPos');
    });

    it('2. sitAt3DBlackjackTable selects the NEAREST free chair to the player position', () => {
        // Mock Three.js Vector3
        class Vector3 {
            constructor(x = 0, y = 0, z = 0) {
                this.x = x; this.y = y; this.z = z;
            }
            copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
            set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
            distanceTo(v) {
                return Math.hypot(this.x - v.x, this.y - v.y, this.z - v.z);
            }
        }
        global.THREE = { Vector3 };

        // Extract sitAt3DBlackjackTable implementation
        const sitFnMatch = gameWorldsCode.match(/function sitAt3DBlackjackTable\([\s\S]*?\n\}/);
        assert.ok(sitFnMatch, 'sitAt3DBlackjackTable must exist in GameWorlds.js');

        // Setup test seats
        const seats = [
            { id: 0, label: 'Místo 1', pos: new Vector3(-21.2, 1.8, -5.8), chairPos: new Vector3(-21.2, 0.9, -5.0), occupied: false },
            { id: 1, label: 'Místo 2', pos: new Vector3(-19.3, 1.8, -4.8), chairPos: new Vector3(-19.3, 0.9, -4.0), occupied: false },
            { id: 2, label: 'Místo 3', pos: new Vector3(-16.7, 1.8, -4.8), chairPos: new Vector3(-16.7, 0.9, -4.0), occupied: false },
            { id: 3, label: 'Místo 4', pos: new Vector3(-14.8, 1.8, -5.8), chairPos: new Vector3(-14.8, 0.9, -5.0), occupied: false }
        ];

        global.activeGameMode = 'casino';
        global.bjTableState = { seats, localSeat: -1 };
        global.bjState = { bet: 50 };
        global.gameSpecificData = { isPlayerSeatedAtBj: false };
        global.showGtaNotification = () => {};
        global.setInWorldBjBet = () => {};
        global.updateInWorldBjUI = () => {};
        global.sendMultiplayerPacket = () => {};
        global.document = { pointerLockElement: null, exitPointerLock: () => {}, getElementById: () => null };

        // Test with player near Místo 4 (Seat 3)
        global.playerState = {
            pos: new Vector3(-14.9, 1.8, -5.1),
            vel: new Vector3()
        };

        const sitFn = new Function('Vector3', `
            return (${sitFnMatch[0]});
        `)(Vector3);

        sitFn();
        assert.strictEqual(global.bjTableState.localSeat, 3, 'Should select seat 3 (Místo 4) as it is closest to player (-14.9, 1.8, -5.1)');

        // Test when nearest seat is occupied, should pick next nearest
        global.bjTableState.seats[3].occupied = true;
        global.bjTableState.localSeat = -1;
        sitFn();
        assert.strictEqual(global.bjTableState.localSeat, 2, 'Should select seat 2 (Místo 3) when seat 3 is occupied');
    });

    it('3. Table geometry and armrest are correctly aligned in +Z semicircular direction', () => {
        // armrestMesh and railMesh must not have rotation.z = Math.PI which flips them backwards behind dealer
        assert.doesNotMatch(gameWorldsCode, /armrestMesh\.rotation\.z\s*=\s*Math\.PI/, 'armrestMesh must not have rotation.z = Math.PI');
        assert.doesNotMatch(gameWorldsCode, /railMesh\.rotation\.z\s*=\s*Math\.PI/, 'railMesh must not have rotation.z = Math.PI');

        // feltMesh and baseMesh must not have rotation.y = Math.PI which rotates them away
        assert.doesNotMatch(gameWorldsCode, /feltMesh\.rotation\.y\s*=\s*Math\.PI/, 'feltMesh must not have rotation.y = Math.PI');
        assert.doesNotMatch(gameWorldsCode, /baseMesh\.rotation\.y\s*=\s*Math\.PI/, 'baseMesh must not have rotation.y = Math.PI');
    });

    it('4. Camera is placed in first person view when seated at Blackjack table', () => {
        // Assert first person camera logic: should position near seat eye level and look at table felt
        assert.ok(physicsCode.includes('isPlayerSeatedAtBj'), 'Camera logic must handle isPlayerSeatedAtBj');
        assert.doesNotMatch(physicsCode, /tableFeltCenter\s*=\s*new THREE\.Vector3\(-18,\s*2\.35,\s*0\)/, 'tableFeltCenter must not point to Z=0 (table is at Z=-8)');
    });
});
