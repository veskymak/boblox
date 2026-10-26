const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('node:vm');

const repoRoot = path.resolve(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const gameWorlds = fs.readFileSync(path.join(repoRoot, 'src', 'games', 'GameWorlds.js'), 'utf8');
const physics = fs.readFileSync(path.join(repoRoot, 'src', 'core', 'PhysicsAndLoop.js'), 'utf8');
const inputMgr = fs.readFileSync(path.join(repoRoot, 'src', 'core', 'InputManager.js'), 'utf8');
const serverJs = fs.readFileSync(path.join(repoRoot, 'server.js'), 'utf8');

describe('Overhaul Gambling Mechanics: GTA 5 Casino Lucky Wheel & 3D In-World Blackjack', () => {

    describe('1. General Gambling Math & Fair Probabilities', () => {
        it('calibrates Lucky Wheel RTP to near-fair statistical expectation (~99.1% RTP)', () => {
            const start = gameWorlds.indexOf('const WHEEL_PRIZES = [');
            const end = gameWorlds.indexOf('];', start);
            assert.notEqual(start, -1, 'WHEEL_PRIZES must exist');
            
            const context = {};
            vm.runInNewContext(`${gameWorlds.slice(start, end + 2)}; globalThis.prizes = WHEEL_PRIZES;`, context);
            const prizes = context.prizes;

            assert.equal(prizes.length, 20, 'Lucky Wheel must feature exactly 20 segments (GTA 5 Diamond Casino spec)');
            
            const prizeTotal = prizes.reduce((sum, p) => sum + (p.type === 'bobux' ? p.amount : 0), 0);
            const extraSpinProb = prizes.filter(p => p.type === 'extra').length / prizes.length;
            const expectedPayout = (prizeTotal / prizes.length) / (1 - extraSpinProb);

            assert.ok(expectedPayout >= 580 && expectedPayout <= 600, `Expected payout ${expectedPayout.toFixed(2)} B$ should be ~594 B$ for 600 B$ spin price`);
            const rtp = (expectedPayout / 600) * 100;
            assert.ok(rtp >= 98.0 && rtp <= 100.0, `RTP is ${rtp.toFixed(2)}%, calibrated mathematically fair`);
        });

        it('includes the VIP Tag jackpot with highest payout (3 500 B$)', () => {
            const start = gameWorlds.indexOf('const WHEEL_PRIZES = [');
            const end = gameWorlds.indexOf('];', start);
            const context = {};
            vm.runInNewContext(`${gameWorlds.slice(start, end + 2)}; globalThis.prizes = WHEEL_PRIZES;`, context);
            const jackpotPrize = context.prizes.find(p => p.isJackpot);
            assert.ok(jackpotPrize, 'Must include a designated jackpot slice');
            assert.equal(jackpotPrize.amount, 3500);
            assert.equal(jackpotPrize.icon, '👑');
            assert.equal(jackpotPrize.label, 'VIP TAG');
        });
    });

    describe('2. Lucky Wheel (GTA 5 Diamond Casino Wheel)', () => {
        it('features modal with smooth entrance animation and Spin & Autospin buttons in index.html', () => {
            assert.ok(indexHtml.includes('id="lucky-wheel-modal"'), 'Modal container must exist');
            assert.ok(indexHtml.includes('animate-wheel-modal'), 'Modal must have entrance animation class');
            assert.ok(indexHtml.includes('id="wheel-spin-btn"'), 'Spin button must exist');
            assert.ok(indexHtml.includes('id="wheel-autospin-toggle-btn"'), 'Autospin button must exist');
            assert.ok(indexHtml.includes('id="wheel-auto-spin"'), 'Backwards-compatible autospin checkbox must exist');
            assert.ok(indexHtml.includes('id="casino-wheel-canvas"'), 'Wheel canvas must exist');
        });

        it('dispatches generic spinning multiplayer packet for other players', () => {
            assert.match(gameWorlds, /networkManager\.sendWsPacket\(\{\s*type:\s*['"]casino_event['"],\s*action:\s*['"]wheel_spin['"]/);
            assert.ok(gameWorlds.includes('function startRemoteWheelSpin('), 'Must provide startRemoteWheelSpin for generic local spin animation on peer clients');
        });

        it('triggers global celebration event, announcement, and 3D confetti on Jackpot win', () => {
            assert.ok(gameWorlds.includes('function triggerLuckyWheelJackpot('), 'Must define triggerLuckyWheelJackpot');
            assert.match(gameWorlds, /action:\s*['"]jackpot_win['"]/);
            assert.ok(gameWorlds.includes('function showJackpotCelebrationScreen('), 'Must provide celebration overlay handler');
            assert.ok(gameWorlds.includes('function spawnLuckyWheelConfettiBurst('), 'Must provide 3D confetti burst around physical wheel');
            assert.ok(indexHtml.includes('id="jackpot-celebration-overlay"'), 'Global jackpot celebration overlay must exist in DOM');
            assert.ok(indexHtml.includes('id="jackpot-winner-title"'), 'Winner title display element must exist');
            assert.ok(indexHtml.includes('id="jackpot-winner-prize"'), 'Winner prize display element must exist');
        });
    });

    describe('3. Multiplayer 3D In-World Blackjack System', () => {
        it('defines multi-seat 3D blackjack table configuration (4 seats)', () => {
            assert.ok(gameWorlds.includes('BJ_TABLE_SEATS'), 'Must define BJ_TABLE_SEATS');
            assert.ok(gameWorlds.includes('setup3DBlackjackTable'), 'Must define setup3DBlackjackTable');
            assert.ok(gameWorlds.includes('sitAt3DBlackjackTable'), 'Must define sitAt3DBlackjackTable');
            assert.ok(gameWorlds.includes('standUpFromBjTable'), 'Must define standUpFromBjTable');
        });

        it('provides betting phase countdown, dealer dealing sequence, and action controls in 3D HUD', () => {
            assert.ok(indexHtml.includes('id="blackjack-3d-hud"'), '3D Blackjack HUD must exist');
            assert.ok(indexHtml.includes('id="bj-table-phase-timer"'), 'Countdown timer badge must exist');
            assert.ok(indexHtml.includes('id="bj-table-phase-banner"'), 'Table phase banner must exist');
            assert.ok(indexHtml.includes('id="bj-action-controls"'), 'Action controls bar must exist');
            assert.ok(indexHtml.includes('id="bj-action-hit"'), 'Hit button must exist');
            assert.ok(indexHtml.includes('id="bj-action-stand"'), 'Stand button must exist');
            assert.ok(indexHtml.includes('id="bj-action-double"'), 'Double button must exist');
            assert.ok(indexHtml.includes('id="bj-action-split"'), 'Split button must exist');
        });

        it('handles seated player pose and GTA 5 Blackjack camera view in PhysicsAndLoop.js', () => {
            assert.ok(physics.includes('isPlayerSeatedAtBj'), 'Physics loop must check isPlayerSeatedAtBj');
            assert.match(physics, /camera\.position\.lerp/);
            assert.match(physics, /playerAvatar\.leftLegPivot\.rotation\.x\s*=\s*-Math\.PI\s*\/\s*2/);
            assert.ok(physics.includes('update3DBlackjackGame'), 'Must invoke update3DBlackjackGame in casino loop');
        });

        it('supports keyboard shortcuts [H], [S], [D], [P], [Q], [ESC] when seated in InputManager.js', () => {
            assert.ok(inputMgr.includes("executeBjAction('hit')"));
            assert.ok(inputMgr.includes("executeBjAction('stand')"));
            assert.ok(inputMgr.includes("executeBjAction('double')"));
            assert.ok(inputMgr.includes("executeBjAction('split')"));
            assert.ok(inputMgr.includes('standUpFromBjTable()'));
        });

        it('relays casino packets across WebSocket server rooms in server.js', () => {
            assert.match(serverJs, /msg\.type === ['"]casino_event['"] \|\| msg\.type === ['"]casinoEvent['"]/);
        });
    });
});
