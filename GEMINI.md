# Boblox

Boblox je 3D webová herní platforma s multiplayerem a Roblox estetikou, postavená na Three.js, vanilla JavaScriptu, WebSockets/WebRTC a Node.js/SQLite/Supabase backendu.

## 🛠️ Vývojové prostředí
- **Balíčkovací manažer:** `npm` (žádný externí bundler/build tool; klientské ES6 skripty jsou načítány napřímo přes `<script defer>` v `index.html`).
- **Lokální server:** `npm run dev` nebo `npm start` (`node server.js`).

## ⚠️ Klíčová pravidla pro všechny úkoly
1. **Cache-Busting před commitem:** Při jakékoliv úpravě v `src/` nebo `index.html` je **povinné** inkrementovat verzi `?v=X.X` v [index.html](file:///c:/Users/vacla/Desktop/Boblox/boblox/index.html) a [version.json](file:///c:/Users/vacla/Desktop/Boblox/boblox/version.json). Kompletní postup viz [Cache-Busting Workflow](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/development/cache-busting.md).
2. **Zachování DOM ID a UI:** Nikdy nemaž existující DOM ID (minihry na nich přímo závisí) a dodržuj tmavé Roblox téma. Seznam ID a barevnou paletu najdeš v [UI & Compatibility Guidelines](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/development/ui-guidelines.md).

## 📚 Dokumentace
- [Přehled dokumentace](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/README.md)
- [Průvodce integrací backendu](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/integration-guide.md)
- [GitHub Pages hosting](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/github-pages/01-getting-started.md)
- [Supabase API & Realtime](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/supabase/01-getting-started-js.md)
