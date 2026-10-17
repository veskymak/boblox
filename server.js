/**
 * BOBLOX v2.0 - Full-Stack Backend Server
 * Stack: Node.js + Express + SQLite (node:sqlite) + bcryptjs + JWT + WebSocket (ws)
 */
const http = require('http');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'boblox_super_secret_jwt_key_2026_v2';
const COOKIE_NAME = 'boblox_token';
const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours strict interval
const COMMENT_COOLDOWN_MS = 30 * 1000; // 30s anti-spam cooldown
const MAX_COMMENT_LENGTH = 250;

const VALID_GAME_IDS = new Set([
    'adoptme', 'obby', 'lava', 'sfoth', 'tycoon', 'disasters',
    'toh', 'zombies', 'speedrun', 'hideandseek', 'bedwars'
]);

/* ============================================================================
 * 1. SQLITE DATABASE INITIALIZATION & SCHEMA
 * ============================================================================ */
const dbPath = path.join(__dirname, 'boblox.db');
const db = new DatabaseSync(dbPath);

db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        inventory TEXT NOT NULL DEFAULT '{"owned":["face_classic"],"outfit":{"shirt":null,"pants":null,"face":"face_classic","hat":null},"torsoHex":"#0D69AC","gamesPlayed":0}',
        coins INTEGER NOT NULL DEFAULT 250,
        daily_claim_date INTEGER NOT NULL DEFAULT 0,
        game_ratings TEXT NOT NULL DEFAULT '{}',
        comments TEXT NOT NULL DEFAULT '[]',
        last_comment_at INTEGER NOT NULL DEFAULT 0,
        last_login_at INTEGER NOT NULL DEFAULT 0,
        last_active_at INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS game_ratings (
        user_id INTEGER NOT NULL,
        game_id TEXT NOT NULL,
        vote TEXT NOT NULL CHECK(vote IN ('like', 'dislike')),
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (user_id, game_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        username TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_comments_game_id ON comments(game_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ratings_game_id ON game_ratings(game_id);
`);

// Migration for existing databases
try { db.exec(`ALTER TABLE users ADD COLUMN last_login_at INTEGER NOT NULL DEFAULT 0;`); } catch (e) {}
try { db.exec(`ALTER TABLE users ADD COLUMN last_active_at INTEGER NOT NULL DEFAULT 0;`); } catch (e) {}

/* ============================================================================
 * 2. SECURITY & SANITIZATION HELPERS (XSS & SQL/NoSQL INJECTION PROTECTION)
 * ============================================================================ */
function sanitizePlainText(input, maxLen = 250) {
    if (typeof input !== 'string') return '';
    // Strip control chars, null bytes, NoSQL operator patterns ($where, $gt, etc.), and dangerous tags
    let cleaned = input
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
        .trim();
    if (cleaned.length > maxLen) {
        cleaned = cleaned.slice(0, maxLen);
    }
    return cleaned;
}

function encodeHtmlEntities(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\//g, '&#x2F;');
}

function validateUsername(raw) {
    if (typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmed)) return null;
    return trimmed;
}

function safeParseJSON(str, fallback) {
    try {
        const parsed = JSON.parse(str);
        return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch {
        return fallback;
    }
}

function serializeUserForClient(row) {
    if (!row) return null;
    return {
        id: row.id,
        username: row.username,
        coins: Number(row.coins) || 0,
        inventory: safeParseJSON(row.inventory, {
            owned: ['face_classic'],
            outfit: { shirt: null, pants: null, face: 'face_classic', hat: null },
            torsoHex: '#0D69AC',
            gamesPlayed: 0
        }),
        daily_claim_date: Number(row.daily_claim_date) || 0,
        last_login_at: Number(row.last_login_at) || 0,
        last_active_at: Number(row.last_active_at) || 0,
        game_ratings: safeParseJSON(row.game_ratings, {}),
        comments: safeParseJSON(row.comments, [])
    };
}

/* ============================================================================
 * 3. EXPRESS APP & JWT AUTH MIDDLEWARE
 * ============================================================================ */
const app = express();
const server = http.createServer(app);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

function signUserToken(user) {
    return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
}

function setAuthCookie(res, token) {
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
}

function extractUserFromReq(req) {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
    } else if (req.cookies && req.cookies[COOKIE_NAME]) {
        token = req.cookies[COOKIE_NAME];
    }
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        return stmt.get(decoded.id) || null;
    } catch {
        return null;
    }
}

function requireAuth(req, res, next) {
    const userRow = extractUserFromReq(req);
    if (!userRow) {
        return res.status(401).json({ error: 'Pro tuto akci se musíš přihlásit.' });
    }
    req.userRow = userRow;
    next();
}

/* ============================================================================
 * 4. AUTHENTICATION ENDPOINTS (/api/auth/register, /api/auth/login, /api/auth/me)
 * ============================================================================ */
app.post('/api/auth/register', async (req, res) => {
    try {
        const body = req.body || {};
        const username = validateUsername(body.username);
        const password = typeof body.password === 'string' ? body.password : '';

        if (!username) {
            return res.status(400).json({ error: 'Uživatelské jméno musí mít 3–20 znaků (písmena, čísla, podtržítko).' });
        }
        if (password.length < 6 || password.length > 100) {
            return res.status(400).json({ error: 'Heslo musí mít alespoň 6 znaků.' });
        }

        const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
        if (existing) {
            return res.status(409).json({ error: 'Toto uživatelské jméno je již obsazené.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const now = Date.now();
        const defaultInv = JSON.stringify({
            owned: ['face_classic'],
            outfit: { shirt: null, pants: null, face: 'face_classic', hat: null },
            torsoHex: '#0D69AC',
            gamesPlayed: 0
        });

        const insertStmt = db.prepare(`
            INSERT INTO users (username, password_hash, inventory, coins, daily_claim_date, game_ratings, comments, last_comment_at, last_login_at, last_active_at, created_at)
            VALUES (?, ?, ?, 250, 0, '{}', '[]', 0, ?, ?, ?)
        `);
        const info = insertStmt.run(username, passwordHash, defaultInv, now, now, now);
        const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);

        const token = signUserToken(userRow);
        setAuthCookie(res, token);

        return res.status(201).json({
            token,
            user: serializeUserForClient(userRow),
            serverTime: now
        });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ error: 'Chyba serveru při registraci.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const body = req.body || {};
        const username = validateUsername(body.username);
        const password = typeof body.password === 'string' ? body.password : '';

        if (!username || !password) {
            return res.status(400).json({ error: 'Zadej platné uživatelské jméno a heslo.' });
        }

        const userRow = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (!userRow) {
            return res.status(401).json({ error: 'Nesprávné uživatelské jméno nebo heslo.' });
        }

        const match = await bcrypt.compare(password, userRow.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Nesprávné uživatelské jméno nebo heslo.' });
        }

        const now = Date.now();
        db.prepare('UPDATE users SET last_login_at = ?, last_active_at = ? WHERE id = ?').run(now, now, userRow.id);
        userRow.last_login_at = now;
        userRow.last_active_at = now;

        const token = signUserToken(userRow);
        setAuthCookie(res, token);

        return res.json({
            token,
            user: serializeUserForClient(userRow),
            serverTime: now
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Chyba serveru při přihlášení.' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME);
    return res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
    const userRow = extractUserFromReq(req);
    if (!userRow) {
        return res.status(401).json({ error: 'Nepřihlášen', serverTime: Date.now() });
    }
    return res.json({
        user: serializeUserForClient(userRow),
        serverTime: Date.now()
    });
});

/* ============================================================================
 * 5. ACCOUNT SYNC & DAILY REWARD ENDPOINTS
 * ============================================================================ */
app.post('/api/user/sync', requireAuth, (req, res) => {
    try {
        const body = req.body || {};
        const currentInv = safeParseJSON(req.userRow.inventory, {});
        let nextCoins = req.userRow.coins;

        if (typeof body.coins === 'number' && Number.isFinite(body.coins) && body.coins >= 0 && body.coins <= 10000000) {
            nextCoins = Math.floor(body.coins);
        }

        const updatedInv = {
            owned: Array.isArray(body.owned) ? body.owned.filter(x => typeof x === 'string').slice(0, 100) : (currentInv.owned || ['face_classic']),
            outfit: (body.outfit && typeof body.outfit === 'object') ? {
                shirt: typeof body.outfit.shirt === 'string' ? body.outfit.shirt : null,
                pants: typeof body.outfit.pants === 'string' ? body.outfit.pants : null,
                face: typeof body.outfit.face === 'string' ? body.outfit.face : 'face_classic',
                hat: typeof body.outfit.hat === 'string' ? body.outfit.hat : null
            } : (currentInv.outfit || { shirt: null, pants: null, face: 'face_classic', hat: null }),
            torsoHex: (typeof body.torsoHex === 'string' && /^#[0-9A-Fa-f]{6}$/.test(body.torsoHex)) ? body.torsoHex : (currentInv.torsoHex || '#0D69AC'),
            gamesPlayed: (typeof body.gamesPlayed === 'number' && body.gamesPlayed >= 0) ? Math.floor(body.gamesPlayed) : (currentInv.gamesPlayed || 0)
        };

        const now = Date.now();
        db.prepare('UPDATE users SET coins = ?, inventory = ?, last_active_at = ? WHERE id = ?')
            .run(nextCoins, JSON.stringify(updatedInv), now, req.userRow.id);

        const fresh = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userRow.id);
        return res.json({ user: serializeUserForClient(fresh), serverTime: now });
    } catch (err) {
        console.error('Sync error:', err);
        return res.status(500).json({ error: 'Chyba při ukládání účtu.' });
    }
});

app.post('/api/user/active', requireAuth, (req, res) => {
    try {
        const now = Date.now();
        db.prepare('UPDATE users SET last_active_at = ? WHERE id = ?').run(now, req.userRow.id);
        return res.json({ ok: true, last_active_at: now, serverTime: now });
    } catch (err) {
        return res.status(500).json({ error: 'Chyba při aktualizaci aktivity.' });
    }
});

app.post('/api/daily-claim', requireAuth, (req, res) => {
    try {
        const now = Date.now();
        const lastClaim = Number(req.userRow.daily_claim_date) || 0;
        const elapsed = now - lastClaim;

        if (lastClaim > 0 && elapsed < DAILY_COOLDOWN_MS) {
            const nextClaimTimestamp = lastClaim + DAILY_COOLDOWN_MS;
            return res.status(400).json({
                error: 'Denní bonus si můžeš vyzvednout pouze 1x za 24 hodin!',
                lastClaimTimestamp: lastClaim,
                nextClaimTimestamp,
                remainingMs: nextClaimTimestamp - now,
                serverTime: now
            });
        }

        const reward = 50;
        const newCoins = (Number(req.userRow.coins) || 0) + reward;
        db.prepare('UPDATE users SET coins = ?, daily_claim_date = ? WHERE id = ?')
            .run(newCoins, now, req.userRow.id);

        const fresh = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userRow.id);
        return res.json({
            ok: true,
            reward,
            user: serializeUserForClient(fresh),
            lastClaimTimestamp: now,
            nextClaimTimestamp: now + DAILY_COOLDOWN_MS,
            serverTime: now
        });
    } catch (err) {
        console.error('Daily claim error:', err);
        return res.status(500).json({ error: 'Chyba při vyzvedávání denního bonusu.' });
    }
});

/* ============================================================================
 * 6. RATINGS (LIKE/DISLIKE) & SECURE COMMENTS ENDPOINTS
 * ============================================================================ */
function getGameRatingStats(gameId) {
    const rows = db.prepare(`
        SELECT vote, COUNT(*) as cnt
        FROM game_ratings
        WHERE game_id = ?
        GROUP BY vote
    `).all(gameId);

    let likes = 0;
    let dislikes = 0;
    rows.forEach(r => {
        if (r.vote === 'like') likes = Number(r.cnt);
        if (r.vote === 'dislike') dislikes = Number(r.cnt);
    });
    const total = likes + dislikes;
    const ratingPct = total > 0 ? Math.round((likes / total) * 100) : null;
    return { likes, dislikes, total, ratingPct };
}

app.get('/api/games/summary', (req, res) => {
    const userRow = extractUserFromReq(req);
    const userRatings = userRow ? safeParseJSON(userRow.game_ratings, {}) : {};
    const onlineStats = getLiveOnlineCounts();

    const summary = {};
    VALID_GAME_IDS.forEach(gid => {
        const stats = getGameRatingStats(gid);
        const commentCountRow = db.prepare('SELECT COUNT(*) as cnt FROM comments WHERE game_id = ?').get(gid);
        summary[gid] = {
            ...stats,
            myVote: userRatings[gid] || null,
            commentCount: commentCountRow ? Number(commentCountRow.cnt) : 0,
            online: onlineStats.perGame[gid] || 0
        };
    });

    return res.json({
        totalOnline: onlineStats.totalOnline,
        games: summary,
        serverTime: Date.now()
    });
});

app.get('/api/games/:gameId/social', (req, res) => {
    const gameId = String(req.params.gameId || '').trim();
    if (!VALID_GAME_IDS.has(gameId)) {
        return res.status(404).json({ error: 'Hra nenalezena.' });
    }

    const userRow = extractUserFromReq(req);
    const stats = getGameRatingStats(gameId);
    let myVote = null;
    if (userRow) {
        const voteRow = db.prepare('SELECT vote FROM game_ratings WHERE user_id = ? AND game_id = ?').get(userRow.id, gameId);
        myVote = voteRow ? voteRow.vote : null;
    }

    const commentRows = db.prepare(`
        SELECT id, game_id, user_id, username, content, created_at
        FROM comments
        WHERE game_id = ?
        ORDER BY created_at DESC
        LIMIT 50
    `).all(gameId);

    const onlineStats = getLiveOnlineCounts();

    return res.json({
        gameId,
        ...stats,
        myVote,
        onlinePlayers: onlineStats.perGame[gameId] || 0,
        comments: commentRows.map(c => ({
            id: c.id,
            gameId: c.game_id,
            userId: c.user_id,
            username: c.username,
            content: c.content,
            contentHtmlSafe: encodeHtmlEntities(c.content),
            createdAt: Number(c.created_at)
        }))
    });
});

app.post('/api/games/:gameId/rate', requireAuth, (req, res) => {
    const gameId = String(req.params.gameId || '').trim();
    if (!VALID_GAME_IDS.has(gameId)) {
        return res.status(404).json({ error: 'Hra nenalezena.' });
    }

    const vote = req.body && req.body.vote;
    if (vote !== 'like' && vote !== 'dislike') {
        return res.status(400).json({ error: 'Neplatné hodnocení.' });
    }

    const now = Date.now();
    const existing = db.prepare('SELECT vote FROM game_ratings WHERE user_id = ? AND game_id = ?').get(req.userRow.id, gameId);

    if (existing && existing.vote === vote) {
        // User already cast this exact vote -> strictly 1 vote per user per game
        return res.status(400).json({
            error: `Tuto hru jsi již ohodnotil (${vote === 'like' ? '👍 Like' : '👎 Dislike'}).`,
            ...getGameRatingStats(gameId),
            myVote: existing.vote
        });
    }

    db.prepare(`
        INSERT INTO game_ratings (user_id, game_id, vote, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, game_id) DO UPDATE SET vote = excluded.vote, updated_at = excluded.updated_at
    `).run(req.userRow.id, gameId, vote, now);

    // Sync user's game_ratings JSON column
    const userRatings = safeParseJSON(req.userRow.game_ratings, {});
    userRatings[gameId] = vote;
    db.prepare('UPDATE users SET game_ratings = ? WHERE id = ?')
        .run(JSON.stringify(userRatings), req.userRow.id);

    const stats = getGameRatingStats(gameId);
    return res.json({
        ok: true,
        ...stats,
        myVote: vote,
        game_ratings: userRatings
    });
});

app.post('/api/games/:gameId/comments', requireAuth, (req, res) => {
    const gameId = String(req.params.gameId || '').trim();
    if (!VALID_GAME_IDS.has(gameId)) {
        return res.status(404).json({ error: 'Hra nenalezena.' });
    }

    const now = Date.now();
    const lastCommentAt = Number(req.userRow.last_comment_at) || 0;
    if (now - lastCommentAt < COMMENT_COOLDOWN_MS) {
        const retrySec = Math.ceil((COMMENT_COOLDOWN_MS - (now - lastCommentAt)) / 1000);
        return res.status(429).json({
            error: `Anti-spam ochrana: Další komentář můžeš napsat za ${retrySec}s.`,
            retryAfterSec: retrySec
        });
    }

    const rawText = req.body && typeof req.body.content === 'string' ? req.body.content : '';
    const cleanText = sanitizePlainText(rawText, MAX_COMMENT_LENGTH);

    if (!cleanText || cleanText.length < 2) {
        return res.status(400).json({ error: 'Komentář musí obsahovat alespoň 2 znaky (max 250 znaků).' });
    }

    const insertInfo = db.prepare(`
        INSERT INTO comments (game_id, user_id, username, content, created_at)
        VALUES (?, ?, ?, ?, ?)
    `).run(gameId, req.userRow.id, req.userRow.username, cleanText, now);

    // Update user's comments JSON column & last_comment_at
    const userComments = safeParseJSON(req.userRow.comments, []);
    userComments.unshift({
        id: Number(insertInfo.lastInsertRowid),
        gameId,
        content: cleanText,
        createdAt: now
    });
    if (userComments.length > 50) userComments.length = 50;

    db.prepare('UPDATE users SET comments = ?, last_comment_at = ? WHERE id = ?')
        .run(JSON.stringify(userComments), now, req.userRow.id);

    const createdComment = {
        id: Number(insertInfo.lastInsertRowid),
        gameId,
        userId: req.userRow.id,
        username: req.userRow.username,
        content: cleanText,
        contentHtmlSafe: encodeHtmlEntities(cleanText),
        createdAt: now
    };

    return res.status(201).json({
        ok: true,
        comment: createdComment,
        cooldownMs: COMMENT_COOLDOWN_MS
    });
});

/* ============================================================================
 * 7. WEBSOCKET LIVE PRESENCE, SIGNALING & GLOBAL/PRIVATE MATCHMAKING
 * ============================================================================ */
const wss = new WebSocketServer({ server, path: '/ws' });

// Connected clients: ws -> { clientId, username, peerId, gameId, mode, roomCode }
const clients = new Map();

function getLiveOnlineCounts() {
    const perGame = {};
    VALID_GAME_IDS.forEach(gid => { perGame[gid] = 0; });
    let totalOnline = 0;

    for (const info of clients.values()) {
        totalOnline++;
        if (info.gameId && VALID_GAME_IDS.has(info.gameId)) {
            perGame[info.gameId] = (perGame[info.gameId] || 0) + 1;
        }
    }
    return { totalOnline, perGame };
}

function broadcastOnlineStats() {
    const stats = getLiveOnlineCounts();
    const payload = JSON.stringify({
        type: 'onlineStats',
        totalOnline: stats.totalOnline,
        perGame: stats.perGame
    });
    for (const ws of clients.keys()) {
        if (ws.readyState === 1) {
            ws.send(payload);
        }
    }
}

function getRoomPeers(gameId, mode, roomCode, excludeClientId = null) {
    const peers = [];
    for (const info of clients.values()) {
        if (info.clientId === excludeClientId) continue;
        if (mode === 'public') {
            if (info.mode === 'public' && info.gameId === gameId) {
                peers.push({ clientId: info.clientId, peerId: info.peerId, username: info.username });
            }
        } else if (mode === 'private' && roomCode) {
            if (info.mode === 'private' && info.roomCode === roomCode) {
                peers.push({ clientId: info.clientId, peerId: info.peerId, username: info.username, gameId: info.gameId, isHost: info.isHost });
            }
        }
    }
    return peers;
}

wss.on('connection', (ws) => {
    const clientId = 'c_' + crypto.randomBytes(6).toString('hex');
    clients.set(ws, {
        clientId,
        username: 'Noob_CZ',
        peerId: null,
        gameId: null, // null = in lobby
        mode: 'public',
        roomCode: null,
        isHost: false
    });

    ws.send(JSON.stringify({
        type: 'welcome',
        clientId,
        serverTime: Date.now(),
        ...getLiveOnlineCounts()
    }));
    broadcastOnlineStats();

    ws.on('message', (raw) => {
        let msg;
        try {
            msg = JSON.parse(String(raw));
        } catch {
            return;
        }
        const info = clients.get(ws);
        if (!info || !msg || typeof msg.type !== 'string') return;

        if (msg.type === 'presence') {
            info.username = sanitizePlainText(msg.username || info.username, 20) || 'Noob_CZ';
            info.peerId = typeof msg.peerId === 'string' ? msg.peerId.slice(0, 80) : info.peerId;
            const nextGame = (typeof msg.gameId === 'string' && VALID_GAME_IDS.has(msg.gameId)) ? msg.gameId : null;
            info.gameId = nextGame;
            info.mode = msg.mode === 'private' ? 'private' : 'public';
            info.roomCode = typeof msg.roomCode === 'string' ? msg.roomCode.toUpperCase().slice(0, 8) : null;
            info.isHost = !!msg.isHost;
            broadcastOnlineStats();

            if (info.gameId || (info.mode === 'private' && info.roomCode)) {
                const roomPeers = getRoomPeers(info.gameId, info.mode, info.roomCode, info.clientId);
                ws.send(JSON.stringify({
                    type: 'matchmakingPeers',
                    gameId: info.gameId,
                    mode: info.mode,
                    roomCode: info.roomCode,
                    peers: roomPeers
                }));
            }
            return;
        }

        if (msg.type === 'playerState' || msg.type === 'weaponSwitch' || msg.type === 'gameEvent' || msg.type === 'hostGameSelect') {
            // Relay multiplayer packet to all players in the same room (public matchmaking pool for gameId OR private party roomCode)
            for (const [otherWs, otherInfo] of clients.entries()) {
                if (otherWs === ws || otherWs.readyState !== 1) continue;
                const samePublicPool = info.mode === 'public' && otherInfo.mode === 'public' && info.gameId && otherInfo.gameId === info.gameId;
                const samePrivateRoom = info.mode === 'private' && otherInfo.mode === 'private' && info.roomCode && otherInfo.roomCode === info.roomCode;
                if (samePublicPool || samePrivateRoom) {
                    otherWs.send(JSON.stringify({
                        ...msg,
                        id: info.peerId || info.clientId
                    }));
                }
            }
        }
    });

    ws.on('close', () => {
        const info = clients.get(ws);
        clients.delete(ws);
        if (info) {
            const leaveMsg = JSON.stringify({
                type: 'peerLeft',
                id: info.peerId || info.clientId
            });
            for (const otherWs of clients.keys()) {
                if (otherWs.readyState === 1) otherWs.send(leaveMsg);
            }
        }
        broadcastOnlineStats();
    });
});

app.get('/api/stats/online', (req, res) => {
    return res.json({
        ...getLiveOnlineCounts(),
        serverTime: Date.now()
    });
});

// Serve static frontend files
app.use(express.static(__dirname));

server.listen(PORT, () => {
    console.log(`[BOBLOX Server] Running at http://localhost:${PORT}`);
});

