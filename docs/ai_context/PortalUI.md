# PortalUI.js - AI Context

## 1. Quick Summary (TL;DR)
`src/ui/PortalUI.js` ovládá kompletní 2D uživatelské rozhraní portálu Boblox (katalog her, filtrování, detaily a recenze her), profily hráčů s vitrínou avatarů, sociální systém (přátelé, žádosti o přátelství, soukromé zprávy v lobby), responzivní mobilní navigaci, herní Roblox ESC menu a systém detekce nových verzí aplikace (cache-busting).

---

## 2. Global State & Single Source of Truth (SSOT)
- **Vlastní a spravuje:**
  - `activePortalSection`: Aktivní sekce portálu (`'home'`, `'profile'`, `'people'`).
  - `robloxUiState`: Stav herního UI `{ isMenuOpen, activeMenuTab, isShiftLock, isPlayerListOpen, isChatOpen, isMuted }`.
  - `friendsSet` (`Set`): Množina potvrzených přátel lokálního uživatele.
  - `sentFriendRequests` a `receivedFriendRequests`: Objekty odeslaných a přijatých žádostí o přátelství.
  - `liveFriendsPresence`: Slovník stavů přátel (zda jsou ve hře, jaký herní mód hrají).
  - `lobbyDirectMessages`: Úložiště soukromých zpráv v lobby `{ partnerUser -> [messages] }`.
  - `unreadDirectMessages`: Počítadla nepřečtených zpráv.
  - `MOBILE_SIDEBAR_CLASSES`: CSS třídy pro vysouvací mobilní menu.
- **Čte:**
  - `authState`, `bobuxBalance`, `GAMES_CATALOG`, `avatarOutfit`.

---

## 3. Key API Functions & Signatures
- `switchPortalSection(sectionId: string): void`
  - Přepíná hlavní pohledy portálu (Domů / Profil / Lidé), automaticky zavírá mobilní sidebar a aktualizuje aktivní třídy navigace.
- `renderGameCatalog(): void`
  - Vygeneruje do `#game-cards-grid` karty všech 12 her s hodnocením, počtem hráčů, štítky a náhledovým obrázkem.
- `renderPortalProfileView(targetUser?: Object): void`
  - Vykreslí profilový pohled s bio hráče, statistikami, 3D náhledem a mřížkou nasazených předmětů (`wearGrid`).
- `toggleMobileSidebar(forceState?: boolean): void`
  - Otevírá nebo zavírá mobilní vysouvací panel `#portal-sidebar` a podkladový ztmavovací backdrop `#portal-sidebar-backdrop`.
- `openRobloxEscMenu(initialTab?: string): void`
  - Otevře zážitkové menu Robloxu (klávesa ESC), uvolní Pointer Lock myši a zobrazí záložky (Lidé s VIP štítky a portréty avatarů, Nastavení, Nápověda).
- `renderRobloxTopRightPlayerList(): void`
  - Vykreslí leaderboard vpravo nahoře; VIP hráčům vedle jména přidá zlatý odznak `VIP`.
- `appendRobloxChatMessage(senderName: string, text: string, isVip?: boolean): void`
  - Přidá zprávu do in-game chatu; u VIP hráčů zobrazí zlatý tag `[VIP]`.
- `closeRobloxEscMenu(): void`
  - Zavře ESC menu a vrátí hráče do plynulého ovládání 3D kamery.
- `sendFriendRequest(targetUsername: string): Promise<boolean>`
  - Odešle žádost o přátelství přes `apiRequest('/api/friends/request')` a uloží do odeslaných žádostí.
- `acceptFriendRequest(senderUsername: string): Promise<boolean>`
  - Přijme žádost, zařadí hráče do `friendsSet`, aktualizuje UI a zavolá `syncAccountToServer()`.
- `syncDirectChatMessages(partnerUsername: string): Promise<void>`
  - Stáhne a synchronizuje přímé zprávy s daným uživatelem.
- `checkForBobloxUpdates(): Promise<void>`
  - Ověří verzi proti `/version.json`. Pokud server hlásí novější build, zobrazí odpočítávací modální okno k obnovení stránky.

---

## 4. Lifecycle & Execution Hooks
- **Start portálu:** `bootBobloxPortal()` volá `renderGameCatalog()`, `initPortalSidebarMobileEvents()` a spustí kontrolu verzí.
- **Stisk klávesy ESC ve hře:** Vyvolá `toggleRobloxEscMenu()`.
- **Přepnutí pohledu:** Kliknutí na navigační ikony volá `switchPortalSection()`.

---

## 5. Anti-Duplication Rules & Gotchas
- **PŘÍSNÝ ZÁKAZ mazání nebo přejmenovávání existujících DOM ID**: Na ID jako `portal-sidebar`, `mobile-bottom-nav`, `admin-modal`, `wearGrid` přímo závisí herní moduly i automatizované testy.
- **Pravidlo Touch Targetů**: Každé nové tlačítko nebo odkaz v UI MUSÍ mít minimální výšku 44px (`min-h-[44px]`).
- **Zákaz míchání domén (Divergent Change)**: Administrátorské funkce patří do `AdminUI.js`. Do `PortalUI.js` nepřidávej admin cheaty ani správu měny.
- **Rozlišení chatů**: V in-game chatu používej `spawnChatBubbleOnAvatar()`, pro lobby chat používej `lobbyDirectMessages`.

---

## 6. Code Snippets / Seams

### Seam A: Mobilní postranní panel a backdrop
```javascript
// src/ui/PortalUI.js: L3320-L3335
function toggleMobileSidebar(forceState = null) {
    const sidebar = document.getElementById('portal-sidebar');
    const backdrop = document.getElementById('portal-sidebar-backdrop');
    const shouldOpen = forceState !== null ? forceState : sidebar.classList.contains('hidden');
    sidebar.classList.toggle('hidden', !shouldOpen);
    backdrop.classList.toggle('hidden', !shouldOpen);
}
```

### Seam B: Otevření Roblox ESC menu
```javascript
// src/ui/PortalUI.js: L1210-L1225
function openRobloxEscMenu(initialTab = 'players') {
    robloxUiState.isMenuOpen = true;
    if (document.exitPointerLock) document.exitPointerLock();
    document.getElementById('roblox-esc-menu-modal').classList.remove('hidden');
    switchRobloxMenuTab(initialTab);
}
```

### Seam C: Přijetí žádosti o přátelství
```javascript
// src/ui/PortalUI.js: L1540-L1555
async function acceptFriendRequest(senderUsername) {
    friendsSet.add(senderUsername.toLowerCase());
    delete receivedFriendRequests[senderUsername.toLowerCase()];
    await apiRequest('/api/friends/accept', { method: 'POST', body: JSON.stringify({ target: senderUsername }) });
    syncAccountToServer();
}
```
