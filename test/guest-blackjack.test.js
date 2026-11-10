const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { DatabaseSync } = require('node:sqlite');
const { score } = require('../docs/supabase/functions/blackjack-table/table.mjs');
const { guestCredentials } = require('../docs/supabase/functions/blackjack-table/guest.mjs');

function backend() {
    const db = new DatabaseSync(':memory:');
    db.exec("CREATE TABLE users(id INTEGER PRIMARY KEY,username TEXT,coins INTEGER,revision INTEGER); INSERT INTO users VALUES(1,'Alice',1000,0)");
    let handler, authorize;
    const timers = [];
    const original = global.setInterval;
    try {
        global.setInterval = callback => { timers.push(callback); return { unref() {} }; };
        require('../server/BlackjackTable')({ post(path, middleware, fn) { authorize = middleware; handler = fn; } }, db,
            (req, res, next) => req.userRow ? next() : res.status(401).json({error:'Authentication required'}));
    } finally { global.setInterval = original; }
    return { db, timers, call(body, id) {
        let status = 200, data;
        const req = { body, userRow: id ? { id } : null };
        const res = { status(value) { status = value; return this; }, json(value) { data = value; } };
        authorize(req, res, () => handler(req, res));
        return {ok:status === 200, status, data};
    }};
}

function browser(server, id, storage = new Map()) {
    const elements = new Map();
    const document = { getElementById(key) {
        if (!elements.has(key)) elements.set(key,{textContent:'',classList:{toggle(){}}});
        return elements.get(key);
    }};
    const context = vm.createContext({
        Date, document, STORAGE_KEYS:{BLACKJACK_GUEST:'guest-token',BOBUX:'balance'},
        localStorage:{getItem:key=>storage.get(key) || null,setItem:(key,value)=>storage.set(key,value)},
        sessionStorage:{getItem:key=>storage.get(key) || null,setItem:(key,value)=>storage.set(key,value)},
        authState:{user:id ? {id,username:'Alice'} : null},
        isServerAccount:()=>!!id, accountIdentity:()=>id ? 'account:'+id : null,
        mpState:{roomCode:'ABC123'}, activeGameMode:'casino', gameSpecificData:{}, bobuxBalance:id ? 1000 : 250,
        getGuestNickname:()=> 'Guest 8325',
        bjTableState:{localSeat:0,seats:Array.from({length:4},(_,i)=>({label:'Seat '+i,cardPos:{x:i,z:0},rotY:0,cardMeshes:[],chipMeshes:[],bet:0})),dealerCardMeshes:[]},
        playerState:{pos:{copy(){}}},scene:{add(){}},
        create3DCardMesh:card=>({card,position:{set(){}},rotation:{}}),
        disposeObject3D(){},updateSeat3DChipStack(){},updateSeatScoreBadge(){},updateDealerScoreBadge(){},
        calculateHandScore:cards=>({total:score(cards)}),showGtaNotification(){},updateCasinoBobuxDisplay(){},
        applyAuthenticatedUser(){},reportAccountError(){},
        apiRequest:async (path,options)=>path === '/api/blackjack/table' ? server.call(options.body,id)
            : {ok:true,data:{user:{id,coins:server.db.prepare('SELECT coins FROM users WHERE id=?').get(id).coins}}}
    });
    vm.runInContext(fs.readFileSync(require.resolve('../src/games/CasinoCommands.js'),'utf8'),context);
    return { context, storage, run:code=>vm.runInContext(code,context),
        sync:()=>vm.runInContext("blackjackSession ||= {world:gameSpecificData,identity:blackjackIdentity(),room:blackjackRoom()}; requestTable(blackjackSession,{action:'sync'})",context) };
}

test('account and guest use the client controller to see the same cards and take sequential turns', async () => {
    const server = backend();
    const account = browser(server,1), guest = browser(server,null);
    try {
        await account.sync(); await guest.sync();
        assert.match(guest.storage.get('guest-token'),/^[a-f0-9]{64}$/);
        account.run('bjTableState.seats[0].bet=100');
        await account.run("secureBlackjackAction('deal')");
        guest.run('bjTableState.seats[0].bet=100');
        await guest.run("secureBlackjackAction('deal')");
        assert.equal(guest.run('bjTableState.localSeat'),1);
        assert.equal(guest.run('blackjackSession.snapshot.seats[1].name'),'Guest 8325');
        assert.equal(server.db.prepare('SELECT coins FROM users').get().coins,900);
        assert.equal(server.db.prepare('SELECT coins FROM blackjack_guests').get().coins,150);

        // Use an explicit shoe and expired deal deadline to test the normal sync/render path deterministically.
        const row = server.db.prepare('SELECT state FROM blackjack_tables').get();
        const state = JSON.parse(row.state);
        state.deck = ['10','8','10','8','8','7','3'].map(val=>({val,suit:'♠',color:'black'}));
        state.deadline = Date.now()-3100;
        server.db.prepare('UPDATE blackjack_tables SET state=?').run(JSON.stringify(state));
        await account.sync(); await guest.sync();
        assert.equal(account.run('bjTableState.seats[1].cardMeshes.length'),2);
        assert.equal(guest.run('bjTableState.seats[0].cardMeshes.length'),2);
        assert.equal(account.run('JSON.stringify(blackjackSession.snapshot.dealer)'),guest.run('JSON.stringify(blackjackSession.snapshot.dealer)'));
        assert.equal(guest.run('blackjackSession.snapshot.dealer[0]'),null);
        assert.equal(guest.run("document.getElementById('bj-table-phase-title').textContent"),'Na tahu: Alice');
        await guest.run("secureBlackjackAction('hit')");
        assert.equal(guest.run('bjTableState.seats[1].cardMeshes.length'),2);
        await account.run("secureBlackjackAction('stand')"); await guest.sync();
        assert.equal(guest.run("document.getElementById('bj-table-phase-title').textContent"),'Tvůj tah');
        await guest.run("secureBlackjackAction('stand')");
        assert.equal(guest.run('blackjackSession.snapshot.phase'),'dealer');

        const reconnected = browser(server,null,new Map(guest.storage));
        await reconnected.sync();
        assert.equal(reconnected.run('bjTableState.localSeat'),1);
        assert.equal(reconnected.run('bjTableState.seats[0].cardMeshes.length'),2);
        const stranger = browser(server,null);
        await stranger.sync();
        assert.notEqual(stranger.storage.get('guest-token'),guest.storage.get('guest-token'));
        assert.equal(stranger.run('blackjackSession.snapshot.seats.some(p=>p?.mine)'),false);
        stranger.run("mpState.roomCode='XYZ123'; blackjackSession=null");
        await stranger.sync();
        assert.equal(stranger.run('blackjackSession.snapshot.seats.every(p=>!p)'),true);
    } finally { server.db.close(); }
});

test('guest capability and wallet persist, reject invalid tokens and settle exactly once', () => {
    const server = backend();
    try {
        const first = server.call({guest:true,action:'sync',room:'ABC123'}).data;
        const guestToken = first.guestToken;
        const action = {guest:true,guestToken,room:'ABC123',round:1,seat:0,bet:100,action:'deal'};
        assert.equal(server.call(action).data.balance,150);
        assert.ok(server.call(action).data.error);
        assert.equal(server.call({guest:true,guestToken,room:'ABC123',action:'sync'}).data.balance,150);
        assert.equal(server.call({...action,guestToken:'0'.repeat(64)}).ok,false);
        assert.equal(server.call({...action,guestToken:'bad-token'}).ok,false);
        assert.equal(server.call({room:'ABC123',action:'sync'}).status,401);
        const state = JSON.parse(server.db.prepare('SELECT state FROM blackjack_tables').get().state);
        const hash = guestCredentials({guestToken}).hash;
        const payout = state.idle.changes['guest:'+hash] || 0;
        server.db.exec("UPDATE blackjack_tables SET state=json_set(state,'$.idle.due',0)");
        server.timers[0](); server.timers[0]();
        assert.equal(server.call({guest:true,guestToken,room:'ABC123',action:'sync'}).data.balance,150+payout);
        assert.equal(server.db.prepare('SELECT coins FROM users').get().coins,1000);
        assert.equal(server.db.prepare('SELECT sum(amount) AS total FROM blackjack_guest_ledger').get().total,payout-100);
    } finally { server.db.close(); }
});

test('two guest browsers share a round with distinct wallets and visible opponent cards', async () => {
    const server = backend();
    const first = browser(server,null), second = browser(server,null);
    try {
        await first.sync(); await second.sync();
        assert.notEqual(first.storage.get('guest-token'),second.storage.get('guest-token'));
        first.run('bjTableState.seats[0].bet=50');
        await first.run("secureBlackjackAction('deal')");
        second.run('bjTableState.seats[0].bet=100');
        await second.run("secureBlackjackAction('deal')");
        const state = JSON.parse(server.db.prepare('SELECT state FROM blackjack_tables').get().state);
        state.deadline = Date.now()-3100;
        state.deck = ['7','9','10','8','8','7'].map(val=>({val,suit:'♠',color:'black'}));
        server.db.prepare('UPDATE blackjack_tables SET state=?').run(JSON.stringify(state));
        await first.sync(); await second.sync();
        assert.equal(first.run('bjTableState.seats[1].cardMeshes.length'),2);
        assert.equal(second.run('bjTableState.seats[0].cardMeshes.length'),2);
        assert.equal(first.run('blackjackSession.snapshot.balance'),200);
        assert.equal(second.run('blackjackSession.snapshot.balance'),150);
        assert.equal(first.run('blackjackSession.snapshot.turn'),0);
        await first.run("secureBlackjackAction('stand')");
        await second.sync();
        assert.equal(second.run('blackjackSession.snapshot.turn'),1);
        assert.equal(second.run('blackjackSession.snapshot.seats[1].mine'),true);
    } finally { server.db.close(); }
});

test('Supabase adapter forwards guest table requests without a login session', async () => {
    let invoked;
    const backend = require('../src/state/AccountBackend');
    const sb = {auth:{getSession:async()=>({data:{session:null}})},functions:{invoke:async(name,options)=>{
        invoked = {name,options}; return {data:{balance:250,guestToken:'a'.repeat(64)}};
    }}};
    const result = await backend.request(sb,'/api/blackjack/table',{body:{guest:true,action:'sync',room:'ABC123'}});
    assert.equal(result.ok,true);
    assert.equal(invoked.name,'blackjack-table');
    assert.equal(invoked.options.body.guest,true);
    assert.equal((await backend.request(sb,'/api/blackjack/table',{body:{action:'sync',room:'ABC123'}})).status,401);
});

test('all blackjack action entry points and frame updates dispatch guests to the shared controller', () => {
    const source = fs.readFileSync(require.resolve('../src/games/GameWorlds.js'),'utf8');
    const actions = [];
    const context = vm.createContext({isServerAccount:()=>false,
        secureBlackjackAction:action=>actions.push(action),updateSharedBlackjack:()=>actions.push('sync')});
    for (const [name,action,arg] of [
        ['confirmInWorldBjBet','deal'],['startInWorldBlackjackDealing','deal'],
        ['dealBlackjack','deal'],['hitBlackjack','hit'],['standBlackjack','stand'],
        ['doubleBlackjack','double'],['executeBjAction','split',"'split'"],['update3DBlackjackGame','sync']
    ]) {
        const match = source.match(new RegExp('^function '+name+'\\([^]*?^\\}', 'm'));
        assert.ok(match,name+' exists');
        vm.runInContext(match[0],context);
        vm.runInContext(name+'('+(arg || '')+')',context);
        assert.equal(actions.pop(),action);
    }
});
