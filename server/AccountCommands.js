const crypto = require('node:crypto');
const catalog = require('../data/shop-catalog.json');
const random = (n) => crypto.randomInt(n);
const blackjack = require('./Blackjack');
function installAccountCommands(app, db, requireAuth, serialize) {
    if (
        !db
            .prepare('PRAGMA table_info(users)')
            .all()
            .some((column) => column.name === 'revision')
    )
        db.exec('ALTER TABLE users ADD COLUMN revision INTEGER NOT NULL DEFAULT 0');
    db.exec(`CREATE TABLE IF NOT EXISTS account_commands(user_id INTEGER, request_id TEXT, command TEXT NOT NULL, payload TEXT NOT NULL, result TEXT NOT NULL, PRIMARY KEY(user_id,request_id));
    CREATE TABLE IF NOT EXISTS account_command_state(user_id INTEGER PRIMARY KEY, state TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS account_ledger(id TEXT PRIMARY KEY,user_id INTEGER NOT NULL,amount INTEGER NOT NULL,balance_after INTEGER NOT NULL,game TEXT NOT NULL,created_at INTEGER NOT NULL);
    CREATE TRIGGER IF NOT EXISTS wallet_audit AFTER UPDATE OF coins ON users WHEN NEW.coins<>OLD.coins BEGIN
      INSERT INTO account_ledger VALUES(lower(hex(randomblob(16))),NEW.id,NEW.coins-OLD.coins,NEW.coins,'Boblox',CAST(unixepoch('subsec')*1000 AS INTEGER));
    END;`);
    app.get('/api/transactions', requireAuth, (req, res) =>
        res.json({
            ok: true,
            transactions: db
                .prepare(
                    'SELECT id,amount,game,created_at AS timestamp,balance_after AS balanceAfter FROM account_ledger WHERE user_id=? ORDER BY created_at DESC LIMIT 100'
                )
                .all(req.userRow.id)
        })
    );
    for (const action of ['remove', 'reject', 'cancel'])
        app.post('/api/friends/' + action, requireAuth, (req, res) => {
            const target = db
                .prepare('SELECT * FROM users WHERE username=? COLLATE NOCASE')
                .get(String(req.body?.targetUsername || ''));
            if (!target || target.id === req.userRow.id)
                return res.status(400).json({ error: 'Invalid recipient.' });
            db.exec('BEGIN IMMEDIATE');
            try {
                for (const [id, other] of [
                    [req.userRow.id, target.username],
                    [target.id, req.userRow.username]
                ]) {
                    const row = db.prepare('SELECT inventory FROM users WHERE id=?').get(id);
                    const inv = JSON.parse(row.inventory || '{}');
                    for (const key of ['friends', 'sent_friend_requests', 'received_friend_requests'])
                        inv[key] = (inv[key] || []).filter(
                            (value) =>
                                String(typeof value === 'string' ? value : value.username || value.id)
                                    .replace(/^(cloud_|db_|user_|peer_)/, '')
                                    .toLowerCase() !== other.toLowerCase()
                        );
                    db.prepare('UPDATE users SET inventory=?,revision=revision+1 WHERE id=?').run(
                        JSON.stringify(inv),
                        id
                    );
                }
                db.exec('COMMIT');
                res.json({
                    ok: true,
                    user: serialize(db.prepare('SELECT * FROM users WHERE id=?').get(req.userRow.id))
                });
            } catch (error) {
                db.exec('ROLLBACK');
                res.status(500).json({ error: 'Friend change failed.' });
            }
        });
    app.post('/api/account/command', requireAuth, (req, res) => {
        const { command, payload = {}, requestId } = req.body || {};
        if (
            !/^[0-9a-f-]{36}$/i.test(requestId || '') ||
            !payload ||
            typeof payload !== 'object' ||
            Array.isArray(payload)
        )
            return res.status(400).json({ error: 'Invalid command.' });
        db.exec('BEGIN IMMEDIATE');
        try {
            const row = db.prepare('SELECT * FROM users WHERE id=?').get(req.userRow.id);
            const saved = db
                .prepare('SELECT * FROM account_commands WHERE user_id=? AND request_id=?')
                .get(row.id, requestId);
            if (saved) {
                if (saved.command !== command || saved.payload !== JSON.stringify(payload))
                    throw Error('Request ID reused.');
                db.exec('COMMIT');
                const replayUser = serialize(row);
                return res.json({
                    ...JSON.parse(saved.result),
                    user: replayUser,
                    wheelAt: replayUser.wheelAt,
                    extraSpin: replayUser.extraSpin,
                    serverTime: Date.now()
                });
            }
            const inv = JSON.parse(row.inventory || '{}');
            const state = JSON.parse(
                db.prepare('SELECT state FROM account_command_state WHERE user_id=?').get(row.id)?.state ||
                    '{}'
            );
            let amount = 0,
                result = {},
                bet = 0,
                payout = 0;
            const now = Date.now();
            const validBet = (value) => {
                if (!Number.isSafeInteger(value) || value < 1 || value > 10000 || row.coins < value)
                    throw Error('Invalid bet or insufficient funds.');
                return value;
            };
            if (command === 'purchase') {
                const item = catalog.find((i) => i.id === payload.itemId && i.slot !== 'egg');
                if (!item) throw Error('Unknown item.');
                inv.owned ||= ['face_classic'];
                inv.outfit ||= {};
                if (!inv.owned.includes(item.id)) {
                    amount = -item.price;
                    inv.owned.push(item.id);
                }
                inv.outfit[item.slot] = item.id;
            } else if (command === 'wheel') {
                bet = state.extraSpin || now - (state.wheelAt || 0) >= 86400000 ? 0 : 600;
                if (row.coins < bet) throw Error('Insufficient funds.');
                const idx = random(20);
                payout = [
                    3500, 500, 150, 300, 250, 600, 200, 400, 0, 700, 250, 500, 300, 600, 300, 600, 500, 900,
                    400, 350
                ][idx];
                if (!bet && !state.extraSpin) state.wheelAt = now;
                state.extraSpin = idx === 8;
                if (idx === 0) inv.is_vip = true;
                amount = payout - bet;
                result = { prizeIndex: idx, payout };
            } else if (command === 'slots') {
                bet = validBet(payload.bet);
                const weights = [30, 24, 18, 14, 8, 5, 3];
                const reels = Array.from({ length: 3 }, () => {
                    let r = random(102),
                        i = 0;
                    while (i < 6 && r >= weights[i]) r -= weights[i++];
                    return i;
                });
                payout = reels.every((i) => i === reels[0])
                    ? bet * [2, 4, 8, 15, 25, 35, 50][reels[0]]
                    : reels[0] === 0 && reels[1] === 0
                      ? Math.round(bet * 1.5)
                      : 0;
                amount = payout - bet;
                result = { reels, payout };
            } else if (command === 'derby') {
                bet = validBet(payload.bet);
                const odds = [2.2, 3.5, 5, 8, 15];
                if (!Number.isInteger(payload.horseId) || payload.horseId < 1 || payload.horseId > 5)
                    throw Error('Invalid horse.');
                let r = (random(1000000) / 1000000) * odds.reduce((a, o) => a + 1 / o, 0),
                    i = 0;
                while (i < 4 && r >= 1 / odds[i]) r -= 1 / odds[i++];
                payout = payload.horseId === i + 1 ? Math.round(bet * odds[i]) : 0;
                amount = payout - bet;
                result = { winnerId: i + 1, payout };
            } else if (command === 'blackjack') {
                const step = blackjack.advance(state.blackjack, payload.action, payload.bet, row.coins);
                state.blackjack = step.state;
                amount = step.amount;
                result = step.result;
            } else if (command === 'game_start') {
                if (
                    ![
                        'adoptme',
                        'obby',
                        'lava',
                        'sfoth',
                        'tycoon',
                        'disasters',
                        'toh',
                        'zombies',
                        'speedrun',
                        'hideandseek',
                        'bedwars',
                        'casino'
                    ].includes(payload.gameId)
                )
                    throw Error('Unknown game.');
                state.session = { gameId: payload.gameId, start: now, last: now, rewarded: 0 };
                inv.gamesPlayed = (inv.gamesPlayed || 0) + 1;
            } else if (command === 'game_reward') {
                if (
                    !state.session ||
                    state.session.gameId === 'casino' ||
                    now - state.session.last < 30000 ||
                    state.session.rewarded >= 600
                )
                    throw Error('Reward unavailable.');
                amount = 20;
                state.session.last = now;
                state.session.rewarded += 20;
            } else if (command.startsWith('adopt_')) {
                inv.adoptme_bucks ??= 120;
                inv.adoptme_pets ||= [{ id: 'dog', tasksDone: 0, ageIdx: 0 }];
                if (command === 'adopt_tree' || command === 'adopt_trade') {
                    const key = command === 'adopt_tree' ? 'lastTree' : 'lastTrade',
                        delay = command === 'adopt_tree' ? 9000 : 16000;
                    if (now - (state[key] || 0) < delay) throw Error('Cooldown.');
                    state[key] = now;
                    inv.adoptme_bucks += command === 'adopt_tree' ? 15 : 40;
                    amount = command === 'adopt_trade' ? 35 : 0;
                } else if (command === 'adopt_need') {
                    if (now - (state.lastNeed || 0) < 12500) throw Error('Cooldown.');
                    const pet = inv.adoptme_pets[payload.petIndex];
                    const rewards = {
                        hungry: [30, 25],
                        thirsty: [30, 25],
                        sleepy: [38, 30],
                        dirty: [38, 30],
                        sick: [45, 35],
                        bored: [42, 30],
                        school: [50, 35],
                        camping: [50, 35]
                    }[payload.needId];
                    if (!pet || !rewards) throw Error('Invalid task.');
                    state.lastNeed = now;
                    pet.tasksDone = (pet.tasksDone || 0) + 1;
                    pet.ageIdx = Math.min(5, Math.floor(pet.tasksDone / 2));
                    inv.adoptme_bucks += rewards[0];
                    amount = rewards[1] + (pet.tasksDone === 10 ? 180 : 0);
                } else if (command === 'adopt_hatch') {
                    const egg = catalog.find((i) => i.id === payload.eggId && i.slot === 'egg');
                    if (!egg || inv.adoptme_bucks < egg.price || inv.adoptme_pets.length >= 200)
                        throw Error('Egg unavailable.');
                    const pools = {
                        cracked_egg: [
                            ['dog', 40],
                            ['cat', 35],
                            ['penguin', 14],
                            ['bunny', 8],
                            ['redpanda', 3]
                        ],
                        pet_egg: [
                            ['penguin', 30],
                            ['bunny', 28],
                            ['redpanda', 22],
                            ['kitsune', 12],
                            ['unicorn', 5],
                            ['dragon', 3]
                        ],
                        royal_egg: [
                            ['redpanda', 22],
                            ['kitsune', 28],
                            ['unicorn', 27],
                            ['dragon', 23]
                        ]
                    };
                    let r = random(100),
                        pool = pools[egg.id],
                        i = 0;
                    while (i < pool.length - 1 && r >= pool[i][1]) r -= pool[i++][1];
                    const petId = pool[i][0];
                    inv.adoptme_bucks -= egg.price;
                    inv.adoptme_pets.push({ id: petId, tasksDone: 0, ageIdx: 0 });
                    amount = ['unicorn', 'dragon'].includes(petId)
                        ? 120
                        : ['kitsune', 'redpanda'].includes(petId)
                          ? 75
                          : 45;
                    result = { petId };
                } else throw Error('Unknown command.');
            } else throw Error('Unknown command.');
            if (
                !Number.isSafeInteger(row.coins + amount) ||
                row.coins + amount < 0 ||
                row.coins + amount > 2147483647
            )
                throw Error('Insufficient funds.');
            db.prepare(
                'UPDATE users SET coins=?,inventory=?,last_active_at=?,revision=revision+1 WHERE id=?'
            ).run(row.coins + amount, JSON.stringify(inv), now, row.id);
            db.prepare(
                'INSERT INTO account_command_state(user_id,state) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET state=excluded.state'
            ).run(row.id, JSON.stringify(state));
            result = { ...result, ok: true, wheelAt: state.wheelAt || 0, extraSpin: !!state.extraSpin };
            db.prepare('INSERT INTO account_commands VALUES(?,?,?,?,?)').run(
                row.id,
                requestId,
                command,
                JSON.stringify(payload),
                JSON.stringify(result)
            );
            const user = serialize(db.prepare('SELECT * FROM users WHERE id=?').get(row.id));
            db.exec('COMMIT');
            res.json({ ...result, user, serverTime: now });
        } catch (error) {
            db.exec('ROLLBACK');
            res.status(400).json({ error: error.message });
        }
    });
}
module.exports = { installAccountCommands };
