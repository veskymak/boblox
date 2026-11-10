/* ============================================================================
 * 2. BOBLOX PORTAL STATE, BACKEND AUTH/DB, DAILY BONUS & 10 GAMES CATALOG
 * ============================================================================ */
const STORAGE_KEYS = Object.freeze({
    VIP: 'boblox_is_vip_v1',
    BIO: 'boblox_custom_bio_v1',
    WHEEL: 'boblox_casino_wheel_last_spin_v2',
    BOBUX: 'boblox_bobux_balance_v1',
    PLAYED: 'boblox_games_played_v1',
    TORSO: 'boblox_avatar_torso_v1',
    JWT: 'boblox_jwt_token_v2',
    DAILY_TS: 'boblox_daily_claim_ts_v2',
    TRANSACTIONS: 'boblox_bobux_transactions_v2',
    CLOUD_USERS: 'boblox_cloud_users_cache_v2',
    USER_CACHE: 'boblox_auth_user_cache',
    LOCAL_USERS: 'boblox_local_db_users_v2',
    LOCAL_SOCIAL: 'boblox_local_db_social_v2',
    ADOPTME_BUCKS: 'boblox_adoptme_bucks_v1',
    ADOPTME_PETS: 'boblox_adoptme_pets_v1',
    GUEST_NUM: 'boblox_guest_num',
    BLACKJACK_GUEST: 'boblox_blackjack_guest_token',
    MP_NICK: 'boblox_mp_nick',
    API_BASE: 'boblox_api_base',
    CHAT_MESSAGES: 'boblox_direct_messages_v2',
    CHAT_UNREAD: 'boblox_unread_messages_v2',
    MUSIC_VOLUME: 'boblox_music_volume_v1'
});
if (typeof window !== 'undefined') {
    window.STORAGE_KEYS = STORAGE_KEYS;
}

const STORAGE_KEY_BOBUX = STORAGE_KEYS.BOBUX;
const STORAGE_KEY_PLAYED = STORAGE_KEYS.PLAYED;
const STORAGE_KEY_TORSO = STORAGE_KEYS.TORSO;
const STORAGE_KEY_JWT = STORAGE_KEYS.JWT;
const STORAGE_KEY_DAILY_TS = STORAGE_KEYS.DAILY_TS;
const STORAGE_KEY_TRANSACTIONS = STORAGE_KEYS.TRANSACTIONS;
const STORAGE_KEY_CLOUD_USERS = STORAGE_KEYS.CLOUD_USERS;
const LOCAL_DB_USERS_KEY = STORAGE_KEYS.LOCAL_USERS;
const LOCAL_DB_SOCIAL_KEY = STORAGE_KEYS.LOCAL_SOCIAL;
const STORAGE_KEY_ADOPTME_BUCKS = STORAGE_KEYS.ADOPTME_BUCKS;
const STORAGE_KEY_ADOPTME_PETS = STORAGE_KEYS.ADOPTME_PETS;
const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000; // Strict 24h interval
const COMMENT_COOLDOWN_MS = 30 * 1000; // Strict 30s anti-spam rate limit

let bobuxBalance = parseInt(localStorage.getItem(STORAGE_KEY_BOBUX) || '250', 10);
let gamesPlayedCount = parseInt(localStorage.getItem(STORAGE_KEY_PLAYED) || '0', 10);
let avatarTorsoHex = localStorage.getItem(STORAGE_KEY_TORSO) || '#0D69AC';
let lastClaimTimestamp = parseInt(localStorage.getItem(STORAGE_KEY_DAILY_TS) || '0', 10);
let serverTimeOffsetMs = 0; // serverTime - Date.now()
let activeFilterTag = 'ALL';
let selectedGameId = null;

function getGuestNickname(forceNew = false) {
    const hasSessionStorage = typeof sessionStorage !== 'undefined';
    let savedNum = !forceNew && hasSessionStorage ? sessionStorage.getItem(STORAGE_KEYS.GUEST_NUM) : null;
    if (!savedNum || forceNew || savedNum === 'NaN' || !/^\d+$/.test(savedNum)) {
        savedNum = String(Math.floor(1000 + Math.random() * 9000));
        if (hasSessionStorage) {
            try { sessionStorage.setItem(STORAGE_KEYS.GUEST_NUM, savedNum); } catch (e) {}
        }
        try { localStorage.setItem(STORAGE_KEYS.GUEST_NUM, savedNum); } catch (e) {}
    }
    return `Guest ${savedNum}`;
}

function resetGuestEconomy() {
    bobuxBalance = 250;
    try { localStorage.setItem(STORAGE_KEY_BOBUX, '250'); } catch (e) {}
    try { localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS); } catch (e) {}
    if (typeof bobuxTransactions !== 'undefined') bobuxTransactions = [];
    try { localStorage.removeItem(STORAGE_KEYS.ADOPTME_BUCKS); } catch (e) {}
    try { localStorage.removeItem(STORAGE_KEYS.ADOPTME_PETS); } catch (e) {}
    if (typeof updateBobuxUI === 'function') updateBobuxUI();
}

// Current authenticated user state
const authState = (typeof window !== 'undefined' && window.authState) ? window.authState : {
    token: (typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_JWT) : null) || null,
    user: null, // { id, username, coins, inventory, daily_claim_date, game_ratings, comments }
    mode: 'login',
    backendConnected: false,
    isSupabase: false,
    lastCommentTime: 0
};
if (typeof window !== 'undefined') {
    window.authState = authState;
}

// Live online player counters (NO fake random generators!)
const liveSocialState = {
    totalOnline: 1,
    perGameOnline: {},
    ratingsByGame: {}, // gameId -> { likes, dislikes, ratingPct, myVote, commentCount }
    commentsByGame: {} // gameId -> Array<{ id, username, content, createdAt }>
};

const GAMES_CATALOG = [
    {
        id: 'adoptme',
        title: 'Adopt Me! – Adoption Island',
        author: 'UpliftGames_Boblox',
        tag: 'RP',
        badgeText: '🐾 ADOPT ME! PETS',
        reward: '+180 B$ / Mazlíček',
        description: 'Vítej na ikonickém Adoption Islandu z playadopt.me! Navštiv Nursery (Adopční centrum), vylíhni vajíčka (Cracked Egg, Pet Egg, Royal Legendary Egg), adoptuj 3D mazlíčky od Štěňátka až po Neonového Jednorožce a Shadow Dragona, plň jejich potřeby (Hlad, Žízeň, Spánek, Koupel, Nemocnice, Hřiště), létej na nich (Fly & Ride) a obchoduj na Trade stanovišti!',
        mechanics: [
            '🥚 Nursery (Adopční centrum): Vylíhni Cracked Egg ($35), Pet Egg ($65) nebo Royal Legendary Egg ($120)',
            '🦄 8 3D Mazlíčků: Dog, Cat, Penguin, Snow Bunny, Red Panda, Kitsune, Neon Unicorn i létající Shadow Dragon!',
            '🍎 Potřeby mazlíčků (Ailments): Krmení (Slot 1), Nápoj (Slot 2), Postýlka, Hot Springs, Nemocnice a Trampolíny',
            '🪽 Slot 3 (Fly & Ride Potion): Nasedni na mazlíčka a létej nad ostrovem + Slot 4: Přepínání sbírky!'
        ]
    },
    {
        id: 'obby',
        title: 'Classic Mega Obby',
        author: 'ObbyKing_Builder',
        tag: 'OBBY',
        badgeText: 'PARKOUR & OBBY',
        reward: '+100 B$',
        description: 'Klasická víceúrovňová překážková dráha vysoko v oblacích! Přeskakuj smrtící červené lasery, udrž rovnováhu na pohyblivých plošinách, aktivuj zlaté checkpointy a dosáhni vítězného ostrova s konfetami.',
        mechanics: [
            '🔴 Červené lasery a bloky = okamžitá smrt ("OOF")',
            '🟨 Zlaté Checkpointy ukládají tvou pozici (+15 B$)',
            '↔️ Pohyblivé plošiny unášejí hráče s sebou',
            '🏆 Cíl na konci trati spouští konfety a odměnu +100 Bobux'
        ]
    },
    {
        id: 'lava',
        title: 'The Floor is Lava: Tower Escape',
        author: 'MagmaLabs_Official',
        tag: 'OBBY',
        badgeText: 'TOWER ESCAPE',
        reward: '+120 B$',
        description: 'Z podlahy sopečné věže každou sekundu stoupá žhnoucí láva! Šplhej po žebřících, skákej po římsách, sbírej legendární Speed Coil a Gravity Coil a dostaň se k záchrannému vrtulníku na střeše.',
        mechanics: [
            '🌋 Stoupající láva plynule zaplavuje nižší patra věže',
            '🪜 Žluté žebříky umožňují rychlé šplhání vzhůru',
            '⚡ Speed Coil (rychlost) a Gravity Coil (vysoký skok) ve slotech 1–3',
            '🚁 Záchranná helikoptéra a portál na vrcholu (+120 Bobux)'
        ]
    },
    {
        id: 'sfoth',
        title: 'Sword Fights on the Heights',
        author: 'Shedletsky_Legacy',
        tag: 'ACTION',
        badgeText: 'SFOTH ARENA',
        reward: '+35 B$ / Kill',
        description: 'Legendární šermířská aréna na plovoucích ostrovech spojených úzkými mosty! Přepínej mezi mečem, štítem a lékárničkou, odrážej rytíře údery (knockback) a shoď je do prázdna.',
        mechanics: [
            '⚔️ Slot 1: Linked Sword (sek s výpadem), Slot 2: Battle Axe, Slot 3: Medkit',
            '🤖 3 autonomní AI rytíři + živí hráči v multiplayeru',
            '💥 Zásah zbraní odhazuje nepřítele dozadu (knockback)',
            '👑 Za každého poraženého protivníka +35 B$, za celou vlnu +100 B$'
        ]
    },
    {
        id: 'tycoon',
        title: 'Classic 2-Story Tycoon',
        author: 'TycoonEmpire_Dev',
        tag: 'TYCOON',
        badgeText: 'BASE TYCOON',
        reward: '+150 B$',
        description: 'Postav si vlastní dvoupatrovou továrnu a pevnost od nuly! Dopravníkový pás chrlí kostky stříbrné a zlaté rudy do sběrné pece. Šlapej na fyzické čudlíky na zemi a odemykej stěny, schodiště a věž.',
        mechanics: [
            '🏭 Dopravník (Conveyor belt) fyzicky posouvá kostky rudy',
            '💵 Zelený sběrný čudlík připisuje vydělané dolary ($)',
            '🟢 Nášlapná tlačítka: Stěny ($100), 2. Dropper ($250), Schody ($500)',
            '🗼 Laserové dveře a VIP věž ($1000) generují Bobuxy!'
        ]
    },
    {
        id: 'disasters',
        title: 'Survive the Natural Disasters',
        author: 'Stickmaster_Luke',
        tag: 'ACTION',
        badgeText: 'SURVIVAL',
        reward: '+125 B$',
        description: 'Kruhový ostrov s parkem, stromy a dvoupatrovým cihlovým domem. Každou minutu udeří náhodná přírodní katastrofa, která fyzicky ničí budovu. Přežij odpočet 60 sekund a získej odměnu!',
        mechanics: [
            '☄️ Meteoritický déšť: padající ohnivé koule boří části domu',
            '🌧️ Kyselý déšť: schovej se pod pevnou střechu, jinak ztrácíš HP',
            '🌪️ Tornádo: rotující vír nasává cihly domu a odhazuje hráče',
            '⏱️ Přežij do konce 60s odpočtu pro výhru +125 Bobux'
        ]
    },
    {
        id: 'toh',
        title: 'Tower of Hell: Obby Extreme',
        author: 'Pyxl_Towers',
        tag: 'OBBY',
        badgeText: 'EXTREME TOWER',
        reward: '+200 B$',
        description: 'Extrémní vertikální skákačka bez záchytných checkpointů! Vyšplhej 5 neonových pater plných rotujících laserových ramen, obíhajících plošin a mizících bloků dříve, než vyprší časomíra.',
        mechanics: [
            '🌀 Rotující laserové tyče (Sweepers) a obíhající prstence',
            '🚫 Žádné záchytné checkpointy – čistý skill až do výšky 64 m',
            '⚡ Možnost přepnout Speed/Gravity Coil v hotbaru',
            '👑 Korunní portál na vrcholu věže uděluje +200 Bobux!'
        ]
    },
    {
        id: 'zombies',
        title: 'Zombie Survival Outpost',
        author: 'ApocDefense_Studio',
        tag: 'ACTION',
        badgeText: 'ZOMBIE SHOOTER',
        reward: '+150 B$ / Vlna',
        description: 'Opevněná vojenská základna v noci pod útokem vln hladových zombie! Přepínej mezi Blaster Pistolí, Pulzní Brokovnicí, Katanou a Lékárničkou (klávesy 1–4 nebo kolečko myši), přebíjej munici a přežij!',
        mechanics: [
            '🔫 Zbraně 1–4: Blaster Pistol, Pulse Shotgun, Katana, Lékárnička',
            '🧟 Stupňující se vlny 3D zombie s HP bary a AI pronásledováním',
            '📦 Svítící muniční bedny na základně doplňují náboje',
            '💰 +15 B$ za každou zombie a +100 B$ bonus za přežitou vlnu!'
        ]
    },
    {
        id: 'speedrun',
        title: 'Speed Run: Parkour Rush',
        author: 'SonicBlox_Track',
        tag: 'OBBY',
        badgeText: 'SPEED PARKOUR',
        reward: '+160 B$',
        description: 'Vysokorychlostní neonová závodní dráha s přesnou časomírou na setiny sekundy! Využívej modré zrychlující Boost Pady, překonávej obří propasti v rychlosti 2x Sprint a pokoř rekord trati.',
        mechanics: [
            '⏱️ Přesná závodní časomíra (MM:SS.ms) a 4 mezičasové checkpointy',
            '💨 Tyrkysové Boost Pady vystřelí rychlost hráče na 210 %',
            '🚧 Nakloněné šikany a laserové překážky v plné rychlosti',
            '🏁 Odměna +160 B$ (+50 B$ bonus za čas pod 45 sekund!)'
        ]
    },
    {
        id: 'hideandseek',
        title: 'Hide and Seek: Prop Hunt',
        author: 'PropMaster_Games',
        tag: 'PARTY',
        badgeText: 'PROP HUNT',
        reward: '+140 B$',
        description: 'Napínavá hra na schovávanou ve skladišti plném rekvizit! Jako Schovávající se proměň v dřevěnou bednu, sud nebo keř (sloty 1–3) a splyň s okolím. Jako Hledač použij Prop Scanner (slot 4) a odhal schované!',
        mechanics: [
            '📦 Sloty 1–3 mění tvůj 3D model na Krabici, Červený Sud nebo Keř',
            '🔍 Slot 4 přepne do role Hledače s detektorem a značkovacím obuškem',
            '🤖 AI Hledač i živí hráči prohledávají skladiště s kuželem světla',
            '⏳ Přežij 60s v přestrojení nebo odhal všechny schované (+140 B$)'
        ]
    },
    {
        id: 'bedwars',
        title: 'Bedwars: Island Battle',
        author: 'SkyWars_Collective',
        tag: 'PARTY',
        badgeText: 'ISLAND PVP',
        reward: '+200 B$',
        description: 'Ostrovní PvP a AI bitva vysoko nad propastí! Těž železo a diamanty z generátorů, stavěj mosty z vlněných bloků (Slot 3), prokopej se krumpáčem (Slot 2) k nepřátelské Červené posteli, znič ji a poraz obránce!',
        mechanics: [
            '🛏️ Dokud stojí týmová postel, hráči i obránci se po smrti respawnují',
            '🧱 Slot 3 (Stavební bloky): pokládej reálné 3D mosty a obranu nad propastí',
            '⛏️ Slot 2 (Krumpáč) & Slot 1 (Meč): těž obranu a znič Červenou postel',
            '💎 Středový ostrov generuje bonusové diamanty a Bobuxy (+200 B$ za výhru)'
        ]
    },
    {
        id: 'casino',
        title: 'Blox Vegas: Casino & Derby',
        author: 'BloxVegas_Studios',
        tag: 'PARTY',
        badgeText: 'CASINO & DERBY',
        reward: 'Až 10 000 B$',
        description: 'Luxusní neonové kasino Blox Vegas s blackjackovým stolem, výherními automaty Lucky 7, obřím kolem štěstí a napínavými sázkami na živé koňské dostihy! Vsaď Bobuxy, poraž krupiéra a vyhraj pohádkový jackpot!',
        mechanics: [
            '🃏 Blackjack (21): Vyzvi krupiéra, ber karty (Hit), stůj (Stand), zdvojnásob (Double) a vyhraj 2x až 2.5x vkladu',
            '🎰 Výherní automaty (Slots): 3 rotující válce se symboly Bobloxu a obřím jackpotem Lucky 7 (až 50x)',
            '🎡 Kolo štěstí (Daily Wheel): Denní zatočení zdarma o Bobuxy (až 2 500 B$) nebo toč za Bobuxy',
            '🏇 Koňské dostihy (Blox Derby): 5 závodních koní s kurzy od 2.2x do 15x. Vsaď na vítěze a sleduj napínavý závod!'
        ]
    }
];

function getSyncedNow() {
    return Date.now() + serverTimeOffsetMs;
}

function sanitizeTextClient(input, maxLen = 250) {
    if (typeof input !== 'string') return '';
    return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, maxLen);
}

/* ============================================================================
 * 2A. BACKEND API CLIENT + LOCAL FALLBACK DB (AUTH, DAILY BONUS, RATINGS, COMMENTS)
 * ============================================================================ */
function getLocalUsersDB() {
    try { return JSON.parse(localStorage.getItem(LOCAL_DB_USERS_KEY) || '[]'); } catch { return []; }
}
function saveLocalUsersDB(users) {
    localStorage.setItem(LOCAL_DB_USERS_KEY, JSON.stringify(users));
}
function getLocalSocialDB() {
    try {
        const raw = JSON.parse(localStorage.getItem(LOCAL_DB_SOCIAL_KEY) || '{}');
        return raw && typeof raw === 'object' ? raw : {};
    } catch {
        return {};
    }
}
function saveLocalSocialDB(data) {
    localStorage.setItem(LOCAL_DB_SOCIAL_KEY, JSON.stringify(data));
}


const SUPABASE_URL = 'https://vfbdsclqvsjbzzhyaegw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_lG31mqqwY-JFiSYbtkJqzg_-vR53iJh';
let supabaseClient = null;
let supabaseKeepalive = false;
function getSupabaseClient() {
    if (!supabaseClient && window.supabase && typeof window.supabase.createClient === 'function') {
        try {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                global: {
                    fetch: (input, options = {}) => fetch(input, {
                        ...options,
                        keepalive: options.keepalive === true || supabaseKeepalive
                    })
                }
            });
        } catch (e) {
            console.warn('Nepodařilo se inicializovat Supabase klienta:', e);
        }
    }
    return supabaseClient;
}

/* ============================================================================
 * 2A-1b. CLOUD USERS DIRECTORY & SEARCH (SUPABASE PROFILES / SERVER BACKEND)
 * ============================================================================ */
function isAppropriateUsername(name) {
    if (!name || typeof name !== 'string') return false;
    return name.trim().length > 0;
}

function getCloudUsersCache() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_CLOUD_USERS);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed.filter(u => u && u.username && isAppropriateUsername(u.username));
        }
    } catch (e) {}
    return [];
}

async function fetchCloudUsers(searchQuery = '') {
    const sb = getSupabaseClient();
    if (sb) {
        try {
            let req = sb.from('profiles').select('id, username, coins, inventory, created_at, bio');
            const q = (searchQuery || '').trim();
            if (q) {
                req = req.ilike('username', `%${q}%`);
            }
            let { data, error } = await req.order('username', { ascending: true }).limit(50);
            if (error && (error.message?.includes('column') || error.code === 'PGRST204')) {
                let fallbackReq = sb.from('profiles').select('id, username, coins, inventory, created_at');
                if (q) fallbackReq = fallbackReq.ilike('username', `%${q}%`);
                const fallbackRes = await fallbackReq.order('username', { ascending: true }).limit(50);
                data = fallbackRes.data;
                error = fallbackRes.error;
            }
            if (!error && Array.isArray(data)) {
                const currentCache = getCloudUsersCache();
                const map = new Map(currentCache.map(u => [u.username.toLowerCase(), u]));
                data.forEach(u => {
                    if (u && u.username && isAppropriateUsername(u.username)) {
                        if (!u.bio && u.inventory && typeof u.inventory === 'object' && u.inventory.bio) {
                            u.bio = u.inventory.bio;
                        }
                        map.set(u.username.toLowerCase(), u);
                    }
                });
                const merged = Array.from(map.values());
                localStorage.setItem(STORAGE_KEY_CLOUD_USERS, JSON.stringify(merged));
                if (typeof syncFriendRequestsWithCloudUsers === 'function') {
                    syncFriendRequestsWithCloudUsers(merged);
                }
                return merged;
            }
        } catch (e) {
            console.warn('Supabase fetchCloudUsers error:', e);
        }
    }

    if (!isStaticHostingWithoutBackend()) {
        try {
            const q = encodeURIComponent((searchQuery || '').trim());
            const resp = await fetch(`/api/users/search?q=${q}`);
            if (resp.ok) {
                const list = await resp.json();
                if (Array.isArray(list)) {
                    const currentCache = getCloudUsersCache();
                    const map = new Map(currentCache.map(u => [u.username.toLowerCase(), u]));
                    list.forEach(u => {
                        if (u && u.username && isAppropriateUsername(u.username)) {
                            map.set(u.username.toLowerCase(), u);
                        }
                    });
                    const merged = Array.from(map.values());
                    localStorage.setItem(STORAGE_KEY_CLOUD_USERS, JSON.stringify(merged));
                    if (typeof syncFriendRequestsWithCloudUsers === 'function') {
                        syncFriendRequestsWithCloudUsers(merged);
                    }
                    return merged;
                }
            }
        } catch (e) {}
    }

    return getCloudUsersCache();
}

async function handleSupabaseApiRequest(sb, path, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    let body = options.body || {};
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch (e) {
            body = {};
        }
    }
    const now = Date.now();

    const accountAdapter = typeof BobloxAccountBackend !== 'undefined' ? BobloxAccountBackend
        : (typeof require === 'function' ? require('./AccountBackend.js') : null);
    if (accountAdapter) {
        const response = await accountAdapter.request(sb, path, options);
        if (response) return response;
    }
    async function getCurrentSupabaseProfile() {
        const { data, error } = await sb.auth.getUser();
        if (error || !data?.user) return null;
        const result = await sb.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
        return result.error ? null : result.data;
    }

    if (path === '/api/games/summary' && method === 'GET') {
        const [ratingsRes, commentsRes] = await Promise.all([
            sb.from('game_ratings').select('game_id, vote'),
            sb.from('comments').select('id, game_id')
        ]);

        if (ratingsRes.error || commentsRes.error) return gameSocialUnavailable();

        const ratings = ratingsRes.data || [];
        const comments = commentsRes.data || [];

        const summary = {};
        GAMES_CATALOG.forEach(g => {
            const gVotes = ratings.filter(r => r.game_id === g.id);
            const likes = gVotes.filter(r => r.vote === 'like').length;
            const dislikes = gVotes.filter(r => r.vote === 'dislike').length;
            const total = likes + dislikes;
            const gComments = comments.filter(c => c.game_id === g.id);
            summary[g.id] = {
                likes,
                dislikes,
                ratingPct: total ? Math.round((likes / total) * 100) : null,
                commentCount: gComments.length,
                online: (liveSocialState.perGameOnline && liveSocialState.perGameOnline[g.id]) || 0
            };
        });

        return {
            ok: true,
            status: 200,
            data: {
                games: summary,
                totalOnline: liveSocialState.totalOnline || 1,
                serverTime: now
            }
        };
    }

    const rateMatch = path.match(/^\/api\/games\/([a-z0-9_]+)\/rate$/);
    if (rateMatch && method === 'POST') {
        const currentUser = await getCurrentSupabaseProfile();
        if (!currentUser) return { ok: false, status: 401, data: { error: 'Pro hodnocení hry se nejprve přihlas ke svému účtu!' } };
        const gid = rateMatch[1];
        const vote = body.vote;
        if (!GAMES_CATALOG.some(g => g.id === gid)) return { ok: false, status: 404, data: { error: 'Hra nenalezena.' } };
        if (vote !== null && vote !== 'like' && vote !== 'dislike') return { ok: false, status: 400, data: { error: 'Neplatné hodnocení.' } };

        let upsertErr = null;
        try {
            const res = vote === null
                ? await sb.from('game_ratings').delete().eq('game_id', gid).eq('username', currentUser.username)
                : await sb.from('game_ratings').upsert({
                game_id: gid,
                username: currentUser.username,
                vote: vote,
                updated_at: new Date().toISOString()
            }, { onConflict: 'game_id,username' });
            upsertErr = res?.error || null;
        } catch (e) {
            upsertErr = e;
        }

        if (upsertErr) return gameSocialUnavailable();
        const stats = await sb.from('game_ratings').select('username, vote').eq('game_id', gid);
        if (stats.error) return gameSocialUnavailable();
        const votes = stats.data || [];
        if (vote === null && votes.some(v => v.username === currentUser.username)) return gameSocialUnavailable();
        const likes = votes.filter(v => v.vote === 'like').length;
        const dislikes = votes.filter(v => v.vote === 'dislike').length;
        const total = likes + dislikes;

        return {
            ok: true,
            status: 200,
            data: { ok: true, likes, dislikes, ratingPct: total ? Math.round((likes / total) * 100) : null, myVote: vote }
        };
    }

    const commentMatch = path.match(/^\/api\/games\/([a-z0-9_]+)\/comments$/);
    if (commentMatch && method === 'POST') {
        const currentUser = await getCurrentSupabaseProfile();
        if (!currentUser) return { ok: false, status: 401, data: { error: 'Pro psaní komentářů se musíš přihlásit!' } };
        const gid = commentMatch[1];

        if (now - (currentUser.last_comment_at || 0) < COMMENT_COOLDOWN_MS) {
            const retrySec = Math.ceil((COMMENT_COOLDOWN_MS - (now - (currentUser.last_comment_at || 0))) / 1000);
            return { ok: false, status: 429, data: { error: `Anti-spam: Další komentář za ${retrySec}s.`, retryAfterSec: retrySec } };
        }

        const clean = sanitizeTextClient(body.content, 250);
        if (clean.length < 2) return { ok: false, status: 400, data: { error: 'Komentář musí mít 2–250 znaků.' } };

        let newComment = null;
        let cErr = null;
        try {
            const res = await sb.from('comments').insert({
                game_id: gid,
                username: currentUser.username,
                content: clean
            }).select().single();
            newComment = res?.data || null;
            cErr = res?.error || null;
        } catch (e) {
            cErr = e;
        }

        if (cErr || !newComment) return gameSocialUnavailable();
        currentUser.last_comment_at = now;

        return {
            ok: true,
            status: 201,
            data: {
                ok: true,
                comment: {
                    id: newComment.id,
                    gameId: newComment.game_id,
                    username: newComment.username,
                    content: newComment.content,
                    createdAt: new Date(newComment.created_at).getTime()
                }
            }
        };
    }

    const socialGetMatch = path.match(/^\/api\/games\/([a-z0-9_]+)\/social$/);
    if (socialGetMatch && method === 'GET') {
        const gid = socialGetMatch[1];
        const currentUser = await getCurrentSupabaseProfile();

        const [ratingsRes, commentsRes] = await Promise.all([
            sb.from('game_ratings').select('username, vote').eq('game_id', gid),
            sb.from('comments').select('*').eq('game_id', gid).order('created_at', { ascending: false }).limit(50)
        ]);

        if (ratingsRes.error || commentsRes.error) return gameSocialUnavailable();

        const votes = ratingsRes.data || [];
        const likes = votes.filter(v => v.vote === 'like').length;
        const dislikes = votes.filter(v => v.vote === 'dislike').length;
        const total = likes + dislikes;

        let myVote = null;
        if (currentUser) {
            const found = votes.find(v => v.username.toLowerCase() === currentUser.username.toLowerCase());
            if (found) myVote = found.vote;
        }

        const comments = (commentsRes.data || []).map(c => ({
            id: c.id,
            gameId: c.game_id,
            username: c.username,
            content: c.content,
            createdAt: new Date(c.created_at).getTime()
        }));

        return {
            ok: true,
            status: 200,
            data: {
                gameId: gid,
                likes,
                dislikes,
                ratingPct: total ? Math.round((likes / total) * 100) : null,
                myVote,
                comments
            }
        };
    }

    function isSupabaseAdminUser(profile) {
        return profile?.id === '2806aa83-95cb-405d-8db4-23b95f676612';
    }

    const moderation = path.match(/^\/api\/admin\/games\/([a-z0-9_]+)\/(social|reset-ratings|delete-comment)$/);
    if (moderation) {
        const profile = await getCurrentSupabaseProfile();
        if (!isSupabaseAdminUser(profile)) return { ok: false, status: 403, data: { error: 'Přístup odepřen.' } };
        const [, gid, action] = moderation;
        if (!GAMES_CATALOG.some(g => g.id === gid)) return { ok: false, status: 404, data: { error: 'Hra nenalezena.' } };
        if ((action === 'social' ? 'GET' : 'POST') !== method) return { ok: false, status: 405, data: { error: 'Neplatná metoda.' } };
        const result = await sb.rpc('admin_game_social', { target_game: gid, moderation_action: action, target_comment: String(body.commentId || '') });
        if (result.error || !result.data) {
            const missing = result.error?.code === 'PGRST202' || result.error?.code === '42883';
            return { ok: false, status: 503, data: { error: missing
                ? 'Supabase: spus\u0165 aktualizovanou migraci schema_update_v9.2.sql v SQL Editoru.'
                : 'Spr\u00e1va hodnocen\u00ed selhala v datab\u00e1zi. Ov\u011b\u0159 nasazen\u00ed aktu\u00e1ln\u00ed migrace a opr\u00e1vn\u011bn\u00ed Vendeez.' } };
        }
        return { ok: true, status: 200, data: result.data };
    }

    if (path === '/api/admin/reset-daily' && method === 'POST') {
        const currentUser = await getCurrentSupabaseProfile();
        if (!isSupabaseAdminUser(currentUser)) {
            return { ok: false, status: 403, data: { error: 'Přístup odepřen.' } };
        }
        const username = String(body.username || currentUser.username).trim();
        const { data, error } = await sb.from('profiles').update({ daily_claim_date: 0 })
            .ilike('username', username).select('username, daily_claim_date').maybeSingle();
        if (error || !data) return { ok: false, status: 400, data: { error: 'Reset denního bonusu se nezdařil.' } };
        return { ok: true, status: 200, data: { ok: true, ...data } };
    }

    if (path === '/api/admin/users' && method === 'GET') {
        const currentUser = await getCurrentSupabaseProfile();
        if (!isSupabaseAdminUser(currentUser)) {
            return { ok: false, status: 403, data: { error: 'Přístup odepřen: Administrátorská práva vyžadována.' } };
        }
        try {
            let req = sb.from('profiles').select('id, username, coins, inventory, created_at, last_login_at, last_active_at');
            let { data, error } = await req.order('created_at', { ascending: false }).limit(200);
            if (error && (error.message?.includes('column') || error.code === '42703' || error.code === 'PGRST204')) {
                const fallbackReq = sb.from('profiles').select('id, username, coins, inventory, created_at');
                const fallbackRes = await fallbackReq.order('created_at', { ascending: false }).limit(200);
                data = fallbackRes.data;
                error = fallbackRes.error;
            }
            const profiles = (data && Array.isArray(data)) ? data : [];
            const userList = profiles.map(p => {
                const inv = (typeof p.inventory === 'object' && p.inventory !== null)
                    ? p.inventory
                    : (typeof p.inventory === 'string' ? (() => { try { return JSON.parse(p.inventory); } catch (e) { return {}; } })() : {});
                return {
                    id: p.id,
                    username: p.username,
                    coins: Number(p.coins) || 0,
                    gamesPlayed: Number(inv.gamesPlayed) || 0,
                    daily_claim_date: Number(p.daily_claim_date) || 0,
                    last_login_at: p.last_login_at ? new Date(p.last_login_at).getTime() : now,
                    last_active_at: p.last_active_at ? new Date(p.last_active_at).getTime() : now,
                    created_at: p.created_at ? new Date(p.created_at).getTime() : now
                };
            });
            return { ok: true, status: 200, data: { ok: true, users: userList }, serverTime: now };
        } catch (err) {
            console.warn('Supabase admin users error:', err);
            return { ok: false, status: 500, data: { error: 'Chyba při načítání uživatelů ze Supabase.' } };
        }
    }

    if (path === '/api/admin/give-coins' && method === 'POST') {
        const currentUser = await getCurrentSupabaseProfile();
        if (!isSupabaseAdminUser(currentUser)) {
            return { ok: false, status: 403, data: { error: 'Přístup odepřen: Administrátorská práva vyžadována.' } };
        }
        const targetUsername = typeof body.username === 'string' ? body.username.trim() : '';
        const rawAmount = Number(body.amount);
        const action = body.action === 'set' || body.setBalance === true ? 'set' : 'add';
        if (!targetUsername) {
            return { ok: false, status: 400, data: { error: 'Uživatelské jméno je povinné.' } };
        }
        if (isNaN(rawAmount) || rawAmount < 0) {
            return { ok: false, status: 400, data: { error: 'Částka musí být platné kladné číslo.' } };
        }

        let newCoins = null;
        let rpcSuccess = false;

        // 1. Přednostní volání Supabase RPC funkce admin_give_coins (SECURITY DEFINER obchází RLS omezení pro cizí řádky)
        try {
            const { data: rpcRes, error: rpcErr } = await sb.rpc('admin_give_coins', {
                target_username: targetUsername,
                amount: Math.floor(rawAmount),
                action: action
            });
            if (!rpcErr && rpcRes && (typeof rpcRes.coins === 'number' || rpcRes.ok)) {
                rpcSuccess = true;
                newCoins = typeof rpcRes.coins === 'number' ? rpcRes.coins : rawAmount;
            }
        } catch (e) {
            console.warn('Supabase admin_give_coins RPC attempt:', e);
        }

        // 2. Záložní přímý update (funkční při změně vlastního profilu nebo při nastavení RLS pro admina)
        let targetProfile = null;
        if (!rpcSuccess) {
            let { data: tp } = await sb.from('profiles').select('*').ilike('username', targetUsername).maybeSingle();
            targetProfile = tp;
            if (!targetProfile && targetUsername.toLowerCase() === (currentUser?.username || '').toLowerCase()) {
                targetProfile = currentUser;
            }
            if (!targetProfile) {
                return { ok: false, status: 404, data: { error: `Uživatel "${targetUsername}" nenalezen v cloudu.` } };
            }

            const currentCoins = Number(targetProfile.coins) || 0;
            newCoins = action === 'set' ? Math.max(0, Math.floor(rawAmount)) : Math.max(0, Math.floor(currentCoins + rawAmount));

            try {
                const result = await sb.from('profiles').update({ coins: newCoins }).eq('id', targetProfile.id);
                if (result.error) return { ok: false, status: 400, data: { error: 'Zůstatek se nepodařilo uložit.' } };
            } catch (e) {
                console.warn('Supabase coins update failed:', e);
                return { ok: false, status: 500, data: { error: 'Zůstatek se nepodařilo uložit.' } };
            }
            targetProfile.coins = newCoins;
        }

        if (authState.user && authState.user.username && authState.user.username.toLowerCase() === targetUsername.toLowerCase()) {
            authState.user.coins = newCoins;
            bobuxBalance = newCoins;
            try { localStorage.setItem(STORAGE_KEY_BOBUX, String(newCoins)); } catch (e) {}
            try { localStorage.setItem(STORAGE_KEYS.USER_CACHE, JSON.stringify(authState.user)); } catch (e) {}
            if (typeof updateBobuxUI === 'function') updateBobuxUI();
        }

        return {
            ok: true,
            status: 200,
            data: {
                ok: true,
                username: targetUsername,
                coins: newCoins,
                action
            }
        };
    }

    if (path === '/api/admin/broadcast' && method === 'POST') {
        const currentUser = await getCurrentSupabaseProfile();
        if (!isSupabaseAdminUser(currentUser)) {
            return { ok: false, status: 403, data: { error: 'Přístup odepřen: Administrátorská práva vyžadována.' } };
        }
        const msg = (body.message || '').trim();
        if (!msg) {
            return { ok: false, status: 400, data: { error: 'Zpráva oznámení nesmí být prázdná.' } };
        }
        const sender = currentUser?.username || (authState.user?.username || 'Vendeez');
        const broadcastPayload = {
            type: 'admin_broadcast',
            message: msg,
            sender,
            timestamp: now
        };
        if (typeof sendSocialBroadcast === 'function') {
            sendSocialBroadcast('admin_broadcast', broadcastPayload);
        }
        if (typeof handleIncomingAdminBroadcast === 'function') {
            handleIncomingAdminBroadcast(broadcastPayload);
        }
        return { ok: true, status: 200, data: { ok: true, message: msg, sender } };
    }

    return null;
}

const CUSTOM_API_BASE = (window.BOBLOX_API_BASE || localStorage.getItem(STORAGE_KEYS.API_BASE) || '').replace(/\/+$/, '');

function isStaticHostingWithoutBackend() {
    if (CUSTOM_API_BASE) return false;
    const loc = (typeof window !== 'undefined' && window.location) ? window.location : (typeof location !== 'undefined' ? location : null);
    if (!loc) return true;
    if (loc.protocol === 'file:') return true;
    const h = (loc.hostname || '').toLowerCase();
    // Static hosts where POST /api/* returns 405 Method Not Allowed or 404 HTML
    return h.endsWith('.github.io') || h.endsWith('.pages.dev') || h.endsWith('.netlify.app') || h.endsWith('.surge.sh');
}

function gameSocialUnavailable() {
    return { ok: false, status: 503, data: { error: 'Sdílená hodnocení a komentáře nejsou dostupné. Zkus to prosím znovu později.' } };
}

function isGameSocialRequest(path) {
    return /^\/api\/admin\/games\//.test(path) || /^\/api\/games\/(summary|[a-z0-9_]+\/(social|rate|comments))$/.test(path);
}

async function apiRequest(path, options = {}) {
    // 1. Prioritize Supabase Cloud Database (Cross-device, works directly on GitHub Pages!)
    const sb = getSupabaseClient();
    if (sb) {
        try {
            const sbRes = await handleSupabaseApiRequest(sb, path, options);
            if (!sbRes) return { ok: false, status: 404, data: { error: 'Nepodporovaná cloudová operace.' } };
            if (sbRes) {
                authState.backendConnected = true;
                authState.isSupabase = true;
                return sbRes;
            }
        } catch (sbErr) {
            if (isGameSocialRequest(path)) return gameSocialUnavailable();
            return { ok: false, status: 503, data: { error: 'Cloud není dostupný. Změna nebyla uložena.' } };
        }
    }

    // 2. If running on GitHub Pages (or static host) without an external backend URL configured,
    // use the built-in cryptographic local database directly without triggering 404/405 browser errors.
    if (isStaticHostingWithoutBackend()) {
        authState.backendConnected = false;
        authState.isSupabase = false;
        return handleOfflineApiFallback(path, options);
    }

    const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    if (authState.token) {
        headers['Authorization'] = 'Bearer ' + authState.token;
    }
    const targetUrl = CUSTOM_API_BASE ? (CUSTOM_API_BASE + path) : path;
    try {
        const resp = await fetch(targetUrl, {
            method: options.method || 'GET',
            headers,
            credentials: CUSTOM_API_BASE ? 'include' : 'same-origin',
            body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined,
            keepalive: options.keepalive === true
        });

        const contentType = (resp.headers.get('content-type') || '').toLowerCase();
        // If a static server (like Varnish/GitHub Pages/LiveServer) responds with 405 Method Not Allowed,
        // 501 Not Implemented, or an HTML 404 page instead of JSON, fall back to local DB.
        if (resp.status === 405 || resp.status === 501 || !contentType.includes('application/json')) {
            authState.backendConnected = false;
            return handleOfflineApiFallback(path, options);
        }

        const data = await resp.json().catch(() => null);
        if (!data || typeof data !== 'object') {
            authState.backendConnected = false;
            return handleOfflineApiFallback(path, options);
        }

        authState.backendConnected = true;
        if (typeof data.serverTime === 'number') {
            serverTimeOffsetMs = data.serverTime - Date.now();
        }
        return { ok: resp.ok, status: resp.status, data, fromServer: true };
    } catch (err) {
        authState.backendConnected = false;
        return handleOfflineApiFallback(path, options);
    }
}

// Seamless cryptographic local DB fallback when hosted on static GitHub Pages or opened without node server.js
async function handleOfflineApiFallback() {
    return { ok: false, status: 503, data: { error: 'Účet vyžaduje spojení se serverem.' } };
}

function getPlayerTag(username, isVip = false) {
    if (String(username || '').toLowerCase() === 'vendeez') return 'ADMIN';
    return isVip ? 'VIP' : '';
}

function isCurrentUserVip() {
    if (authState.user) return !!(authState.user.is_vip || authState.user.inventory?.is_vip);
    return localStorage.getItem(STORAGE_KEYS.VIP) === 'true';
}

function grantCurrentUserVip() {
    if (typeof isServerAccount === 'function' && isServerAccount()) return false;
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('boblox_is_vip_v1', 'true');
        }
    } catch (e) {}

    const auth = (typeof window !== 'undefined' && window.authState)
        ? window.authState
        : (typeof authState !== 'undefined' ? authState : null);
    if (auth && auth.user) {
        auth.user.is_vip = true;
        if (!auth.user.inventory || typeof auth.user.inventory !== 'object') {
            auth.user.inventory = {};
        }
        auth.user.inventory.is_vip = true;
    }
    if (typeof authState !== 'undefined' && authState && authState.user && authState !== auth) {
        authState.user.is_vip = true;
        if (!authState.user.inventory || typeof authState.user.inventory !== 'object') {
            authState.user.inventory = {};
        }
        authState.user.inventory.is_vip = true;
    }

    if (typeof syncAccountToServer === 'function') {
        syncAccountToServer().catch(() => {});
    }

    if (typeof updateAuthUI === 'function') {
        updateAuthUI();
    }
    if (typeof renderRobloxTopRightPlayerList === 'function') {
        renderRobloxTopRightPlayerList();
    }
    if (typeof renderRobloxPeopleList === 'function') {
        renderRobloxPeopleList();
    }
    if (typeof renderPortalProfileView === 'function' && typeof activePortalSection !== 'undefined' && activePortalSection === 'profile') {
        renderPortalProfileView();
    }

    if (typeof broadcastGameAnnounce === 'function') {
        broadcastGameAnnounce();
    }
    if (typeof broadcastSocialPresence === 'function') {
        broadcastSocialPresence(typeof activeGameMode !== 'undefined' && !!activeGameMode);
    }
    if (typeof updateSocialPresenceTrack === 'function') {
        updateSocialPresenceTrack().catch(() => {});
    }

    return true;
}

function applyAuthenticatedUser(user) {
    if (!user) return;
    if (authState.user?.id === user.id && Number.isFinite(user.revision) && Number(authState.user.revision || 0) > user.revision) return;
    if (typeof user.wheelAt === 'number') localStorage.setItem(STORAGE_KEYS.WHEEL, String(user.extraSpin ? 0 : user.wheelAt));
    if (authState.user?.id !== user.id && typeof resetAccountSocialCaches === 'function') resetAccountSocialCaches();
    authState.user = user;
    if (typeof refreshAccountConsent === 'function') refreshAccountConsent();
    if (typeof refreshRecoveryEmailPrompt === 'function') refreshRecoveryEmailPrompt();
    if (typeof sentFriendRequests !== 'undefined') Object.keys(sentFriendRequests).forEach(k => delete sentFriendRequests[k]);
    if (typeof receivedFriendRequests !== 'undefined') Object.keys(receivedFriendRequests).forEach(k => delete receivedFriendRequests[k]);
    const vip = !!(user.is_vip || user.inventory?.is_vip);
    localStorage.setItem(STORAGE_KEYS.VIP, String(vip));
    authState.user.is_vip = vip;
    authState.user.bio = typeof user.bio === 'string' ? user.bio : '';
    localStorage.setItem(STORAGE_KEYS.BIO, authState.user.bio);
    if (typeof user.coins === 'number') {
        bobuxBalance = user.coins;
        localStorage.setItem(STORAGE_KEY_BOBUX, String(bobuxBalance));
    }
    if (typeof user.daily_claim_date === 'number') {
        lastClaimTimestamp = Number(user.daily_claim_date);
        localStorage.setItem(STORAGE_KEY_DAILY_TS, String(lastClaimTimestamp));
    }
    if (user.inventory && typeof user.inventory === 'object') {
        if (Array.isArray(user.inventory.owned)) {
            ownedShopItems = new Set([DEFAULT_FACE_ID, ...user.inventory.owned.filter(id => SHOP_ITEM_MAP[id])]);
        }
        if (user.inventory.outfit) {
            if (typeof avatarOutfit !== 'undefined') {
                avatarOutfit = typeof sanitizeOutfit === 'function' ? sanitizeOutfit(user.inventory.outfit) : user.inventory.outfit;
            }
        }
        if (user.inventory.torsoHex) {
            avatarTorsoHex = user.inventory.torsoHex;
            localStorage.setItem(STORAGE_KEY_TORSO, avatarTorsoHex);
        }
        if (typeof user.inventory.gamesPlayed === 'number') {
            gamesPlayedCount = Math.max(gamesPlayedCount, user.inventory.gamesPlayed);
            localStorage.setItem(STORAGE_KEY_PLAYED, String(gamesPlayedCount));
        }
        if (Array.isArray(user.inventory.friends) && user.inventory.friends.length > 0 && typeof friendsSet !== 'undefined') {
            user.inventory.friends.forEach(f => {
                if (f && typeof f === 'string') {
                    const clean = f.toLowerCase().replace(/^(user_|cloud_|db_|peer_)/, '').trim();
                    if (clean && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean)) {
                        friendsSet.add(clean);
                        if (typeof sentFriendRequests !== 'undefined') {
                            delete sentFriendRequests[clean];
                            delete sentFriendRequests[`cloud_${clean}`];
                            delete sentFriendRequests[`db_${clean}`];
                            delete sentFriendRequests[`user_${clean}`];
                        }
                    }
                }
            });
            if (typeof saveFriendsList === 'function') saveFriendsList();
            if (typeof saveSentFriendRequests === 'function') saveSentFriendRequests();
        }
        if (Array.isArray(user.inventory.sent_friend_requests) && typeof sentFriendRequests !== 'undefined') {
            user.inventory.sent_friend_requests.forEach(r => {
                if (r && r.id) {
                    const clean = (r.username || r.id).toLowerCase().replace(/^(user_|cloud_|db_|peer_)/, '').trim();
                    if (typeof friendsSet === 'undefined' || !friendsSet.has(clean)) {
                        sentFriendRequests[r.id] = r;
                    }
                }
            });
            if (typeof saveSentFriendRequests === 'function') saveSentFriendRequests();
        }
        if (Array.isArray(user.inventory.received_friend_requests) && typeof receivedFriendRequests !== 'undefined') {
            user.inventory.received_friend_requests.forEach(r => {
                if (r && r.id) {
                    receivedFriendRequests[r.id] = r;
                    if (r.username) {
                        const uLower = r.username.toLowerCase();
                        receivedFriendRequests[uLower] = r;
                        receivedFriendRequests[`cloud_${uLower}`] = r;
                    }
                }
            });
            if (typeof saveReceivedFriendRequests === 'function') saveReceivedFriendRequests();
        }
        if (Array.isArray(user.inventory.transactions) && user.inventory.transactions.length > 0) {
            const cloudTxs = user.inventory.transactions;
            const localTxs = (typeof bobuxTransactions !== 'undefined' && Array.isArray(bobuxTransactions)) ? bobuxTransactions : [];
            const mergedMap = new Map();
            localTxs.forEach(t => { if (t && t.id) mergedMap.set(t.id, t); });
            cloudTxs.forEach(t => { if (t && t.id) mergedMap.set(t.id, t); });
            const merged = Array.from(mergedMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 60);
            if (typeof bobuxTransactions !== 'undefined') bobuxTransactions = merged;
            try { localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(merged)); } catch (e) {}
        }
        if (typeof saveShopState === 'function') saveShopState();
    }
    if (typeof user.adoptme_bucks === 'number') {
        localStorage.setItem(STORAGE_KEY_ADOPTME_BUCKS, String(Math.max(0, Math.floor(user.adoptme_bucks))));
    }
    if (Array.isArray(user.adoptme_pets) && user.adoptme_pets.length > 0) {
        localStorage.setItem(STORAGE_KEY_ADOPTME_PETS, JSON.stringify(user.adoptme_pets));
    }
    if (user.last_login_at !== undefined) authState.user.last_login_at = user.last_login_at;
    if (user.last_active_at !== undefined) authState.user.last_active_at = user.last_active_at;
    if (typeof updateNickname === 'function') updateNickname(user.username);
    if (typeof invalidateAvatarHeadshotCache === 'function') invalidateAvatarHeadshotCache();
    if (typeof updateBobuxUI === 'function') updateBobuxUI();
    if (typeof updateAuthUI === 'function') updateAuthUI();
    if (typeof updateDailyBonusUI === 'function') updateDailyBonusUI();
    try {
        localStorage.setItem(STORAGE_KEYS.USER_CACHE, JSON.stringify(user));
    } catch (e) {}
    if (typeof syncDirectChatMessages === 'function') {
        try { syncDirectChatMessages(); } catch (e) {}
    }
}

let accountSyncQueue = null;

async function syncAccountToServer({ bypassQueue = false } = {}) {
    if (!authState.user) return;
    const adopt = typeof loadAdoptMeSavedData === 'function' ? loadAdoptMeSavedData() : null;
    const friendsList = (typeof friendsSet !== 'undefined')
        ? Array.from(new Set([...friendsSet].map(f => String(f).toLowerCase().replace(/^(user_|cloud_|db_|peer_)/, '').trim()).filter(Boolean)))
        : [];
    const sentReqsList = (typeof sentFriendRequests !== 'undefined') ? Object.values(sentFriendRequests) : [];
    const receivedReqsList = (typeof receivedFriendRequests !== 'undefined') ? Object.values(receivedFriendRequests) : [];
    const currentBio = (authState.user && typeof authState.user.bio === 'string')
        ? authState.user.bio
        : ((typeof localStorage !== 'undefined' && localStorage.getItem('boblox_custom_bio_v1')) || '');

    const syncIdentity = `${authState.user.id ?? authState.user.username}:${authState.token || ''}`;
    const syncBody = {
        bio: currentBio,
        outfit: typeof avatarOutfit !== 'undefined' ? { ...avatarOutfit } : {},
        torsoHex: typeof avatarTorsoHex !== 'undefined' ? avatarTorsoHex : '#0D69AC'
    };
    const runSync = () => {
        const currentIdentity = authState.user
            ? `${authState.user.id ?? authState.user.username}:${authState.token || ''}`
            : null;
        if (currentIdentity !== syncIdentity) return Promise.resolve(null);
        return apiRequest('/api/user/sync', {
            method: 'POST',
            body: { ...syncBody, revision: authState.user.revision },
            keepalive: bypassQueue
        });
    };
    const syncOperation = !bypassQueue && accountSyncQueue
        ? accountSyncQueue.then(runSync, runSync)
        : runSync();
    const queuedSync = syncOperation.then(() => undefined, () => undefined);
    accountSyncQueue = queuedSync;
    queuedSync.then(() => {
        if (accountSyncQueue === queuedSync) accountSyncQueue = null;
    });
    const syncResp = await syncOperation;

    if (syncResp && !syncResp.ok) throw new Error(syncResp.data?.error || 'Uložení selhalo.');
    if (syncResp && authState.user && `${authState.user.id ?? authState.user.username}:${authState.token || ''}` === syncIdentity) {
        const u = syncResp.user || (syncResp.data && syncResp.data.user);
        if (u && authState.user && Number(u.revision || 0) >= Number(authState.user.revision || 0)) {
            authState.user.revision = u.revision;
            if (typeof u.bio === 'string') {
                authState.user.bio = u.bio;
                try { localStorage.setItem('boblox_custom_bio_v1', u.bio || 'No bio yet'); } catch (e) {}
            }
            if (typeof u.coins === 'number') {
                authState.user.coins = u.coins;
            }
            try {
                localStorage.setItem(STORAGE_KEYS.USER_CACHE, JSON.stringify(authState.user));
            } catch (e) {}
        }
    }
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('pagehide', () => {
        if (!authState.user) return;
        supabaseKeepalive = true;
        syncAccountToServer({ bypassQueue: true }).then(
            () => { supabaseKeepalive = false; },
            (error) => {
                supabaseKeepalive = false;
                console.error('Uložení účtu před zavřením stránky selhalo:', error);
            }
        );
    });
}

function formatDateTimeUserFriendly(val, isCurrentOnlineCheck = false) {
    if (!val) return 'Právě teď (Online)';
    let date = null;
    if (typeof val === 'number') {
        date = new Date(val);
    } else if (typeof val === 'string') {
        date = new Date(val);
    }
    if (!date || isNaN(date.getTime())) return 'Není k dispozici';

    const diffMs = Math.max(0, Date.now() - date.getTime());
    if (isCurrentOnlineCheck && diffMs < 120000) {
        return '🟢 Právě teď (Online)';
    }
    if (diffMs < 60000) return 'Před chvílí';
    if (diffMs < 3600000) {
        const mins = Math.floor(diffMs / 60000);
        return `Před ${mins} min`;
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}. v ${hours}:${mins}`;
}

let lastUserActivitySentTs = 0;
let pendingUserActivityTimer = null;

async function touchUserActivity(forceImmediate = false) {
    if (!authState.user || !authState.token) return;
    const now = Date.now();
    const minInterval = forceImmediate ? 5000 : 60000;
    if (now - lastUserActivitySentTs < minInterval) {
        if (!pendingUserActivityTimer && !forceImmediate) {
            pendingUserActivityTimer = setTimeout(() => {
                pendingUserActivityTimer = null;
                touchUserActivity(false);
            }, minInterval - (now - lastUserActivitySentTs));
        }
        return;
    }
    lastUserActivitySentTs = now;
    if (pendingUserActivityTimer) {
        clearTimeout(pendingUserActivityTimer);
        pendingUserActivityTimer = null;
    }
    try {
        const res = await apiRequest('/api/user/active', { method: 'POST' });
        if (res && res.ok && authState.user) {
            authState.user.last_active_at = res.data?.last_active_at || now;
            const pLastActive = document.getElementById('auth-profile-last-active');
            if (pLastActive) pLastActive.textContent = formatDateTimeUserFriendly(authState.user.last_active_at, true);
        }
    } catch (e) {}
}

function updateAuthUI() {
    if (!authState.user && typeof closeRecoveryEmailPrompt === 'function') closeRecoveryEmailPrompt();
    const isLogged = !!authState.user;
    const navName = document.getElementById('nav-player-name');
    const navLabel = document.getElementById('nav-auth-label');
    const navDot = document.getElementById('nav-auth-dot');
    const bannerName = document.getElementById('banner-player-name');
    const bannerBtn = document.getElementById('banner-auth-btn');
    const badge = document.getElementById('auth-backend-badge');

    if (badge) {
        if (authState.isSupabase) {
            badge.textContent = '🟢 Připojeno k Supabase Cloudu (Cross-Device Uložení)';
        } else if (authState.backendConnected) {
            badge.textContent = '🟢 Připojeno k hernímu serveru (JWT + Bcrypt)';
        } else {
            badge.textContent = '🟡 Lokální Šifrovaná DB (Offline / P2P Režim)';
        }
    }

    const sideName = document.getElementById('sidebar-player-name');

    if (isLogged) {
        if (navName) navName.textContent = authState.user.username;
        if (sideName) sideName.textContent = authState.user.username;
        if (navLabel) navLabel.textContent = 'Účet aktivní';
        if (navDot) navDot.className = 'w-1.5 h-1.5 rounded-full bg-[#00B06F]';
        if (bannerName) bannerName.textContent = authState.user.username;
        if (bannerBtn) bannerBtn.textContent = `👤 Účet: ${authState.user.username}`;
        document.getElementById('auth-logged-in-view')?.classList.remove('hidden');
        document.getElementById('auth-form-view')?.classList.add('hidden');
        const pName = document.getElementById('auth-profile-username');
        const pId = document.getElementById('auth-profile-id');
        const pCoins = document.getElementById('auth-profile-coins');
        const pItems = document.getElementById('auth-profile-items');
        const pLastLogin = document.getElementById('auth-profile-last-login');
        const pLastActive = document.getElementById('auth-profile-last-active');
        if (pName) pName.textContent = authState.user.username;
        if (pId) {
            const uid = String(authState.user.id || '');
            pId.textContent = '#' + (uid.length > 8 ? uid.slice(0, 8) : uid);
        }
        if (pCoins) pCoins.textContent = `${bobuxBalance.toLocaleString('cs-CZ')} B$`;
        if (pItems && typeof ownedShopItems !== 'undefined') pItems.textContent = String(ownedShopItems.size);
        if (pLastLogin) pLastLogin.textContent = formatDateTimeUserFriendly(authState.user.last_login_at);
        if (pLastActive) pLastActive.textContent = formatDateTimeUserFriendly(authState.user.last_active_at || Date.now(), true);
        if (typeof refreshPortalAvatarVisuals === 'function') refreshPortalAvatarVisuals();
    } else {
        const guestName = (typeof getGuestNickname === 'function') ? getGuestNickname() : 'Guest';
        if (navName) navName.textContent = guestName;
        if (sideName) sideName.textContent = guestName;
        if (navLabel) navLabel.textContent = 'Přihlásit účet';
        if (navDot) navDot.className = 'w-1.5 h-1.5 rounded-full bg-[#00A2FF]';
        if (bannerName) bannerName.textContent = guestName;
        if (bannerBtn) bannerBtn.textContent = '🔐 Přihlásit / Registrovat účet';
        document.getElementById('auth-logged-in-view')?.classList.add('hidden');
        document.getElementById('auth-form-view')?.classList.remove('hidden');
        if (typeof refreshPortalAvatarVisuals === 'function') refreshPortalAvatarVisuals();
    }
    if (typeof updateAdminUI === 'function') {
        updateAdminUI();
    }
    const tag = getPlayerTag(authState.user?.username, isCurrentUserVip());
    const isVip = !!tag;
    ['sidebar-vip-badge', 'nav-vip-badge', 'banner-vip-badge', 'profile-vip-badge'].forEach(id => {
        const el = document.getElementById(id);
        if (el && el.classList) {
            el.textContent = tag;
            if (typeof el.classList.toggle === 'function') {
                el.classList.toggle('hidden', !isVip);
            } else if (isVip && typeof el.classList.remove === 'function') {
                el.classList.remove('hidden');
            } else if (!isVip && typeof el.classList.add === 'function') {
                el.classList.add('hidden');
            }
        }
    });
}

function openAuthModal() {
    if (document.pointerLockElement) document.exitPointerLock();
    updateAuthUI();
    const modal = document.getElementById('auth-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    const searchInput = document.getElementById('game-search-input');
    const uInput = document.getElementById('auth-username-input');
    if (searchInput && uInput && searchInput.value && uInput.value && searchInput.value.trim().toLowerCase() === uInput.value.trim().toLowerCase()) {
        searchInput.value = '';
        renderGameCatalog();
    }
}

function switchAuthTab(mode) {
    authState.mode = mode === 'register' ? 'register' : 'login';
    const registering = authState.mode === 'register';
    document.getElementById('auth-consent-fields')?.classList.toggle('hidden', !registering);
    for (const id of ['auth-age-consent']) {
        const input = document.getElementById(id);
        if (input) { input.required = registering; input.disabled = !registering; }
    }
    const emailInput = document.getElementById('auth-email-input');
    document.getElementById('auth-email-field')?.classList.toggle('hidden', !registering);
    if (emailInput) { emailInput.required = registering; emailInput.disabled = !registering; }
    const usernameInput = document.getElementById('auth-username-input');
    if (usernameInput) usernameInput.maxLength = registering ? 20 : 254;
    const usernameLabel = document.getElementById('auth-username-label');
    if (usernameLabel) usernameLabel.textContent = registering ? 'Uživatelské jméno (3–20 znaků)' : 'Uživatelské jméno nebo e-mail';
    const passwordInput = document.getElementById('auth-password-input');
    if (passwordInput) passwordInput.autocomplete = registering ? 'new-password' : 'current-password';
    const tabLogin = document.getElementById('auth-tab-login');
    const tabReg = document.getElementById('auth-tab-register');
    const submitBtn = document.getElementById('auth-submit-btn');
    const alertBox = document.getElementById('auth-alert');
    if (alertBox) alertBox.className = 'hidden';

    if (authState.mode === 'login') {
        tabLogin.className = 'py-2 rounded-lg text-xs font-bold bg-[#00A2FF] text-white transition';
        tabReg.className = 'py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white transition';
        submitBtn.textContent = 'Přihlásit se k účtu';
    } else {
        tabReg.className = 'py-2 rounded-lg text-xs font-bold bg-[#00B06F] text-white transition';
        tabLogin.className = 'py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white transition';
        submitBtn.textContent = 'Vytvořit nový účet (+250 B$)';
    }
}

function showAuthAlert(msg, isError = true) {
    const el = document.getElementById('auth-alert');
    if (!el) return;
    el.textContent = msg;
    el.className = 'text-xs font-semibold px-3 py-2 rounded-lg ' + (isError
        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
        : 'bg-[#00B06F]/20 text-green-300 border border-[#00B06F]/40');
}

async function submitAuthForm() {
    const username = (document.getElementById('auth-username-input')?.value || '').trim();
    const password = document.getElementById('auth-password-input')?.value || '';
    const endpoint = authState.mode === 'register' ? '/api/auth/register' : '/api/auth/login';

    const res = await apiRequest(endpoint, {
        method: 'POST',
        body: { username, password, ageOver15: document.getElementById('auth-age-consent')?.checked === true, email: document.getElementById('auth-email-input')?.value || '', redirectTo: window.location.origin + window.location.pathname }
    });

    if (!res.ok) {
        showAuthAlert(res.data?.error || 'Přihlášení se nezdařilo.', true);
        return;
    }
    if (res.data?.confirmationRequired) {
        showAuthAlert('Zkontroluj e-mail a potvrď adresu. Potom se přihlas svým e-mailem a heslem.', false);
        return;
    }

    // Vyčistit pole vyhledávání, pokud do něj prohlížeč omylem vložil přihlašovací jméno
    const searchInput = document.getElementById('game-search-input');
    if (searchInput && searchInput.value && username && searchInput.value.trim().toLowerCase() === username.toLowerCase()) {
        searchInput.value = '';
    }

    authState.token = res.data.token;
    localStorage.setItem(STORAGE_KEY_JWT, authState.token);
    applyAuthenticatedUser(res.data.user);
    sfx.playWinFanfare();
    showAuthAlert(authState.mode === 'register' ? 'Účet úspěšně vytvořen!' : 'Úspěšně přihlášeno!', false);
    renderGameCatalog();
    fetchAllGamesSummary();
}

async function logoutAccount() {
    if (typeof resetAccountSocialCaches === 'function') resetAccountSocialCaches();
    await apiRequest('/api/auth/logout', { method: 'POST' });
    authState.token = null;
    authState.user = null;
    localStorage.removeItem(STORAGE_KEY_JWT);
    localStorage.removeItem(STORAGE_KEYS.USER_CACHE);
    document.cookie = 'boblox_token=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';

    // 1. Generate fresh guest nickname with unique random number
    const fallbackName = getGuestNickname(true);
    if (typeof mpState !== 'undefined') {
        mpState.nickname = fallbackName;
    }
    localStorage.setItem(STORAGE_KEYS.MP_NICK, fallbackName);

    // 2. Reset avatar skin/outfit/torso to guest starter defaults
    if (typeof resetAvatarToGuestStarter === 'function') {
        resetAvatarToGuestStarter();
    } else {
        avatarTorsoHex = '#0D69AC';
        localStorage.setItem(STORAGE_KEY_TORSO, '#0D69AC');
    }

    // 3. Reset Bobux balance and economy to default guest values (250 B$)
    resetGuestEconomy();

    // 4. Reset form inputs
    const mpInput = document.getElementById('mp-nickname-input');
    if (mpInput) mpInput.value = fallbackName;
    const passInput = document.getElementById('auth-password-input');
    if (passInput) passInput.value = '';
    const alertBox = document.getElementById('auth-alert');
    if (alertBox) alertBox.className = 'hidden';

    // 5. Reset inspected profile so it doesn't show old user's profile
    if (typeof currentInspectedProfile !== 'undefined') {
        currentInspectedProfile = null;
    }

    // 6. Refresh all UI & avatars
    if (typeof invalidateAvatarHeadshotCache === 'function') invalidateAvatarHeadshotCache();
    updateAuthUI();
    if (typeof refreshPortalAvatarVisuals === 'function') refreshPortalAvatarVisuals();
    renderGameCatalog();

    showHudToast(`Byl jsi odhlášen z účtu (nyní ${fallbackName}).`, 'blue');
}

async function initAuthSession() {
    // 0. Pre-fetch cloud users in background
    if (typeof fetchCloudUsers === 'function') {
        fetchCloudUsers().catch(() => {});
    }

    const fallbackName = getGuestNickname();
    if (!authState.token) {
        const sb = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        if (sb && sb.auth) {
            try {
                const { data: sessionData } = await sb.auth.getSession();
                if (sessionData?.session?.user) {
                    authState.token = 'sb_jwt_' + sessionData.session.user.id;
                    localStorage.setItem(STORAGE_KEY_JWT, authState.token);
                }
            } catch (e) {}
        }
    }
    if (!authState.token) {
        if (typeof mpState !== 'undefined') {
            mpState.nickname = fallbackName;
        }
        localStorage.setItem(STORAGE_KEYS.MP_NICK, fallbackName);
        localStorage.removeItem(STORAGE_KEYS.USER_CACHE);
        updateAuthUI();
        fetchAllGamesSummary();
        return;
    }

    const res = await apiRequest('/api/auth/me');
    if (res.ok && res.data?.user) {
        localStorage.setItem(STORAGE_KEYS.USER_CACHE, JSON.stringify(res.data.user));
        applyAuthenticatedUser(res.data.user);
        touchUserActivity(true);
    } else {
        authState.token = null;
        authState.user = null;
        localStorage.removeItem(STORAGE_KEY_JWT);
        localStorage.removeItem(STORAGE_KEYS.USER_CACHE);
        if (typeof mpState !== 'undefined') {
            mpState.nickname = fallbackName;
        }
        localStorage.setItem(STORAGE_KEYS.MP_NICK, fallbackName);
        updateAuthUI();
    }
    fetchAllGamesSummary();
}
let bobuxTransactions = (() => {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_TRANSACTIONS));
        if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch (e) {}
    return [
        {
            id: 'tx_init',
            amount: 250,
            game: 'Uvítací Boblox Bonus',
            timestamp: Date.now() - 3600 * 1000 * 2
        }
    ];
})();

function recordBobuxTransaction(amount, reasonText = '') {
    let sourceGame = reasonText;
    if (!sourceGame) {
        if (typeof activeGameId !== 'undefined' && activeGameId) {
            const g = (typeof GAMES_CATALOG !== 'undefined') ? GAMES_CATALOG.find(x => x.id === activeGameId) : null;
            sourceGame = g ? g.title : 'Boblox Minihra';
        } else {
            sourceGame = 'Herní odměna';
        }
    }
    const tx = {
        id: 'tx_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        amount,
        game: sourceGame,
        timestamp: Date.now()
    };
    bobuxTransactions.unshift(tx);
    if (bobuxTransactions.length > 60) bobuxTransactions.pop();
    try {
        localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(bobuxTransactions));
    } catch (e) {}
}

function addBobux(amount, reasonText = '') {
    if (typeof isServerAccount === 'function' && isServerAccount()) return requestGameReward();
    if (!Number.isSafeInteger(amount) || amount <= 0) return;
    bobuxBalance += amount;
    localStorage.setItem(STORAGE_KEY_BOBUX, String(bobuxBalance));
    if (authState.user) {
        authState.user.coins = bobuxBalance;
        try { localStorage.setItem(STORAGE_KEYS.USER_CACHE, JSON.stringify(authState.user)); } catch (e) {}
    }
    recordBobuxTransaction(amount, reasonText);
    updateBobuxUI();
    sfx.playCoin();
    if (reasonText) {
        showHudToast(`+${amount} Bobux! (${reasonText})`, 'gold');
    }
    syncAccountToServer().catch(error => { if (typeof reportAccountError === 'function') reportAccountError(error); });
}

function spendBobux(amount, reasonText = '') {
    if (typeof isServerAccount === 'function' && isServerAccount()) return false;
    if (!Number.isSafeInteger(amount) || amount < 0) return false;
    if (amount <= 0) return true;
    if (bobuxBalance < amount) {
        showHudToast(`Nemáš dostatek Bobuxů! (Chybí ${amount - bobuxBalance} B$)`, 'red');
        return false;
    }
    bobuxBalance -= amount;
    localStorage.setItem(STORAGE_KEY_BOBUX, String(bobuxBalance));
    if (authState.user) {
        authState.user.coins = bobuxBalance;
        try { localStorage.setItem(STORAGE_KEYS.USER_CACHE, JSON.stringify(authState.user)); } catch (e) {}
    }
    recordBobuxTransaction(-amount, reasonText);
    updateBobuxUI();
    syncAccountToServer().catch(error => { if (typeof reportAccountError === 'function') reportAccountError(error); });
    return true;
}

function updateBobuxUI() {
    const elLobby = document.getElementById('lobby-bobux-count');
    const elBanner = document.getElementById('banner-bobux-count');
    const elHud = document.getElementById('hud-bobux-count');
    const elPlayed = document.getElementById('banner-games-played');
    const elWheel = document.getElementById('wheel-modal-bobux-display');
    const elCasino = document.getElementById('casino-bobux-display');
    if (elLobby) elLobby.textContent = bobuxBalance.toLocaleString('cs-CZ');
    if (elBanner) elBanner.textContent = `${bobuxBalance.toLocaleString('cs-CZ')} B$`;
    if (elHud) elHud.textContent = bobuxBalance.toLocaleString('cs-CZ');
    if (elPlayed) elPlayed.textContent = gamesPlayedCount;
    if (elWheel) elWheel.textContent = `${bobuxBalance.toLocaleString('cs-CZ')} B$`;
    if (elCasino) elCasino.textContent = `${bobuxBalance.toLocaleString('cs-CZ')} B$`;
}

/* ============================================================================
 * 2B. DAILY BONUS (1x PER 24 HOURS + LIVE HH:MM:SS COUNTDOWN TIMER)
 * ============================================================================ */
function formatHMS(ms) {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const hh = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
}

function getDailyRemainingMs() {
    if (!lastClaimTimestamp || lastClaimTimestamp <= 0) return 0;
    const elapsed = getSyncedNow() - lastClaimTimestamp;
    return Math.max(0, DAILY_COOLDOWN_MS - elapsed);
}

function updateDailyBonusUI() {
    const rem = getDailyRemainingMs();
    const btn = document.getElementById('btn-daily-bonus');
    const label = document.getElementById('daily-bonus-label');
    const timerEl = document.getElementById('daily-bonus-timer');
    const dotEl = document.getElementById('daily-bonus-dot');
    const mobBtn = document.getElementById('btn-daily-bonus-mobile');
    const mobTimer = document.getElementById('daily-bonus-timer-mobile');

    if (rem > 0) {
        const formatted = formatHMS(rem);
        if (btn) btn.disabled = false;
        if (label) label.textContent = 'Create';
        if (timerEl) {
            timerEl.textContent = formatted;
            timerEl.classList.remove('hidden');
        }
        if (dotEl) dotEl.classList.add('hidden');
        if (mobBtn) mobBtn.disabled = true;
        if (mobTimer) mobTimer.textContent = formatted;
    } else {
        if (btn) btn.disabled = false;
        if (label) label.textContent = 'Create';
        if (timerEl) timerEl.classList.add('hidden');
        if (dotEl) dotEl.classList.remove('hidden');
        if (mobBtn) mobBtn.disabled = false;
        if (mobTimer) mobTimer.textContent = '+50 B$';
    }
}

setInterval(updateDailyBonusUI, 1000);

async function giveDailyBonus() {
    const rem = getDailyRemainingMs();
    if (rem > 0) {
        showHudToast(`Denní bonus bude dostupný až za ${formatHMS(rem)}!`, 'red');
        updateDailyBonusUI();
        return;
    }

    if (authState.user) {
        const res = await apiRequest('/api/daily-claim', { method: 'POST' });
        if (!res.ok) {
            if (res.data?.lastClaimTimestamp) {
                lastClaimTimestamp = Number(res.data.lastClaimTimestamp);
                localStorage.setItem(STORAGE_KEY_DAILY_TS, String(lastClaimTimestamp));
            }
            updateDailyBonusUI();
            showHudToast(res.data?.error || 'Denní bonus již byl vybrán!', 'red');
            return;
        }
        lastClaimTimestamp = Number(res.data.lastClaimTimestamp) || getSyncedNow();
        localStorage.setItem(STORAGE_KEY_DAILY_TS, String(lastClaimTimestamp));
        if (res.data.user) {
            applyAuthenticatedUser(res.data.user);
        } else {
            addBobux(50, 'Denní Boblox Bonus');
        }
        sfx.playWinFanfare();
        showHudToast('+50 Bobux! Denní bonus vyzvednut (další za 24h).', 'gold');
        updateDailyBonusUI();
    } else {
        lastClaimTimestamp = getSyncedNow();
        localStorage.setItem(STORAGE_KEY_DAILY_TS, String(lastClaimTimestamp));
        addBobux(50, 'Denní Boblox Bonus (24h Cooldown)');
        sfx.playWinFanfare();
        updateDailyBonusUI();
    }
}

// Automatically track user activity on interaction, tab visibility and heartbeat
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    let lastPulseEventTs = 0;
    const pulseActive = () => {
        const now = Date.now();
        if (now - lastPulseEventTs > 30000) {
            lastPulseEventTs = now;
            if (typeof touchUserActivity === 'function') touchUserActivity(false);
        }
    };
    window.addEventListener('pointerdown', pulseActive, { passive: true });
    window.addEventListener('keydown', pulseActive, { passive: true });
    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && typeof touchUserActivity === 'function') touchUserActivity(false);
        });
    }
    setInterval(() => {
        if (typeof document !== 'undefined' && !document.hidden || (typeof activeGameMode !== 'undefined' && activeGameMode)) {
            if (typeof touchUserActivity === 'function') touchUserActivity(false);
        }
    }, 60000);
}

if (typeof window !== 'undefined') {
    window.handleSupabaseApiRequest = handleSupabaseApiRequest;
    window.getLocalUsersDB = getLocalUsersDB;
    window.saveLocalUsersDB = saveLocalUsersDB;
    window.syncAccountToServer = syncAccountToServer;
    window.sanitizeTextClient = sanitizeTextClient;
    window.getPlayerTag = getPlayerTag;
    window.isCurrentUserVip = isCurrentUserVip;
    window.grantCurrentUserVip = grantCurrentUserVip;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        applyAuthenticatedUser,
        logoutAccount,
        apiRequest,
        syncAccountToServer,
        addBobux,
        spendBobux,
        sanitizeTextClient,
        handleOfflineApiFallback,
        handleSupabaseApiRequest,
        getLocalUsersDB,
        saveLocalUsersDB,
        getPlayerTag,
        isCurrentUserVip,
        grantCurrentUserVip,
        STORAGE_KEYS
    };
}
