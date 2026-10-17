# BOBLOX - Instrukce a pravidla pro Antigravity

Vítej v projektu Boblox (3D herní portál s multiplayerem a Roblox estetikou). Při práci na tomto projektu vždy dodržuj následující pravidla:

---

## 🚀 1. POVINNÝ Cache-Busting před každým commitem
Kdykoliv upravíš jakýkoliv skript v `src/` (`src/core/`, `src/state/`, `src/ui/`, `src/games/`, `src/network/`) nebo samotný `index.html`:
1. **PŘED commitem VŽDY otevři [index.html](file:///c:/Users/vacla/Desktop/Boblox/boblox/index.html)**.
2. Na konci souboru najdi sekci modulárních skriptů:
   ```html
   <!-- BOBLOX Modular Architecture (Core Engine, State, Network, Games & UI with Cache-Busting) -->
   <script src="src/core/SoundEngine.js?v=X.X" defer></script>
   <script src="src/state/PortalStore.js?v=X.X" defer></script>
   ...
   ```
3. **Inkrementuj verzi `?v=X.X`** na novou hodnotu (např. z `?v=2.3` na `?v=2.4`).
4. Ujisti se, že v `<head>` v `index.html` zůstávají meta tagy pro zákaz cachování HTML:
   ```html
   <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
   <meta http-equiv="Pragma" content="no-cache">
   <meta http-equiv="Expires" content="0">
   ```
5. Teprve po inkrementaci verze v `index.html` proveď `git add` a `git commit`.

> **Proč:** Hráči na webu (GitHub Pages) si jinak stahují staré soubory z mezipaměti prohlížeče a museli by mačkat `Ctrl + Shift + R`. Inkrementace verze zajistí okamžité automatické načtení nového kódu všem hráčům hned napoprvé.

---

## 🎮 2. Zachování herních ID a kompatibility
- **Nikdy nemaž existující DOM ID** (`#three-canvas`, `#hud-hp-bar`, `#hud-game-title`, `#hud-fps`, `#hud-objective-title`, atd.) – minihry v `GameWorlds.js` na nich přímo závisí.
- **Responzivita**: Všechny nové UI prvky musí fungovat jak na PC s myší/klávesnicí, tak na mobilních zařízeních s dotykovým ovládáním.
- **Konzistence stylů**: Drž se Roblox 2021–současnost tmavého UI tématu (`#191B1D`, `#232527`, `#2C2F33`, `#393B3D`, modrá `#00A2FF`, zelená `#00B06F`).
