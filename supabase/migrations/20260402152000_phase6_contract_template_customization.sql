alter table public.coach_requests
  add column if not exists contract_template_text text,
  add column if not exists contract_prepared_content text,
  add column if not exists contract_coach_full_name text,
  add column if not exists contract_coach_email text,
  add column if not exists contract_coach_status text,
  add column if not exists contract_coach_address text,
  add column if not exists contract_coach_registration text;
