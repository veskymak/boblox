-- Access export: fixed authenticated identity, no password hashes or session tokens.
-- Private definer is necessary to read the existing non-exposed account tables.
create or replace function boblox_private.privacy_export()
returns jsonb language plpgsql security definer set search_path = pg_catalog as $$
declare uid uuid := auth.uid(); result jsonb;
begin
    if uid is null or not exists(select 1 from auth.users where id = uid) then
        raise exception 'Authentication required' using errcode = '42501';
    end if;
    select jsonb_build_object(
        'exportedAt', now(),
        'account', (select jsonb_build_object('id',id,'email',email,'created_at',created_at,'last_sign_in_at',last_sign_in_at) from auth.users where id=uid),
        'profile', (select to_jsonb(p)-'password_hash' from public.profiles p where p.id=uid),
        'ageConfirmation', (select to_jsonb(c) from public.account_consents c where user_id=uid),
        'messages', coalesce((select jsonb_agg(to_jsonb(m) order by created_at,id) from boblox_private.messages m where sender_id=uid or recipient_id=uid),'[]'::jsonb),
        'friendships', coalesce((select jsonb_agg(to_jsonb(f)) from boblox_private.friendships f where sender_id=uid or recipient_id=uid),'[]'::jsonb),
        'transactions', coalesce((select jsonb_agg(to_jsonb(l) order by created_at,id) from boblox_private.ledger l where user_id=uid),'[]'::jsonb),
        'comments', coalesce((select jsonb_agg(to_jsonb(c) order by created_at,id) from public.comments c where user_id=uid),'[]'::jsonb),
        'ratings', coalesce((select jsonb_agg(to_jsonb(r)) from public.game_ratings r where user_id=uid),'[]'::jsonb),
        'gameSession', (select to_jsonb(g) from boblox_private.game_sessions g where user_id=uid),
        'gameState', (select to_jsonb(c) from boblox_private.casino_state c where user_id=uid),
        'emailEnrollment', (select to_jsonb(e) from boblox_private.email_enrollment e where user_id=uid),
        'commands', coalesce((select jsonb_agg(jsonb_build_object('request_id',request_id,'command',command,'payload',payload,'created_at',created_at) order by created_at) from boblox_private.account_requests where user_id=uid),'[]'::jsonb)
    ) into result;
    return result;
end $$;
revoke all on function boblox_private.privacy_export() from public, anon, authenticated;
grant usage on schema boblox_private to authenticated;
grant execute on function boblox_private.privacy_export() to authenticated;
create or replace function public.privacy_export()
returns jsonb language sql security invoker set search_path = pg_catalog as $$
    select boblox_private.privacy_export();
$$;
revoke all on function public.privacy_export() from public, anon;
grant execute on function public.privacy_export() to authenticated;
