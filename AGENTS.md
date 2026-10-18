# Boblox

Boblox je 3D webová herní platforma s multiplayerem a Roblox estetikou, postavená na Three.js, vanilla JavaScriptu, WebSockets/WebRTC a Node.js/SQLite/Supabase backendu.

## 🛠️ Vývojové prostředí
- **Balíčkovací manažer:** `npm` (žádný externí bundler/build tool; klientské ES6 skripty jsou načítány napřímo přes `<script defer>` v `index.html`).
- **Lokální server:** `npm run dev` nebo `npm start` (`node server.js`).
- **Spouštění testů:** Vždy spouštějte testy pomocí `node --test` (ve Windows PowerShell má `npm.ps1` omezenou execution policy, alternativně `cmd /c npm test`).

## ⚠️ Klíčová pravidla pro všechny úkoly
1. **Cache-Busting před commitem:** Při jakékoliv úpravě v `src/` nebo `index.html` je **povinné** inkrementovat verzi `?v=X.X` v [index.html](file:///c:/Users/vacla/Desktop/Boblox/boblox/index.html) a [version.json](file:///c:/Users/vacla/Desktop/Boblox/boblox/version.json). Kompletní postup viz [Cache-Busting Workflow](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/development/cache-busting.md).
2. **Zachování DOM ID a UI:** Nikdy nemaž existující DOM ID (minihry na nich přímo závisí) a dodržuj tmavé Roblox téma. Seznam ID a barevnou paletu najdeš v [UI & Compatibility Guidelines](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/development/ui-guidelines.md).
3. **WebSocket Bezpečnost:** Privilegované WebSocket zprávy (administrátorské vysílání, manipulace s účtem) musí vždy nést a ověřovat JWT token v `server.js`. Klientská `presence` (`msg.username`) nesmí být považována za autorizaci.
4. **Touch Targety & Bobux barva:** Tlačítka a klikací prvky musí splňovat minimální rozměr 44×44px (`min-h-[44px]`). Bobux měna musí používat výhradně barvu `text-[#FFE066]` (nikdy `text-yellow-400`).

## 📚 Dokumentace
- [Přehled dokumentace](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/README.md)
- [Průvodce integrací backendu](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/integration-guide.md)
- [GitHub Pages hosting](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/github-pages/01-getting-started.md)
- [Supabase API & Realtime](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/supabase/01-getting-started-js.md)

## Agent skills

### Issue tracker

GitHub Issues at https://github.com/veskymak/boblox. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical triage label vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repository layout (`GLOSSARY.md` and `docs/adr/`). See `docs/agents/domain.md`.
