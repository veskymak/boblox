# 🚀 Cache-Busting & Release Workflow

Pravidla pro verzování a nasazení frontendových skriptů v projektu Boblox na GitHub Pages.

---

## 📌 Proč je to nutné
Prohlížeče hráčů na GitHub Pages agresivně cachují JavaScriptové soubory. Bez explicitního cache-bustingu by hráči po aktualizaci kódu viděli staré skripty, padaly by herní mechaniky nebo by museli provádět tvrdý refresh (`Ctrl + Shift + R`). 

Díky tomuto postupu:
1. Změna verze `?v=X.X` v URL skriptu okamžitě donutí prohlížeč stáhnout nový kód.
2. Změna ve `version.json` automaticky aktivuje in-game banner a modal v reálném čase, který hráči nabídne rychlý restart hry.

---

## 📋 Postup před commitem

Kdykoliv upravíš **jakýkoliv skript v `src/`** (`src/core/`, `src/state/`, `src/ui/`, `src/games/`, `src/network/`) nebo samotný `index.html`:

### 1. Inkrementuj verzi v `index.html`
Na konci souboru [index.html](file:///c:/Users/vacla/Desktop/Boblox/boblox/index.html) vyhledej sekci modulárních skriptů a zvedni verzi `?v=X.X` (např. z `?v=4.2` na `?v=4.3`):
```html
<!-- BOBLOX Modular Architecture (Core Engine, State, Network, Games & UI with Cache-Busting) -->
<script src="src/core/SoundEngine.js?v=4.3" defer></script>
<script src="src/state/PortalStore.js?v=4.3" defer></script>
<script src="src/network/NetworkManager.js?v=4.3" defer></script>
<script src="src/ui/PortalUI.js?v=4.3" defer></script>
<script src="src/core/AvatarAndShop.js?v=4.3" defer></script>
<script src="src/core/Engine.js?v=4.3" defer></script>
<script src="src/games/GameWorlds.js?v=4.3" defer></script>
<script src="src/core/PhysicsAndLoop.js?v=4.3" defer></script>
<script src="src/core/InputManager.js?v=4.3" defer></script>
```

### 2. Inkrementuj `version.json`
V souboru [version.json](file:///c:/Users/vacla/Desktop/Boblox/boblox/version.json) aktualizuj verzi, čas sestavení a stručný popis změn:
```json
{
  "version": "4.3",
  "buildTime": 1792272000000,
  "updatedAt": "2026-10-18T15:00:00Z",
  "title": "Boblox Aktualizace v4.3",
  "message": "Stručný popis provedených změn pro hráče."
}
```

### 3. Zachování No-Cache Meta Tagů
Ujisti se, že v `<head>` v [index.html](file:///c:/Users/vacla/Desktop/Boblox/boblox/index.html) zůstávají meta tagy proti ukládání HTML do mezipaměti:
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

### 4. Jediný zdroj pravdy (SSOT) & Pravidla pro kód
- **Žádné statické verze v `src/`:** Klientské skripty ve složce `src/` **nesmí** obsahovat natvrdo definované konstanty či proměnné verze (např. `BOBLOX_CLIENT_VERSION = 'X.X'`).
- **Detekce verze klienta výhradně z DOMu:** Funkce `getAppClientVersion()` detekuje verzi parsováním parametru `?v=X.X` z tagů `<script src="...">` v [index.html](file:///c:/Users/vacla/Desktop/Boblox/boblox/index.html). Pokud v DOMu žádný tag nenajde, vrací `null`, nikoliv statický řetězec.
- **Automatická kontrola:** Test `test/update-detection.test.js` v rámci pre-commit hooku hlídá shodu verzí mezi `index.html` a `version.json` a zakazuje jakékoliv konstanty verzí v `src/`.

### 5. Git Commit
Teprve po provedení výše uvedených kroků commituj změny do gitu:
```bash
git add .
git commit -m "feat/fix: Popis změn a bump na vX.X"
```

> **Poznámka:** Změny, které se týkají **pouze** backendu (`server.js`), dokumentace (`docs/`, `*.md`) nebo konfigurace (`package.json`), nevyžadují bump frontendové cache verze.

