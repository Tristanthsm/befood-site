alter table public.coach_requests
  add column if not exists profile_type text,
  add column if not exists activity text,
  add column if not exists expertise text,
  add column if not exists audience text,
  add column if not exists motivation text,
  add column if not exists admin_note text,
  add column if not exists updated_by uuid references public.profiles(id) on delete set null,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.coach_requests
set status = 'pending'
where status is null;

alter table public.coach_requests
  alter column status set default 'pending',
  alter column status set not null;

alter table public.coach_requests
  drop constraint if exists coach_requests_status_check;

alter table public.coach_requests
  add constraint coach_requests_status_check
  check (
    status = any (array['pending'::text, 'approved'::text, 'rejected'::text, 'changes_requested'::text])
  );

create index if not exists idx_coach_requests_status_created_at
  on public.coach_requests (status, created_at desc);

create index if not exists idx_coach_requests_updated_by
  on public.coach_requests (updated_by);

create or replace function public.coach_requests_set_updated_at()
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

drop trigger if exists trg_coach_requests_updated_at on public.coach_requests;
create trigger trg_coach_requests_updated_at
before update on public.coach_requests
for each row
execute function public.coach_requests_set_updated_at();

update public.coach_requests
set updated_at = coalesce(updated_at, created_at, timezone('utc', now()))
where updated_at is null;
