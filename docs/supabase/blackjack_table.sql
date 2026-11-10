-- Apply before deploying the blackjack-table Edge Function.
CREATE TABLE IF NOT EXISTS boblox_private.blackjack_tables (
    room text PRIMARY KEY, version bigint NOT NULL, state jsonb NOT NULL
);

CREATE OR REPLACE FUNCTION public.blackjack_table_read(room_key text, actor uuid)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $$
    SELECT jsonb_build_object('state',t.state,'version',coalesce(t.version,0),
        'actor',jsonb_build_object('id',p.id,'username',p.username,'coins',p.coins,'revision',p.revision))
    FROM public.profiles p LEFT JOIN boblox_private.blackjack_tables t ON t.room=room_key
    WHERE p.id=actor
$$;

CREATE OR REPLACE FUNCTION public.blackjack_table_commit(room_key text, expected_version bigint,
    table_state jsonb, deltas jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE delta record;
BEGIN
    PERFORM pg_advisory_xact_lock(hashtextextended(room_key,6421));
    IF coalesce((SELECT version FROM boblox_private.blackjack_tables WHERE room=room_key),0) <> expected_version THEN RETURN false; END IF;
    PERFORM set_config('boblox.command','blackjack',true);
    FOR delta IN SELECT key::uuid AS id,value::integer AS amount FROM jsonb_each_text(deltas) ORDER BY key LOOP
        IF delta.amount <> 0 THEN
            UPDATE public.profiles SET coins=coins+delta.amount,revision=revision+1
            WHERE id=delta.id AND coins+delta.amount>=0;
            IF NOT FOUND THEN RAISE EXCEPTION 'Nedostatek Bobuxů.'; END IF;
        END IF;
    END LOOP;
    INSERT INTO boblox_private.blackjack_tables VALUES(room_key,expected_version+1,table_state)
    ON CONFLICT(room) DO UPDATE SET state=excluded.state,version=excluded.version;
    RETURN true;
END
$$;
REVOKE ALL ON FUNCTION public.blackjack_table_read(text,uuid),public.blackjack_table_commit(text,bigint,jsonb,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.blackjack_table_read(text,uuid),public.blackjack_table_commit(text,bigint,jsonb,jsonb) TO service_role;
