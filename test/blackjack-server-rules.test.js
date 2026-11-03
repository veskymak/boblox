const { test } = require('node:test');
const assert = require('node:assert/strict');
const { advance } = require('../server/Blackjack');
const card = (val) => ({ val, suit: '♠', color: 'black' });
test('blackjack natural pays immediately and does not draw a dealer 21 to turn it into a push', () => {
    const result = advance(null, 'deal', 100, 1000, () => ['A', 'K', '5', '6', '10'].map(card));
    assert.equal(result.state.phase, 'finished');
    assert.equal(result.amount, 150);
    assert.equal(result.result.payout, 250);
    assert.equal(result.state.dealer.length, 2);
    assert.equal(Object.hasOwn(result.result, 'deck'), false);
});
test('split debits the additional stake and settles both hands only after both turns', () => {
    let step = advance(null, 'deal', 100, 1000, () => ['8', '8', '10', '7', '3', '2', '10', '9'].map(card));
    assert.equal(step.result.dealer[0], null);
    step = advance(step.state, 'split', null, 900);
    assert.equal(step.amount, -100);
    assert.equal(step.state.hands.length, 2);
    step = advance(step.state, 'stand', null, 800);
    assert.equal(step.state.phase, 'playing');
    assert.equal(step.amount, 0);
    assert.equal(step.state.activeHand, 1);
    step = advance(step.state, 'stand', null, 800);
    assert.equal(step.state.phase, 'finished');
    assert.equal(step.amount, 0);
    assert.equal(Object.hasOwn(step.result, 'deck'), false);
    assert.throws(() => advance(step.state, 'stand', null, 800));
});
