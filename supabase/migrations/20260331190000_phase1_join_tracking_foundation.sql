create or replace function public.generate_coach_referral_url(p_invite_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
    v_base_url text := 'https://befood.fr/join';
    v_invite_code text := upper(trim(coalesce(p_invite_code, '')));
begin
    if v_invite_code = '' then
        return null;
    end if;

    return v_base_url || '?coach_code=' || v_invite_code;
end;
$$;

update public.coach_profiles
set referral_link = public.generate_coach_referral_url(invite_code),
    updated_at = timezone('utc', now())
where referral_link is null
   or referral_link ilike '%befood.app/join%'
   or referral_link not ilike '%befood.fr/join%';

create table if not exists public.web_join_sessions (
    id uuid primary key default gen_random_uuid(),
    click_id uuid not null unique default gen_random_uuid(),
    session_id text not null,
    coach_code text,
    coach_profile_user_id uuid references public.profiles(id) on delete set null,
    ref text,
    utm_source text,
    utm_medium text,
    utm_campaign text,
    utm_term text,
    utm_content text,
    http_referrer text,
    user_agent text,
    landing_path text not null default '/join',
    query_string text,
    arrived_at timestamptz not null default timezone('utc', now()),
    app_open_attempted_at timestamptz,
    app_store_clicked_at timestamptz,
    bridge_nonce text,
    bridge_status text not null default 'none' check (bridge_status in ('none', 'issued', 'failed')),
    session_status text not null default 'active' check (session_status in ('active', 'app_opened', 'store_clicked', 'expired')),
    reconciliation_status text not null default 'pending' check (reconciliation_status in ('pending', 'attributed', 'unattributed', 'invalidated')),
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_web_join_sessions_arrived_at on public.web_join_sessions (arrived_at desc);
create index if not exists idx_web_join_sessions_session_id on public.web_join_sessions (session_id);
create index if not exists idx_web_join_sessions_coach_code on public.web_join_sessions (coach_code);
create index if not exists idx_web_join_sessions_coach_profile_user_id on public.web_join_sessions (coach_profile_user_id);

create or replace function public.web_join_sessions_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

drop trigger if exists trg_web_join_sessions_updated_at on public.web_join_sessions;
create trigger trg_web_join_sessions_updated_at
before update on public.web_join_sessions
for each row
execute function public.web_join_sessions_set_updated_at();

alter table public.web_join_sessions enable row level security;

drop policy if exists "No direct access" on public.web_join_sessions;
create policy "No direct access"
on public.web_join_sessions
for all
to anon, authenticated
using (false)
with check (false);
