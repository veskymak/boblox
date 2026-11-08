-- Private age attestation; intentionally not public profile data.
create table if not exists public.account_consents (
    user_id uuid primary key references auth.users(id) on delete cascade,
    version integer not null default 1 check (version = 1),
    age_over_15 boolean not null check (age_over_15),
    -- Legacy records retained; new age attestations do not collect activity consent.
    activity_consent boolean check (activity_consent),
    accepted_at timestamptz not null default now()
);
alter table public.account_consents enable row level security;
revoke all on public.account_consents from anon, authenticated;
grant select on public.account_consents to authenticated;
grant insert (user_id, age_over_15) on public.account_consents to authenticated;
create policy consent_read on public.account_consents for select to authenticated using ((select auth.uid()) = user_id);
create policy consent_insert on public.account_consents for insert to authenticated with check ((select auth.uid()) = user_id);

-- Upgrade existing deployments without deleting historical records.
alter table public.account_consents alter column activity_consent drop not null;
revoke insert(activity_consent) on public.account_consents from authenticated;
