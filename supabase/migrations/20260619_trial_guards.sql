-- Idempotent: trial-farming guard columns
alter table public.users add column if not exists normalized_email text;
alter table public.users add column if not exists signup_ip_hash   text;

-- Backfill normalized_email for existing rows (simple lowercase — app normalizes fully for new users)
update public.users set normalized_email = lower(email) where normalized_email is null and email is not null;

-- Index for one-trial-per-normalized-email check
create index if not exists users_normalized_email_idx on public.users (normalized_email);
