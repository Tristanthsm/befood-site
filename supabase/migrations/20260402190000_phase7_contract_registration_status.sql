alter table public.coach_requests
  add column if not exists contract_registration_status text;

update public.coach_requests
set contract_registration_status = case
  when nullif(trim(contract_coach_registration), '') is not null
    and lower(trim(contract_coach_registration)) <> lower('non renseigné à la date de signature')
    then 'provided'
  else 'pending_creation'
end
where contract_registration_status is null;

alter table public.coach_requests
  alter column contract_registration_status set default 'pending_creation';

update public.coach_requests
set contract_registration_status = 'pending_creation'
where contract_registration_status is null;

alter table public.coach_requests
  alter column contract_registration_status set not null;

alter table public.coach_requests
  drop constraint if exists coach_requests_contract_registration_status_check;

alter table public.coach_requests
  add constraint coach_requests_contract_registration_status_check
  check (contract_registration_status = any (array['provided'::text, 'pending_creation'::text]));
