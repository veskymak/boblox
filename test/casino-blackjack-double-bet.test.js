const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createBlackjackGame() {
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'games', 'GameWorlds.js'), 'utf8');
    const start = source.indexOf('const bjState = {');
    const end = source.indexOf('/* ============================================================================\n * B. ', start);
    assert.notEqual(start, -1, 'Blackjack state must exist in GameWorlds.js');
    assert.notEqual(end, -1, 'Blackjack section must have an end marker');

    const elements = new Map();
    const getElementById = (id) => {
        if (!elements.has(id)) {
            elements.set(id, {
                disabled: false,
                textContent: '',
                className: '',
                innerHTML: '',
                classList: { toggle() {} },
                appendChild() {}
            });
        }
        return elements.get(id);
    };
    const spendCalls = [];
    const context = {
        bobuxBalance: 10000,
        document: {
            getElementById,
            createElement: () => ({ classList: { toggle() {} } }),
            querySelectorAll: () => []
        },
        sfx: {
            playJump() {},
            playCardFlip() {},
            playOof() {},
            playWinFanfare() {},
            playCoin() {}
        },
        spendBobux(amount, reason) {
            spendCalls.push({ amount, reason });
            this.bobuxBalance -= amount;
            return true;
        },
        addBobux() {},
        updateCasinoBobuxDisplay() {},
        showHudToast() {},
        setTimeout(callback) {
            callback();
        }
    };
    const blackjackSource = source.slice(start, end)
        + '\nglobalThis.blackjack = { bjState, dealBlackjack, doubleBlackjack, finishBlackjackRound };';
    vm.runInNewContext(blackjackSource, context);

    return { game: context.blackjack, spendCalls, elements, context };
}

describe('Blackjack double-down bet', () => {
    it('uses the selected bet again when dealing the next round', () => {
        const { game, spendCalls, elements } = createBlackjackGame();
        const card = (val) => ({ val, suit: '♠', color: 'black' });
        game.bjState.bet = 100;
        game.bjState.deck = Array.from({ length: 15 }, () => card('2'))
            .concat([card('5'), card('8'), card('10'), card('3'), card('8')]);

        game.dealBlackjack();
        game.doubleBlackjack();
        assert.equal(game.bjState.bet, 100);
        assert.equal(elements.get('bj-current-bet').textContent, '100 B$');
        game.dealBlackjack();

        assert.deepEqual(spendCalls.map(({ amount }) => amount), [100, 100, 100]);
    });
});
