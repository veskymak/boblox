# Server.js - AI Context

## 1. Quick Summary (TL;DR)
`server.js` je backendový Node.js Express server s SQLite databází (`boblox.db`) a WebSocket real-time serverem (`/ws`). Zajišťuje perzistenci uživatelských účtů, ověřování JWT tokenů, synchronizaci ekonomiky a inventářů (včetně VIP statusu `is_vip`), multiplayerový relay a administrátorské API.

---

## 2. Global State & Single Source of Truth (SSOT)
- **Vlastní a spravuje výhradně:**
  - SQLite databázi `boblox.db`:
    - Tabulka `users`: `id`, `username`, `password_hash`, `coins`, `is_vip`, `inventory` (JSON), `daily_claim_date`, `created_at`, `last_login_at`, `last_active_at`.
    - Tabulky `game_ratings`, `comments`, `direct_messages`, `transactions`.
  - WebSocket klienty (`wss.clients`): Seznam aktivních socketů pro broadcast zpráv a real-time přítomnost.
  - JWT secret klíč (`JWT_SECRET`) pro podepisování a verifikaci autorizačních tokenů.

---

## 3. Key API Endpoints & Handlers
- **Autentizace & Profil:**
  - `POST /api/auth/register`: Vytvoří uživatele, zahashuje heslo (bcrypt), inicializuje základní inventář a vrátí JWT token.
  - `POST /api/auth/login`: Ověří přihlašovací údaje a vrátí JWT + serializovaný uživatelský profil.
  - `GET /api/auth/me`: Vrátí aktuální profil přihlášeného uživatele z JWT tokenu.
- **Synchronizace účtu & Perzistence:**
  - `POST /api/user/sync`: Zpracuje změny konta (`coins`), bio, přátel, Adopt Me postupu, transakcí a VIP statusu (`is_vip`).
  - `serializeUserForClient(row)`: Bezpečně převede databázový záznam do JSONu pro klienta (včetně `is_vip: isVip` a odstranění `password_hash`).
- **Sociální funkce & Hodnocení:**
  - `GET/POST /api/friends/request`, `/api/friends/accept`: Správa žádostí o přátelství.
  - `GET/POST /api/comments`, `GET/POST /api/ratings`: Recenze a hodnocení miniher.
- **Administrace:**
  - `POST /api/admin/give-coins`: Privilegované přičtení nebo nastavení Bobuxů (pouze pro uživatele `vendeez` nebo `admin`).
  - `POST /api/admin/broadcast`: Odeslání systémové zprávy všem připojeným klientům.
  - `GET /api/admin/users`: Seznam registrovaných účtů pro administrátorský panel.
- **WebSocket Gateway (`/ws`):**
  - Obousměrný relay pro multiplayerové pakety (`playerState`, `chatMessage`, `admin_broadcast`, `presence`).

---

## 4. Lifecycle & Execution Hooks
- **Start serveru:** `node server.js` (nebo `npm start`) inicializuje SQLite tabulky, spustí HTTP server na portu 3000 (nebo `PORT`) a naváže WebSocket server `/ws`.
- **Statické soubory:** Servíruje kořenový adresář Bobloxu (`index.html`, `src/`, assety) s `Cache-Control: no-cache` pro HTML a JS soubory.

---

## 5. Anti-Duplication Rules & Gotchas
- **Perzistence VIP statusu (`is_vip`)**: `is_vip` je uloženo jak v kořenovém sloupci/objektu uživatele, tak v JSON inventáři `inventory.is_vip` pro maximální zpětnou kompatibilitu se staršími verzemi databáze a Supabase.
- **Vždy escapuj a sanitizuj vstupy**: Veškerý uživatelský text prochází sanitizací před uložením do SQLite.
- **Bezpečnost hesel**: Hesla se ukládají výhradně jako bcrypt hash se solí.
- **Hesla se nikdy nesmí vrátit klientovi**: `serializeUserForClient()` vždy odstraní `password_hash`.
