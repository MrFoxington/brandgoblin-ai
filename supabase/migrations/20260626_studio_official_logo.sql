-- Studio Official Logo: let a user mark ONE logo concept per brand as the brand's
-- official logo. Generated product art / social graphics then get that exact logo
-- stamped on automatically (overlay happens in completeJob).
-- Run in the Supabase SQL editor (Dashboard → SQL Editor → New query → paste → Run).
-- Additive + idempotent — safe to run more than once.

-- ── official_logo flag ───────────────────────────────────────────────────────
ALTER TABLE studio_jobs
  ADD COLUMN IF NOT EXISTS official_logo BOOLEAN NOT NULL DEFAULT false;

-- Only ONE official logo per (user, brand). brand_id NULL (freeform) is excluded
-- since there's no brand to stamp onto.
CREATE UNIQUE INDEX IF NOT EXISTS studio_jobs_one_official_logo_per_brand
  ON studio_jobs (user_id, brand_id)
  WHERE official_logo = true AND brand_id IS NOT NULL;

-- Fast lookup of "the official logo for this brand" during overlay.
CREATE INDEX IF NOT EXISTS studio_jobs_official_logo
  ON studio_jobs (user_id, brand_id)
  WHERE official_logo = true;
