-- Studio Phase 1: studio_jobs table + atomic energy reservation
-- Run in the Supabase SQL editor (Dashboard → SQL Editor → New query → paste → Run).

-- ── studio_jobs ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS studio_jobs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id          UUID,
  job_type          TEXT NOT NULL DEFAULT 'image',
  model_key         TEXT NOT NULL,
  image_type        TEXT,           -- 'logo_concept' | 'social_graphic' | 'product_art'
  image_size        TEXT NOT NULL DEFAULT 'square_hd',
  energy_reserved   INT  NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending',
                    -- pending | running | completed | failed | cancelled | moderation_blocked
  provider          TEXT NOT NULL DEFAULT 'fal',
  provider_job_id   TEXT,
  prompt            TEXT,
  output_url        TEXT,           -- re-signed on every read from storage_path
  storage_path      TEXT,           -- canonical path in studio-assets bucket
  error_message     TEXT,
  reservation_tx_id UUID,           -- references energy_transactions.id
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Per-user concurrency guard + stale-job sweep
CREATE INDEX IF NOT EXISTS studio_jobs_user_status
  ON studio_jobs (user_id, status);

-- Webhook lookup by provider job ID
CREATE INDEX IF NOT EXISTS studio_jobs_provider_job_id
  ON studio_jobs (provider_job_id)
  WHERE provider_job_id IS NOT NULL;

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_studio_job_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_studio_job_updated_at ON studio_jobs;
CREATE TRIGGER set_studio_job_updated_at
  BEFORE UPDATE ON studio_jobs
  FOR EACH ROW EXECUTE FUNCTION update_studio_job_updated_at();

-- ── Atomic energy reservation ──────────────────────────────────────────────
-- Locks the balance row, checks sufficiency, decrements atomically.
-- Returns (success=TRUE) only when the full amount is available.
-- Deducts from monthly bucket first, then refill bucket.
CREATE OR REPLACE FUNCTION reserve_energy(
  p_user_id UUID,
  p_amount   INT
) RETURNS TABLE(
  success           BOOLEAN,
  monthly_remaining INT,
  refill_remaining  INT
) LANGUAGE plpgsql AS $$
DECLARE
  v_monthly     INT := 0;
  v_refill      INT := 0;
  v_monthly_new INT;
  v_refill_new  INT;
  v_to_deduct   INT;
BEGIN
  SELECT monthly_energy_remaining, refill_energy_remaining
  INTO   v_monthly, v_refill
  FROM   user_energy_balances
  WHERE  user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND OR (v_monthly + v_refill) < p_amount THEN
    RETURN QUERY SELECT FALSE::BOOLEAN, COALESCE(v_monthly, 0), COALESCE(v_refill, 0);
    RETURN;
  END IF;

  v_to_deduct := p_amount;
  IF v_monthly >= v_to_deduct THEN
    v_monthly_new := v_monthly - v_to_deduct;
    v_refill_new  := v_refill;
  ELSE
    v_monthly_new := 0;
    v_refill_new  := v_refill - (v_to_deduct - v_monthly);
  END IF;

  UPDATE user_energy_balances
  SET    monthly_energy_remaining = v_monthly_new,
         refill_energy_remaining  = v_refill_new
  WHERE  user_id = p_user_id;

  RETURN QUERY SELECT TRUE::BOOLEAN, v_monthly_new, v_refill_new;
END;
$$;
