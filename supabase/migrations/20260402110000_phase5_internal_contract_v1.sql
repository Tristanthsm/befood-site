alter table public.coach_requests
  add column if not exists contract_status text not null default 'none',
  add column if not exists contract_version text,
  add column if not exists contract_content_hash text,
  add column if not exists contract_signed_at timestamptz,
  add column if not exists contract_signed_ip text,
  add column if not exists contract_signed_user_agent text,
  add column if not exists contract_signed_email text,
  add column if not exists contract_signature_type text,
  add column if not exists contract_signature_payload jsonb,
  add column if not exists contract_verified_at timestamptz,
  add column if not exists contract_verified_by uuid references public.profiles(id) on delete set null,
  add column if not exists contract_prepared_at timestamptz,
  add column if not exists contract_sent_at timestamptz;

alter table public.coach_requests
  drop constraint if exists coach_requests_status_check;

alter table public.coach_requests
  add constraint coach_requests_status_check
  check (
    status = any (
      array[
        'pending'::text,
        'approved'::text,
        'rejected'::text,
        'changes_requested'::text,
        'to_prepare'::text,
        'sent'::text,
        'signed_pending_verification'::text,
        'verified'::text
      ]
    )
  );

update public.coach_requests
set status = 'to_prepare'
where status = 'approved';

alter table public.coach_requests
  drop constraint if exists coach_requests_contract_status_check;

alter table public.coach_requests
  add constraint coach_requests_contract_status_check
  check (
    contract_status = any (
      array[
        'none'::text,
        'to_prepare'::text,
        'sent'::text,
        'signed_pending_verification'::text,
        'verified'::text
      ]
    )
  );

alter table public.coach_requests
  drop constraint if exists coach_requests_contract_signature_type_check;

alter table public.coach_requests
  add constraint coach_requests_contract_signature_type_check
  check (
    contract_signature_type is null
    or contract_signature_type = any (array['typed'::text, 'drawn'::text])
  );

create index if not exists idx_coach_requests_contract_status_created_at
  on public.coach_requests (contract_status, created_at desc);

create table if not exists public.coach_request_contract_events (
  id bigint generated always as identity primary key,
  coach_request_id uuid not null references public.coach_requests(id) on delete cascade,
  event_type text not null check (
    event_type = any (array['prepared'::text, 'sent'::text, 'opened'::text, 'signed'::text, 'verified'::text])
  ),
  event_source text not null check (
    event_source = any (array['admin'::text, 'coach'::text, 'system'::text])
  ),
  actor_user_id uuid references public.profiles(id) on delete set null,
  occurred_at timestamptz not null default timezone('utc', now()),
  payload jsonb not null default '{}'::jsonb
);

create index if not exists idx_contract_events_request_occurred_at
  on public.coach_request_contract_events (coach_request_id, occurred_at desc);

create or replace function public.prevent_coach_request_contract_events_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'coach_request_contract_events is append-only';
end;
$$;

drop trigger if exists trg_contract_events_no_update on public.coach_request_contract_events;
create trigger trg_contract_events_no_update
before update on public.coach_request_contract_events
for each row
execute function public.prevent_coach_request_contract_events_mutation();

drop trigger if exists trg_contract_events_no_delete on public.coach_request_contract_events;
create trigger trg_contract_events_no_delete
before delete on public.coach_request_contract_events
for each row
execute function public.prevent_coach_request_contract_events_mutation();

update public.coach_requests
set contract_status = case
  when status = 'to_prepare' then 'to_prepare'
  when status = 'sent' then 'sent'
  when status = 'signed_pending_verification' then 'signed_pending_verification'
  when status = 'verified' then 'verified'
  else 'none'
end
where contract_status is null
   or contract_status = 'none';
