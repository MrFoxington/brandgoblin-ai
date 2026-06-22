-- Studio Showcase: curation flag for the public showcase wall
-- Run in the Supabase SQL editor (Dashboard → SQL Editor → New query → paste → Run).
-- Additive + idempotent — safe to run more than once.

-- ── featured flags ───────────────────────────────────────────────────────────
ALTER TABLE studio_jobs
  ADD COLUMN IF NOT EXISTS featured       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_order INT,
  ADD COLUMN IF NOT EXISTS featured_at    TIMESTAMPTZ;

-- Partial index — only featured rows are indexed (the public wall reads these).
CREATE INDEX IF NOT EXISTS studio_jobs_featured
  ON studio_jobs (featured, featured_order)
  WHERE featured = true;


-- ── OPTIONAL SEED ────────────────────────────────────────────────────────────
-- Populate the wall immediately by featuring your OWN most recent completed image
-- jobs. Replace <YOUR_USER_ID> with your auth.users id (Supabase → Authentication →
-- Users → copy your UUID). Only features YOUR jobs — never anyone else's.
--
-- UPDATE studio_jobs
-- SET featured = true,
--     featured_at = NOW(),
--     featured_order = sub.rn
-- FROM (
--   SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
--   FROM studio_jobs
--   WHERE user_id = '<YOUR_USER_ID>'
--     AND status = 'completed'
--     AND job_type = 'image'
--   LIMIT 20
-- ) AS sub
-- WHERE studio_jobs.id = sub.id;
