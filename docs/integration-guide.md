# Průvodce migrací Boblox: Node.js / SQLite ➔ GitHub Pages + Supabase

Tento návod vysvětluje, jak převést stávající projekt Boblox z lokálního serveru (`server.js` + `boblox.db` SQLite) na moderní bezserverovou architekturu hostovanou na **GitHub Pages** se **Supabase** jako backendem.

---

## 1. Srovnání architektur

| Vlastnost | Původní architektura | Nová architektura |
| :--- | :--- | :--- |
| **Hosting webu** | Lokální Node.js server (`http://localhost:3000`) | **GitHub Pages** (`https://<username>.github.io/boblox/`) |
| **Databáze** | SQLite soubor (`boblox.db`) | **Supabase PostgreSQL** v cloudu |
| **Autentizace** | Vlastní sessions v Express.js | **Supabase Auth** (JWT tokeny, bezpečné heslá, OAuth) |
| **Realtime** | WebSocket / Polling na server.js | **Supabase Realtime** kanály |
| **Náklady & Provoz** | Vyžaduje běžící VPS / server | **100% Zdarma** (GitHub Pages Free + Supabase Free Tier) |

---

## 2. Krok 1: Vytvoření tabulek v Supabase

V Supabase Dashboardu otevřete **SQL Editor** a vytvořte základní tabulky odpovídající Bobloxu:

```sql
-- 1. Tabulka profilů hráčů (propojená se Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  score INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  last_login_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migrace pro již existující tabulky:
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();

-- Zapnutí zabezpečení RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Kdokoli může číst žebříček
CREATE POLICY "Veřejný přístup ke skóre" 
ON public.profiles FOR SELECT 
USING (true);

-- Uživatel může upravovat pouze svůj profil
CREATE POLICY "Vlastní úprava profilu" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 2. Automatické vytvoření profilu po registraci uživatele
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, score, coins)
  VALUES (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 0, 100);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Tabulka pro přímé zprávy (Direct Chat) a transakce v cloudu
-- Kompletní skript viz docs/supabase/schema_update_v6.5.sql
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id TEXT PRIMARY KEY DEFAULT ('msg_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 6)),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_username TEXT NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint
);
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Veřejné čtení direct_messages" ON public.direct_messages FOR SELECT USING (true);
CREATE POLICY "Vkládání direct_messages" ON public.direct_messages FOR INSERT WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY DEFAULT ('tx_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 6)),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  amount INTEGER NOT NULL,
  game TEXT NOT NULL,
  created_at BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Veřejné čtení transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Vkládání transactions" ON public.transactions FOR INSERT WITH CHECK (true);

-- 4. Admin RPC funkce pro změnu Bobuxů (SECURITY DEFINER obchází RLS pro administrátory)
CREATE OR REPLACE FUNCTION public.admin_give_coins(
  target_username TEXT,
  amount INTEGER,
  action TEXT DEFAULT 'add'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID;
  caller_profile RECORD;
  target_profile RECORD;
  calculated_coins INTEGER;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NOT NULL THEN
    SELECT * INTO caller_profile FROM public.profiles WHERE id = caller_id;
    IF lower(caller_profile.username) NOT IN ('vendeez', 'admin') AND NOT coalesce(caller_profile.is_admin, false) THEN
      RAISE EXCEPTION 'Přístup odepřen: Administrátorská práva vyžadována.';
    END IF;
  END IF;

  SELECT * INTO target_profile FROM public.profiles WHERE lower(username) = lower(trim(target_username));
  IF target_profile.id IS NULL THEN
    RAISE EXCEPTION 'Uživatel % nebyl v cloudu nalezen.', target_username;
  END IF;

  IF action = 'set' THEN
    calculated_coins := GREATEST(0, amount);
  ELSE
    calculated_coins := GREATEST(0, coalesce(target_profile.coins, 0) + amount);
  END IF;

  UPDATE public.profiles
  SET coins = calculated_coins, last_active_at = timezone('utc'::text, now())
  WHERE id = target_profile.id;

  RETURN jsonb_build_object(
    'ok', true,
    'username', target_profile.username,
    'coins', calculated_coins,
    'diff', calculated_coins - coalesce(target_profile.coins, 0),
    'action', action
  );
END;
$$;
```

---

## 3. Krok 2: Úprava `index.html` pro přímé volání Supabase

V původním kódu jste pravděpodobně volali `fetch('/api/login')` nebo `fetch('/api/score')`. V nové architektuře voláte přímo Supabase klienta:

```html
<!-- Přidejte do hlavičky index.html -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<script>
  // Nastavení Supabase
  const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
  const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Příklad: Načtení žebříčku nejlepších hráčů
  async function nacistZebriček() {
    const { data: topPlayers, error } = await db
      .from('profiles')
      .select('username, score')
      .order('score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Chyba načítání žebříčku:', error);
      return;
    }

    console.log('Žebříček:', topPlayers);
  }

  // Příklad: Uložení nového skóre po skončení hry
  async function ulozitSkore(noveSkore) {
    const { data: { user } } = await db.auth.getUser();
    if (!user) {
      alert('Pro uložení skóre se musíte přihlásit!');
      return;
    }

    const { error } = await db
      .from('profiles')
      .update({ score: noveSkore })
      .eq('id', user.id);

    if (error) console.error('Chyba ukládání:', error);
  }
</script>
```

---

## 4. Krok 3: Nasazení na GitHub Pages

1. Ujistěte se, že kořen repozitáře obsahuje `index.html`.
2. Vytvořte v kořenu prázdný soubor `.nojekyll`.
3. Odešlete změny do GitHub repozitáře:
   ```bash
   git add .
   git commit -m "Přechod na GitHub Pages a Supabase"
   git push origin main
   ```
4. Na GitHubu v **Settings** -> **Pages** zvolte větev `main` a složku `/ (root)`.
5. Web bude během chvíle dostupný na adrese:
   `https://<vase-jmeno>.github.io/boblox/`

