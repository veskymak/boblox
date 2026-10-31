-- Run once in Supabase SQL Editor before deploying the moderation UI.
-- JWT identity is checked in the database, never from a caller-supplied username.
CREATE OR REPLACE FUNCTION public.admin_game_social(
    target_game text, moderation_action text, target_comment text DEFAULT ''
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE result jsonb;
BEGIN
    IF auth.uid() IS NULL OR NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND lower(username) = 'vendeez'
    ) THEN
        RAISE EXCEPTION 'Access denied' USING ERRCODE = '42501';
    END IF;
    IF target_game NOT IN ('adoptme','obby','lava','sfoth','tycoon','disasters','toh','zombies','speedrun','hideandseek','bedwars','casino') THEN
        RAISE EXCEPTION 'Unknown game';
    END IF;
    IF moderation_action = 'social' THEN
        SELECT jsonb_build_object(
            'ratings', COALESCE((SELECT jsonb_agg(to_jsonb(r) ORDER BY r.updated_at DESC) FROM
                (SELECT username, vote, updated_at FROM public.game_ratings WHERE game_id = target_game) r), '[]'::jsonb),
            'comments', COALESCE((SELECT jsonb_agg(to_jsonb(c) ORDER BY c.created_at DESC) FROM
                (SELECT id, username, content, created_at FROM public.comments WHERE game_id = target_game) c), '[]'::jsonb)
        ) INTO result;
        RETURN result;
    ELSIF moderation_action = 'reset-ratings' THEN
        DELETE FROM public.game_ratings WHERE game_id = target_game;
        -- Some installations retain a legacy profile JSON mirror.
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'game_ratings') THEN
            EXECUTE 'UPDATE public.profiles SET game_ratings = COALESCE(game_ratings::jsonb, ''{}''::jsonb) - $1' USING target_game;
        END IF;
    ELSIF moderation_action = 'delete-comment' THEN
        DELETE FROM public.comments WHERE game_id = target_game AND id::text = target_comment;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'comments') THEN
            EXECUTE 'UPDATE public.profiles SET comments = COALESCE((SELECT jsonb_agg(c) FROM jsonb_array_elements(COALESCE(comments::jsonb, ''[]''::jsonb)) c WHERE NOT (c->>''gameId'' = $1 AND c->>''id'' = $2)), ''[]''::jsonb)' USING target_game, target_comment;
        END IF;
    ELSE
        RAISE EXCEPTION 'Unknown action';
    END IF;
    RETURN jsonb_build_object('ok', true);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_game_social(text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_game_social(text,text,text) TO authenticated;

-- Players may remove only their own votes. Existing read/write policies remain.
ALTER TABLE public.game_ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS game_ratings_delete_own ON public.game_ratings;
CREATE POLICY game_ratings_delete_own ON public.game_ratings
FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid()
        AND p.username = game_ratings.username)
);
GRANT DELETE ON public.game_ratings TO authenticated;
