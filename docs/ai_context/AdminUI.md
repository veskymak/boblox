# AdminUI.js - AI Context

## 1. Quick Summary (TL;DR)
`src/ui/AdminUI.js` poskytuje administrační panel pouze pro účet Vendeez. Ovládá ekonomiku, hráče, oznámení a cheaty a sdílí přepínače cheatů s herním ESC menu.

---

## 2. Global State & Single Source of Truth (SSOT)
- **Vlastní a spravuje:**
  - `adminCachedUsers` (`Array`): Mezipaměť seznamu uživatelských účtů načtená z backendu nebo Supabase.
- **Modifikuje v globálním stavu:**
  - `playerState.godmode` (`boolean`): Nesmrtelnost hráče (imunita vůči poškození i void fallu).
  - `playerState.superSpeed` (`boolean`): Extra zrychlení pohybu hráče.
  - `playerState.speedMultiplier`: Násobič rychlosti běhu.
  - `lastClaimTimestamp`: Vynulování pro cheat okamžitého denního bonusu.
- **Čte:**
  - `authState.user`: Uživatelský objekt pro ověření administrátorských oprávnění.

---

## 3. Key API Functions & Signatures
- `isCurrentUserAdmin(user?: Object): boolean`
  - Povolí pouze username `vendeez` bez ohledu na velikost písmen. Účet `admin` ani příznak `isAdmin` přístup neudělují.
- `updateAdminUI(): void`
  - Zobrazí nebo skryje administrátorská tlačítka v postranním panelu (`#sidebar-admin-btn`) a v mobilních rychlých volbách (`#quick-action-admin`).
- `openAdminModal(): void` / `closeAdminModal(): void`
  - Otevře nebo zavře modální okno `#admin-modal`. Při nepovoleném přístupu zobrazí varování.
- `switchAdminTab(tabName: string): void`
  - Přepíná záložky panelu: `'economy'`, `'users'`, `'broadcast'`, `'cheats'`.
- `submitAdminGiveCoins(targetUsername?: string, customAmount?: number, action?: string): Promise<void>`
  - Odešle požadavek na `/api/admin/give-coins` s akcí `'add'` (přičtení) nebo `'set'` (nastavení přesné hodnoty konta) a synchronizuje stav.
- `submitAdminBroadcast(customMsg?: string): Promise<void>`
  - Odešle globální zprávu všem připojeným hráčům přes `/api/admin/broadcast` (nebo fallback přes `sendSocialBroadcast`).
- `toggleAdminGodmode(forceVal?: boolean): boolean`
  - Aktivuje/deaktivuje nesmrtelnost lokálního hráče.
- `toggleAdminSuperSpeed(forceVal?: boolean): boolean`
  - Přepíná násobič rychlosti pohybu 2,5×.
- `resetAdminDailyCooldown(): void`
  - Vynuluje časovač denního bonusu na nulu pro okamžitý opakovaný výběr.
- `loadAdminUsersList(): Promise<void>`
  - Načte seznam všech registrovaných hráčů z `/api/admin/users` a vykreslí jej.

---

## 4. Lifecycle & Execution Hooks
- **Přihlášení / změna uživatele:** `updateAuthUI()` v `PortalStore.js` volá `updateAdminUI()`.
- **Kliknutí na admin tlačítko:** Otevření panelu přes `openAdminModal()`.
- **Přijetí admin broadcastu:** Na všech klientech vyvolá zobrazení celoobrazovkového zlatého pruhu a fanfáru.

---

## 5. Anti-Duplication Rules & Gotchas
- **ZÁKAZ obcházení autorizace na klientu i serveru**: Klientská přítomnost (`msg.username`) nestačí; privilegované volání musí vždy nést platný JWT token.
- **Respektuj standard Bobux barvy**: Všechna čísla a tlačítka Bobuxů v administraci musí používat striktně třídu `text-[#FFE066]`.
- **Mobilní touch targety**: Všechna tlačítka v panelu administrátora musí mít výšku minimálně 44px (`min-h-[44px]`).
- **Nerozšiřuj PortalUI o admin logiku**: Veškerý nový kód pro správu vývojářského panelu patří do `AdminUI.js`.

---

## 6. Code Snippets / Seams

### Seam A: Ověření role administrátora
```javascript
// src/ui/AdminUI.js: L38-L43
function isCurrentUserAdmin(user) {
    const u = user || (typeof authState !== 'undefined' ? authState.user : null);
    if (!u || !u.username) return false;
    const name = String(u.username).toLowerCase();
    return name === 'vendeez';
}
```

### Seam B: Nastavení a přičtení Bobuxů cílovému hráči
```javascript
// src/ui/AdminUI.js: L246+ (request excerpt)
async function submitAdminGiveCoins(amount, action = 'add', targetUsername = null) {
    const res = await apiRequest('/api/admin/give-coins', {
        method: 'POST',
        body: { username: targetUsername, amount, action }
    });
    // Only a successful response updates the local balance and refreshes players.
}
```

### Seam C: Přepínání vývojářských cheatů
```javascript
// src/ui/AdminUI.js: L143+ (toggle excerpt)
function toggleAdminGodmode(forceVal) {
    if (!isCurrentUserAdmin() || typeof playerState === 'undefined') return false;
    playerState.godmode = (forceVal !== undefined) ? !!forceVal : !playerState.godmode;
    syncAdminCheatControls();
    return playerState.godmode;
}
```

## Admin menu and ESC controls (v8.9)
- syncAdminCheatControls() synchronizes admin-* and esc-admin-* status, button text and aria-pressed from playerState. Toggles check Vendeez at the mutation boundary. updateAdminUI clears cheats and cached users on logout/account change.
- ESC controls live in #rblx-panel-admin; PortalUI permits the admin tab only for Vendeez. Cheat behavior stays in AdminUI, without new localStorage state.
- Economy accepts safe nonnegative integers and add/set actions. Pending flags block duplicate mutations; data-admin-economy buttons disable while saving. Success refreshes the balance and players list.
- Users load when entering the tab; request sequence ignores stale responses. Names and inline handler arguments are escaped; search uses adminCachedUsers. Cached fallback is explicitly labeled stale.
- Broadcast validates 1-300 characters, preserves input on failure and prevents duplicate sends. #admin-feedback provides progress/errors via aria-live.
- resetAdminDailyCooldown is async: /api/admin/reset-daily must succeed before local state changes. Node already persists this route; PortalStore adds the Supabase implementation.
- Tests: node --test test/admin-menu-improvements.test.js and existing admin frontend/cloud tests. Existing DOM IDs remain intact.

## Game moderation (v9.2)
- Vendeez-only GET `/api/admin/games/:gameId/social` returns named votes and comments. POST sibling `reset-ratings` deletes all game votes; `delete-comment` takes `commentId`.
- SQLite mutations are transactional and remove legacy users JSON mirrors. Existing public social/summary reads and fresh auth reflect deletions.
- AdminUI ratings tab loads on entry/game selection and refreshes after writes; DOM textContent protects user content. Logout invalidates pending reads. Destructive actions require browser confirmation.
- Supabase uses authenticated SECURITY DEFINER RPC `admin_game_social`, checking auth.uid() against profiles username. Deploy `docs/supabase/schema_update_v9.2.sql` first; unavailable RPC fails closed, with no offline success or Node fallback.
- Comments have no separate voting model. Moderation supports viewing authors and deleting comments, while game reset preserves comments.
