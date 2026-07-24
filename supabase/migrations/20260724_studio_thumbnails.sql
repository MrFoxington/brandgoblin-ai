-- Studio Thumbnail makers (July 24 2026)
-- Stores the thumbnail overlay spec (title, accent word, fonts, colors, logo
-- placement) on the job so the completion step can draw the on-brand text and
-- logo after the background image is generated. Nullable + additive: every
-- existing job and non-thumbnail job is unaffected.

alter table studio_jobs
  add column if not exists overlay_spec jsonb;
