const { randomInt } = require('node:crypto');
function shuffledDeck() {
    const deck = [];
    for (const suit of ['♠', '♥', '♦', '♣'])
        for (const val of ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'])
            deck.push({ val, suit, color: ['♥', '♦'].includes(suit) ? 'red' : 'black' });
    for (let i = deck.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}
function score(cards) {
    let total = 0,
        aces = 0;
    for (const c of cards) {
        total += c.val === 'A' ? 11 : ['J', 'Q', 'K'].includes(c.val) ? 10 : Number(c.val);
        if (c.val === 'A') aces++;
    }
    while (total > 21 && aces-- > 0) total -= 10;
    return total;
}
function advance(previous, action, bet, balance, deckFactory = shuffledDeck) {
    let state = previous ? JSON.parse(JSON.stringify(previous)) : null;
    let amount = 0,
        payout = 0;
    const visible = () => {
        const { deck, ...result } = state;
        return {
            ...result,
            dealer: state.phase === 'playing' ? [null, state.dealer[1]] : state.dealer,
            payout
        };
    };
    if (action === 'resume') {
        state ||= { hand: [], hands: [], dealer: [], bet: 50, phase: 'betting' };
        return { state, amount, result: visible() };
    }
    if (action === 'deal') {
        if (state?.phase === 'playing') throw Error('Finish current hand first.');
        if (!Number.isSafeInteger(bet) || bet < 1 || bet > 10000 || balance < bet)
            throw Error('Invalid bet.');
        const deck = deckFactory();
        const hand = [deck.shift(), deck.shift()],
            dealer = [deck.shift(), deck.shift()];
        state = {
            deck,
            dealer,
            hands: [{ cards: hand, bet, status: 'playing', split: false }],
            activeHand: 0,
            phase: 'playing'
        };
        amount = -bet;
    } else {
        if (state?.phase !== 'playing') throw Error('No active hand.');
        state.hands ||= [{ cards: state.hand, bet: state.bet, status: 'playing', split: false }];
        state.activeHand ||= 0;
        state.deck ||= deckFactory();
        const hand = state.hands[state.activeHand];
        if (action === 'split') {
            if (
                hand.cards.length !== 2 ||
                hand.cards[0].val !== hand.cards[1].val ||
                state.hands.length >= 4 ||
                balance < hand.bet
            )
                throw Error('Cannot split.');
            const other = hand.cards.pop();
            hand.split = true;
            hand.cards.push(state.deck.shift());
            state.hands.push({
                cards: [other, state.deck.shift()],
                bet: hand.bet,
                status: 'playing',
                split: true
            });
            amount = -hand.bet;
        } else if (['hit', 'double'].includes(action)) {
            if (action === 'double') {
                if (hand.cards.length !== 2 || balance < hand.bet) throw Error('Cannot double.');
                amount = -hand.bet;
                hand.bet *= 2;
                hand.status = 'stand';
            }
            hand.cards.push(state.deck.shift());
        } else if (action === 'stand') hand.status = 'stand';
        else throw Error('Unknown blackjack action.');
    }
    const natural =
        state.hands.length === 1 &&
        state.hands[0].cards.length === 2 &&
        !state.hands[0].split &&
        score(state.hands[0].cards) === 21;
    const dealerNatural = state.dealer.length === 2 && score(state.dealer) === 21;
    if (natural || dealerNatural) state.activeHand = state.hands.length;
    else
        while (
            state.activeHand < state.hands.length &&
            (state.hands[state.activeHand].status === 'stand' ||
                score(state.hands[state.activeHand].cards) >= 21)
        )
            state.activeHand++;
    if (state.activeHand >= state.hands.length) {
        if (!natural && state.hands.some((h) => score(h.cards) <= 21))
            while (score(state.dealer) < 17) state.dealer.push(state.deck.shift());
        const ds = score(state.dealer);
        for (const h of state.hands) {
            const s = score(h.cards);
            payout +=
                s > 21
                    ? 0
                    : natural && !dealerNatural
                      ? Math.floor(h.bet * 2.5)
                      : dealerNatural && !natural
                        ? 0
                        : s === ds
                          ? h.bet
                          : ds > 21 || s > ds
                            ? h.bet * 2
                            : 0;
        }
        amount += payout;
        state.phase = 'finished';
        state.activeHand = state.hands.length - 1;
    }
    state.hand = state.hands[state.activeHand].cards;
    state.bet = state.hands[state.activeHand].bet;
    return { state, amount, result: visible() };
}
module.exports = { advance, score };
