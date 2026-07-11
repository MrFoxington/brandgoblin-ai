-- Archive / hide Studio creations (July 11, 2026)
-- Soft-hide: archived images disappear from the gallery, favorites, dashboard
-- stash, and website preview, but live in a "Hidden" tab for restore.
-- ⚠️ RUN THIS IN THE SUPABASE SQL EDITOR BEFORE DEPLOYING THE CODE THAT USES IT.

alter table studio_jobs
  add column if not exists archived boolean not null default false;

-- Fast lookups for the common "not archived" gallery query
create index if not exists studio_jobs_user_archived_idx
  on studio_jobs (user_id, archived);
