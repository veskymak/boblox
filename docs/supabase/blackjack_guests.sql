-- Guest capabilities and wallets stay in the private schema.
CREATE TABLE IF NOT EXISTS boblox_private.blackjack_guests (
    token_hash text PRIMARY KEY CHECK (token_hash ~ '^[a-f0-9]{64}$'),
    username text NOT NULL,
    coins integer NOT NULL DEFAULT 250 CHECK (coins >= 0)
);
CREATE TABLE IF NOT EXISTS boblox_private.blackjack_guest_ledger (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash text NOT NULL REFERENCES boblox_private.blackjack_guests(token_hash),
    amount integer NOT NULL,
    balance_after integer NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

DROP FUNCTION IF EXISTS public.blackjack_guest_open(text,boolean);
CREATE OR REPLACE FUNCTION public.blackjack_guest_open(token_hash text, create_guest boolean, guest_name text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
    IF token_hash !~ '^[a-f0-9]{64}$' THEN RETURN false; END IF;
    IF create_guest THEN
        INSERT INTO boblox_private.blackjack_guests(token_hash,username)
        VALUES(token_hash,CASE WHEN guest_name ~ '^Guest [0-9]{4}$' THEN guest_name ELSE 'Guest ' || (1000+floor(random()*9000))::integer END)
        ON CONFLICT DO NOTHING;
    END IF;
    RETURN EXISTS(SELECT FROM boblox_private.blackjack_guests g WHERE g.token_hash=blackjack_guest_open.token_hash);
END
$$;

CREATE OR REPLACE FUNCTION public.blackjack_guest_table_read(room_key text, token_hash text)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $$
    SELECT jsonb_build_object('state',t.state,'version',coalesce(t.version,0),
        'actor',jsonb_build_object('id','guest:' || g.token_hash,'username',g.username,'coins',g.coins))
    FROM boblox_private.blackjack_guests g LEFT JOIN boblox_private.blackjack_tables t ON t.room=room_key
    WHERE g.token_hash=blackjack_guest_table_read.token_hash
$$;

CREATE OR REPLACE FUNCTION public.blackjack_table_commit(room_key text, expected_version bigint,
    table_state jsonb, deltas jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE delta record; new_balance integer;
BEGIN
    PERFORM pg_advisory_xact_lock(hashtextextended(room_key,6421));
    IF coalesce((SELECT version FROM boblox_private.blackjack_tables WHERE room=room_key),0) <> expected_version THEN RETURN false; END IF;
    PERFORM set_config('boblox.command','blackjack',true);
    FOR delta IN SELECT key AS id,value::integer AS amount FROM jsonb_each_text(deltas) ORDER BY key LOOP
        IF delta.amount <> 0 THEN
            IF left(delta.id,6)='guest:' THEN
                UPDATE boblox_private.blackjack_guests SET coins=coins+delta.amount
                WHERE token_hash=substring(delta.id FROM 7) AND coins+delta.amount>=0
                RETURNING coins INTO new_balance;
                IF NOT FOUND THEN RAISE EXCEPTION 'Nedostatek Bobuxů.'; END IF;
                INSERT INTO boblox_private.blackjack_guest_ledger(token_hash,amount,balance_after)
                VALUES(substring(delta.id FROM 7),delta.amount,new_balance);
            ELSE
                UPDATE public.profiles SET coins=coins+delta.amount,revision=revision+1
                WHERE id=delta.id::uuid AND coins+delta.amount>=0;
                IF NOT FOUND THEN RAISE EXCEPTION 'Nedostatek Bobuxů.'; END IF;
            END IF;
        END IF;
    END LOOP;
    INSERT INTO boblox_private.blackjack_tables VALUES(room_key,expected_version+1,table_state)
    ON CONFLICT(room) DO UPDATE SET state=excluded.state,version=excluded.version;
    RETURN true;
END
$$;
REVOKE ALL ON FUNCTION public.blackjack_guest_open(text,boolean,text),public.blackjack_guest_table_read(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.blackjack_guest_open(text,boolean,text),public.blackjack_guest_table_read(text,text) TO service_role;
