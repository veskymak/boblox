-- Run as the project database owner. All fixture changes are rolled back.
BEGIN;
CREATE TEMP TABLE audit_results(test text, passed boolean);
GRANT INSERT ON audit_results TO authenticated,anon;
SELECT set_config('request.jwt.claim.sub',(SELECT p.id::text FROM public.profiles p JOIN auth.users a ON a.id=p.id WHERE p.id<>'2806aa83-95cb-405d-8db4-23b95f676612'::uuid LIMIT 1),true);
UPDATE public.profiles SET coins=5000,daily_claim_date=0 WHERE id=auth.uid();
UPDATE public.comments SET created_at=now()-interval '1 minute' WHERE user_id=auth.uid();
SET LOCAL ROLE authenticated;
DO $$
DECLARE first jsonb; second jsonb; command_id uuid:=gen_random_uuid(); balance integer; target text; response jsonb;
BEGIN
 first:=public.account_command('slots','{"bet":25}',command_id);
 balance:=(first->'user'->>'coins')::integer;
 IF balance<>5000-25+(first->>'payout')::integer THEN RAISE EXCEPTION 'Incorrect settlement'; END IF;
 second:=public.account_command('slots','{"bet":25}',command_id);
 IF second->'user'->>'coins' IS DISTINCT FROM first->'user'->>'coins' OR second->'reels' IS DISTINCT FROM first->'reels' THEN RAISE EXCEPTION 'Replay paid twice'; END IF;
 INSERT INTO audit_results VALUES('server settlement and replay',true);
 BEGIN
  PERFORM public.account_command('slots','{"bet":50}',command_id);
  RAISE EXCEPTION 'Replay accepted different payload';
 EXCEPTION WHEN invalid_parameter_value THEN INSERT INTO audit_results VALUES('mismatched replay rejected',true); END;
 first:=public.account_command('daily','{}',gen_random_uuid());
 BEGIN
  PERFORM public.account_command('daily','{}',gen_random_uuid());
  RAISE EXCEPTION 'Double daily reward';
 EXCEPTION WHEN invalid_parameter_value THEN INSERT INTO audit_results VALUES('daily cooldown enforced',true); END;
 first:=public.account_command('me','{}',gen_random_uuid());
 BEGIN
  PERFORM public.account_command('profile',jsonb_build_object('bio','stale','revision',(first->'user'->>'revision')::bigint-1),gen_random_uuid());
  RAISE EXCEPTION 'Stale profile accepted';
 EXCEPTION WHEN serialization_failure THEN INSERT INTO audit_results VALUES('cross-device stale update rejected',true); END;
 first:=public.account_command('blackjack','{"action":"deal","bet":10}',gen_random_uuid());
 IF first->>'phase'='playing' AND first->'dealer'->0<>'null'::jsonb THEN RAISE EXCEPTION 'Dealer card leaked'; END IF;
 IF first->>'phase'='playing' THEN PERFORM public.account_command('blackjack','{"action":"stand"}',gen_random_uuid()); END IF;
 INSERT INTO audit_results VALUES('blackjack server hand and settlement',true);
 SELECT p.username INTO target FROM public.profiles p WHERE p.id<>auth.uid() LIMIT 1;
 PERFORM public.account_command('friend_request',jsonb_build_object('targetUsername',target),gen_random_uuid());
 first:=public.account_command('message_send',jsonb_build_object('recipient',target,'text','rollback private message'),gen_random_uuid());
 second:=public.account_command('messages',jsonb_build_object('partner',target),gen_random_uuid());
 IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(second->'messages') m WHERE m->>'id'=first->'message'->>'id') THEN RAISE EXCEPTION 'Message not persisted'; END IF;
 INSERT INTO audit_results VALUES('private messages persist for sender',true);
 BEGIN PERFORM public.account_command('broadcast','{"message":"forbidden"}',gen_random_uuid()); RAISE EXCEPTION 'Unauthorized announcement';
 EXCEPTION WHEN insufficient_privilege THEN INSERT INTO audit_results VALUES('announcement authorization',true); END;
 BEGIN UPDATE public.profiles p SET coins=p.coins+1000 WHERE p.id=auth.uid(); RAISE EXCEPTION 'Direct credit allowed';
 EXCEPTION WHEN insufficient_privilege THEN INSERT INTO audit_results VALUES('direct economic write denied',true); END;
 IF EXISTS(SELECT 1 FROM public.profiles WHERE password_hash<>'') THEN RAISE EXCEPTION 'Public credential leak'; END IF;
 INSERT INTO audit_results VALUES('public credentials empty',true);
 BEGIN
  INSERT INTO public.comments(game_id,username,content) VALUES('obby','vendeez','forged author');
  RAISE EXCEPTION 'Comment author forged';
 EXCEPTION WHEN insufficient_privilege THEN INSERT INTO audit_results VALUES('immutable social author enforced',true); END;
 INSERT INTO public.comments(game_id,username,content) SELECT 'obby',username,'rollback comment' FROM public.profiles WHERE id=auth.uid();
 BEGIN
  INSERT INTO public.comments(game_id,username,content) SELECT 'obby',username,'second comment' FROM public.profiles WHERE id=auth.uid();
  RAISE EXCEPTION 'Comment cooldown bypassed';
 EXCEPTION WHEN invalid_parameter_value THEN INSERT INTO audit_results VALUES('server comment cooldown',true); END;
END $$;
RESET ROLE;
UPDATE boblox_private.casino_state SET blackjack='{"hand":[{"val":"8"},{"val":"8"}],"hands":[{"cards":[{"val":"8"},{"val":"8"}],"bet":10,"status":"playing","split":false}],"activeHand":0,"dealer":[{"val":"10"},{"val":"7"}],"deck":[{"val":"3"},{"val":"2"},{"val":"9"},{"val":"10"}],"bet":10,"phase":"playing"}'::jsonb WHERE user_id=auth.uid();
SET LOCAL ROLE authenticated;
DO $$ DECLARE result jsonb; BEGIN
 result:=public.account_command('blackjack','{"action":"split"}',gen_random_uuid());
 IF jsonb_array_length(result->'hands')<>2 OR result ? 'deck' OR result->'dealer'->0<>'null'::jsonb THEN RAISE EXCEPTION 'Invalid split or hidden deck leaked'; END IF;
 PERFORM public.account_command('blackjack','{"action":"stand"}',gen_random_uuid());
 result:=public.account_command('blackjack','{"action":"stand"}',gen_random_uuid());
 IF result->>'phase'<>'finished' THEN RAISE EXCEPTION 'Split did not finish'; END IF;
 INSERT INTO audit_results VALUES('server split and hidden deck protection',true);
END $$;
RESET ROLE;
SELECT set_config('request.jwt.claim.sub',(SELECT recipient_id::text FROM boblox_private.messages WHERE sender_id=auth.uid() AND content='rollback private message' ORDER BY created_at DESC LIMIT 1),true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE result jsonb; BEGIN
 result:=public.account_command('messages','{}',gen_random_uuid());
 IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(result->'messages') m WHERE m->>'text'='rollback private message') THEN RAISE EXCEPTION 'Recipient cannot read message'; END IF;
 INSERT INTO audit_results VALUES('fresh recipient device reads persisted message',true);
END $$;
RESET ROLE;
SELECT set_config('request.jwt.claim.sub',(SELECT p.id::text FROM public.profiles p WHERE p.id<>auth.uid() AND p.id NOT IN (SELECT sender_id FROM boblox_private.messages WHERE content='rollback private message') LIMIT 1),true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE result jsonb; BEGIN
 result:=public.account_command('messages','{}',gen_random_uuid());
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(result->'messages') m WHERE m->>'text'='rollback private message') THEN RAISE EXCEPTION 'Unrelated account reads private message'; END IF;
 INSERT INTO audit_results VALUES('unrelated account cannot read private message',true);
END $$;
RESET ROLE;
SELECT jsonb_agg(to_jsonb(a)) AS results FROM audit_results a;
ROLLBACK;
