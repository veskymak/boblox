# AdminUI.js - AI Context

## 1. Quick Summary (TL;DR)
`src/ui/AdminUI.js` poskytuje rozhraní vývojářského a administrátorského panelu Bobloxu. Zajišťuje autorizaci administrátorů (uživatelé Vendeez a admin), ovládá 4záložkový administrátorský modál (správa Bobuxů a ekonomiky, seznam uživatelů, globální oznámení a cheaty jako Godmode a Super Speed) a zprostředkovává volání privilegovaných endpointů.

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
  - Ověří, zda je daný uživatel administrátor (kontrola jména `vendeez` nebo `admin` bez ohledu na velikost písmen, případně role `admin`).
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
  - Zvyšuje rychlost pohybu hráče na dvojnásobek.
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
// src/ui/AdminUI.js: L10-L20
function isCurrentUserAdmin(user) {
    const u = user || (typeof authState !== 'undefined' ? authState.user : null);
    if (!u || !u.username) return false;
    const name = String(u.username).toLowerCase();
    return name === 'vendeez' || name === 'admin' || u.role === 'admin';
}
```

### Seam B: Nastavení a přičtení Bobuxů cílovému hráči
```javascript
// src/ui/AdminUI.js: L220-L235
async function submitAdminGiveCoins(targetUsername, customAmount, action = 'add') {
    const res = await apiRequest('/api/admin/give-coins', {
        method: 'POST',
        body: JSON.stringify({ target: targetUsername, amount: customAmount, action })
    });
    if (res && res.coins !== undefined && isTargetSelf) { bobuxBalance = res.coins; updateBobuxUI(); }
}
```

### Seam C: Přepínání vývojářských cheatů
```javascript
// src/ui/AdminUI.js: L120-L135
function toggleAdminGodmode(forceVal) {
    playerState.godmode = (forceVal !== undefined) ? !!forceVal : !playerState.godmode;
    showHudToast(playerState.godmode ? 'Godmode ZAPNUT' : 'Godmode VYPNUT', 'gold');
    return playerState.godmode;
}
```
