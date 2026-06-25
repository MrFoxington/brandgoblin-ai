-- Freemium conversion: one-time free Goblin Studio starter energy grant.
-- Replaces the 7-day reverse trial. This flag is the once-per-user gate for the
-- FREE_STUDIO_STARTER_ENERGY grant (default 250). It is intentionally SEPARATE
-- from has_used_trial: every existing free/expired user already has
-- has_used_trial=true, so reusing it would strand them. A fresh column (default
-- false) makes every current non-Pro user eligible for the one-time grant exactly
-- once, while the atomic claim in grantFreeStudioStarterIfEligible() prevents
-- double-grants.
alter table public.users
  add column if not exists has_received_free_studio_grant boolean not null default false;
