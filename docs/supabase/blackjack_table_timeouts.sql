-- Persist the deterministic all-stand outcome alongside the private shoe. This also
-- settles empty private rooms when every player has closed the game.
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE INDEX IF NOT EXISTS blackjack_table_idle_due ON boblox_private.blackjack_tables
    (((state->'idle'->>'due')::bigint)) WHERE state ? 'idle';
CREATE OR REPLACE FUNCTION boblox_private.settle_idle_blackjack()
RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE t record;
BEGIN
    FOR t IN SELECT room,version,state->'idle' AS outcome FROM boblox_private.blackjack_tables
        WHERE state ? 'idle' AND (state->'idle'->>'due')::bigint <= extract(epoch FROM now())*1000
        ORDER BY room LIMIT 100 LOOP
        PERFORM public.blackjack_table_commit(t.room,t.version,t.outcome->'state',t.outcome->'changes');
    END LOOP;
END
$$;
REVOKE ALL ON FUNCTION boblox_private.settle_idle_blackjack() FROM PUBLIC,anon,authenticated;
SELECT cron.schedule('boblox-settle-idle-blackjack','* * * * *','SELECT boblox_private.settle_idle_blackjack()');
