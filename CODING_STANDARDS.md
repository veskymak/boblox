# Boblox Coding Standards

Dokumentované standardy pro vývoj a review kódu v projektu Boblox. Tento dokument slouží primárně jako reference pro review fázi (`code-review` skill).

---

## 1. Architektura a vrstvy

- **Správa stavu & Transport:**
  - Veškerá klientská komunikace s `/api/*` musí probíhat výhradně přes centrální funkci `apiRequest()` definovanou v [`src/state/PortalStore.js`](src/state/PortalStore.js).
  - Je zakázáno vytvářet v UI komponentách sekundární redundantní větve s přímým voláním `fetch('/api/...')`.
  - Veškerý přístup k lokálnímu úložišti (`localStorage`) musí používat zmrazený slovník `STORAGE_KEYS` v [`src/state/PortalStore.js`](src/state/PortalStore.js).

- **Perzistence a Cross-Device synchronizace (Zákaz izolovaného LocalStorage):**
  - Uživatelská data a interakce (zprávy, přátelé, nákupy, transakce, postup) musí být vázána na uživatelský profil a perzistována na backendu (`server.js` SQLite / Supabase).
  - `localStorage` slouží výhradně jako rychlá klientská mezipaměť (cache) nebo offline fallback pro statický hosting, nikoliv jako primární a jediné úložiště nových funkcí.
  - Každá nová funkce pracující s uživatelskými daty musí obsahovat:
    1. Databázovou tabulku/pole na backendu (`server.js`).
    2. Bezpečné REST API endpointy (`POST`/`GET`) s autentizací (`requireAuth`).
    3. Klientskou synchronizační funkci volanou při přihlášení (`applyAuthenticatedUser`) a při otevření daného UI pohledu.
    4. Automatizovaný integrační test ověřující dostupnost dat na novém zařízení (simulace přechodu mobil -> PC s prázdným `localStorage`).

- **UI Moduly:**
  - Každá doména má svůj dedikovaný UI modul v `src/ui/` (např. [`src/ui/AdminUI.js`](src/ui/AdminUI.js) pro administraci a dev menu).
  - Nepřidávat nesouvisející logiku do [`src/ui/PortalUI.js`](src/ui/PortalUI.js) (*Divergent Change*).

---

## 2. UI & Stylingové standardy

Kompletní specifikace viz [UI Guidelines](docs/development/ui-guidelines.md).

- **Touch Targety (Mobilní přístupnost):**
  - Všechna tlačítka, přepínače záložek a klikací prvky musí splňovat minimální rozměr 44×44px pomocí Tailwind třídy `min-h-[44px]` (a odpovídajícího zarovnání např. `flex items-center justify-center`).
  - Pravidlo platí i pro dynamicky generované nebo přepínané třídy v JavaScriptu.
- **Bobux měna:**
  - Pro zobrazení Bobux měny (B$) se používá výhradně barva `text-[#FFE066]`.
  - Je přísně zakázáno používat `text-yellow-400` nebo jiné odstíny žluté pro měnu.
- **Zachování DOM ID:**
  - Nikdy nemažte ani nepřejmenovávejte existující DOM ID. Minihry, widgety a testy na nich přímo závisí.
- **Roblox téma:**
  - Dodržujte tmavé Roblox téma (pozadí `#191B1D`, panely `#2C2F33`, tmavé karty a zaoblení).

---

## 3. Bezpečnost & Síť

- **WebSocket autorizace:**
  - Privilegované WebSocket zprávy (broadcast oznámení, manipulace se zůstatkem účtu, admin akce) musí nést a na straně `server.js` ověřovat JWT token.
  - Klientská `presence` (`msg.username`) nesmí být považována za autorizaci.

---

## 4. Verzování a Cache-Busting

Kompletní specifikace viz [Cache-Busting Workflow](docs/development/cache-busting.md).

- Při jakékoliv úpravě v `src/` nebo `index.html` je **povinné** inkrementovat verzi `?v=X.X` ve všech `<script>` tazích v [`index.html`](index.html) a v [`version.json`](version.json).
- V souborech pod `src/` se nesmí nacházet žádné hardcoded verze klienta (*SSOT guardrail*).

---

## 5. Review Smell Baseline (Fowler)

Během review kódu posuzujte kód vůči těmto standardním smellům:
- **Mysterious Name:** Název funkce nebo proměnné nevyjadřuje účel → přejmenovat.
- **Duplicated Code:** Stejná logika na více místech → extrahovat do sdílené funkce.
- **Feature Envy:** Metoda sahá do cizích dat více než do svých → přesunout metodu k datům.
- **Data Clumps:** Skupina parametrů cestující neustále společně → sjednotit do objektu/typu.
- **Primitive Obsession:** Primitivum reprezentující doménový koncept → vytvořit helper/typ.
- **Repeated Switches:** Opakované větvení `switch/if` na stejném typu → nahradit mapou nebo polymorfismem.
- **Shotgun Surgery:** Jedna změna si vynucuje úpravy v mnoha souborech → sjednotit do jednoho modulu.
- **Divergent Change:** Jeden soubor se mění z mnoha nesouvisejících důvodů → rozdělit modul.
- **Speculative Generality:** Nevyužité abstrakce přidané "pro strýčka Příhodu" → odstranit / inline.
- **Message Chains:** Dlouhé řetězení `a.b().c().d()` → zapouzdřit navigaci.
- **Middle Man:** Třída nebo funkce, která pouze deleguje dál → volat přímo cílovou funkci.
