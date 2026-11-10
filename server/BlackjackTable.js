const {advanceTable,validateRoom,changedTable,persistableTable} = require('../docs/supabase/functions/blackjack-table/table.mjs');
const {guestCredentials} = require('../docs/supabase/functions/blackjack-table/guest.mjs');

module.exports = function installTable(app,db,requireAuth) {
    db.exec('CREATE TABLE IF NOT EXISTS blackjack_tables(room TEXT PRIMARY KEY,state TEXT NOT NULL)');
    db.exec(`CREATE TABLE IF NOT EXISTS blackjack_guests(token_hash TEXT PRIMARY KEY,username TEXT NOT NULL,coins INTEGER NOT NULL DEFAULT 250 CHECK(coins>=0));
        CREATE TABLE IF NOT EXISTS blackjack_guest_ledger(id INTEGER PRIMARY KEY,token_hash TEXT NOT NULL,amount INTEGER NOT NULL,balance_after INTEGER NOT NULL,created_at INTEGER NOT NULL)`);
    const credit = (changes) => {
        for (const [id,amount] of Object.entries(changes)) {
            if (!amount) continue;
            if (id.startsWith('guest:')) {
                const hash = id.slice(6);
                const row = db.prepare('UPDATE blackjack_guests SET coins=coins+? WHERE token_hash=? AND coins+?>=0 RETURNING coins').get(amount,hash,amount);
                if (!row) throw Error('Nedostatek Bobuxů.');
                db.prepare('INSERT INTO blackjack_guest_ledger(token_hash,amount,balance_after,created_at) VALUES(?,?,?,?)').run(hash,amount,row.coins,Date.now());
            } else if (!db.prepare('UPDATE users SET coins=coins+?,revision=revision+1 WHERE id=? AND coins+?>=0').run(amount,id,amount).changes)
                throw Error('Nedostatek Bobuxů.');
        }
    };
    const settleIdle = () => {
        db.exec('BEGIN IMMEDIATE');
        try {
            const due = db.prepare("SELECT room,state FROM blackjack_tables WHERE json_extract(state,'$.idle.due') <= ? LIMIT 100").all(Date.now());
            for (const row of due) {
                const {idle} = JSON.parse(row.state);
                credit(idle.changes);
                db.prepare('UPDATE blackjack_tables SET state=? WHERE room=?').run(JSON.stringify(idle.state),row.room);
            }
            db.exec('COMMIT');
        } catch (error) {
            db.exec('ROLLBACK');
            console.error('Blackjack timeout settlement:', error.message);
        }
    };
    const timer = setInterval(settleIdle,60000);
    timer.unref();
    const authorize = (req,res,next) => req.body?.guest === true ? next() : requireAuth(req,res,next);
    app.post('/api/blackjack/table',authorize,(req,res) => {
        db.exec('BEGIN IMMEDIATE');
        try {
            const input = req.body;
            validateRoom(input.room);
            let guest;
            let actor;
            if (input.guest === true) {
                guest = guestCredentials(input);
                if (guest.create) db.prepare('INSERT INTO blackjack_guests(token_hash,username) VALUES(?,?)').run(guest.hash,guest.name);
                actor = db.prepare('SELECT username,coins FROM blackjack_guests WHERE token_hash=?').get(guest.hash);
                if (actor) actor.id = 'guest:'+guest.hash;
            } else actor = db.prepare('SELECT id,username,coins FROM users WHERE id=?').get(req.userRow.id);
            if (!actor) throw Error('Relace hráče není dostupná.');
            const saved = db.prepare('SELECT state FROM blackjack_tables WHERE room=?').get(input.room);
            const previous = saved && JSON.parse(saved.state);
            const {state,changes,view} = advanceTable(previous,actor,input,Date.now());
            if (changedTable(previous,state)) {
                credit(changes);
                const json = JSON.stringify(persistableTable(state,actor,Date.now()));
                db.prepare('INSERT INTO blackjack_tables VALUES(?,?) ON CONFLICT(room) DO UPDATE SET state=excluded.state').run(input.room,json);
            }
            db.exec('COMMIT');
            res.json({...view,balance:actor.coins + (changes[actor.id] || 0),
                ...(guest ? {guestToken:guest.token,guestName:actor.username} : {})});
        } catch (e) {
            db.exec('ROLLBACK');
            res.status(400).json({error:e.message});
        }
    });
};
