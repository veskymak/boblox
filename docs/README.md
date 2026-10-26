# Dokumentace: GitHub Pages & Supabase

Tato složka obsahuje kompletní referenční dokumentaci a návody pro provoz a vývoj webové aplikace na **GitHub Pages** s backendem na **Supabase**.

---

## 📁 Struktura dokumentace

### 1. GitHub Pages (`/docs/github-pages/`)
- [`01-getting-started.md`](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/github-pages/01-getting-started.md) – Zprovoznění GitHub Pages, výběr větve, struktura projektu.
- [`02-custom-domains-and-https.md`](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/github-pages/02-custom-domains-and-https.md) – Vlastní doména, CNAME, DNS záznamy, HTTPS.
- [`03-spa-routing-and-limits.md`](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/github-pages/03-spa-routing-and-limits.md) – SPA routing (404.html trik), limity hostingu, `.nojekyll`.
- [`04-github-actions-deployment.md`](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/github-pages/04-github-actions-deployment.md) – Automatické nasazení přes GitHub Actions workflow.

### 2. Supabase (`/docs/supabase/`)
- [`01-getting-started-js.md`](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/supabase/01-getting-started-js.md) – Inicializace klienta (CDN i NPM), konfigurace API klíčů.
- [`02-database-crud.md`](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/supabase/02-database-crud.md) – Práce s databází (Select, Insert, Update, Delete, filtry, relace).
- [`03-auth.md`](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/supabase/03-auth.md) – Autentizace uživatelů (registrace, přihlášení, relace, OAuth).
- [`04-row-level-security-rls.md`](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/supabase/04-row-level-security-rls.md) – Bezpečnost dat pomocí RLS politik v PostgreSQL.
- [`05-realtime.md`](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/supabase/05-realtime.md) – WebSockets odběr změn v databázi v reálném čase.
- [`06-storage.md`](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/supabase/06-storage.md) – Správa souborů, upload obrázků a veřejné URL.
- [`07-edge-functions.md`](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/supabase/07-edge-functions.md) – Serverless funkce pro operace vyžadující tajné klíče.

### 3. Integrační průvodce (`/docs/integration-guide.md`)
- [`integration-guide.md`](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/integration-guide.md) – Jak propojit statický frontend na GitHub Pages se Supabase backendem a migrovat z lokálního Node.js / SQLite řešení.

### 4. Vývojové standardy a workflow (`/docs/development/`)
- [`cache-busting.md`](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/development/cache-busting.md) – Povinný postup verzování frontendových skriptů před commitem.
- [`ui-guidelines.md`](file:///c:/Users/vacla/Desktop/Boblox/boblox/docs/development/ui-guidelines.md) – Kritická DOM ID, barevná paleta Roblox tématu a podpora mobilního ovládání.


### 5. AI Context Layer (/docs/ai_context/)
- [INDEX.md](ai_context/INDEX.md) – Strojově čitelná dokumentace architektury pro AI agenty (Self-Maintaining Protocol).
