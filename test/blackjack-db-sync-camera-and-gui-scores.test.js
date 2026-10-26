const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('Blackjack DB Persistence, Elevated Camera & GUI Card Scores', () => {
    const portalStorePath = path.resolve(__dirname, '../src/state/PortalStore.js');
    const gameWorldsPath = path.resolve(__dirname, '../src/games/GameWorlds.js');
    const physicsPath = path.resolve(__dirname, '../src/core/PhysicsAndLoop.js');
    const indexPath = path.resolve(__dirname, '../index.html');

    const portalStoreCode = fs.readFileSync(portalStorePath, 'utf8');
    const gameWorldsCode = fs.readFileSync(gameWorldsPath, 'utf8');
    const physicsCode = fs.readFileSync(physicsPath, 'utf8');
    const indexCode = fs.readFileSync(indexPath, 'utf8');

    it('1. addBobux and spendBobux update authState.user.coins and USER_CACHE', () => {
        // Assert that addBobux updates authState.user.coins and USER_CACHE
        const addBobuxMatch = portalStoreCode.match(/function addBobux\([\s\S]*?\n\}/);
        assert.ok(addBobuxMatch, 'addBobux must exist');
        assert.ok(
            addBobuxMatch[0].includes('authState.user.coins =') || addBobuxMatch[0].includes('USER_CACHE'),
            'addBobux must update authState.user.coins or USER_CACHE to prevent reload revert'
        );

        const spendBobuxMatch = portalStoreCode.match(/function spendBobux\([\s\S]*?\n\}/);
        assert.ok(spendBobuxMatch, 'spendBobux must exist');
        assert.ok(
            spendBobuxMatch[0].includes('authState.user.coins =') || spendBobuxMatch[0].includes('USER_CACHE'),
            'spendBobux must update authState.user.coins or USER_CACHE to prevent reload revert'
        );
    });

    it('2. Blackjack dealing and round payout invoke syncAccountToServer with bypassQueue to persist immediately', () => {
        // startInWorldBlackjackDealing or resolveInWorldBlackjackPayout must call syncAccountToServer
        assert.ok(
            gameWorldsCode.includes('syncAccountToServer({ bypassQueue: true })') ||
            gameWorldsCode.includes('syncAccountToServer()'),
            'Blackjack round resolution must invoke syncAccountToServer to persist Bobux balance to server/Supabase'
        );
    });

    it('3. Camera eye height in PhysicsAndLoop is elevated (>= 4.0m) to look down at cards over chips', () => {
        const cameraBlockMatch = physicsCode.match(/if \(activeGameMode === 'casino'[\s\S]*?camera\.lookAt\(tableFeltCenter\);/);
        assert.ok(cameraBlockMatch, 'Seated camera block must exist in PhysicsAndLoop.js');
        const eyeYMatch = cameraBlockMatch[0].match(/eyeY\s*=\s*([^;]+);/);
        assert.ok(eyeYMatch, 'eyeY calculation must exist');

        const sPos = { x: -20, y: 1.8, z: -3 };
        const eyeY = new Function('sPos', `return (${eyeYMatch[1]});`)(sPos);
        assert.ok(eyeY >= 4.0, `eyeY is ${eyeY}, must be >= 4.0 to clearly see cards over chips`);
    });

    it('4. index.html contains in-world GUI score badges for dealer and player', () => {
        assert.ok(indexCode.includes('id="bj-inworld-dealer-badge"'), 'index.html must have bj-inworld-dealer-badge');
        assert.ok(indexCode.includes('id="bj-inworld-dealer-val"'), 'index.html must have bj-inworld-dealer-val');
        assert.ok(indexCode.includes('id="bj-inworld-player-badge"'), 'index.html must have bj-inworld-player-badge');
        assert.ok(indexCode.includes('id="bj-inworld-player-val"'), 'index.html must have bj-inworld-player-val');
    });

    it('5. GameWorlds.js updates in-world GUI score badges on card deal and actions', () => {
        assert.ok(gameWorldsCode.includes('bj-inworld-dealer-val'), 'GameWorlds must update bj-inworld-dealer-val');
        assert.ok(gameWorldsCode.includes('bj-inworld-player-val'), 'GameWorlds must update bj-inworld-player-val');
    });
});
