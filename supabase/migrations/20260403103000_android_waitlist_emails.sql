create table if not exists public.android_waitlist_emails (
    id uuid primary key default gen_random_uuid(),
    email text not null,
    email_normalized text not null,
    source text,
    http_referrer text,
    user_agent text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists idx_android_waitlist_emails_email_normalized
on public.android_waitlist_emails (email_normalized);

create or replace function public.android_waitlist_emails_set_updated_at()
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

drop trigger if exists trg_android_waitlist_emails_updated_at on public.android_waitlist_emails;
create trigger trg_android_waitlist_emails_updated_at
before update on public.android_waitlist_emails
for each row
execute function public.android_waitlist_emails_set_updated_at();

alter table public.android_waitlist_emails enable row level security;

drop policy if exists "No direct access" on public.android_waitlist_emails;
create policy "No direct access"
on public.android_waitlist_emails
for all
to anon, authenticated
using (false)
with check (false);
