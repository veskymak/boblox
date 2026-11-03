CREATE INDEX account_requests_user_time ON boblox_private.account_requests(user_id,created_at DESC);
CREATE INDEX ledger_user_time ON boblox_private.ledger(user_id,created_at DESC);
CREATE INDEX friendships_recipient ON boblox_private.friendships(recipient_id,sender_id);
CREATE INDEX announcements_time ON public.announcements(created_at DESC);
CREATE OR REPLACE FUNCTION public.account_command(command text, payload jsonb DEFAULT '{}', request_id uuid DEFAULT gen_random_uuid())
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE uid uuid:=auth.uid(); p public.profiles; old_balance integer; now_ms bigint:=(extract(epoch from clock_timestamp())*1000)::bigint;
 cached boblox_private.account_requests; state boblox_private.casino_state; session boblox_private.game_sessions;
 target public.profiles; item boblox_private.shop_catalog; result jsonb:='{}'; inv jsonb; amount integer:=0; bet integer;
 idx integer; a integer; b integer; c integer; win integer:=0; roll double precision; threshold double precision;
 slots integer[]:='{}'; weights integer[]:=ARRAY[30,24,18,14,8,5,3]; mult integer[]:=ARRAY[2,4,8,15,25,35,50];
 wheel integer[]:=ARRAY[3500,500,150,300,250,600,200,400,0,700,250,500,300,600,300,600,500,900,400,350];
 odds numeric[]:=ARRAY[2.2,3.5,5,8,15]; bj jsonb; hand jsonb; dealer jsonb; phase text; score integer; ds integer;
 deck jsonb; hands jsonb; current_hand jsonb; active_hand integer; h jsonb; has_natural boolean;
 pets jsonb; pet jsonb; petidx integer; tasks integer; chosen text; allowed_games text[]:=ARRAY['adoptme','obby','lava','sfoth','tycoon','disasters','toh','zombies','speedrun','hideandseek','bedwars','casino'];
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
 IF command IS NULL OR payload IS NULL OR request_id IS NULL OR jsonb_typeof(payload)<>'object' OR octet_length(payload::text)>16384 THEN RAISE EXCEPTION 'Invalid request' USING ERRCODE='22023'; END IF;
 -- A per-user lock also serializes profile creation and concurrent requests from another device.
 PERFORM pg_advisory_xact_lock(hashtextextended(uid::text,0));
 SELECT * INTO p FROM public.profiles WHERE id=uid FOR UPDATE;
 IF NOT FOUND THEN
  IF command<>'register' THEN RAISE EXCEPTION 'Account requires secure recovery' USING ERRCODE='42501'; END IF;
  IF payload->>'username' !~ '^[a-zA-Z0-9_]{3,20}$' OR lower(payload->>'username') IN ('vendeez','admin')
   OR NOT EXISTS(SELECT 1 FROM auth.users WHERE id=uid AND lower(email)=lower(payload->>'username')||'@boblox.cz')
   OR EXISTS(SELECT 1 FROM public.profiles WHERE lower(username)=lower(payload->>'username'))
  THEN RAISE EXCEPTION 'Invalid or reserved account name' USING ERRCODE='22023'; END IF;
  INSERT INTO public.profiles(id,username,password_hash) VALUES(uid,payload->>'username','') RETURNING * INTO p;
 END IF;
 PERFORM set_config('boblox.command',command,true);
 old_balance:=coalesce(p.coins,0); inv:=coalesce(p.inventory,'{}');
 SELECT * INTO cached FROM boblox_private.account_requests r WHERE r.user_id=uid AND r.request_id=account_command.request_id;
 IF FOUND THEN
  IF cached.command IS DISTINCT FROM command OR cached.payload IS DISTINCT FROM payload THEN RAISE EXCEPTION 'Request ID reused with different content' USING ERRCODE='22023'; END IF;
  RETURN cached.result || jsonb_build_object('user',boblox_private.account_snapshot(uid),'serverTime',now_ms);
 END IF;
 IF command NOT IN ('me','messages','transactions','announcements') AND (SELECT count(*) FROM boblox_private.account_requests WHERE user_id=uid AND created_at>now()-interval '1 minute')>=120 THEN RAISE EXCEPTION 'Command rate limit' USING ERRCODE='22023'; END IF;
 INSERT INTO boblox_private.casino_state(user_id) VALUES(uid) ON CONFLICT DO NOTHING;
 SELECT * INTO state FROM boblox_private.casino_state WHERE user_id=uid;
 IF command='announcements' THEN
  SELECT jsonb_build_object('announcements',coalesce(jsonb_agg(to_jsonb(a)),'[]'::jsonb)) INTO result FROM
    (SELECT id,message,sender,created_at FROM public.announcements WHERE created_at>now_ms-60000 ORDER BY created_at DESC LIMIT 10) a;
 ELSIF command='broadcast' THEN
  IF uid IS DISTINCT FROM '2806aa83-95cb-405d-8db4-23b95f676612'::uuid THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
  IF length(trim(coalesce(payload->>'message','')))=0 OR length(payload->>'message')>300 THEN RAISE EXCEPTION 'Invalid announcement' USING ERRCODE='22023'; END IF;
  INSERT INTO public.announcements(message,sender,created_at) VALUES(payload->>'message',p.username,now_ms);
 ELSIF command IN ('me','register') THEN NULL;
 ELSIF command='profile' THEN
  IF payload ? 'revision' AND (payload->>'revision')::bigint<>p.revision THEN RAISE EXCEPTION 'Profile changed on another device. Refresh and retry.' USING ERRCODE='40001'; END IF;
  IF payload ? 'bio' THEN p.bio:=left(payload->>'bio',160); END IF;
  IF payload ? 'torsoHex' THEN
   IF payload->>'torsoHex' !~ '^#[0-9a-fA-F]{6}$' THEN RAISE EXCEPTION 'Invalid color' USING ERRCODE='22023'; END IF;
   inv:=jsonb_set(inv,'{torsoHex}',payload->'torsoHex');
  END IF;
  IF payload ? 'outfit' THEN
   IF jsonb_typeof(payload->'outfit')<>'object' THEN RAISE EXCEPTION 'Invalid outfit' USING ERRCODE='22023'; END IF;
   FOR chosen,pet IN SELECT key,value FROM jsonb_each(payload->'outfit') LOOP
    IF chosen NOT IN ('shirt','pants','face','hat') OR (pet<>'null'::jsonb AND NOT coalesce(inv->'owned','[]'::jsonb) ? (pet#>>'{}')) THEN RAISE EXCEPTION 'Item not owned' USING ERRCODE='42501'; END IF;
   END LOOP;
   inv:=jsonb_set(inv,'{outfit}',payload->'outfit');
  END IF;
 ELSIF command='purchase' THEN
  SELECT * INTO item FROM boblox_private.shop_catalog WHERE id=payload->>'itemId' AND slot<>'egg';
  IF NOT FOUND THEN RAISE EXCEPTION 'Unknown item' USING ERRCODE='22023'; END IF;
  IF NOT coalesce(inv->'owned','[]'::jsonb) ? item.id THEN
   amount:=-item.price;
   inv:=jsonb_set(inv,'{owned}',coalesce(inv->'owned','[]'::jsonb)||to_jsonb(item.id));
  END IF;
  inv:=jsonb_set(inv,'{outfit}',coalesce(inv->'outfit','{}'::jsonb)||jsonb_build_object(item.slot,item.id));
 ELSIF command='daily' THEN
  IF now_ms-coalesce(p.daily_claim_date,0)<86400000 THEN RAISE EXCEPTION 'Daily reward already claimed' USING ERRCODE='22023'; END IF;
  amount:=50; p.daily_claim_date:=now_ms; result:=jsonb_build_object('lastClaimTimestamp',now_ms);
 ELSIF command IN ('slots','wheel','derby') THEN
  IF command='wheel' THEN
   bet:=CASE WHEN state.extra_spin OR now_ms-state.wheel_at>=86400000 THEN 0 ELSE 600 END;
   idx:=floor(random()*20)::integer; win:=wheel[idx+1];
   IF bet=0 AND NOT state.extra_spin THEN state.wheel_at:=now_ms; END IF;
   state.extra_spin:=idx=8;
   IF idx=0 THEN inv:=inv||'{"is_vip":true}'::jsonb; END IF;
   result:=jsonb_build_object('prizeIndex',idx,'wheelAt',state.wheel_at,'extraSpin',state.extra_spin,'payout',win);
  ELSE
   bet:=(payload->>'bet')::integer;
   IF bet IS NULL OR bet NOT BETWEEN 1 AND 10000 THEN RAISE EXCEPTION 'Invalid bet' USING ERRCODE='22023'; END IF;
   IF command='slots' THEN
    FOR b IN 1..3 LOOP
     roll:=random()*102; idx:=1;
     WHILE idx<7 AND roll>=weights[idx] LOOP roll:=roll-weights[idx]; idx:=idx+1; END LOOP;
     slots:=array_append(slots,idx-1);
    END LOOP;
    IF slots[1]=slots[2] AND slots[2]=slots[3] THEN win:=bet*mult[slots[1]+1];
    ELSIF (CASE WHEN slots[1]=0 THEN 1 ELSE 0 END + CASE WHEN slots[2]=0 THEN 1 ELSE 0 END + CASE WHEN slots[3]=0 THEN 1 ELSE 0 END)>=2 THEN win:=bet*2; END IF;
    result:=jsonb_build_object('reels',slots,'payout',win);
   ELSE
    a:=(payload->>'horseId')::integer;
    IF a IS NULL OR a NOT BETWEEN 1 AND 5 THEN RAISE EXCEPTION 'Invalid horse' USING ERRCODE='22023'; END IF;
    roll:=random()*(1/2.2+1/3.5+1/5.0+1/8.0+1/15.0); idx:=1;
    WHILE idx<5 AND roll>=1/odds[idx] LOOP roll:=roll-1/odds[idx]; idx:=idx+1; END LOOP;
    IF idx=a THEN win:=round(bet*odds[a]); END IF;
    result:=jsonb_build_object('winnerId',idx,'payout',win);
   END IF;
  END IF;
  IF old_balance<bet THEN RAISE EXCEPTION 'Insufficient funds' USING ERRCODE='22023'; END IF;
  amount:=win-bet;

 ELSIF command='blackjack' THEN
  bj:=state.blackjack; phase:=coalesce(bj->>'phase','finished');
  IF payload->>'action' IS NULL THEN RAISE EXCEPTION 'Action required' USING ERRCODE='22023'; END IF;
  IF payload->>'action'='resume' THEN
   RETURN (coalesce(bj,'{"hand":[],"hands":[],"dealer":[],"bet":50,"phase":"betting"}'::jsonb)-'deck') || jsonb_build_object('dealer',CASE WHEN phase='playing' THEN jsonb_build_array('null'::jsonb,bj->'dealer'->1) ELSE coalesce(bj->'dealer','[]'::jsonb) END,'user',boblox_private.account_snapshot(uid),'serverTime',now_ms);
  END IF;
  IF payload->>'action'='deal' THEN
   IF phase='playing' THEN RAISE EXCEPTION 'Finish current hand first' USING ERRCODE='22023'; END IF;
   bet:=(payload->>'bet')::integer;
   IF bet IS NULL OR bet NOT BETWEEN 1 AND 10000 OR old_balance<bet THEN RAISE EXCEPTION 'Invalid bet or insufficient funds' USING ERRCODE='22023'; END IF;
   SELECT jsonb_agg(c.card ORDER BY random()) INTO deck FROM
    (SELECT jsonb_build_object('val',v,'suit',s,'color',CASE WHEN s IN ('♥','♦') THEN 'red' ELSE 'black' END) AS card
     FROM unnest(ARRAY['2','3','4','5','6','7','8','9','10','J','Q','K','A']) v CROSS JOIN unnest(ARRAY['♠','♥','♦','♣']) s) c;
   hand:=jsonb_build_array(deck->0,deck->1); dealer:=jsonb_build_array(deck->2,deck->3);
   deck:=deck-0-0-0-0; amount:=-bet; phase:='playing'; active_hand:=0;
   hands:=jsonb_build_array(jsonb_build_object('cards',hand,'bet',bet,'status','playing','split',false));
  ELSE
   IF phase<>'playing' THEN RAISE EXCEPTION 'No active hand' USING ERRCODE='22023'; END IF;
   -- Upgrade any hand started before this migration without exposing its hidden card.
   hands:=coalesce(bj->'hands',jsonb_build_array(jsonb_build_object('cards',bj->'hand','bet',bj->'bet','status','playing','split',false)));
   active_hand:=coalesce((bj->>'activeHand')::integer,0); deck:=coalesce(bj->'deck','[]'::jsonb); dealer:=bj->'dealer';
   IF jsonb_array_length(deck)=0 THEN
    SELECT jsonb_agg(c.card ORDER BY random()) INTO deck FROM
    (SELECT jsonb_build_object('val',v,'suit',s,'color',CASE WHEN s IN ('♥','♦') THEN 'red' ELSE 'black' END) AS card
     FROM unnest(ARRAY['2','3','4','5','6','7','8','9','10','J','Q','K','A']) v CROSS JOIN unnest(ARRAY['♠','♥','♦','♣']) s) c;
   END IF;
   current_hand:=hands->active_hand; hand:=current_hand->'cards'; bet:=(current_hand->>'bet')::integer;
   IF payload->>'action'='split' THEN
    IF jsonb_array_length(hand)<>2 OR hand->0->>'val'<>hand->1->>'val' OR jsonb_array_length(hands)>=4 OR old_balance<bet THEN RAISE EXCEPTION 'Cannot split' USING ERRCODE='22023'; END IF;
    amount:=-bet;
    hands:=hands||jsonb_build_array(jsonb_build_object('cards',jsonb_build_array(hand->1,deck->1),'bet',bet,'status','playing','split',true));
    hand:=jsonb_build_array(hand->0,deck->0); deck:=deck-0-0; current_hand:=current_hand||'{"split":true}'::jsonb;
   ELSIF payload->>'action' IN ('hit','double') THEN
    IF payload->>'action'='double' THEN
     IF jsonb_array_length(hand)<>2 OR old_balance<bet THEN RAISE EXCEPTION 'Cannot double' USING ERRCODE='22023'; END IF;
     amount:=-bet; bet:=bet*2;
    END IF;
    hand:=hand||jsonb_build_array(deck->0); deck:=deck-0;
   ELSIF payload->>'action'<>'stand' THEN RAISE EXCEPTION 'Unknown blackjack action' USING ERRCODE='22023'; END IF;
   current_hand:=current_hand||jsonb_build_object('cards',hand,'bet',bet);
   IF payload->>'action' IN ('stand','double') OR boblox_private.card_score(hand)>=21 THEN current_hand:=current_hand||'{"status":"stand"}'::jsonb; END IF;
   hands:=jsonb_set(hands,ARRAY[active_hand::text],current_hand);
  END IF;
  IF (jsonb_array_length(hands)=1 AND jsonb_array_length(hand)=2 AND boblox_private.card_score(hand)=21 AND NOT coalesce((hands->0->>'split')::boolean,false)) OR (jsonb_array_length(dealer)=2 AND boblox_private.card_score(dealer)=21) THEN
   active_hand:=jsonb_array_length(hands);
  ELSE
   WHILE active_hand<jsonb_array_length(hands) AND (hands->active_hand->>'status'='stand' OR boblox_private.card_score(hands->active_hand->'cards')>=21) LOOP active_hand:=active_hand+1; END LOOP;
  END IF;
  IF active_hand>=jsonb_array_length(hands) THEN
   has_natural:=jsonb_array_length(hands)=1 AND jsonb_array_length(hands->0->'cards')=2 AND boblox_private.card_score(hands->0->'cards')=21 AND NOT coalesce((hands->0->>'split')::boolean,false);
   ds:=boblox_private.card_score(dealer);
   IF NOT has_natural AND EXISTS(SELECT 1 FROM jsonb_array_elements(hands) v WHERE boblox_private.card_score(v->'cards')<=21) THEN
    WHILE ds<17 LOOP dealer:=dealer||jsonb_build_array(deck->0); deck:=deck-0; ds:=boblox_private.card_score(dealer); END LOOP;
   END IF;
   win:=0;
   FOR h IN SELECT value FROM jsonb_array_elements(hands) LOOP
    score:=boblox_private.card_score(h->'cards'); bet:=(h->>'bet')::integer;
    IF score>21 THEN NULL;
    ELSIF has_natural AND NOT (ds=21 AND jsonb_array_length(dealer)=2) THEN win:=win+floor(bet*2.5);
    ELSIF ds=21 AND jsonb_array_length(dealer)=2 AND NOT has_natural THEN NULL;
    ELSIF score=ds THEN win:=win+bet;
    ELSIF ds>21 OR score>ds THEN win:=win+bet*2; END IF;
   END LOOP;
   amount:=amount+win; phase:='finished'; active_hand:=jsonb_array_length(hands)-1;
  END IF;
  current_hand:=hands->active_hand;
  state.blackjack:=jsonb_build_object('hand',current_hand->'cards','hands',hands,'activeHand',active_hand,'dealer',dealer,'deck',deck,'bet',current_hand->'bet','phase',phase);
  result:=(state.blackjack-'deck')||jsonb_build_object('dealer',CASE WHEN phase='playing' THEN jsonb_build_array('null'::jsonb,dealer->1) ELSE dealer END,'payout',win);
 ELSIF command='game_start' THEN
  IF NOT coalesce(payload->>'gameId'=ANY(allowed_games),false) THEN RAISE EXCEPTION 'Unknown game' USING ERRCODE='22023'; END IF;
  INSERT INTO boblox_private.game_sessions(user_id,game_id) VALUES(uid,payload->>'gameId')
   ON CONFLICT(user_id) DO UPDATE SET game_id=excluded.game_id,started_at=now(),last_reward_at=NULL,rewarded=0;
  inv:=inv||jsonb_build_object('gamesPlayed',coalesce((inv->>'gamesPlayed')::integer,0)+1);
 ELSIF command='game_reward' THEN
  SELECT * INTO session FROM boblox_private.game_sessions WHERE user_id=uid;
  -- Client physics cannot prove a win. Rewards are explicitly capped, time-based participation rewards.
  IF NOT FOUND OR session.game_id='casino' OR now()<session.started_at+interval '30 seconds'
    OR now()<coalesce(session.last_reward_at,session.started_at)+interval '30 seconds' OR session.rewarded>=600
  THEN RAISE EXCEPTION 'Reward not available yet' USING ERRCODE='22023'; END IF;
  amount:=20;
  UPDATE boblox_private.game_sessions SET last_reward_at=now(),rewarded=rewarded+amount WHERE user_id=uid;
 ELSIF command IN ('adopt_need','adopt_tree','adopt_trade','adopt_hatch') THEN
  pets:=coalesce(p.adoptme_pets,'[{"id":"dog","tasksDone":0,"ageIdx":0}]'::jsonb);
  IF command='adopt_need' THEN
   IF now_ms-state.last_need_at<12500 THEN RAISE EXCEPTION 'Pet need cooldown' USING ERRCODE='22023'; END IF;
   petidx:=(payload->>'petIndex')::integer;
   IF petidx IS NULL OR petidx<0 OR petidx>=jsonb_array_length(pets) OR payload->>'needId' IS NULL OR payload->>'needId' NOT IN ('hungry','thirsty','sleepy','dirty','sick','bored','school','camping') THEN RAISE EXCEPTION 'Invalid pet task' USING ERRCODE='22023'; END IF;
   pet:=pets->petidx; tasks:=coalesce((pet->>'tasksDone')::integer,0)+1;
   pet:=pet||jsonb_build_object('tasksDone',tasks,'ageIdx',least(5,tasks/2)); pets:=jsonb_set(pets,ARRAY[petidx::text],pet);
   p.adoptme_bucks:=coalesce(p.adoptme_bucks,0)+CASE WHEN payload->>'needId' IN ('school','camping') THEN 50 WHEN payload->>'needId' IN ('hungry','thirsty') THEN 30 WHEN payload->>'needId'='sick' THEN 45 WHEN payload->>'needId'='bored' THEN 42 ELSE 38 END;
   amount:=CASE WHEN payload->>'needId' IN ('school','camping','sick') THEN 35 WHEN payload->>'needId' IN ('hungry','thirsty') THEN 25 ELSE 30 END;
   IF tasks=10 THEN amount:=amount+180; END IF; state.last_need_at:=now_ms;
  ELSIF command='adopt_tree' THEN
   IF now_ms-state.last_tree_at<9000 THEN RAISE EXCEPTION 'Tree cooldown' USING ERRCODE='22023'; END IF;
   p.adoptme_bucks:=coalesce(p.adoptme_bucks,0)+15; state.last_tree_at:=now_ms;
  ELSIF command='adopt_trade' THEN
   IF now_ms-state.last_trade_at<16000 THEN RAISE EXCEPTION 'Trade cooldown' USING ERRCODE='22023'; END IF;
   p.adoptme_bucks:=coalesce(p.adoptme_bucks,0)+40; amount:=35; state.last_trade_at:=now_ms;
  ELSE
   -- Egg definitions are stored in the server catalog; caller never supplies cost or outcome.
   SELECT * INTO item FROM boblox_private.shop_catalog WHERE id=payload->>'eggId' AND slot='egg';
   IF NOT FOUND OR coalesce(p.adoptme_bucks,0)<item.price OR jsonb_array_length(pets)>=200 THEN RAISE EXCEPTION 'Egg unavailable' USING ERRCODE='22023'; END IF;
   p.adoptme_bucks:=p.adoptme_bucks-item.price;
   roll:=random()*100;
   IF item.id='cracked_egg' THEN
    chosen:=CASE WHEN roll<40 THEN 'dog' WHEN roll<75 THEN 'cat' WHEN roll<89 THEN 'penguin' WHEN roll<97 THEN 'bunny' ELSE 'redpanda' END;
   ELSIF item.id='pet_egg' THEN
    chosen:=CASE WHEN roll<30 THEN 'penguin' WHEN roll<58 THEN 'bunny' WHEN roll<80 THEN 'redpanda' WHEN roll<92 THEN 'kitsune' WHEN roll<97 THEN 'unicorn' ELSE 'dragon' END;
   ELSE chosen:=CASE WHEN roll<22 THEN 'redpanda' WHEN roll<50 THEN 'kitsune' WHEN roll<77 THEN 'unicorn' ELSE 'dragon' END; END IF;
   pets:=pets||jsonb_build_array(jsonb_build_object('id',chosen,'tasksDone',0,'ageIdx',0));
   amount:=CASE WHEN chosen IN ('unicorn','dragon') THEN 120 WHEN chosen IN ('redpanda','kitsune') THEN 75 ELSE 45 END;
   result:=jsonb_build_object('petId',chosen);
  END IF; p.adoptme_pets:=pets;
 ELSIF command LIKE 'friend_%' OR command='message_send' THEN
  SELECT * INTO target FROM public.profiles WHERE lower(username)=lower(coalesce(payload->>'targetUsername',payload->>'target',payload->>'toUsername',payload->>'recipient',payload->>'to'));
  IF NOT FOUND OR target.id=uid THEN RAISE EXCEPTION 'Invalid recipient' USING ERRCODE='22023'; END IF;
  IF command='friend_request' THEN
   IF NOT EXISTS(SELECT 1 FROM boblox_private.friendships WHERE (sender_id=uid AND recipient_id=target.id) OR (sender_id=target.id AND recipient_id=uid)) THEN
    INSERT INTO boblox_private.friendships(sender_id,recipient_id) VALUES(uid,target.id);
   END IF;
  ELSIF command='friend_accept' THEN
   UPDATE boblox_private.friendships SET accepted=true WHERE sender_id=target.id AND recipient_id=uid;
   IF NOT FOUND THEN RAISE EXCEPTION 'No incoming request' USING ERRCODE='22023'; END IF;
  ELSIF command IN ('friend_remove','friend_reject','friend_cancel') THEN
   DELETE FROM boblox_private.friendships WHERE (sender_id=uid AND recipient_id=target.id) OR (sender_id=target.id AND recipient_id=uid);
  ELSIF command='message_send' THEN
   IF length(trim(coalesce(payload->>'text','')))=0 OR length(payload->>'text')>250 THEN RAISE EXCEPTION 'Invalid message' USING ERRCODE='22023'; END IF;
   IF EXISTS(SELECT 1 FROM boblox_private.messages WHERE sender_id=uid AND created_at>now_ms-500) THEN RAISE EXCEPTION 'Message rate limit' USING ERRCODE='22023'; END IF;
   INSERT INTO boblox_private.messages(sender_id,recipient_id,content,created_at) VALUES(uid,target.id,trim(payload->>'text'),now_ms)
   RETURNING jsonb_build_object('id',id,'from',p.username,'to',target.username,'text',content,'timestamp',created_at) INTO result;
   result:=jsonb_build_object('message',result);
  ELSE RAISE EXCEPTION 'Unknown social action' USING ERRCODE='22023'; END IF;
 ELSIF command='messages' THEN
  SELECT jsonb_build_object('messages',coalesce(jsonb_agg(to_jsonb(m) ORDER BY m.timestamp),'[]'::jsonb)) INTO result FROM
   (SELECT m.id,s.username AS "from",r.username AS "to",m.content AS text,m.created_at AS timestamp
    FROM boblox_private.messages m JOIN public.profiles s ON s.id=m.sender_id JOIN public.profiles r ON r.id=m.recipient_id
    WHERE (m.sender_id=uid OR m.recipient_id=uid) AND (coalesce(payload->>'partner','')='' OR lower(CASE WHEN m.sender_id=uid THEN r.username ELSE s.username END)=lower(payload->>'partner'))
    ORDER BY m.created_at DESC LIMIT 200) m;
 ELSIF command='transactions' THEN
  SELECT jsonb_build_object('transactions',coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb)) INTO result FROM
   (SELECT id,amount,game,created_at AS timestamp,balance_after AS "balanceAfter" FROM boblox_private.ledger WHERE user_id=uid ORDER BY created_at DESC LIMIT 100) t;
 ELSE RAISE EXCEPTION 'Unknown account command' USING ERRCODE='22023'; END IF;
 IF old_balance+amount<0 OR old_balance::bigint+amount>2147483647 THEN RAISE EXCEPTION 'Insufficient funds or balance overflow' USING ERRCODE='22023'; END IF;
 IF command NOT IN ('me','messages','transactions','announcements') THEN
  UPDATE public.profiles SET coins=old_balance+amount,inventory=inv,bio=p.bio,adoptme_pets=p.adoptme_pets,adoptme_bucks=p.adoptme_bucks,daily_claim_date=p.daily_claim_date,last_active_at=now(),revision=revision+1 WHERE id=uid;
  UPDATE boblox_private.casino_state SET wheel_at=state.wheel_at,extra_spin=state.extra_spin,blackjack=state.blackjack,last_need_at=state.last_need_at,last_tree_at=state.last_tree_at,last_trade_at=state.last_trade_at WHERE user_id=uid;
  IF amount=0 AND command IN ('slots','wheel','derby','blackjack') THEN INSERT INTO boblox_private.ledger(user_id,amount,balance_after,game,created_at) VALUES(uid,amount,old_balance+amount,command,now_ms); END IF;
  INSERT INTO boblox_private.account_requests(user_id,request_id,command,payload,result) VALUES(uid,request_id,command,payload,result);
 END IF;
 RETURN result||jsonb_build_object('ok',true,'user',boblox_private.account_snapshot(uid),'serverTime',now_ms,'wheelAt',state.wheel_at,'extraSpin',state.extra_spin);
END $$;
