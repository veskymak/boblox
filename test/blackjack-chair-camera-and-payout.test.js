const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('Blackjack Chair Clipping, Camera Framing, Single Payout & Spectator Betting', () => {
    const gameWorldsPath = path.resolve(__dirname, '../src/games/GameWorlds.js');
    const physicsPath = path.resolve(__dirname, '../src/core/PhysicsAndLoop.js');

    const gameWorldsCode = fs.readFileSync(gameWorldsPath, 'utf8');
    const physicsCode = fs.readFileSync(physicsPath, 'utf8');

    it('1. BJ_TABLE_SEATS chairs are placed outside the table armrest radius (>= 5.4m from center) to prevent clipping', () => {
        // Extract BJ_TABLE_SEATS definition
        const seatsMatch = gameWorldsCode.match(/const BJ_TABLE_SEATS = \[([\s\S]*?)\];/);
        assert.ok(seatsMatch, 'BJ_TABLE_SEATS must be defined in GameWorlds.js');

        // Evaluate seats with mocked Vector3
        class Vector3 {
            constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
        }
        const seats = new Function('THREE', `
            const BJ_TABLE_SEATS = [${seatsMatch[1]}];
            return BJ_TABLE_SEATS;
        `)({ Vector3 });

        assert.strictEqual(seats.length, 4, 'Must have 4 seats');
        seats.forEach((seat, idx) => {
            const chairPos = seat.chairPos || seat.pos;
            const dist = Math.hypot(chairPos.x - (-18.0), chairPos.z - (-8.0));
            assert.ok(
                dist >= 5.4,
                `Seat ${idx} (${seat.label}) chairPos is at distance ${dist.toFixed(2)}m from table center, which is too close (< 5.4m) and clips into the armrest!`
            );
        });
    });

    it('2. Camera eye height when seated at Blackjack is elevated (>= 3.0m) to provide full view of table and cards', () => {
        // Ensure eyeY is at least 3.0 in PhysicsAndLoop.js camera logic
        const cameraBlockMatch = physicsCode.match(/if \(activeGameMode === 'casino'[\s\S]*?camera\.lookAt\(tableFeltCenter\);/);
        assert.ok(cameraBlockMatch, 'Seated camera block must exist in PhysicsAndLoop.js');
        const eyeYMatch = cameraBlockMatch[0].match(/eyeY\s*=\s*([^;]+);/);
        assert.ok(eyeYMatch, 'eyeY calculation must exist');
        // Test that eyeY evaluation is >= 3.0 with sPos.y = 1.8
        const sPos = { x: -20, y: 1.8, z: -3 };
        const eyeY = new Function('sPos', `return (${eyeYMatch[1]});`)(sPos);
        assert.ok(eyeY >= 3.0, `eyeY is ${eyeY}, must be >= 3.0 to avoid being too low and close to table`);
    });

    it('3. resolveInWorldBlackjackPayout awards Bobux exactly ONCE on win or push (no double payout)', () => {
        // Check that finishBlackjackRound does not duplicate addBobux when called from resolveInWorldBlackjackPayout
        let bobuxAwardCount = 0;
        let awardedAmounts = [];

        global.addBobux = (amt, reason) => {
            bobuxAwardCount++;
            awardedAmounts.push({ amt, reason });
        };
        global.updateCasinoBobuxDisplay = () => {};
        global.updateInWorldBjUI = () => {};
        global.sfx = { playWinFanfare: () => {}, playCoin: () => {}, playOof: () => {} };
        global.showGtaNotification = () => {};
        global.spawnObbyConfetti = () => {};
        global.renderHandCards = () => {};
        global.calculateHandScore = (cards) => {
            let total = 0;
            cards.forEach(c => total += c.val);
            return { total, isBust: false, isBlackjack: false };
        };
        global.document = { getElementById: () => null };

        global.bjTableState = {
            phase: 'dealer',
            localSeat: 0,
            seats: [{
                id: 0,
                occupied: true,
                hands: [{ cards: [{ val: 10 }, { val: 10 }], bet: 500 }],
                pos: { x: 0, y: 0, z: 0, clone: () => ({ add: () => ({}) }) }
            }]
        };
        global.bjState = { phase: 'playing', dealerHand: [], bet: 500, betBeforeDouble: null };

        // Extract functions from GameWorlds.js
        const resolveMatch = gameWorldsCode.match(/function resolveInWorldBlackjackPayout\([\s\S]*?\n\}/);
        const finishMatch = gameWorldsCode.match(/function finishBlackjackRound\([\s\S]*?\n\}/);

        const resolveFn = new Function('finishBlackjackRound', `
            ${finishMatch[0]}
            ${resolveMatch[0]}
            return resolveInWorldBlackjackPayout;
        `)(new Function());

        // Test push (tie) where dealer has 20 and player has 20
        resolveFn({ total: 20, isBust: false, isBlackjack: false });

        assert.strictEqual(bobuxAwardCount, 1, `addBobux must be called exactly 1 time on push, but was called ${bobuxAwardCount} times!`);
    });

    it('4. Unconfirmed bets do NOT deal cards or deduct Bobux, and table does not start if no bets were confirmed', () => {
        let spentBobux = false;
        global.spendBobux = () => { spentBobux = true; };
        global.updateCasinoBobuxDisplay = () => {};
        global.updateInWorldBjUI = () => {};
        global.showGtaNotification = () => {};
        global.createShuffledDeck = () => [];
        global.deal3DCardToSeat = () => {};
        global.create3DCardMesh = () => ({});
        global.scene = { add: () => {}, remove: () => {} };

        global.bjTableState = {
            phase: 'betting',
            phaseTimer: 0,
            localSeat: 0,
            deck: [{ val: 10 }],
            seats: [{
                id: 0,
                occupied: true,
                confirmedBet: false, // Player sat down but NEVER clicked Potvrdit Sázku
                bet: 50,
                hands: []
            }]
        };

        const startDealingMatch = gameWorldsCode.match(/function startInWorldBlackjackDealing\(\)\s*\{[\s\S]*?\n\}/);
        const startDealingFn = new Function(`
            ${startDealingMatch[0]}
            return startInWorldBlackjackDealing;
        `)();

        startDealingFn();

        assert.strictEqual(spentBobux, false, 'Must not spend Bobux if player did not confirm bet');
        assert.strictEqual(global.bjTableState.seats[0].hands.length, 0, 'Must not deal hands to player who did not confirm bet');
        assert.strictEqual(global.bjTableState.phase, 'betting', 'Must stay in betting phase if no active bets were placed');
    });
});
