-- Per-job opt-out for the official-logo stamp on product art / social graphics.
-- Default true = existing behavior (stamp when the brand has an official logo).
alter table studio_jobs
  add column if not exists stamp_logo boolean not null default true;
