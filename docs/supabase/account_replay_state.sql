-- An idempotent receipt preserves the outcome, but returns the account's latest UI state.
DO $$
DECLARE definition text; original text;
BEGIN
 SELECT pg_get_functiondef('public.account_command(text,jsonb,uuid)'::regprocedure) INTO original;
 definition:=replace(original,
 'RETURN cached.result || jsonb_build_object(''user'',boblox_private.account_snapshot(uid),''serverTime'',now_ms);',
 'RETURN cached.result || jsonb_build_object(''user'',boblox_private.account_snapshot(uid),''serverTime'',now_ms,''wheelAt'',(SELECT wheel_at FROM boblox_private.casino_state WHERE user_id=uid),''extraSpin'',(SELECT extra_spin FROM boblox_private.casino_state WHERE user_id=uid));');
 IF definition=original THEN RAISE EXCEPTION 'Expected receipt branch not found'; END IF;
 EXECUTE definition;
END $$;
