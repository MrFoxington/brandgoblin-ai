-- Studio Favorites: add favorite flag to studio_jobs
-- Run in the Supabase SQL editor (Dashboard → SQL Editor → New query → paste → Run).
-- Additive + idempotent — safe to run more than once.

-- ── favorite flag ───────────────────────────────────────────────────────────
ALTER TABLE studio_jobs
  ADD COLUMN IF NOT EXISTS favorite BOOLEAN NOT NULL DEFAULT false;

-- Partial index — only the starred rows are indexed (keeps it small + fast for
-- the Favorites filter in Studio and the dashboard Favorites section).
CREATE INDEX IF NOT EXISTS studio_jobs_user_favorite
  ON studio_jobs (user_id, favorite)
  WHERE favorite = true;
