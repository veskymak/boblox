import { randomInt } from 'node:crypto';

export function deckOfCards(copies = 1) {
    const deck = [];
    for (let n = 0; n < copies; n++)
        for (const suit of ['♠', '♥', '♦', '♣'])
            for (const val of ['2','3','4','5','6','7','8','9','10','J','Q','K','A'])
                deck.push({ val, suit, color: ['♥','♦'].includes(suit) ? 'red' : 'black' });
    for (let i = deck.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

export function score(cards) {
    let aces = 0, total = 0;
    for (const {val} of cards) {
        if (val === 'A') aces++;
        total += val === 'A' ? 11 : ['K','Q','J'].includes(val) ? 10 : Number(val);
    }
    while (total > 21 && aces-- > 0) total -= 10;
    return total;
}

const empty = round => ({round, phase:'betting', seats:[null,null,null,null], dealer:[], deck:[], turn:-1, deadline:0, step:0});
const natural = h => !h.split && h.cards.length === 2 && score(h.cards) === 21;
const newHand = (bet, cards = [], split = false) => ({bet, cards, split, done:false});

export function validateRoom(room) {
    if (typeof room !== 'string' || !/^(PUB_CASINO|[A-Z0-9]{6})$/.test(room)) throw Error('Neplatná místnost.');
}

// Call inside a transaction or commit using a compare-and-swap. Wallet deltas commit with the table.
export function advanceTable(previous, actor, input, now, shuffle = () => deckOfCards(6)) {
    let t = previous ? structuredClone(previous) : empty(1);
    delete t.idle;
    const changes = {};
    const moveMoney = (id, amount) => { changes[id] = (changes[id] || 0) + amount; };
    const nextTurn = at => {
        t.turn = t.seats.findIndex(p => p && p.hands.some(h => !h.done && score(h.cards) < 21));
        t.phase = t.turn < 0 ? 'dealer' : 'players';
        t.deadline = at + (t.turn < 0 ? 900 : 25000);
    };
    const settle = at => {
        const ds = score(t.dealer), dn = ds === 21 && t.dealer.length === 2;
        for (const p of t.seats.filter(Boolean)) {
            p.payout = 0;
            for (const h of p.hands) {
                const s = score(h.cards);
                if (natural(h)) p.payout += dn ? h.bet : Math.floor(h.bet * 2.5);
                else if (s <= 21 && !dn) p.payout += ds > 21 || s > ds ? 2*h.bet : ds === s ? h.bet : 0;
            }
            moveMoney(p.id, p.payout);
        }
        t.phase = 'cooldown'; t.deadline = at + 6000;
    };
    // Catch up against absolute deadlines, including an abandoned room on re-entry.
    while (t.deadline && t.deadline <= now) {
        const at = t.deadline;
        if (t.phase === 'betting') {
            if (!t.deck.length) t.deck = shuffle();
            t.phase = 'dealing'; t.deadline = at;
        } else if (t.phase === 'dealing') {
            const bettors = t.seats.filter(Boolean), size = bettors.length + 1;
            const recipient = bettors[t.step % size];
            (recipient ? recipient.hands[0].cards : t.dealer).push(t.deck.shift());
            if (++t.step === size * 2) {
                nextTurn(at);
                if (score(t.dealer) === 21) { t.turn = -1; t.phase = 'dealer'; t.deadline = at + 900; }
            } else t.deadline = at + 600;
        } else if (t.phase === 'players') {
            t.seats[t.turn].hands.forEach(h => { h.done = true; });
            nextTurn(at);
        } else if (t.phase === 'dealer') {
            const contested = t.seats.some(p => p?.hands.some(h => !natural(h) && score(h.cards) <= 21));
            if (contested && score(t.dealer) < 17) {
                t.dealer.push(t.deck.shift()); t.deadline = at + 900;
            } else settle(at);
        } else t = empty(t.round + 1);
    }

    const mySeat = t.seats.findIndex(p => p?.id === actor.id);
    let error = null;
    // A stale command must still commit any autonomous timeout or payout above.
    if (input.action !== 'sync') {
        try {
            if (input.round !== t.round) throw Error('Kolo již skončilo.');
            if (input.action === 'deal') {
                if (t.phase !== 'betting' || mySeat >= 0) throw Error('Sázky jsou uzavřené.');
                if (!Number.isSafeInteger(input.bet) || input.bet < 1 || input.bet > 10000 || input.bet > actor.coins + (changes[actor.id] || 0)) throw Error('Neplatná sázka nebo nedostatek Bobuxů.');
                const index = Number.isInteger(input.seat) && input.seat >= 0 && input.seat < 4 && !t.seats[input.seat] ? input.seat : t.seats.indexOf(null);
                if (index < 0) throw Error('Stůl je plný.');
                t.seats[index] = {id:actor.id, name:actor.username, hands:[newHand(input.bet)], sequence:0};
                moveMoney(actor.id, -input.bet);
                if (!t.deadline) { t.deadline = now + 12000; t.deck = shuffle(); }
            } else {
                const p = t.seats[mySeat];
                if (!p || t.phase !== 'players' || mySeat !== t.turn || input.sequence !== p.sequence) throw Error('Tento tah už není k dispozici.');
                const i = p.hands.findIndex(h => !h.done && score(h.cards) < 21), h = p.hands[i];
                if (['double','split'].includes(input.action) && (h.cards.length !== 2 || actor.coins < h.bet)) throw Error('Tento tah není dostupný.');
                switch (input.action) {
                    case 'split': {
                        if (p.hands.length >= 4 || h.cards[0].val !== h.cards[1].val) throw Error('Tyto karty nelze rozdělit.');
                        moveMoney(actor.id, -h.bet);
                        const second = newHand(h.bet, [h.cards.pop(), t.deck.shift()], true);
                        h.split = true; h.cards.push(t.deck.shift());
                        if (h.cards[0].val === 'A') h.done = second.done = true;
                        p.hands.splice(i + 1, 0, second);
                        break;
                    }
                    case 'double': moveMoney(actor.id,-h.bet); h.bet *= 2; h.cards.push(t.deck.shift()); h.done = true; break;
                    case 'hit': h.cards.push(t.deck.shift()); break;
                    case 'stand': h.done = true; break;
                    default: throw Error('Neplatný tah.');
                }
                p.sequence++; nextTurn(now);
            }
        } catch (e) { error = e.message; }
    }
    const {deck, ...view} = t;
    const hidden = ['dealing','players'].includes(t.phase);
    return {state:t, changes, view:{...view, dealer:t.dealer.map((c,i) => hidden && i === 0 ? null : c),
        seats:t.seats.map(p => p && ({name:p.name, hands:p.hands, sequence:p.sequence, payout:p.payout, mine:p.id === actor.id})),
        now, error}};
}

// Five minutes exceeds all remaining automatic deals and four 25-second turns.
export function persistableTable(state, actor, now) {
    if (!state.deadline) return state;
    const due = now + 300000;
    const outcome = advanceTable(state,actor,{action:'sync'},due);
    return {...state,idle:{due,state:outcome.state,changes:outcome.changes}};
}

export function changedTable(previous, state) {
    if (!previous) return !!state.deadline;
    const {idle, ...last} = previous;
    return JSON.stringify(last) !== JSON.stringify(state);
}
