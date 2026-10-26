# NetworkManager.js - AI Context

## 1. Quick Summary (TL;DR)
`src/network/NetworkManager.js` zastřešuje kompletní síťovou vrstvu Bobloxu. Kombinuje peer-to-peer WebRTC mesh přes PeerJS pro nízko-latentní přenos pozic a akcí hráčů, WebSocket spojení na Node.js backend (`server.js`), Supabase Realtime broadcast kanály pro statický hosting na GitHub Pages a `BroadcastChannel` pro synchronizaci mezi taby prohlížeče.

---

## 2. Global State & Single Source of Truth (SSOT)
- **Vlastní a spravuje výhradně (`mpState`):**
  - `mpState.mode`: Režim `'public'` (globální matchmaking) nebo `'private'` (privátní 6místná párty).
  - `mpState.peer`: Instance `Peer` z PeerJS knihovny.
  - `mpState.ws`: WebSocket spojení na lokální/produkční server (`wss://` nebo `ws://`).
  - `mpState.bc`: Instance `BroadcastChannel('boblox_live_presence_v2')`.
  - `mpState.supabaseGameChannel` a `mpState.supabaseSocialChannel`: Aktivní kanály Supabase Realtime.
  - `mpState.connections`: Pole aktivních `DataConnection` objektů otevřených vůči ostatním hráčům.
  - `mpState.remotePlayers`: Slovník `{ peerId -> playerRecord }` obsahující pozice, rotace, avatary, zbraně a Three.js meshe cizích hráčů.
  - `mpState.globalOnlinePeers`: Seznam aktivních hráčů na síti pro online čítače.
  - `mpState.syncTimer`: Akumulátor času pro síťový tick (20 Hz = 50 ms).
- **Čte:**
  - `playerState`: Čte pozici, rychlost, zbraň, animaci pro sestavení broadcast paketu.
  - `avatarOutfit`, `avatarTorsoHex`: Vzhled hráče pro replikaci cizím klientům.
  - `activeGameMode`: ID běžící minihry pro směrování zpráv do správného kanálu.
  - `authState`: Uživatelské jméno a JWT token pro autorizaci privilegovaných zpráv.

---

## 3. Key API Functions & Signatures
- `sendMultiplayerPacket(payload: Object): void`
  - Odešle herní data všem účastníkům. Využívá vícevrstvý transport: 1. WebRTC DataConnections, 2. Supabase Realtime broadcast, 3. WebSocket fallback.
- `broadcastLocalPlayerState(dt: number): void`
  - Volána v každém snímku z `gameLoop`. Pokud uběhlo 50 ms (20 Hz), zabalí pozici, rotaci, animaci chůze, zbraň, skin a VIP status (`isVip: isCurrentUserVip()`) lokálního hráče a odešle je přes `sendMultiplayerPacket`.
- `createNameplateSprite(nameText: string, isVip?: boolean): THREE.Sprite`
  - Vygeneruje texturální sprite se jménem hráče a u VIP hráčů vykreslí zlatý `VIP` badge s rámečkem `#FFE066`. Dynamicky se aktualizuje při změně VIP statusu.
- `handleMultiplayerPacket(packet: Object, sourceConn?: Object): void`
  - Vstupní brána pro příchozí síťové zprávy. Pokud je klient hostitelem (Host), přeposílá paket ostatním peerům. Zpracovává typy `playerState`, `playerDamage`, `chatBubble`, `casino_event`, `admin_broadcast`.
- `updateRemotePlayersInScene(dt: number): void`
  - Volána každý render snímek. Provádí hladkou interpolaci (LERP) pozic a rotací vzdálených hráčů a animuje jejich končetiny v Three.js scéně.
- `connectGlobalPublicMatchmaking(gameId: string): void`
  - Připojí hráče k veřejnému matchmakingovému poolu pro zvolenou minihru na základě herního ID.
- `sendSocialBroadcast(event: string, payload: Object): void`
  - Odešle globální sociální nebo systémovou zprávu (žádost o přátelství, aktualizace přítomnosti, admin broadcast) přes `BroadcastChannel`, WebSocket i Supabase.
- `handleIncomingAdminBroadcast(msg: Object): void`
  - Zobrazí celoobrazovkový zlatý oznamovací pruh administrátora a přehraje zvuk fanfáry.

---

## 4. Lifecycle & Execution Hooks
- **Start aplikace (`bootBobloxPortal`):**
  - Inicializace přes `initLiveSocketAndPresence()`. Otevře `BroadcastChannel`, pokusí se o WebSocket spojení a přihlásí se do Supabase kanálu `boblox-global-presence`.
- **Každý snímek smyčky (`PhysicsAndLoop.js` -> `gameLoop`):**
  1. `updateRemotePlayersInScene(dt)`: Posun a animace cizích panáčků.
  2. `broadcastLocalPlayerState(dt)`: Síťový tick na frekvenci 20 Hz (při `syncTimer >= 0.05`).
- **Příchozí asynchronní události:**
  - `conn.on('data')`: Paket z přímého WebRTC kanálu.
  - `ws.onmessage`: Zpráva z WebSocket serveru.
  - `supabaseSocialChannel.on('broadcast')`: Cloudový broadcast ze statického hostingu.

---

## 5. Anti-Duplication Rules & Gotchas
- **ZÁKAZ otevírání vlastních WebSocketů v UI nebo hrách**: Veškerý síťový provoz musí jít přes `sendMultiplayerPacket()` pro hru nebo `sendSocialBroadcast()` pro sociální funkce.
- **ZÁKAZ posílání Three.js instancí přes síť**: Přenášejí se výhradně serializovatelné primitivní objekty `{ x, y, z, rotY, torsoHex, weaponId }`.
- **Respektuj 20 Hz limit**: Nikdy nevysílej stav hráče bez kontroly `mpState.syncTimer >= 0.05`. Přeplnění WebRTC/WebSocket bufferu způsobuje lag a desynchronizaci.
- **Relay princip hostitele**: V privátních hrách hostitel automaticky přeposílá pakety ostatním klientům. Neposílej duplicitní broadcast všem z klienta, který není host.

---

## 6. Code Snippets / Seams

### Seam A: Vícevrstvé odesílání herního paketu
```javascript
// src/network/NetworkManager.js: L1196-L1210
function sendMultiplayerPacket(payload) {
    mpState.connections.forEach(c => { if (c.open) try { c.send(payload); } catch (e) {} });
    if (mpState.supabaseGameChannel) { mpState.supabaseGameChannel.send({ type: 'broadcast', event: 'game_event', payload }); }
    if (mpState.ws && mpState.ws.readyState === WebSocket.OPEN) { mpState.ws.send(JSON.stringify({ type: 'game_packet', gameId: activeGameMode, payload })); }
}
```

### Seam B: Příchozí distribuce síťového paketu
```javascript
// src/network/NetworkManager.js: L1084-L1095
function handleMultiplayerPacket(packet, sourceConn) {
    if (!packet || !packet.type) return;
    if (mpState.isHost && sourceConn) {
        mpState.connections.forEach(c => { if (c !== sourceConn && c.open) c.send(packet); });
    }
```

### Seam C: 20 Hz periodický tick hráče
```javascript
// src/network/NetworkManager.js: L1245-L1250
function broadcastLocalPlayerState(dt) {
    if (!activeGameMode) return;
    mpState.syncTimer += dt;
    if (mpState.syncTimer < 0.05) return;
    mpState.syncTimer = 0;
```
