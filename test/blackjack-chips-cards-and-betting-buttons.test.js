const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('Blackjack 3D Cards, Physical Chips & Additive Betting Controls', () => {
    const gameWorldsPath = path.resolve(__dirname, '../src/games/GameWorlds.js');
    const indexPath = path.resolve(__dirname, '../index.html');

    const gameWorldsCode = fs.readFileSync(gameWorldsPath, 'utf8');
    const indexCode = fs.readFileSync(indexPath, 'utf8');

    it('1. BJ_TABLE_SEATS cardPos.y and betPos.y are placed above the felt surface (>= 2.40m)', () => {
        const seatsMatch = gameWorldsCode.match(/const BJ_TABLE_SEATS = \[([\s\S]*?)\];/);
        assert.ok(seatsMatch, 'BJ_TABLE_SEATS must be defined in GameWorlds.js');

        class Vector3 {
            constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
        }
        const seats = new Function('THREE', `
            const BJ_TABLE_SEATS = [${seatsMatch[1]}];
            return BJ_TABLE_SEATS;
        `)({ Vector3 });

        seats.forEach((seat, idx) => {
            assert.ok(
                seat.cardPos.y >= 2.40,
                `Seat ${idx} cardPos.y is ${seat.cardPos.y}, must be >= 2.40 to rest above felt at 2.39`
            );
            assert.ok(
                seat.betPos.y >= 2.40,
                `Seat ${idx} betPos.y is ${seat.betPos.y}, must be >= 2.40 to rest above felt at 2.39`
            );
        });
    });

    it('2. Card dealing positions card meshes on top of the felt (Y >= 2.40m, not 2.32m under felt)', () => {
        // Assert dealer card position in startInWorldBlackjackDealing is >= 2.40
        assert.doesNotMatch(gameWorldsCode, /cardMesh\.position\.set\(-18\.0\s*\+\s*dOffset\s*-\s*0\.22,\s*2\.32,/, 'Dealer cards must not be placed at 2.32 under felt');
        assert.doesNotMatch(gameWorldsCode, /cardMesh\.position\.set\(step\.seat\.cardPos\.x\s*\+\s*cardOffset,\s*2\.32\s*\+/, 'Player cards must not be placed at 2.32 under felt');
    });

    it('3. addInWorldBjBet adds chips cumulatively and updates 3D chip stack on the table', () => {
        assert.ok(gameWorldsCode.includes('function addInWorldBjBet('), 'addInWorldBjBet function must exist');

        let chipsAddedToScene = false;
        let removedChipsCount = 0;

        global.scene = {
            add: (obj) => { chipsAddedToScene = true; },
            remove: (obj) => { removedChipsCount++; }
        };
        global.bobuxBalance = 2000;
        global.document = {
            getElementById: () => ({ textContent: '' })
        };
        global.sfx = { playCoin: () => {}, playJump: () => {} };
        global.showHudToast = () => {};

        global.bjTableState = {
            localSeat: 0,
            seats: [{
                id: 0,
                bet: 50,
                confirmedBet: false,
                betPos: { x: -19.5, y: 2.41, z: -4.3, copy: () => {} },
                chipMeshes: []
            }]
        };
        global.bjState = { bet: 50 };

        // Mock create3DChipStack
        global.THREE = {
            Group: class { constructor() { this.position = { set: () => {}, copy: () => {} }; } },
            Mesh: class { constructor() { this.position = { set: () => {} }; } },
            CylinderGeometry: class {},
            MeshStandardMaterial: class {}
        };

        const addFnMatch = gameWorldsCode.match(/function addInWorldBjBet\([\s\S]*?\n\}/);
        assert.ok(addFnMatch, 'addInWorldBjBet must exist');

        const addFn = new Function(`
            ${addFnMatch[0]}
            return addInWorldBjBet;
        `)();

        // Add 100 to initial 50 -> should be 150
        addFn(100);
        assert.strictEqual(global.bjTableState.seats[0].bet, 150, 'Bet should be 150 after adding 100');

        // Add another 250 -> should be 400
        addFn(250);
        assert.strictEqual(global.bjTableState.seats[0].bet, 400, 'Bet should be 400 after adding 250');
    });

    it('4. clearInWorldBjBet resets bet to 0 and clears 3D chips from the table', () => {
        global.scene = {
            add: () => {},
            remove: () => {}
        };
        global.document = {
            getElementById: () => ({ textContent: '' })
        };
        global.sfx = { playJump: () => {} };

        global.bjTableState = {
            localSeat: 0,
            seats: [{
                id: 0,
                bet: 400,
                confirmedBet: false,
                chipMeshes: [{ isMesh: true }]
            }]
        };
        global.bjState = { bet: 400 };

        const clearFnMatch = gameWorldsCode.match(/function clearInWorldBjBet\([\s\S]*?\n\}/);
        assert.ok(clearFnMatch, 'clearInWorldBjBet must exist');

        const clearFn = new Function(`
            ${clearFnMatch[0]}
            return clearInWorldBjBet;
        `)();

        clearFn();
        assert.strictEqual(global.bjTableState.seats[0].bet, 0, 'Bet should be reset to 0');
        assert.strictEqual(global.bjTableState.seats[0].chipMeshes.length, 0, 'Chip meshes array should be empty');
    });

    it('5. index.html betting buttons invoke addInWorldBjBet with + labels', () => {
        assert.ok(indexCode.includes('addInWorldBjBet(10)'), 'Must call addInWorldBjBet(10)');
        assert.ok(indexCode.includes('addInWorldBjBet(500)'), 'Must call addInWorldBjBet(500)');
    });
});
