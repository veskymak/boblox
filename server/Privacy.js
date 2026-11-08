/* Read-only account export. Erasure requests are verified by the operator. */
function installPrivacy(app, db, requireAuth, serialize) {
    app.get('/api/auth/privacy-export', requireAuth, (req, res) => {
        const id = req.userRow.id;
        res.set('Cache-Control', 'no-store');
        const rows = (table, where = 'user_id = ?', params = [id]) => db.prepare(`SELECT * FROM ${table} WHERE ${where}`).all(...params);
        const commands = db.prepare('SELECT request_id,command,payload FROM account_commands WHERE user_id=?').all(id);
        res.json({
            exportedAt: new Date().toISOString(),
            profile: serialize(req.userRow),
            ageConfirmation: rows('account_consents'),
            messages: rows('direct_messages', 'sender_id = ? OR recipient_id = ? OR recipient_username = ? COLLATE NOCASE', [id, id, req.userRow.username]),
            comments: rows('comments'),
            ratings: rows('game_ratings'),
            transactions: rows('account_ledger'),
            gameState: rows('account_command_state'),
            commands
        });
    });
}
module.exports = { installPrivacy };
