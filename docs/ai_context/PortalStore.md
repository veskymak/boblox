# PortalStore.js - AI Context

## 1. Quick Summary (TL;DR)
`src/state/PortalStore.js` představuje centrální stavový a transportní pilíř Bobloxu. Spravuje autentizaci uživatele (`authState`), zmrazené klíče úložiště (`STORAGE_KEYS`), ekonomiku virtuální měny Bobux a její auditní transakční deník, definici katalogu miniher (`GAMES_CATALOG`) a vícevrstvý transportní router `apiRequest()`, který transparentně přepíná mezi Node.js backendem, Supabase cloudovou databází (pro GitHub Pages) a offline mezipamětí.

---

## 2. Global State & Single Source of Truth (SSOT)
- **Vlastní a exportuje:**
  - `STORAGE_KEYS`: Zmrazený slovník (`Object.freeze`) všech klíčů LocalStorage (`BOBUX`, `JWT`, `TORSO`, `DAILY_TS`, `TRANSACTIONS`, `CLOUD_USERS`, `FRIENDS`, atd.).
  - `authState`: Globální stav přihlášení `{ user, token, backendConnected, isSupabase }`.
  - `bobuxBalance`: Číselný stav konta hráče (výchozí 250 pro hosta).
  - `bobuxTransactions` (`Array`): Neměnná transakční historie `{ id, ts, delta, reason, balanceAfter }`.
  - `GAMES_CATALOG`: Seznam všech 12 her s metadaty (ID, název, tagy, miniatury, popis).
  - `avatarTorsoHex`: Zvolená barva trupu avatara.
  - `lastClaimTimestamp`: Časové razítko posledního výběru denního bonusu.
  - `serverTimeOffsetMs`: Odchylka klientských hodin vůči serveru.
  - `supabaseClient`: Inicializovaná instance klienta Supabase.
- **Volá a aktualizuje:**
  - `updateBobuxUI()`, `updateAuthUI()`, `updateDailyBonusUI()`: Aktualizace DOM prvků v portálu.

---

## 3. Key API Functions & Signatures
- `apiRequest(path: string, options?: Object): Promise<any>`
  - **POVINNÉ rozhraní** pro veškerou síťovou komunikaci. Nejprve se pokusí o dotaz do Supabase Cloud DB; pokud není dostupná, volá Node.js REST API; při výpadku sítě sáhne do lokální offline DB.
- `syncAccountToServer(opts?: { bypassQueue: boolean }): Promise<void>`
  - Asynchronní debounce synchronizátor. Shromáždí zůstatek Bobuxů, inventář, seznam přátel, bio, Adopt Me data a transakce a odešle je na server / do Supabase tabulky `profiles`.
- `applyAuthenticatedUser(user: Object): void`
  - Aplikuje přihlášený profil, obnoví data mezi zařízeními (mince, vlastněné skiny, příchozí žádosti o přátelství, transakce) a aktualizuje UI.
- `addBobux(amount: number, reasonText?: string): void`
  - Přičte Bobuxy, vytvoří transakční záznam, aktualizuje UI a naplánuje `syncAccountToServer()`.
- `spendBobux(amount: number, reasonText?: string): boolean`
  - Ověří dostatek prostředků. Pokud ano, odečte Bobuxy, zaloguje transakci, spustí sync a vrátí `true`. Při nedostatku vrátí `false`.
- `handleSupabaseApiRequest(sb: Object, path: string, options?: Object): Promise<any>`
  - Plnohodnotná klientská emulace REST API běžící přímo nad tabulkami Supabase (`profiles`, `game_ratings`, `comments`, `direct_messages`).
- `sanitizeTextClient(input: string, maxLen?: number): string`
  - Očistí text od nebezpečných HTML znaků a zkrátí na povolenou délku.

---

## 4. Lifecycle & Execution Hooks
- **Start aplikace:** `bootBobloxPortal()` volá `initAuthSession()` – ověří existenci uloženého JWT tokenu a načte profil přes `/api/auth/me`.
- **Před zavřením okna (`pagehide`/`beforeunload`):** Okamžité odeslání neuložených dat hráče pomocí `keepalive` požadavku.
- **Změna stavu konta nebo inventáře:** Vyvolá debounced `syncAccountToServer()`.

---

## 5. Anti-Duplication Rules & Gotchas
- **PŘÍSNÝ ZÁKAZ volání `fetch('/api/...')`**: V celém kódu nesmí být žádné přímé volání `fetch` na API. Veškeré požadavky musí jít přes `apiRequest()`.
- **PŘÍSNÝ ZÁKAZ hardcoded klíčů LocalStorage**: Vždy používej konstanty ze zmrazeného objektu `STORAGE_KEYS`.
- **Zákaz izolovaného LocalStorage**: Nová uživatelská data nesmí existovat pouze v LocalStorage. Musí být součástí schématu v `syncAccountToServer()` a perzistována na backendu / Supabase.
- **Barva Bobux měny**: V UI pro částky v Bobuxech používej výhradně barvu `text-[#FFE066]`.

---

## 6. Code Snippets / Seams

### Seam A: Centrální transportní směrovač apiRequest
```javascript
// src/state/PortalStore.js: L1392-L1410
async function apiRequest(path, options = {}) {
    const sb = getSupabaseClient();
    if (sb) {
        try { const sbRes = await handleSupabaseApiRequest(sb, path, options); if (sbRes) return sbRes; }
        catch (sbErr) { console.warn('Supabase fallback:', sbErr); }
    }
    // pokračuje na standardní fetch /api/* a offline fallback
```

### Seam B: Bezpečná útrata virtuální měny
```javascript
// src/state/PortalStore.js: L2200-L2215
function spendBobux(amount, reasonText = '') {
    if (bobuxBalance < amount) return false;
    bobuxBalance -= amount;
    recordBobuxTransaction(-amount, reasonText);
    updateBobuxUI();
    syncAccountToServer();
    return true;
}
```

### Seam C: Cross-device synchronizace uživatele
```javascript
// src/state/PortalStore.js: L2037-L2055
async function syncAccountToServer({ bypassQueue = false } = {}) {
    if (!authState.user) return;
    const syncBody = { coins: bobuxBalance, inventory: { ... }, friends: friendsList, bio: currentBio };
    await apiRequest('/api/user/sync', { method: 'POST', body: JSON.stringify(syncBody) });
}
```
