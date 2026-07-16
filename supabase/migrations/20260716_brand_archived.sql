-- Archive / hide brands (July 16, 2026)
-- Soft-archive: archived brands disappear from the Brand Vault, the Studio
-- brand picker, and Creator Pro, but live in an "Archived" tab for restore.
-- Direct links to /brand/[id] still work. Nothing is ever deleted.
-- ⚠️ RUN THIS IN THE SUPABASE SQL EDITOR BEFORE DEPLOYING THE CODE THAT USES IT.

alter table brand_generations
  add column if not exists archived boolean not null default false;

-- Fast lookups for the common "not archived" vault query
create index if not exists brand_generations_user_archived_idx
  on brand_generations (user_id, archived);
