-- Brand Maturity Prompt 3: signup attribution baseline (August 12, 2026).
-- One row per signup, recording which hero variant the visitor first saw.
-- Service-role only: RLS is enabled with NO policies, so only the server
-- (service role key) can read or write. Chosen over altering public.users
-- so the live handle_new_user trigger is never touched.

create table if not exists public.signup_events (
  user_id uuid primary key,
  hero_variant text,
  landed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.signup_events enable row level security;

create index if not exists signup_events_created_at_idx
  on public.signup_events (created_at desc);
