const test = require('node:test');
const assert = require('node:assert/strict');
const { advanceTable } = require('../docs/supabase/functions/blackjack-table/table.mjs');

function table(cards) {
    let state;
    const players = ['Alice','Bob'].map(id => ({id,username:id,coins:1000}));
    return {
        players,
        act(who, action, now, opts = {}) {
            const r = advanceTable(state,players[who],{action,round:1,seat:0,bet:100,sequence:0,...opts},now,
                () => cards.map(val => ({val})));
            state = r.state;
            players.forEach(p => {p.coins += r.changes[p.id] || 0;});
            return r.view;
        }
    };
}
test('two bettors share the deal, turn order, hidden card and exactly one settlement', () => {
    const t = table(['10','8','10','8','8','7','3','2','10']);
    t.act(0,'deal',0);
    assert.ok(t.act(0,'deal',1).error);
    assert.equal(t.act(1,'deal',1).seats[1].mine,true);
    assert.equal(t.act(1,'sync',12000).seats[0].hands[0].cards.length,1);
    let d = t.act(0,'sync',15000);
    assert.equal(d.turn,0); assert.equal(d.dealer[0],null);
    assert.equal('deck' in d,false); assert.equal('id' in d.seats[0],false);
    assert.ok(t.act(1,'hit',15100).error);
    assert.equal(t.act(0,'stand',15100).turn,1);
    assert.equal(t.act(1,'split',15200).seats[1].hands.length,2);
    assert.ok(t.act(1,'split',15210).error);
    assert.equal(t.act(1,'double',15300,{sequence:1}).turn,1);
    t.act(1,'stand',15400,{sequence:2});
    d = t.act(1,'sync',17000);
    assert.equal(d.phase,'cooldown'); assert.equal(d.dealer[0].val,'10');
    assert.equal(d.seats[0].payout,200);
    assert.equal(d.seats[1].payout,400);
    assert.deepEqual(t.players.map(p => p.coins),[1100,1100]);
    const balances = t.players.map(p => p.coins);
    t.act(0,'sync',30000);
    assert.deepEqual(t.players.map(p=>p.coins),balances);
    assert.ok(t.act(0,'deal',31000).error);
});
test('abandoned room catches up, stands and pays natural 3:2 exactly once', () => {
    const t = table(['A','10','10','K','8','7']);
    t.act(0,'deal',0); t.act(1,'deal',0);
    assert.equal(t.act(0,'sync',90000).round,2);
    assert.deepEqual(t.players.map(p => p.coins),[1150,1100]);
    t.act(1,'sync',91000);
    assert.equal(t.players[1].coins,1100);
});

test('SQLite route restores two seats across clients and settles a closed private room', () => {
    const {DatabaseSync} = require('node:sqlite');
    const db = new DatabaseSync(':memory:');
    db.exec("CREATE TABLE users(id INTEGER PRIMARY KEY,username TEXT,coins INTEGER,revision INTEGER); INSERT INTO users VALUES(1,'Alice',1000,0),(2,'Bob',1000,0)");
    let handler;
    const timers = [];
    const original = global.setInterval;
    try {
        global.setInterval = f => { timers.push(f); return {unref(){}}; };
        require('../server/BlackjackTable')({post:(path,auth,fn) => { handler=fn; }},db,()=>{});
    } finally { global.setInterval = original; }
    const call = (id,action,room='ABC123') => {
        let data;
        handler({userRow:{id},body:{action,room,round:1,bet:100,seat:0}},
            {json:x=>{data=x;},status:()=>{throw Error('Unexpected status');}});
        return data;
    };
    try {
        call(1,'deal'); call(2,'deal');
        assert.equal(call(1,'sync').seats[1].name,'Bob');
        assert.equal(call(2,'sync').seats[1].mine,true);
        assert.ok(call(1,'deal').error);
        assert.equal(call(1,'sync','PUB_CASINO').balance,900);
        const saved = JSON.parse(db.prepare('SELECT state FROM blackjack_tables').get().state);
        const projected = saved.idle.changes;
        db.exec("UPDATE blackjack_tables SET state=json_set(state,'$.idle.due',0)");
        timers[0](); timers[0]();
        assert.equal(call(1,'sync').balance,900 + (projected[1] || 0));
        assert.equal(call(2,'sync').balance,900 + (projected[2] || 0));
        assert.equal(call(1,'sync').round,2);
    } finally { db.close(); }
});

test('dealer blackjack pushes a natural, collects a regular hand and skips player turns', () => {
    const t = table(['A','10','A','K','9','Q']);
    t.act(0,'deal',0); t.act(1,'deal',100);
    const deal = t.act(1,'hit',15000);
    assert.ok(deal.error); assert.equal(deal.phase,'dealer');
    assert.equal(deal.dealer[0].val,'A');
    const result = t.act(1,'sync',15900);
    assert.equal(result.phase,'cooldown');
    assert.deepEqual(t.players.map(p=>p.coins),[1000,900]);
    const next = t.act(1,'sync',21900);
    assert.equal(next.phase,'betting');
    assert.deepEqual(next.seats,[null,null,null,null]);
});
