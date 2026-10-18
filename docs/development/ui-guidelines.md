# 🎮 UI & Compatibility Guidelines

Pravidla pro vývoj a úpravy uživatelského rozhraní (UI), herního HUDu a responsivity v Bobloxu.

---

## 🔒 1. Kritická herní DOM ID (NEMAŽAT!)
Jednotlivé 3D minihry v `src/games/GameWorlds.js`, herní engine `src/core/Engine.js` a `src/ui/PortalUI.js` vyhledávají prvky přímo přes `document.getElementById(...)`. 

Odstranění nebo přejmenování těchto ID způsobí pád běhu hry:

### HUD & Herní zobrazení
- `#three-canvas` – Hlavní WebGL canvas pro Three.js vykreslování
- `#game-viewport` – Kontejner 3D scény
- `#hud-game-title` – Název aktuálně spuštěné minihry
- `#hud-objective-title` – Cíl mise (zobrazuje úkol v Obby, Laser Run, atd.)
- `#hud-objective-text` – Popis úkolu
- `#hud-extra-label` / `#hud-extra-value` – Doplňková počítadla (checkpointy, skóre, kola)
- `#hud-hp-bar` / `#hud-hp-text` – Zobrazení zdraví hráče
- `#hud-fps` – Počítadlo snímkové frekvence
- `#hud-bobux-count` – Měna hráče v HUDu
- `#hud-active-weapon-name` / `#hud-active-weapon-stats` – Výzbroj hráče
- `#damage-flash` – Celoobrazovkový červený záblesk při poškození

### Živý Update & Notifikace
- `#update-floating-bar` / `#update-float-secs` – Plovoucí lišta s odpočtem updatu
- `#update-modal` / `#update-countdown-bar` / `#update-countdown-text` – Modální okno s výzvou k restartu

### Mobilní & Dotykové ovládání
- `#mobile-touch-controls` – Hlavní overlay dotykového ovládání
- `#touch-joystick-zone` / `#touch-joystick-base` / `#touch-joystick-knob` – Virtuální joystick
- `#touch-jump-btn` – Dotykové tlačítko pro skok
- `#touch-action-btn` – Dotykové tlačítko pro akci/útok
- `#roblox-camera-touch-zone` – Zóna pro otáčení kamery tažením prstu

---

## 🎨 2. Barevná paleta (Roblox 2021+ Dark Theme)
Při tvorbě nových modálů, tlačítek a karet se drž konzistentní barevné palety:

| Prvek | Hex kód | Tailwind ekvivalent / Použití |
| :--- | :--- | :--- |
| **Základní pozadí** | `#191B1D` | `bg-[#191B1D]` (nejtmavší vrstva, overlay, spodní lišty) |
| **Karty a modály** | `#232527` | `bg-[#232527]` (tělo vyskakovacích oken a karet) |
| **Prvky a tlačítka** | `#2C2F33` | `bg-[#2C2F33]` (sekundární tlačítka, vstupy) |
| **Hover stavy** | `#393B3D` | `hover:bg-[#393B3D]` (zvýraznění tlačítek) |
| **Akcentní modrá** | `#00A2FF` | `text-[#00A2FF]`, `bg-[#00A2FF]` (hlavní Roblox modrá, CTA) |
| **Akcentní zelená** | `#00B06F` | `text-[#00B06F]`, `bg-[#00B06F]` (potvrzení, nákup, online) |
| **Výdaj / Chyba** | `#FF4D4D` | `text-[#FF4D4D]` (záporné transakce, výdaje, sázky) |
| **Bobux Zlatá** | `#FFE066` | `text-[#FFE066]` (Bobux měna, mince, transakční ikona) |

---

## 📱 3. Responsivita a dotykové ovládání
1. **Desktop vs Mobil**:
   - Všechny herní mechaniky musí mít alternativu pro dotykové zařízení (podpora `touchstart`/`touchmove` nebo propojení s `#touch-action-btn` / `#touch-jump-btn`).
   - UI modály musí mít dostatečný `touch target` (minimálně 44x44px pro tlačítka).
2. **Přizpůsobení oknu**:
   - Three.js plátno se automaticky přizpůsobuje pomocí `window.addEventListener('resize', ...)`.
   - Modální okna používají Tailwind třídy `max-w-md w-full mx-4` a responzivní paddingy `p-4 sm:p-6`.

