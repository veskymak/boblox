/* ============================================================================
 * 2. BOBLOX PORTAL STATE, BACKEND AUTH/DB, DAILY BONUS & 10 GAMES CATALOG
 * ============================================================================ */
const BOBLOX_CLIENT_VERSION = '3.7';
const STORAGE_KEY_BOBUX = 'boblox_bobux_balance_v1';
const STORAGE_KEY_PLAYED = 'boblox_games_played_v1';
const STORAGE_KEY_TORSO = 'boblox_avatar_torso_v1';
const STORAGE_KEY_JWT = 'boblox_jwt_token_v2';
const STORAGE_KEY_DAILY_TS = 'boblox_daily_claim_ts_v2';
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
    let savedNum = !forceNew ? sessionStorage.getItem('boblox_guest_num') : null;
    if (!savedNum || forceNew || savedNum === 'NaN' || !/^\d+$/.test(savedNum)) {
        savedNum = String(Math.floor(1000 + Math.random() * 9000));
        try { sessionStorage.setItem('boblox_guest_num', savedNum); } catch (e) {}
        try { localStorage.setItem('boblox_guest_num', savedNum); } catch (e) {}
    }
    return `Guest ${savedNum}`;
}

function resetGuestEconomy() {
    bobuxBalance = 250;
    try { localStorage.setItem(STORAGE_KEY_BOBUX, '250'); } catch (e) {}
    try { localStorage.removeItem('boblox_bobux_transactions_v2'); } catch (e) {}
    if (typeof bobuxTransactions !== 'undefined') bobuxTransactions = [];
    try { localStorage.removeItem('boblox_adoptme_bucks_v1'); } catch (e) {}
    try { localStorage.removeItem('boblox_adoptme_pets_v1'); } catch (e) {}
    if (typeof updateBobuxUI === 'function') updateBobuxUI();
}

// Current authenticated user state
const authState = {
    token: localStorage.getItem(STORAGE_KEY_JWT) || null,
    user: null, // { id, username, coins, inventory, daily_claim_date, game_ratings, comments }
    mode: 'login',
    backendConnected: false,
    isSupabase: false,
    lastCommentTime: 0
};

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
const LOCAL_DB_USERS_KEY = 'boblox_local_db_users_v2';
const LOCAL_DB_SOCIAL_KEY = 'boblox_local_db_social_v2';

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

async function hashPasswordClientFallback(password) {
    if (window.crypto && window.crypto.subtle) {
        const enc = new TextEncoder().encode('boblox_salt_v2_' + password);
        const buf = await window.crypto.subtle.digest('SHA-256', enc);
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    let h = 2166136261;
    for (let i = 0; i < password.length; i++) {
        h ^= password.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return 'fnv_' + (h >>> 0).toString(16);
}

/* ============================================================================
 * 2A-1. SUPABASE CLOUD DATABASE (PERSISTENT CROSS-DEVICE STORAGE)
 * ============================================================================ */
const SUPABASE_URL = 'https://vfbdsclqvsjbzzhyaegw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_lG31mqqwY-JFiSYbtkJqzg_-vR53iJh';
let supabaseClient = null;

function getSupabaseClient() {
    if (!supabaseClient && window.supabase && typeof window.supabase.createClient === 'function') {
        try {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } catch (e) {
            console.warn('Nepodařilo se inicializovat Supabase klienta:', e);
        }
    }
    return supabaseClient;
}

/* ============================================================================
 * 2A-1b. CLOUD USERS DIRECTORY & SEARCH (SUPABASE PROFILES / SERVER BACKEND)
 * ============================================================================ */
const STORAGE_KEY_CLOUD_USERS = 'boblox_cloud_users_cache_v2';

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
            let req = sb.from('profiles').select('id, username, coins, inventory, created_at');
            const q = (searchQuery || '').trim();
            if (q) {
                req = req.ilike('username', `%${q}%`);
            }
            const { data, error } = await req.order('username', { ascending: true }).limit(50);
            if (!error && Array.isArray(data)) {
                const currentCache = getCloudUsersCache();
                const map = new Map(currentCache.map(u => [u.username.toLowerCase(), u]));
                data.forEach(u => {
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
    const body = options.body || {};
    const now = Date.now();

    async function getCurrentSupabaseProfile() {
        let uid = null;
        let authUser = null;
        try {
            const { data: authUserRes } = await sb.auth.getUser();
            authUser = authUserRes?.user || null;
            if (authUser) uid = authUser.id;
        } catch (e) {}

        const tokenUid = (authState.token && authState.token.startsWith('sb_jwt_'))
            ? authState.token.replace('sb_jwt_', '')
            : null;

        if (!uid) uid = tokenUid;
        if (!uid) return null;

        // 1. Zkusit najít přímo podle UUID (nové Supabase Auth ID)
        let { data, error } = await sb.from('profiles').select('*').eq('id', uid).maybeSingle();
        if (data) return data;

        // 2. Pokud se UUID ještě neshoduje (starší profil před migrací), zkusit najít podle tokenUid
        if (tokenUid && tokenUid !== uid) {
            const { data: byToken } = await sb.from('profiles').select('*').eq('id', tokenUid).maybeSingle();
            if (byToken) return byToken;
        }

        // 3. Zkusit najít podle uživatelského jména z Auth metadat nebo emailu
        const usernameFromAuth = authUser?.user_metadata?.username || (authUser?.email ? authUser.email.split('@')[0] : null);
        if (usernameFromAuth) {
            const { data: byName } = await sb.from('profiles').select('*').ilike('username', usernameFromAuth).maybeSingle();
            if (byName) return byName;
        }

        return null;
    }

    if (path === '/api/auth/register' && method === 'POST') {
        const uname = (body.username || '').trim();
        const pass = body.password || '';
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(uname)) {
            return { ok: false, status: 400, data: { error: 'Uživatelské jméno musí mít 3–20 znaků (písmena, čísla, _).' } };
        }
        if (pass.length < 6) {
            return { ok: false, status: 400, data: { error: 'Heslo musí mít alespoň 6 znaků.' } };
        }

        const { data: existing } = await sb.from('profiles')
            .select('id')
            .ilike('username', uname)
            .maybeSingle();

        if (existing) {
            return { ok: false, status: 409, data: { error: 'Toto uživatelské jméno je již v cloudu obsazené.' } };
        }

        // 1. Bezpečná registrace do Supabase Auth (generuje oficiální JWT token a unikátní UUID)
        const email = `${uname.toLowerCase().replace(/[^a-z0-9_]/g, '')}@boblox.cz`;
        const { data: authData, error: authErr } = await sb.auth.signUp({
            email,
            password: pass,
            options: {
                data: { username: uname }
            }
        });

        if (authErr) {
            if (authErr.message?.toLowerCase().includes('already registered')) {
                return { ok: false, status: 409, data: { error: 'Toto uživatelské jméno je již v cloudu obsazené.' } };
            }
            return { ok: false, status: 400, data: { error: authErr.message || 'Chyba při zakládání účtu v Supabase Auth.' } };
        }

        const authUser = authData?.user;
        if (!authUser) {
            return { ok: false, status: 500, data: { error: 'Chyba: Supabase nevytvořil uživatele. Zkontroluj, zda je v Supabase vypnuto "Confirm email".' } };
        }

        const password_hash = await hashPasswordClientFallback(pass);
        const startCoins = Math.max(bobuxBalance, 250);
        const adoptData = typeof loadAdoptMeSavedData === 'function' ? loadAdoptMeSavedData() : { bucks: 120, pets: [{ id: 'dog', tasksDone: 0, ageIdx: 0 }] };

        const newProfile = {
            id: authUser.id,
            username: uname,
            password_hash,
            coins: startCoins,
            inventory: {
                owned: [...ownedShopItems],
                outfit: Object.assign({}, avatarOutfit),
                torsoHex: avatarTorsoHex,
                gamesPlayed: gamesPlayedCount
            },
            adoptme_pets: adoptData.pets,
            adoptme_bucks: adoptData.bucks,
            daily_claim_date: lastClaimTimestamp || 0,
            last_login_at: new Date(now).toISOString(),
            last_active_at: new Date(now).toISOString()
        };

        let { data: inserted, error: insErr } = await sb.from('profiles')
            .insert(newProfile)
            .select()
            .single();

        // Defensive fallback: if database table hasn't added last_login_at/last_active_at columns yet
        if (insErr && (insErr.message?.toLowerCase().includes('column') || insErr.code === 'PGRST204')) {
            const fallbackProfile = { ...newProfile };
            delete fallbackProfile.last_login_at;
            delete fallbackProfile.last_active_at;
            const retryRes = await sb.from('profiles').insert(fallbackProfile).select().single();
            if (!retryRes.error && retryRes.data) {
                inserted = retryRes.data;
                insErr = null;
            }
        }

        if (insErr || !inserted) {
            if (insErr?.code === '42501' || String(insErr?.message).includes('row-level security')) {
                return { ok: false, status: 403, data: { error: 'Chyba RLS pravidel v Supabase. Zkontrolujte oprávnění tabulky profiles.' } };
            }
            return { ok: false, status: 500, data: { error: insErr?.message || 'Chyba registrace profilu v Supabase cloudu.' } };
        }

        const token = 'sb_jwt_' + authUser.id;
        return { ok: true, status: 201, data: { token, user: inserted, serverTime: now } };
    }

    if (path === '/api/auth/login' && method === 'POST') {
        const uname = (body.username || '').trim();
        const pass = body.password || '';
        if (!uname || !pass) {
            return { ok: false, status: 400, data: { error: 'Vyplň uživatelské jméno i heslo.' } };
        }

        // 1. Zkusit oficiální přihlášení přes Supabase Auth
        const email = `${uname.toLowerCase().replace(/[^a-z0-9_]/g, '')}@boblox.cz`;
        const { data: authData, error: authErr } = await sb.auth.signInWithPassword({
            email,
            password: pass
        });

        if (authData?.user) {
            let { data: userRow } = await sb.from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .maybeSingle();

            if (!userRow) {
                const { data: byName } = await sb.from('profiles')
                    .select('*')
                    .ilike('username', uname)
                    .maybeSingle();
                userRow = byName;
            }

            if (userRow) {
                const nowIso = new Date(now).toISOString();
                try {
                    await sb.from('profiles').update({ last_login_at: nowIso, last_active_at: nowIso }).eq('id', userRow.id);
                    userRow.last_login_at = nowIso;
                    userRow.last_active_at = nowIso;
                } catch (e) {}
                const token = 'sb_jwt_' + userRow.id;
                return { ok: true, status: 200, data: { token, user: userRow, serverTime: now } };
            }
        }

        // 2. Zpětná kompatibilita a tichá auto-migrace pro účty vytvořené před zapnutím Supabase Auth
        const { data: legacyRow } = await sb.from('profiles')
            .select('*')
            .ilike('username', uname)
            .maybeSingle();

        if (legacyRow) {
            const hash = await hashPasswordClientFallback(pass);
            if (legacyRow.password_hash === hash) {
                // Přihlásit nebo registrovat do Supabase Auth:
                try {
                    await sb.auth.signInWithPassword({ email, password: pass });
                } catch (e) {
                    try {
                        await sb.auth.signUp({
                            email,
                            password: pass,
                            options: { data: { username: legacyRow.username } }
                        });
                    } catch (e2) {}
                }

                const nowIso = new Date(now).toISOString();
                try {
                    await sb.from('profiles').update({ last_login_at: nowIso, last_active_at: nowIso }).eq('id', legacyRow.id);
                    legacyRow.last_login_at = nowIso;
                    legacyRow.last_active_at = nowIso;
                } catch (e) {}

                const token = 'sb_jwt_' + legacyRow.id;
                return { ok: true, status: 200, data: { token, user: legacyRow, serverTime: now } };
            }
        }

        return { ok: false, status: 401, data: { error: 'Nesprávné uživatelské jméno nebo heslo.' } };
    }

    if (path === '/api/auth/logout' && method === 'POST') {
        try { await sb.auth.signOut(); } catch (e) {}
        return { ok: true, status: 200, data: { ok: true, serverTime: now } };
    }

    if (path === '/api/auth/me' && method === 'GET') {
        if (!authState.token || !authState.token.startsWith('sb_jwt_')) {
            return null;
        }
        const currentUser = await getCurrentSupabaseProfile();
        if (!currentUser) {
            return { ok: false, status: 401, data: { error: 'Nepřihlášen' } };
        }
        return { ok: true, status: 200, data: { user: currentUser, serverTime: now } };
    }

    if (path === '/api/user/sync' && method === 'POST') {
        if (!authState.token || !authState.token.startsWith('sb_jwt_')) {
            return null;
        }
        const currentUser = await getCurrentSupabaseProfile();
        if (!currentUser) return { ok: false, status: 401, data: { error: 'Nepřihlášen' } };

        const updatePayload = {};
        if (typeof body.coins === 'number') {
            updatePayload.coins = Math.floor(body.coins);
            currentUser.coins = updatePayload.coins;
        }

        const currentInv = (typeof currentUser.inventory === 'object' && currentUser.inventory !== null)
            ? currentUser.inventory
            : (typeof currentUser.inventory === 'string' ? (() => { try { return JSON.parse(currentUser.inventory); } catch (e) { return {}; } })() : {});
        updatePayload.inventory = {
            ...currentInv,
            owned: Array.isArray(body.owned) ? body.owned : (currentInv.owned || []),
            outfit: body.outfit || currentInv.outfit || {},
            torsoHex: body.torsoHex || currentInv.torsoHex || '#0D69AC',
            gamesPlayed: typeof body.gamesPlayed === 'number' ? body.gamesPlayed : (currentInv.gamesPlayed || 0),
            friends: Array.isArray(body.friends) ? body.friends : (currentInv.friends || []),
            sent_friend_requests: Array.isArray(body.sent_friend_requests) ? body.sent_friend_requests : (currentInv.sent_friend_requests || [])
        };
        currentUser.inventory = updatePayload.inventory;

        if (Array.isArray(body.adoptme_pets)) {
            updatePayload.adoptme_pets = body.adoptme_pets;
            currentUser.adoptme_pets = body.adoptme_pets;
        }
        if (typeof body.adoptme_bucks === 'number') {
            updatePayload.adoptme_bucks = Math.floor(body.adoptme_bucks);
            currentUser.adoptme_bucks = updatePayload.adoptme_bucks;
        }
        if (typeof body.daily_claim_date === 'number') {
            updatePayload.daily_claim_date = body.daily_claim_date;
            currentUser.daily_claim_date = body.daily_claim_date;
        }

        const nowIso = new Date(now).toISOString();
        updatePayload.last_active_at = nowIso;
        currentUser.last_active_at = nowIso;

        let { error: updErr } = await sb.from('profiles').update(updatePayload).eq('id', currentUser.id);
        if (updErr && (updErr.message?.toLowerCase().includes('column') || updErr.code === 'PGRST204')) {
            const fallbackPayload = { ...updatePayload };
            delete fallbackPayload.last_active_at;
            const retryRes = await sb.from('profiles').update(fallbackPayload).eq('id', currentUser.id);
            updErr = retryRes.error;
        }
        if (updErr) {
            console.warn('Supabase sync upozornění:', updErr);
        }
        return { ok: true, status: 200, data: { user: currentUser, serverTime: now } };
    }

    if (path === '/api/user/active' && method === 'POST') {
        if (!authState.token || !authState.token.startsWith('sb_jwt_')) {
            return null;
        }
        const currentUser = await getCurrentSupabaseProfile();
        if (!currentUser) return { ok: false, status: 401, data: { error: 'Nepřihlášen' } };
        const nowIso = new Date(now).toISOString();
        currentUser.last_active_at = nowIso;
        try {
            await sb.from('profiles').update({ last_active_at: nowIso }).eq('id', currentUser.id);
        } catch (e) {}
        return { ok: true, status: 200, data: { ok: true, last_active_at: nowIso, serverTime: now } };
    }

    if (path === '/api/daily-claim' && method === 'POST') {
        if (!authState.token || !authState.token.startsWith('sb_jwt_')) {
            return null;
        }
        const currentUser = await getCurrentSupabaseProfile();
        const lastTs = currentUser ? Number(currentUser.daily_claim_date || 0) : lastClaimTimestamp;
        if (lastTs > 0 && (now - lastTs) < DAILY_COOLDOWN_MS) {
            return {
                ok: false,
                status: 400,
                data: {
                    error: 'Denní bonus lze vyzvednout pouze 1x za 24 hodin!',
                    lastClaimTimestamp: lastTs,
                    nextClaimTimestamp: lastTs + DAILY_COOLDOWN_MS,
                    serverTime: now
                }
            };
        }
        let updatedUser = currentUser;
        if (currentUser) {
            const nextCoins = (currentUser.coins || 0) + 100;
            const { data: updated, error: updErr } = await sb.from('profiles')
                .update({ coins: nextCoins, daily_claim_date: now })
                .eq('id', currentUser.id)
                .select()
                .single();
            if (!updErr && updated) {
                updatedUser = updated;
            } else {
                currentUser.coins = nextCoins;
                currentUser.daily_claim_date = now;
            }
        }
        return {
            ok: true,
            status: 200,
            data: {
                ok: true,
                reward: 100,
                user: updatedUser,
                lastClaimTimestamp: now,
                nextClaimTimestamp: now + DAILY_COOLDOWN_MS,
                serverTime: now
            }
        };
    }

    if (path === '/api/games/summary' && method === 'GET') {
        const [ratingsRes, commentsRes] = await Promise.all([
            sb.from('game_ratings').select('game_id, vote'),
            sb.from('comments').select('id, game_id')
        ]);

        if (ratingsRes.error && (ratingsRes.error.code === '42501' || ratingsRes.error.message?.includes('row-level'))) {
            return null;
        }

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

        const { error: upsertErr } = await sb.from('game_ratings').upsert({
            game_id: gid,
            username: currentUser.username,
            vote: vote,
            updated_at: new Date().toISOString()
        }, { onConflict: 'game_id,username' });

        if (upsertErr) {
            console.error('Supabase rate error:', upsertErr);
            return { ok: false, status: 500, data: { error: 'Chyba při ukládání hodnocení.' } };
        }

        const { data: gVotes } = await sb.from('game_ratings').select('vote').eq('game_id', gid);
        const votesArr = gVotes || [];
        const likes = votesArr.filter(v => v.vote === 'like').length;
        const dislikes = votesArr.filter(v => v.vote === 'dislike').length;
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

        const { data: newComment, error: cErr } = await sb.from('comments').insert({
            game_id: gid,
            username: currentUser.username,
            content: clean
        }).select().single();

        if (cErr || !newComment) {
            console.error('Supabase comment insert error:', cErr);
            return { ok: false, status: 500, data: { error: 'Chyba při ukládání komentáře.' } };
        }

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

        if (ratingsRes.error && (ratingsRes.error.code === '42501' || ratingsRes.error.message?.includes('row-level'))) {
            return null;
        }

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

    return null;
}

const CUSTOM_API_BASE = (window.BOBLOX_API_BASE || localStorage.getItem('boblox_api_base') || '').replace(/\/+$/, '');

function isStaticHostingWithoutBackend() {
    if (CUSTOM_API_BASE) return false;
    if (location.protocol === 'file:') return true;
    const h = (location.hostname || '').toLowerCase();
    // Static hosts where POST /api/* returns 405 Method Not Allowed or 404 HTML
    return h.endsWith('.github.io') || h.endsWith('.pages.dev') || h.endsWith('.netlify.app') || h.endsWith('.surge.sh');
}

async function apiRequest(path, options = {}) {
    // 1. Prioritize Supabase Cloud Database (Cross-device, works directly on GitHub Pages!)
    const sb = getSupabaseClient();
    if (sb) {
        try {
            const sbRes = await handleSupabaseApiRequest(sb, path, options);
            if (sbRes) {
                authState.backendConnected = true;
                authState.isSupabase = true;
                return sbRes;
            }
        } catch (sbErr) {
            console.warn('Supabase API error, falling back:', sbErr);
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
            body: options.body ? JSON.stringify(options.body) : undefined
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
async function handleOfflineApiFallback(path, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const body = options.body || {};
    const users = getLocalUsersDB();
    const now = Date.now();

    let currentUser = null;
    if (authState.token && authState.token.startsWith('local_jwt_')) {
        const uid = parseInt(authState.token.replace('local_jwt_', ''), 10);
        currentUser = users.find(u => u.id === uid) || null;
    }

    if (path === '/api/auth/register' && method === 'POST') {
        const uname = (body.username || '').trim();
        const pass = body.password || '';
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(uname)) {
            return { ok: false, status: 400, data: { error: 'Uživatelské jméno musí mít 3–20 znaků (písmena, čísla, _).' } };
        }
        if (pass.length < 6) {
            return { ok: false, status: 400, data: { error: 'Heslo musí mít alespoň 6 znaků.' } };
        }
        if (users.some(u => u.username.toLowerCase() === uname.toLowerCase())) {
            return { ok: false, status: 409, data: { error: 'Toto uživatelské jméno je již obsazené.' } };
        }
        const password_hash = await hashPasswordClientFallback(pass);
        const startCoins = Math.max(bobuxBalance, 250);
        const newUser = {
            id: users.length + 1,
            username: uname,
            password_hash,
            inventory: {
                owned: [...ownedShopItems],
                outfit: Object.assign({}, avatarOutfit),
                torsoHex: avatarTorsoHex,
                gamesPlayed: gamesPlayedCount
            },
            coins: startCoins,
            daily_claim_date: lastClaimTimestamp,
            last_login_at: now,
            last_active_at: now,
            game_ratings: {},
            comments: [],
            last_comment_at: 0
        };
        users.push(newUser);
        saveLocalUsersDB(users);
        const token = 'local_jwt_' + newUser.id;
        return { ok: true, status: 201, data: { token, user: newUser, serverTime: now } };
    }

    if (path === '/api/auth/login' && method === 'POST') {
        const uname = (body.username || '').trim();
        const pass = body.password || '';
        const u = users.find(x => x.username.toLowerCase() === uname.toLowerCase());
        const hash = await hashPasswordClientFallback(pass);
        if (!u || u.password_hash !== hash) {
            return { ok: false, status: 401, data: { error: 'Nesprávné uživatelské jméno nebo heslo.' } };
        }
        u.last_login_at = now;
        u.last_active_at = now;
        saveLocalUsersDB(users);
        const token = 'local_jwt_' + u.id;
        return { ok: true, status: 200, data: { token, user: u, serverTime: now } };
    }

    if (path === '/api/auth/logout' && method === 'POST') {
        return { ok: true, status: 200, data: { ok: true, serverTime: now } };
    }

    if (path === '/api/auth/me' && method === 'GET') {
        if (!currentUser) return { ok: false, status: 401, data: { error: 'Nepřihlášen' } };
        return { ok: true, status: 200, data: { user: currentUser, serverTime: now } };
    }

    if (path === '/api/user/sync' && method === 'POST') {
        if (!currentUser) return { ok: false, status: 401, data: { error: 'Nepřihlášen' } };
        if (typeof body.coins === 'number') currentUser.coins = Math.floor(body.coins);
        currentUser.last_active_at = now;
        const currentInv = currentUser.inventory || {};
        currentUser.inventory = {
            ...currentInv,
            owned: Array.isArray(body.owned) ? body.owned : (currentInv.owned || []),
            outfit: body.outfit || currentInv.outfit,
            torsoHex: body.torsoHex || currentInv.torsoHex,
            gamesPlayed: typeof body.gamesPlayed === 'number' ? body.gamesPlayed : (currentInv.gamesPlayed || 0),
            friends: Array.isArray(body.friends) ? body.friends : (currentInv.friends || []),
            sent_friend_requests: Array.isArray(body.sent_friend_requests) ? body.sent_friend_requests : (currentInv.sent_friend_requests || [])
        };
        saveLocalUsersDB(users);
        return { ok: true, status: 200, data: { user: currentUser, serverTime: now } };
    }

    if (path === '/api/user/active' && method === 'POST') {
        if (!currentUser) return { ok: false, status: 401, data: { error: 'Nepřihlášen' } };
        currentUser.last_active_at = now;
        saveLocalUsersDB(users);
        return { ok: true, status: 200, data: { ok: true, last_active_at: now, serverTime: now } };
    }

    if (path === '/api/daily-claim' && method === 'POST') {
        const lastTs = currentUser ? (currentUser.daily_claim_date || 0) : lastClaimTimestamp;
        if (lastTs > 0 && (now - lastTs) < DAILY_COOLDOWN_MS) {
            return {
                ok: false,
                status: 400,
                data: {
                    error: 'Denní bonus lze vyzvednout pouze 1x za 24 hodin!',
                    lastClaimTimestamp: lastTs,
                    nextClaimTimestamp: lastTs + DAILY_COOLDOWN_MS,
                    serverTime: now
                }
            };
        }
        if (currentUser) {
            currentUser.coins = (currentUser.coins || 0) + 100;
            currentUser.daily_claim_date = now;
            saveLocalUsersDB(users);
        }
        return {
            ok: true,
            status: 200,
            data: {
                ok: true,
                reward: 100,
                user: currentUser,
                lastClaimTimestamp: now,
                nextClaimTimestamp: now + DAILY_COOLDOWN_MS,
                serverTime: now
            }
        };
    }

    const socialDB = getLocalSocialDB();

    if (path === '/api/games/summary' && method === 'GET') {
        const summary = {};
        GAMES_CATALOG.forEach(g => {
            const gData = socialDB[g.id] || { votes: {}, comments: [] };
            const vals = Object.values(gData.votes || {});
            const likes = vals.filter(v => v === 'like').length;
            const dislikes = vals.filter(v => v === 'dislike').length;
            const total = likes + dislikes;
            summary[g.id] = {
                likes,
                dislikes,
                ratingPct: total ? Math.round((likes / total) * 100) : null,
                commentCount: (gData.comments || []).length,
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
        if (!currentUser) return { ok: false, status: 401, data: { error: 'Pro hodnocení hry se nejprve přihlas ke svému účtu!' } };
        const gid = rateMatch[1];
        const vote = body.vote;
        if (!socialDB[gid]) socialDB[gid] = { votes: {}, comments: [] };
        if (socialDB[gid].votes[currentUser.id] === vote) {
            return { ok: false, status: 400, data: { error: 'Tuto hru jsi již takto ohodnotil!' } };
        }
        socialDB[gid].votes[currentUser.id] = vote;
        currentUser.game_ratings = currentUser.game_ratings || {};
        currentUser.game_ratings[gid] = vote;
        saveLocalUsersDB(users);
        saveLocalSocialDB(socialDB);
        const vals = Object.values(socialDB[gid].votes);
        const likes = vals.filter(v => v === 'like').length;
        const dislikes = vals.filter(v => v === 'dislike').length;
        const total = likes + dislikes;
        return {
            ok: true,
            status: 200,
            data: { ok: true, likes, dislikes, ratingPct: total ? Math.round((likes / total) * 100) : null, myVote: vote }
        };
    }

    const commentMatch = path.match(/^\/api\/games\/([a-z0-9_]+)\/comments$/);
    if (commentMatch && method === 'POST') {
        if (!currentUser) return { ok: false, status: 401, data: { error: 'Pro psaní komentářů se musíš přihlásit!' } };
        const gid = commentMatch[1];
        if (now - (currentUser.last_comment_at || 0) < COMMENT_COOLDOWN_MS) {
            const retrySec = Math.ceil((COMMENT_COOLDOWN_MS - (now - currentUser.last_comment_at)) / 1000);
            return { ok: false, status: 429, data: { error: `Anti-spam: Další komentář za ${retrySec}s.`, retryAfterSec: retrySec } };
        }
        const clean = sanitizeTextClient(body.content, 250);
        if (clean.length < 2) return { ok: false, status: 400, data: { error: 'Komentář musí mít 2–250 znaků.' } };
        if (!socialDB[gid]) socialDB[gid] = { votes: {}, comments: [] };
        const cObj = { id: Date.now(), gameId: gid, userId: currentUser.id, username: currentUser.username, content: clean, createdAt: now };
        socialDB[gid].comments.unshift(cObj);
        currentUser.last_comment_at = now;
        currentUser.comments = currentUser.comments || [];
        currentUser.comments.unshift(cObj);
        saveLocalUsersDB(users);
        saveLocalSocialDB(socialDB);
        return { ok: true, status: 201, data: { ok: true, comment: cObj } };
    }

    const socialGetMatch = path.match(/^\/api\/games\/([a-z0-9_]+)\/social$/);
    if (socialGetMatch && method === 'GET') {
        const gid = socialGetMatch[1];
        const gData = socialDB[gid] || { votes: {}, comments: [] };
        const vals = Object.values(gData.votes || {});
        const likes = vals.filter(v => v === 'like').length;
        const dislikes = vals.filter(v => v === 'dislike').length;
        const total = likes + dislikes;
        return {
            ok: true,
            status: 200,
            data: {
                gameId: gid,
                likes,
                dislikes,
                ratingPct: total ? Math.round((likes / total) * 100) : null,
                myVote: currentUser && gData.votes ? (gData.votes[currentUser.id] || null) : null,
                comments: gData.comments || []
            }
        };
    }

    return { ok: false, status: 404, data: {} };
}

function applyAuthenticatedUser(user) {
    if (!user) return;
    authState.user = user;
    if (typeof user.coins === 'number') {
        bobuxBalance = user.coins;
        localStorage.setItem(STORAGE_KEY_BOBUX, String(bobuxBalance));
    }
    if (user.daily_claim_date && user.daily_claim_date > lastClaimTimestamp) {
        lastClaimTimestamp = Number(user.daily_claim_date);
        localStorage.setItem(STORAGE_KEY_DAILY_TS, String(lastClaimTimestamp));
    }
    if (user.inventory && typeof user.inventory === 'object') {
        if (Array.isArray(user.inventory.owned)) {
            ownedShopItems = new Set([DEFAULT_FACE_ID, ...user.inventory.owned.filter(id => SHOP_ITEM_MAP[id])]);
        }
        if (user.inventory.outfit) {
            avatarOutfit = sanitizeOutfit(user.inventory.outfit);
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
                    friendsSet.add(f);
                }
            });
            if (typeof saveFriendsList === 'function') saveFriendsList();
        }
        if (Array.isArray(user.inventory.sent_friend_requests) && typeof sentFriendRequests !== 'undefined') {
            user.inventory.sent_friend_requests.forEach(r => {
                if (r && r.id) {
                    sentFriendRequests[r.id] = r;
                }
            });
            if (typeof saveSentFriendRequests === 'function') saveSentFriendRequests();
        }
        saveShopState();
    }
    if (typeof user.adoptme_bucks === 'number') {
        localStorage.setItem(STORAGE_KEY_ADOPTME_BUCKS, String(Math.max(0, Math.floor(user.adoptme_bucks))));
    }
    if (Array.isArray(user.adoptme_pets) && user.adoptme_pets.length > 0) {
        localStorage.setItem(STORAGE_KEY_ADOPTME_PETS, JSON.stringify(user.adoptme_pets));
    }
    if (user.last_login_at !== undefined) authState.user.last_login_at = user.last_login_at;
    if (user.last_active_at !== undefined) authState.user.last_active_at = user.last_active_at;
    updateNickname(user.username);
    updateBobuxUI();
    updateAuthUI();
    updateDailyBonusUI();
    try {
        localStorage.setItem('boblox_auth_user_cache', JSON.stringify(user));
    } catch (e) {}
}

async function syncAccountToServer() {
    if (!authState.user) return;
    const adopt = typeof loadAdoptMeSavedData === 'function' ? loadAdoptMeSavedData() : null;
    const friendsList = (typeof friendsSet !== 'undefined') ? [...friendsSet] : [];
    const sentReqsList = (typeof sentFriendRequests !== 'undefined') ? Object.values(sentFriendRequests) : [];
    await apiRequest('/api/user/sync', {
        method: 'POST',
        body: {
            coins: bobuxBalance,
            owned: [...ownedShopItems],
            outfit: avatarOutfit,
            torsoHex: avatarTorsoHex,
            gamesPlayed: gamesPlayedCount,
            adoptme_pets: adopt ? adopt.pets : undefined,
            adoptme_bucks: adopt ? adopt.bucks : undefined,
            daily_claim_date: lastClaimTimestamp,
            friends: friendsList,
            sent_friend_requests: sentReqsList
        }
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
        if (pItems) pItems.textContent = String(ownedShopItems.size);
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
        body: { username, password }
    });

    if (!res.ok) {
        showAuthAlert(res.data?.error || 'Přihlášení se nezdařilo.', true);
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
    await apiRequest('/api/auth/logout', { method: 'POST' });
    authState.token = null;
    authState.user = null;
    localStorage.removeItem(STORAGE_KEY_JWT);
    localStorage.removeItem('boblox_auth_user_cache');
    document.cookie = 'boblox_token=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';

    // 1. Generate fresh guest nickname with unique random number
    const fallbackName = getGuestNickname(true);
    if (typeof mpState !== 'undefined') {
        mpState.nickname = fallbackName;
    }
    localStorage.setItem('boblox_mp_nick', fallbackName);

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

    // 1. Okamžitá obnova přihlášeného uživatele z mezipaměti před síťovým voláním (zabraňuje odhlášení při reloadu)
    const cachedUserJson = localStorage.getItem('boblox_auth_user_cache');
    if (cachedUserJson) {
        try {
            const cachedUser = JSON.parse(cachedUserJson);
            if (cachedUser && cachedUser.username) {
                applyAuthenticatedUser(cachedUser);
            }
        } catch (e) {}
    }

    const fallbackName = getGuestNickname();
    if (!authState.token) {
        if (typeof mpState !== 'undefined') {
            mpState.nickname = fallbackName;
        }
        localStorage.setItem('boblox_mp_nick', fallbackName);
        localStorage.removeItem('boblox_auth_user_cache');
        updateAuthUI();
        fetchAllGamesSummary();
        return;
    }

    const res = await apiRequest('/api/auth/me');
    if (res.ok && res.data?.user) {
        localStorage.setItem('boblox_auth_user_cache', JSON.stringify(res.data.user));
        applyAuthenticatedUser(res.data.user);
        touchUserActivity(true);
    } else if (!cachedUserJson) {
        authState.token = null;
        authState.user = null;
        localStorage.removeItem(STORAGE_KEY_JWT);
        localStorage.removeItem('boblox_auth_user_cache');
        if (typeof mpState !== 'undefined') {
            mpState.nickname = fallbackName;
        }
        localStorage.setItem('boblox_mp_nick', fallbackName);
        updateAuthUI();
    }
    fetchAllGamesSummary();
}

const STORAGE_KEY_TRANSACTIONS = 'boblox_bobux_transactions_v2';
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
    bobuxBalance += amount;
    localStorage.setItem(STORAGE_KEY_BOBUX, String(bobuxBalance));
    recordBobuxTransaction(amount, reasonText);
    updateBobuxUI();
    sfx.playCoin();
    if (reasonText) {
        showHudToast(`+${amount} Bobux! (${reasonText})`, 'gold');
    }
    syncAccountToServer();
}

function spendBobux(amount, reasonText = '') {
    if (amount <= 0) return true;
    if (bobuxBalance < amount) {
        showHudToast(`Nemáš dostatek Bobuxů! (Chybí ${amount - bobuxBalance} B$)`, 'red');
        return false;
    }
    bobuxBalance -= amount;
    localStorage.setItem(STORAGE_KEY_BOBUX, String(bobuxBalance));
    recordBobuxTransaction(-amount, reasonText);
    updateBobuxUI();
    syncAccountToServer();
    return true;
}

function updateBobuxUI() {
    const elLobby = document.getElementById('lobby-bobux-count');
    const elBanner = document.getElementById('banner-bobux-count');
    const elHud = document.getElementById('hud-bobux-count');
    const elPlayed = document.getElementById('banner-games-played');
    if (elLobby) elLobby.textContent = bobuxBalance.toLocaleString('cs-CZ');
    if (elBanner) elBanner.textContent = `${bobuxBalance.toLocaleString('cs-CZ')} B$`;
    if (elHud) elHud.textContent = bobuxBalance.toLocaleString('cs-CZ');
    if (elPlayed) elPlayed.textContent = gamesPlayedCount;
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
if (typeof window !== 'undefined') {
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
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && typeof touchUserActivity === 'function') touchUserActivity(false);
    });
    setInterval(() => {
        if (!document.hidden || (typeof activeGameMode !== 'undefined' && activeGameMode)) {
            if (typeof touchUserActivity === 'function') touchUserActivity(false);
        }
    }, 60000);
}

