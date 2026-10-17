# Supabase: Začínáme s JavaScript SDK

Supabase je open-source alternativa k Firebase postavená na PostgreSQL. Poskytuje databázi, autentizaci, úložiště souborů, realtime přenosy a serverless funkce přístupné přímo z prohlížeče.

---

## 1. Získání klíčů v Supabase Dashboardu

1. Zaregistrujte se na [supabase.com](https://supabase.com) a vytvořte nový projekt.
2. V levém menu otevřete **Project Settings** -> **API**.
3. Zkopírujte:
   - **Project URL** (např. `https://xyzcompany.supabase.co`)
   - **Project API Keys** -> `anon` / `public` (veřejný klíč bezpečný pro použití v klientském JavaScriptu)

> [!CAUTION]
> Nikdy do klientského kódu v prohlížeči nevkládejte klíč `service_role`! Klíč `service_role` obchází veškerou bezpečnost Row Level Security (RLS) a patří výhradně na bezpečný privátní server.

---

## 2. Připojení klienta

### Metoda A: Přes CDN přímo v HTML (ideální pro GitHub Pages bez bundleru)
Vložte následující `<script>` do hlavičky vašeho `index.html`:

```html
<!-- Supabase JS Client v2 z CDN -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<script>
  const SUPABASE_URL = 'https://tvuj-projekt.supabase.co';
  const SUPABASE_ANON_KEY = 'tvuj-verejny-anon-klic';

  // Inicializace klienta
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  console.log('Supabase klient připraven:', supabase);
</script>
```

### Metoda B: Přes NPM (pokud používáte bundler jako Vite, Webpack apod.)
```bash
npm install @supabase/supabase-js
```

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tvuj-projekt.supabase.co';
const supabaseAnonKey = 'tvuj-verejny-anon-klic';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 3. Ověření funkčnosti spojení

Rychlý test dotazem na libovolnou existující tabulku:

```javascript
async function testConnection() {
  const { data, error } = await supabase.from('users').select('count');
  if (error) {
    console.error('Chyba spojení se Supabase:', error.message);
  } else {
    console.log('Úspěšně připojeno k Supabase databázi!');
  }
}
testConnection();
```

