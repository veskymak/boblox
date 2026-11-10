const {advanceTable,validateRoom,changedTable,persistableTable} = require('../docs/supabase/functions/blackjack-table/table.mjs');

module.exports = function installTable(app,db,requireAuth) {
    db.exec('CREATE TABLE IF NOT EXISTS blackjack_tables(room TEXT PRIMARY KEY,state TEXT NOT NULL)');
    const credit = (changes) => {
        for (const [id,amount] of Object.entries(changes)) {
            if (amount && !db.prepare('UPDATE users SET coins=coins+?,revision=revision+1 WHERE id=? AND coins+?>=0').run(amount,id,amount).changes)
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
    app.post('/api/blackjack/table',requireAuth,(req,res) => {
        db.exec('BEGIN IMMEDIATE');
        try {
            const input = req.body;
            validateRoom(input.room);
            const actor = db.prepare('SELECT id,username,coins FROM users WHERE id=?').get(req.userRow.id);
            const saved = db.prepare('SELECT state FROM blackjack_tables WHERE room=?').get(input.room);
            const previous = saved && JSON.parse(saved.state);
            const {state,changes,view} = advanceTable(previous,actor,input,Date.now());
            if (changedTable(previous,state)) {
                credit(changes);
                const json = JSON.stringify(persistableTable(state,actor,Date.now()));
                db.prepare('INSERT INTO blackjack_tables VALUES(?,?) ON CONFLICT(room) DO UPDATE SET state=excluded.state').run(input.room,json);
            }
            db.exec('COMMIT');
            res.json({...view,balance:actor.coins + (changes[actor.id] || 0)});
        } catch (e) {
            db.exec('ROLLBACK');
            res.status(400).json({error:e.message});
        }
    });
};
