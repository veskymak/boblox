# Boblox

Boblox je 3D webová herní platforma s multiplayerem a Roblox estetikou, postavená na Three.js, vanilla JavaScriptu, WebSockets/WebRTC a Node.js/SQLite/Supabase backendu.

## 🛠️ Vývojové prostředí
- **Balíčkovací manažer:** `npm` (žádný externí bundler/build tool; klientské ES6 skripty jsou načítány napřímo přes `<script defer>` v `index.html`).
- **Lokální server:** `npm run dev` nebo `npm start` (`node server.js`).
- **Spouštění testů:** Vždy spouštějte testy pomocí `node --test` (ve Windows PowerShell má `npm.ps1` omezenou execution policy, alternativně `cmd /c npm test`).

## ⚠️ Klíčová pravidla pro všechny úkoly
1. **Cache-Busting před commitem:** Při jakékoliv úpravě v `src/` nebo `index.html` je **povinné** inkrementovat verzi `?v=X.X` v [index.html](file:///c:/Users/vacla/Desktop/Boblox/boblox/index.html) a [version.json](file:///c:/Users/vacla/Desktop/Boblox/boblox/version.json). Kompletní postup viz [Cache-Busting Workflow](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/development/cache-busting.md).
2. **Kódovací standardy a UI:** Dodržujte standardy v [CODING_STANDARDS.md](file:///c:/Users/vacla/Desktop/Boblox/boblox/CODING_STANDARDS.md) a [UI Guidelines](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/development/ui-guidelines.md) (nemažte existující DOM ID, touch targety `min-h-[44px]`, Bobux barva výhradně `text-[#FFE066]`).
3. **Transport & Bezpečnost:** Veškerá komunikace s API probíhá výhradně přes `apiRequest()`, privilegované WebSocket zprávy musí nést JWT token.
4. **Cross-Device & Backend Perzistence:** Nové funkce nesmí spoléhat pouze na `localStorage` ani na transientní WebSocket broadcasty. Veškerá uživatelská data a interakce (zprávy, přátelé, nákupy, transakce) musí mít perzistentní model na backendu (`server.js` SQLite / Supabase) a synchronizační mechanismus pro přechod mezi zařízeními (mobil <-> PC).

## 📚 Dokumentace & Standardy
- [Kódovací standardy](file:///c:/Users/vacla/Desktop/Boblox/boblox/CODING_STANDARDS.md)
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

### ⚠️ Supabase Log Query Quota & Best Practices

- **Limit (Free Plan):** 100 GB prohledaných logů na fakturační období.
- **Stav k 21. 10. 2026:** Vyčerpáno přes 60 % (~60,6 GB / 100 GB), velký jednorázový nárůst proběhl 17. 10. (~56,5 GB).
- **Vliv na produkci:** 
  - Překročení limitu **neovlivňuje** chod databáze, API ani aplikace.
    - Při dosažení 100 GB se do konce zúčtovacího období zablokuje vyhledávání a filtrování logů v administraci / Logs Exploreru.
    - **Pravidla při inspekci a ladění logů:**
      - **Vždy omezovat časový rozsah:** Nastavovat co nejkratší okno (např. *Last 15m* nebo *Last 1h*). Nikdy nepouštět široké dotazy (dny/týdny) bez nutnosti.
        - **Používat přesné filtry:** Filtrovat primárně podle cesty, stavového kódu (`status_code >= 400`) nebo ID požadavku, aby se minimalizoval objem skenovaných dat.
        