-- ============================================================================
-- BOBLOX SUPABASE MIGRATION v6.5
-- Tables: direct_messages, transactions, profiles updates & admin_give_coins RPC
-- ============================================================================

-- 1. Tabulka pro přímé zprávy v lobby (Cross-Device Direct Chat)
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id TEXT PRIMARY KEY DEFAULT ('msg_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 6)),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_username TEXT NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- Zapnutí RLS pro direct_messages
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Veřejné čtení direct_messages" ON public.direct_messages;
CREATE POLICY "Veřejné čtení direct_messages"
ON public.direct_messages FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Vkládání direct_messages" ON public.direct_messages;
CREATE POLICY "Vkládání direct_messages"
ON public.direct_messages FOR INSERT
WITH CHECK (true);

-- Indexy pro rychlé načítání konverzací podle partnerů
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON public.direct_messages (lower(sender_username));
CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient ON public.direct_messages (lower(recipient_username));
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON public.direct_messages (created_at ASC);


-- 2. Tabulka pro historii transakcí a Bobux výpis (Cross-Device Transactions)
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY DEFAULT ('tx_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 6)),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  amount INTEGER NOT NULL,
  game TEXT NOT NULL,
  created_at BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- Zapnutí RLS pro transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Veřejné čtení transactions" ON public.transactions;
CREATE POLICY "Veřejné čtení transactions"
ON public.transactions FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Vkládání transactions" ON public.transactions;
CREATE POLICY "Vkládání transactions"
ON public.transactions FOR INSERT
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_transactions_username ON public.transactions (lower(username));
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions (created_at DESC);


-- 3. Doplnění chybějících sloupců v profiles (zamezení 400 chyb PGRST204)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT 'Registrovaný Boblox hráč';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());


-- 4. RPC Funkce admin_give_coins s právy SECURITY DEFINER
-- Umožňuje administrátorovi (Vendeez / admin) měnit Bobuxy ostatním hráčům bez nutnosti backend serveru.
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
  -- Ověření admin oprávnění volajícího
  caller_id := auth.uid();
  IF caller_id IS NOT NULL THEN
    SELECT * INTO caller_profile FROM public.profiles WHERE id = caller_id;
    IF lower(caller_profile.username) NOT IN ('vendeez', 'admin') AND NOT coalesce(caller_profile.is_admin, false) THEN
      RAISE EXCEPTION 'Přístup odepřen: Administrátorská práva vyžadována.';
    END IF;
  END IF;

  -- Vyhledání cílového profilu
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
