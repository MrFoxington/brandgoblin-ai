-- Idempotent: app-managed 7-day reverse trial columns
alter table public.users add column if not exists trial_ends_at  timestamptz;
alter table public.users add column if not exists is_trial       boolean not null default false;
alter table public.users add column if not exists has_used_trial boolean not null default false;
