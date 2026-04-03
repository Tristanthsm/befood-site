alter table public.coach_requests
  add column if not exists admin_message text;
