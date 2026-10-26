# InputManager.js - AI Context

## 1. Quick Summary (TL;DR)
`src/core/InputManager.js` zachytává veškeré hardwarové vstupy (klávesnice, myš, dotyková gesta), spravuje orbitální otáčení a přiblížení kamery, režim Pointer Lock a virtuální mobilní joystick s dotykovými tlačítky. Současně zajišťuje spolehlivý start a bootstrap celé aplikace (`bootBobloxPortal`).

---

## 2. Global State & Single Source of Truth (SSOT)
- **Vlastní a spravuje interně:**
  - `_bobloxPortalBooted`: Guard zabraňující vícenásobné inicializaci aplikace.
  - `_mobileTouchControlsInitialized`: Příznak inicializace dotykových posluchačů.
  - `_touchMoveVector` (`{ x: number, y: number }`): Normalizovaný vektor směru z virtuálního mobilního joysticku.
  - `_activeTouchId`: ID prstu ovládajícího joystick pro zamezení multi-touch konfliktů.
- **Modifikuje (Sdílený stav):**
  - `keysPressed`: Mapa stisknutých kláves (např. `keysPressed['KeyW'] = true`).
  - `camState`: Úhly kamery (`yaw`, `pitch`, `distance`), příznak tažení `isDragging` a pozice kurzoru.
- **Čte:**
  - `activeGameMode`: Pokud je `null` (hráč je v portálu), vstup myši neovládá 3D kameru.
  - `robloxUiState.isMenuOpen`: Pokud je otevřeno Roblox ESC menu, pozastaví Pointer Lock a otáčení kamery.

---

## 3. Key API Functions & Signatures
- `bootBobloxPortal(): void`
  - Vstupní bod běhu aplikace po načtení DOMu (`DOMContentLoaded`/`load`). Spustí inicializaci přezdívky, aktualizuje Bobux UI, nastaví veřejný matchmaking, zinicializuje mobilní ovládání, zkontroluje auth session, připojí WebSocket/Supabase presence a vykreslí katalog her.
- `initMobileTouchControls(): void`
  - Nastaví dotyková gesta na zóně `#mobile-joystick-zone` pro virtuální analogový joystick a napojí dotyková tlačítka (skok, akce/střelba, interakce [E], ESC menu).
- `updateMobileControlsVisibility(): void`
  - Přepíná viditelnost kontejneru `#mobile-touch-controls` v závislosti na tom, zda je detekováno dotykové zařízení a zda je spuštěna 3D hra.
- `isMobileOrTouchDevice(): boolean`
  - Vrací `true`, pokud zařízení podporuje dotykové body (`navigator.maxTouchPoints > 0`) nebo obsahuje mobilní User-Agent.

---

## 4. Lifecycle & Execution Hooks
- **Start aplikace:** `window.addEventListener('DOMContentLoaded', bootBobloxPortal)` a `window.addEventListener('load', bootBobloxPortal)`.
- **Události klávesnice:**
  - `keydown`: Zaznamená klávesu do `keysPressed`, klávesy `1`–`5` volají `equipWeaponSlot()`, `Space` vyvolá skok, `R` přebití zbraně, `/` otevře herní chat, `Escape` přepne ESC menu.
  - `keyup`: Odstraní klávesu z `keysPressed`.
- **Události myši & PointerLock:**
  - Kliknutí do plátna `#three-canvas`: Požadavek na `requestPointerLock()`.
  - `mousemove`: Pokud je aktivní Pointer Lock nebo RMB tažení, upravuje `camState.yaw` a `camState.pitch`.
  - `wheel`: Přibližuje/oddaluje kameru (`camState.distance = 4` až `28`).
- **Resize okna:** Přepočítává poměr stran kamery a volá `renderer.setSize()`.

---

## 5. Anti-Duplication Rules & Gotchas
- **NIKDY nepřidávej přímé `keydown`/`keyup` listenery v herních modulech**: Veškerý stav pohybu čti výhradně z centrálního objektu `keysPressed`.
- **NIKDY nevytvářej vlastní dotykový joystick pro konkrétní minihru**: Mobilní ovládání je plně sjednocené a promítá se do stejného pohybového vektoru v `PhysicsAndLoop.js`.
- **Vždy respektuj modální okna**: Pokud je otevřen jakýkoliv modál (ESC menu, chat, nákup), nevolej `requestPointerLock()`.

---

## 6. Code Snippets / Seams

### Seam A: Spolehlivý bootstrap aplikace
```javascript
// src/core/InputManager.js: L448-L460
function bootBobloxPortal() {
    if (_bobloxPortalBooted) return;
    _bobloxPortalBooted = true;
    updateNickname(mpState.nickname);
    updateBobuxUI();
    initMobileTouchControls();
    initAuthSession();
    renderGameCatalog();
}
```

### Seam B: Pohyb myši a rotace 3D kamery
```javascript
// src/core/InputManager.js: L390-L405
window.addEventListener('mousemove', (e) => {
    if (!activeGameMode || (typeof robloxUiState !== 'undefined' && robloxUiState.isMenuOpen)) return;
    if (document.pointerLockElement === canvasEl) {
        camState.yaw -= e.movementX * 0.0035;
        camState.pitch = Math.max(0.08, Math.min(1.35, camState.pitch + e.movementY * 0.0035));
    }
});
```

### Seam C: Integrace virtuálního mobilního joysticku
```javascript
// src/core/InputManager.js: L90-L105
const dx = touch.clientX - startX;
const dy = touch.clientY - startY;
const dist = Math.min(maxRadius, Math.hypot(dx, dy));
const angle = Math.atan2(dy, dx);
_touchMoveVector.x = (Math.cos(angle) * dist) / maxRadius;
_touchMoveVector.y = (Math.sin(angle) * dist) / maxRadius;
```
