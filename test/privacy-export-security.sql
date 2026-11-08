-- Only synthetic fixtures, always rolled back. No messages are delivered.
begin;
create temporary table privacy_fixture(a uuid, b uuid, c uuid);
insert into privacy_fixture values(gen_random_uuid(),gen_random_uuid(),gen_random_uuid());
insert into auth.users(id,email,encrypted_password)
select id,id::text||'@example.test','NEVER_EXPORT_THIS_HASH' from privacy_fixture f cross join lateral (values(f.a),(f.b),(f.c)) as ids(id);
insert into boblox_private.messages(sender_id,recipient_id,content,created_at)
select a,b,'VISIBLE_TO_A',1 from privacy_fixture union all select c,b,'NOT_VISIBLE_TO_A',2 from privacy_fixture;
insert into public.account_consents(user_id,age_over_15) select a,true from privacy_fixture;
select set_config('request.jwt.claim.sub',(select a::text from privacy_fixture),true);
set local role authenticated;
do $$
declare result jsonb;
begin
    result:=public.privacy_export();
    if result->'account'->>'id' <> auth.uid()::text then raise exception 'Wrong identity'; end if;
    if jsonb_array_length(result->'messages') <> 1 or result->'messages'->0->>'content' <> 'VISIBLE_TO_A' then raise exception 'Cross-account leak'; end if;
    if result::text like '%NEVER_EXPORT_THIS_HASH%' or result::text like '%password_hash%' or result::text like '%encrypted_password%' then raise exception 'Credentials leaked'; end if;
    if not (result->'ageConfirmation'->>'age_over_15')::boolean then raise exception 'Age record missing'; end if;
    if result->'ageConfirmation'->'activity_consent' <> 'null'::jsonb then raise exception 'Activity consent collected'; end if;
    if public.privacy_export() is distinct from result then raise exception 'Fresh request changed shared data'; end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub','',true);
do $$
begin
    begin perform public.privacy_export(); raise exception 'Anonymous export accepted';
    exception when insufficient_privilege then null; end;
    if has_function_privilege('anon','public.privacy_export()','execute') then raise exception 'Anonymous RPC grant'; end if;
end $$;
select 'privacy export identity, cross-device reads and credential isolation passed' as result;
rollback;
