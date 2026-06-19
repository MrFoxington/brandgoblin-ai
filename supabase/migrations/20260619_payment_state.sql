-- Idempotent: track payment state for dunning / recovery banner
alter table public.users
  add column if not exists payment_status text not null default 'active';
  -- values: 'active' | 'past_due' | 'canceled'

alter table public.users
  add column if not exists payment_issue_at timestamptz;
