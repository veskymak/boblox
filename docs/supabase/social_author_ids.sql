-- Bind social writes to immutable verified authors and enforce server-side comment limits.
ALTER TABLE public.comments ADD COLUMN user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.game_ratings ADD COLUMN user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
UPDATE public.comments c SET user_id=p.id FROM public.profiles p WHERE p.username=c.username;
UPDATE public.game_ratings r SET user_id=p.id FROM public.profiles p WHERE p.username=r.username;
CREATE INDEX comments_author_time ON public.comments(user_id,created_at DESC);
CREATE INDEX ratings_author ON public.game_ratings(user_id);
CREATE FUNCTION boblox_private.bind_social_author() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE uid uuid:=auth.uid(); author text;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
 SELECT username INTO author FROM public.profiles WHERE id=uid;
 IF author IS NULL OR NEW.username IS DISTINCT FROM author OR (NEW.user_id IS NOT NULL AND NEW.user_id IS DISTINCT FROM uid) THEN RAISE EXCEPTION 'Invalid author' USING ERRCODE='42501'; END IF;
 IF TG_OP='UPDATE' AND (OLD.user_id IS DISTINCT FROM uid OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.username IS DISTINCT FROM OLD.username OR NEW.game_id IS DISTINCT FROM OLD.game_id) THEN RAISE EXCEPTION 'Cannot reassign a vote' USING ERRCODE='42501'; END IF;
 IF NEW.game_id NOT IN ('adoptme','obby','lava','sfoth','tycoon','disasters','toh','zombies','speedrun','hideandseek','bedwars','casino') THEN RAISE EXCEPTION 'Unknown game' USING ERRCODE='22023'; END IF;
 NEW.user_id:=uid;
 IF TG_TABLE_NAME='comments' THEN
  IF length(trim(NEW.content)) NOT BETWEEN 1 AND 250 THEN RAISE EXCEPTION 'Comment must contain 1 to 250 characters' USING ERRCODE='22023'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(uid::text,1));
  IF EXISTS(SELECT 1 FROM public.comments WHERE user_id=uid AND created_at>clock_timestamp()-interval '30 seconds') THEN RAISE EXCEPTION 'Comment cooldown' USING ERRCODE='22023'; END IF;
  NEW.created_at:=clock_timestamp();
 ELSE NEW.updated_at:=clock_timestamp(); END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION boblox_private.bind_social_author() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER comments_verified_author BEFORE INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION boblox_private.bind_social_author();
CREATE TRIGGER ratings_verified_author BEFORE INSERT OR UPDATE ON public.game_ratings FOR EACH ROW EXECUTE FUNCTION boblox_private.bind_social_author();
ALTER POLICY comments_insert_own ON public.comments WITH CHECK ((select auth.uid())=user_id);
ALTER POLICY ratings_insert_own ON public.game_ratings WITH CHECK ((select auth.uid())=user_id);
ALTER POLICY ratings_update_own ON public.game_ratings USING ((select auth.uid())=user_id) WITH CHECK ((select auth.uid())=user_id);
ALTER POLICY game_ratings_delete_own ON public.game_ratings USING ((select auth.uid())=user_id);
NOTIFY pgrst,'reload schema';
