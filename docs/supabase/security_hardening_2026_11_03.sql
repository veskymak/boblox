-- Applied to boblox-db via Supabase MCP on 2026-11-03.
-- Historical migration: do not rerun over an already hardened database.

CREATE SCHEMA IF NOT EXISTS boblox_private;
REVOKE ALL ON SCHEMA boblox_private FROM PUBLIC, anon, authenticated;
CREATE TABLE boblox_private.legacy_credentials AS SELECT id, password_hash FROM public.profiles;
REVOKE ALL ON boblox_private.legacy_credentials FROM PUBLIC, anon, authenticated;
UPDATE public.profiles SET password_hash = '';
ALTER TABLE public.profiles ALTER COLUMN password_hash SET DEFAULT '';

CREATE FUNCTION boblox_private.guard_profile() RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
 NEW.password_hash := '';
 IF current_user IN ('anon','authenticated') AND auth.uid() IS DISTINCT FROM '2806aa83-95cb-405d-8db4-23b95f676612'::uuid THEN
  IF TG_OP = 'INSERT' THEN
   NEW.coins := 250;
   NEW.inventory := '{"owned":["face_classic"],"outfit":{"hat":null,"face":"face_classic","pants":null,"shirt":null},"torsoHex":"#0D69AC","gamesPlayed":0}'::jsonb;
   NEW.adoptme_bucks := 120;
   NEW.adoptme_pets := '[{"id":"dog","ageIdx":0,"tasksDone":0}]'::jsonb;
   NEW.daily_claim_date := 0;
   IF lower(NEW.username) IN ('vendeez','admin') THEN RAISE EXCEPTION 'Reserved username' USING ERRCODE='42501'; END IF;
  ELSE
   IF NEW.id IS DISTINCT FROM OLD.id OR NEW.username IS DISTINCT FROM OLD.username
    OR NEW.coins IS DISTINCT FROM OLD.coins OR NEW.daily_claim_date IS DISTINCT FROM OLD.daily_claim_date
    OR NEW.adoptme_bucks IS DISTINCT FROM OLD.adoptme_bucks OR NEW.adoptme_pets IS DISTINCT FROM OLD.adoptme_pets
    OR (coalesce(NEW.inventory,'{}'::jsonb) - ARRAY['outfit','torsoHex','bio'])
       IS DISTINCT FROM (coalesce(OLD.inventory,'{}'::jsonb) - ARRAY['outfit','torsoHex','bio'])
   THEN RAISE EXCEPTION 'Protected account fields require a server operation' USING ERRCODE='42501'; END IF;
   IF EXISTS (SELECT 1 FROM jsonb_each_text(coalesce(NEW.inventory->'outfit','{}'::jsonb)) x
       WHERE x.value IS NOT NULL AND x.value <> 'null'
       AND NOT coalesce(OLD.inventory->'owned','[]'::jsonb) ? x.value)
   THEN RAISE EXCEPTION 'Item not owned' USING ERRCODE='42501'; END IF;
  END IF;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION boblox_private.guard_profile() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER guard_profile BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION boblox_private.guard_profile();

CREATE OR REPLACE FUNCTION public.admin_give_coins(target_username text, amount bigint, action text DEFAULT 'add')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE target_rec record; resulting_coins bigint;
BEGIN
 IF auth.uid() IS DISTINCT FROM '2806aa83-95cb-405d-8db4-23b95f676612'::uuid THEN
  RAISE EXCEPTION 'Access denied' USING ERRCODE='42501';
 END IF;
 IF amount IS NULL OR action IS NULL OR action NOT IN ('add','set') OR amount NOT BETWEEN -10000000 AND 10000000
 THEN RAISE EXCEPTION 'Invalid amount or action' USING ERRCODE='22023'; END IF;
 SELECT id,coins INTO target_rec FROM public.profiles WHERE lower(username)=lower(trim(target_username)) FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'User not found' USING ERRCODE='22023'; END IF;
 resulting_coins := greatest(0, CASE WHEN action='set' THEN amount ELSE coalesce(target_rec.coins,0)::bigint + amount END);
 IF resulting_coins > 2147483647 THEN RAISE EXCEPTION 'Balance overflow' USING ERRCODE='22023'; END IF;
 UPDATE public.profiles SET coins=resulting_coins,last_active_at=now() WHERE id=target_rec.id;
 RETURN jsonb_build_object('ok',true,'username',target_username,'coins',resulting_coins,'action',action);
END $$;
REVOKE ALL ON FUNCTION public.admin_give_coins(text,bigint,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_give_coins(text,bigint,text) TO authenticated;
DO $rewrite$
DECLARE definition text;
BEGIN
 SELECT pg_get_functiondef('public.admin_game_social(text,text,text)'::regprocedure) INTO definition;
 definition := replace(definition, 'auth.uid() IS NULL OR NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND lower(username) = ''vendeez''
    )', 'auth.uid() IS DISTINCT FROM ''2806aa83-95cb-405d-8db4-23b95f676612''::uuid');
 -- Handle CRLF in deployed function source.
 definition := replace(replace(definition, chr(13), ''), 'auth.uid() IS NULL OR NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND lower(username) = ''vendeez''
    )', 'auth.uid() IS DISTINCT FROM ''2806aa83-95cb-405d-8db4-23b95f676612''::uuid');
 IF position('lower(username)' in definition)>0 THEN RAISE EXCEPTION 'Admin function rewrite failed'; END IF;
 EXECUTE definition;
END $rewrite$;
REVOKE ALL ON FUNCTION public.admin_game_social(text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_game_social(text,text,text) TO authenticated;

DROP POLICY "Users can update own profile" ON public.profiles;
DROP POLICY "Admin Vendeez can update any profile" ON public.profiles;
CREATE POLICY profile_update ON public.profiles FOR UPDATE TO authenticated
USING ((select auth.uid())=id OR (select auth.uid())='2806aa83-95cb-405d-8db4-23b95f676612'::uuid)
WITH CHECK ((select auth.uid())=id OR (select auth.uid())='2806aa83-95cb-405d-8db4-23b95f676612'::uuid);
ALTER POLICY "Users can insert own profile" ON public.profiles WITH CHECK ((select auth.uid())=id);

DROP POLICY "Authenticated insert comments" ON public.comments;
CREATE POLICY comments_insert_own ON public.comments FOR INSERT TO authenticated
WITH CHECK (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=(select auth.uid()) AND p.username=comments.username));
DROP POLICY "Authenticated insert ratings" ON public.game_ratings;
DROP POLICY "Authenticated update ratings" ON public.game_ratings;
CREATE POLICY ratings_insert_own ON public.game_ratings FOR INSERT TO authenticated
WITH CHECK (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=(select auth.uid()) AND p.username=game_ratings.username));
CREATE POLICY ratings_update_own ON public.game_ratings FOR UPDATE TO authenticated
USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=(select auth.uid()) AND p.username=game_ratings.username))
WITH CHECK (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=(select auth.uid()) AND p.username=game_ratings.username));
ALTER POLICY game_ratings_delete_own ON public.game_ratings USING
(EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=(select auth.uid()) AND p.username=game_ratings.username));
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.profiles, public.comments, public.game_ratings FROM anon,authenticated;
CREATE INDEX comments_game_created_idx ON public.comments(game_id,created_at DESC);
NOTIFY pgrst, 'reload schema';

ALTER TABLE boblox_private.legacy_credentials ADD PRIMARY KEY(id);
ALTER TABLE boblox_private.legacy_credentials ENABLE ROW LEVEL SECURITY;

